/*
Copyright 2025 linux.do

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package redenvelope

import (
	"errors"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/linux-do/credit/internal/apps/oauth"
	"github.com/linux-do/credit/internal/common"
	"github.com/linux-do/credit/internal/config"
	"github.com/linux-do/credit/internal/db"
	"github.com/linux-do/credit/internal/model"
	"github.com/linux-do/credit/internal/util"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// CreateRequest 创建红包请求
type CreateRequest struct {
	Type        model.RedEnvelopeType `json:"type" binding:"required,oneof=fixed random"`
	TotalAmount decimal.Decimal       `json:"total_amount" binding:"required"`
	TotalCount  int                   `json:"total_count" binding:"required,min=1"`
	Greeting    string                `json:"greeting" binding:"max=100"`
	PayKey      string                `json:"pay_key" binding:"required,max=10"`
}

// CreateResponse 创建红包响应
type CreateResponse struct {
	ID   uint64 `json:"id"`
	Code string `json:"code"`
	Link string `json:"link"`
}

// IsEnabledResponse 红包功能是否启用响应
type IsEnabledResponse struct {
	Enabled bool `json:"enabled"`
}

// ClaimRequest 领取红包请求
type ClaimRequest struct {
	Code string `json:"code" binding:"required"`
}

// ClaimResponse 领取红包响应
type ClaimResponse struct {
	Amount      decimal.Decimal    `json:"amount"`
	RedEnvelope *model.RedEnvelope `json:"red_envelope"`
}

// DetailResponse 红包详情响应
type DetailResponse struct {
	RedEnvelope *model.RedEnvelope      `json:"red_envelope"`
	Claims      []model.RedEnvelopeClaim `json:"claims"`
	UserClaimed *model.RedEnvelopeClaim  `json:"user_claimed,omitempty"`
}

// ListRequest 红包列表请求
type ListRequest struct {
	Page     int    `json:"page" binding:"required,min=1"`
	PageSize int    `json:"page_size" binding:"required,min=1,max=100"`
	Type     string `json:"type" binding:"omitempty,oneof=sent received"`
}

// ListResponse 红包列表响应
type ListResponse struct {
	Total        int64                `json:"total"`
	Page         int                  `json:"page"`
	PageSize     int                  `json:"page_size"`
	RedEnvelopes []model.RedEnvelope `json:"red_envelopes"`
}

// Create 创建红包
// @Tags redenvelope
// @Accept json
// @Produce json
// @Param request body CreateRequest true "创建红包请求"
// @Success 200 {object} util.ResponseAny
// @Router /api/v1/redenvelope/create [post]
func Create(c *gin.Context) {
	// 检查红包功能是否启用
	if !model.IsRedEnvelopeEnabled(c.Request.Context()) {
		c.JSON(http.StatusForbidden, util.Err("红包功能未启用"))
		return
	}

	var req CreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, util.Err(err.Error()))
		return
	}

	if req.TotalAmount.LessThanOrEqual(decimal.Zero) {
		c.JSON(http.StatusBadRequest, util.Err(InvalidRedEnvelopeAmount))
		return
	}

	if req.TotalAmount.Exponent() < -2 {
		c.JSON(http.StatusBadRequest, util.Err(common.AmountDecimalPlacesExceeded))
		return
	}

	// 固定金额红包检查每个红包金额
	if req.Type == model.RedEnvelopeTypeFixed {
		perAmount := req.TotalAmount.Div(decimal.NewFromInt(int64(req.TotalCount)))
		if perAmount.LessThan(decimal.NewFromFloat(0.01)) {
			c.JSON(http.StatusBadRequest, util.Err(AmountTooSmall))
			return
		}
	}

	currentUser, _ := util.GetFromContext[*model.User](c, oauth.UserObjKey)

	if !currentUser.VerifyPayKey(req.PayKey) {
		c.JSON(http.StatusBadRequest, util.Err(common.PayKeyIncorrect))
		return
	}

	code := util.GenerateUniqueIDSimple()
	var redEnvelope model.RedEnvelope

	if err := db.DB(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
		// 锁定用户余额
		var user model.User
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE", Options: "NOWAIT"}).
			Where("id = ?", currentUser.ID).First(&user).Error; err != nil {
			return err
		}

		if user.AvailableBalance.LessThan(req.TotalAmount) {
			return errors.New(common.InsufficientBalance)
		}

		// 扣减余额
		if err := tx.Model(&model.User{}).Where("id = ?", user.ID).
			Update("available_balance", gorm.Expr("available_balance - ?", req.TotalAmount)).Error; err != nil {
			return err
		}

		// 创建红包
		redEnvelope = model.RedEnvelope{
			Code:            code,
			CreatorID:       user.ID,
			Type:            req.Type,
			TotalAmount:     req.TotalAmount,
			RemainingAmount: req.TotalAmount,
			TotalCount:      req.TotalCount,
			RemainingCount:  req.TotalCount,
			Greeting:        req.Greeting,
			Status:          model.RedEnvelopeStatusActive,
			ExpiresAt:       time.Now().Add(24 * time.Hour),
		}

		if err := tx.Create(&redEnvelope).Error; err != nil {
			return err
		}

		// 创建订单记录（红包支出）
		order := model.Order{
			OrderName:     fmt.Sprintf("红包支出-%s", req.Greeting),
			ClientID:      "red_envelope",
			PayerUserID:   user.ID,
			PayeeUserID:   user.ID, // 红包支出时，收款人也是自己
			Amount:        req.TotalAmount,
			Status:        model.OrderStatusSuccess,
			Type:          model.OrderTypeRedEnvelopeSend,
			Remark:        fmt.Sprintf("创建红包，共%d个", req.TotalCount),
			PaymentType:   "balance",
			TradeTime:     time.Now(),
			ExpiresAt:     time.Now().Add(24 * time.Hour),
		}
		if order.OrderName == "红包支出-" {
			order.OrderName = "红包支出"
		}

		return tx.Create(&order).Error
	}); err != nil {
		if err.Error() == common.InsufficientBalance {
			c.JSON(http.StatusBadRequest, util.Err(common.InsufficientBalance))
		} else {
			c.JSON(http.StatusInternalServerError, util.Err(err.Error()))
		}
		return
	}

	c.JSON(http.StatusOK, util.OK(CreateResponse{
		ID:   redEnvelope.ID,
		Code: code,
		Link: fmt.Sprintf("%s/redenvelope/%s", config.Config.App.FrontendURL, code),
	}))
}

// Claim 领取红包
// @Tags redenvelope
// @Accept json
// @Produce json
// @Param request body ClaimRequest true "领取红包请求"
// @Success 200 {object} util.ResponseAny
// @Router /api/v1/redenvelope/claim [post]
func Claim(c *gin.Context) {
	// 检查红包功能是否启用
	if !model.IsRedEnvelopeEnabled(c.Request.Context()) {
		c.JSON(http.StatusForbidden, util.Err("红包功能未启用"))
		return
	}

	var req ClaimRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, util.Err(err.Error()))
		return
	}

	currentUser, _ := util.GetFromContext[*model.User](c, oauth.UserObjKey)

	var claimedAmount decimal.Decimal
	var redEnvelope model.RedEnvelope

	if err := db.DB(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
		// 使用 FOR UPDATE 锁定红包记录，防止并发领取
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE", Options: "NOWAIT"}).
			Where("code = ?", req.Code).First(&redEnvelope).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New(RedEnvelopeNotFound)
			}
			return err
		}

		// 检查红包状态
		if redEnvelope.Status == model.RedEnvelopeStatusExpired || redEnvelope.ExpiresAt.Before(time.Now()) {
			return errors.New(RedEnvelopeExpired)
		}

		if redEnvelope.Status == model.RedEnvelopeStatusFinished || redEnvelope.RemainingCount <= 0 {
			return errors.New(RedEnvelopeFinished)
		}

		// 检查是否已领取
		var existingClaim model.RedEnvelopeClaim
		if err := tx.Where("red_envelope_id = ? AND user_id = ?", redEnvelope.ID, currentUser.ID).
			First(&existingClaim).Error; err == nil {
			return errors.New(RedEnvelopeAlreadyClaimed)
		}

		// 计算领取金额
		if redEnvelope.Type == model.RedEnvelopeTypeFixed {
			// 固定金额：如果是最后一个，给全部剩余金额（避免舍入误差）
			if redEnvelope.RemainingCount == 1 {
				claimedAmount = redEnvelope.RemainingAmount
			} else {
				claimedAmount = redEnvelope.TotalAmount.Div(decimal.NewFromInt(int64(redEnvelope.TotalCount))).Round(2)
			}
		} else {
			// 拼手气红包：使用二倍均值算法
			claimedAmount = calculateRandomAmount(redEnvelope.RemainingAmount, redEnvelope.RemainingCount)
		}

		// 创建领取记录
		claim := model.RedEnvelopeClaim{
			RedEnvelopeID: redEnvelope.ID,
			UserID:        currentUser.ID,
			Amount:        claimedAmount,
		}
		if err := tx.Create(&claim).Error; err != nil {
			return err
		}

		// 更新红包状态
		newRemainingCount := redEnvelope.RemainingCount - 1
		newRemainingAmount := redEnvelope.RemainingAmount.Sub(claimedAmount)
		newStatus := redEnvelope.Status
		if newRemainingCount <= 0 {
			newStatus = model.RedEnvelopeStatusFinished
		}

		if err := tx.Model(&model.RedEnvelope{}).Where("id = ?", redEnvelope.ID).
			Updates(map[string]interface{}{
				"remaining_count":  newRemainingCount,
				"remaining_amount": newRemainingAmount,
				"status":           newStatus,
			}).Error; err != nil {
			return err
		}

		// 更新红包对象用于返回
		redEnvelope.RemainingCount = newRemainingCount
		redEnvelope.RemainingAmount = newRemainingAmount
		redEnvelope.Status = newStatus

		// 增加用户余额
		if err := tx.Model(&model.User{}).Where("id = ?", currentUser.ID).
			Update("available_balance", gorm.Expr("available_balance + ?", claimedAmount)).Error; err != nil {
			return err
		}

		// 创建订单记录（红包收入）
		order := model.Order{
			OrderName:     fmt.Sprintf("红包收入-%s", redEnvelope.Greeting),
			ClientID:      "red_envelope",
			PayerUserID:   redEnvelope.CreatorID,
			PayeeUserID:   currentUser.ID,
			Amount:        claimedAmount,
			Status:        model.OrderStatusSuccess,
			Type:          model.OrderTypeRedEnvelopeReceive,
			Remark:        fmt.Sprintf("领取红包，来自创建者ID:%d", redEnvelope.CreatorID),
			PaymentType:   "balance",
			TradeTime:     time.Now(),
			ExpiresAt:     time.Now().Add(24 * time.Hour),
		}
		if order.OrderName == "红包收入-" {
			order.OrderName = "红包收入"
		}

		return tx.Create(&order).Error
	}); err != nil {
		errMsg := err.Error()
		switch errMsg {
		case RedEnvelopeNotFound:
			c.JSON(http.StatusNotFound, util.Err(errMsg))
		case RedEnvelopeExpired, RedEnvelopeFinished, RedEnvelopeAlreadyClaimed, CannotClaimOwnRedEnvelope:
			c.JSON(http.StatusBadRequest, util.Err(errMsg))
		default:
			c.JSON(http.StatusInternalServerError, util.Err(errMsg))
		}
		return
	}

	c.JSON(http.StatusOK, util.OK(ClaimResponse{
		Amount:      claimedAmount,
		RedEnvelope: &redEnvelope,
	}))
}

// GetDetail 获取红包详情
// @Tags redenvelope
// @Produce json
// @Param code path string true "红包码"
// @Success 200 {object} util.ResponseAny
// @Router /api/v1/redenvelope/{code} [get]
func GetDetail(c *gin.Context) {
	code := c.Param("code")
	currentUser, _ := util.GetFromContext[*model.User](c, oauth.UserObjKey)

	var redEnvelope model.RedEnvelope
	if err := db.DB(c.Request.Context()).
		Select("red_envelopes.*, users.username as creator_username, users.avatar_url as creator_avatar_url").
		Joins("LEFT JOIN users ON red_envelopes.creator_id = users.id").
		Where("red_envelopes.code = ?", code).First(&redEnvelope).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, util.Err(RedEnvelopeNotFound))
			return
		}
		c.JSON(http.StatusInternalServerError, util.Err(err.Error()))
		return
	}

	var claims []model.RedEnvelopeClaim
	db.DB(c.Request.Context()).
		Select("red_envelope_claims.*, users.username, users.avatar_url").
		Joins("LEFT JOIN users ON red_envelope_claims.user_id = users.id").
		Where("red_envelope_claims.red_envelope_id = ?", redEnvelope.ID).
		Order("red_envelope_claims.claimed_at DESC").
		Find(&claims)

	var userClaimed *model.RedEnvelopeClaim
	if currentUser != nil {
		for i := range claims {
			if claims[i].UserID == currentUser.ID {
				userClaimed = &claims[i]
				break
			}
		}
	}

	c.JSON(http.StatusOK, util.OK(DetailResponse{
		RedEnvelope: &redEnvelope,
		Claims:      claims,
		UserClaimed: userClaimed,
	}))
}

// List 获取红包列表
// @Tags redenvelope
// @Accept json
// @Produce json
// @Param request body ListRequest true "列表请求"
// @Success 200 {object} util.ResponseAny
// @Router /api/v1/redenvelope/list [post]
func List(c *gin.Context) {
	var req ListRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, util.Err(err.Error()))
		return
	}

	currentUser, _ := util.GetFromContext[*model.User](c, oauth.UserObjKey)

	query := db.DB(c.Request.Context()).Model(&model.RedEnvelope{}).
		Select("red_envelopes.*, users.username as creator_username, users.avatar_url as creator_avatar_url").
		Joins("LEFT JOIN users ON red_envelopes.creator_id = users.id")

	if req.Type == "sent" {
		query = query.Where("red_envelopes.creator_id = ?", currentUser.ID)
	} else if req.Type == "received" {
		query = query.Joins("INNER JOIN red_envelope_claims ON red_envelopes.id = red_envelope_claims.red_envelope_id").
			Where("red_envelope_claims.user_id = ?", currentUser.ID)
	} else {
		query = query.Where("red_envelopes.creator_id = ?", currentUser.ID)
	}

	var total int64
	query.Count(&total)

	var redEnvelopes []model.RedEnvelope
	query.Order("red_envelopes.created_at DESC").
		Offset((req.Page - 1) * req.PageSize).
		Limit(req.PageSize).
		Find(&redEnvelopes)

	c.JSON(http.StatusOK, util.OK(ListResponse{
		Total:        total,
		Page:         req.Page,
		PageSize:     req.PageSize,
		RedEnvelopes: redEnvelopes,
	}))
}

// IsEnabled 检查红包功能是否启用
// @Tags redenvelope
// @Produce json
// @Success 200 {object} util.ResponseAny
// @Router /api/v1/redenvelope/enabled [get]
func IsEnabled(c *gin.Context) {
	enabled := model.IsRedEnvelopeEnabled(c.Request.Context())
	c.JSON(http.StatusOK, util.OK(IsEnabledResponse{
		Enabled: enabled,
	}))
}

// calculateRandomAmount 二倍均值算法计算随机红包金额
func calculateRandomAmount(remaining decimal.Decimal, count int) decimal.Decimal {
	// 如果是最后一个红包，返回所有剩余金额（避免舍入误差）
	if count == 1 {
		return remaining
	}

	minAmount := decimal.NewFromFloat(0.01)
	
	// 确保剩余金额足够分配给所有人至少0.01
	minRequired := minAmount.Mul(decimal.NewFromInt(int64(count)))
	if remaining.LessThan(minRequired) {
		// 如果剩余金额不足，平均分配
		return remaining.Div(decimal.NewFromInt(int64(count))).Round(2)
	}

	// 二倍均值算法：金额范围 [0.01, min(剩余金额/剩余人数*2, 剩余金额-其他人最小金额)]
	avg := remaining.Div(decimal.NewFromInt(int64(count)))
	maxAmount := avg.Mul(decimal.NewFromInt(2))
	
	// 确保给其他人留下足够的金额（每人至少0.01）
	maxPossible := remaining.Sub(minAmount.Mul(decimal.NewFromInt(int64(count - 1))))
	if maxAmount.GreaterThan(maxPossible) {
		maxAmount = maxPossible
	}
	
	// 确保maxAmount不小于minAmount
	if maxAmount.LessThan(minAmount) {
		maxAmount = minAmount
	}

	// 生成随机金额 [minAmount, maxAmount]
	diff := maxAmount.Sub(minAmount)
	if diff.LessThanOrEqual(decimal.Zero) {
		return minAmount
	}

	// 生成随机数：转换为分（cents）来处理，避免精度问题
	diffCents := diff.Mul(decimal.NewFromInt(100)).IntPart()
	if diffCents <= 0 {
		return minAmount
	}
	
	randCents := rand.Int63n(diffCents + 1) // [0, diffCents]
	randAmount := decimal.NewFromInt(randCents).Div(decimal.NewFromInt(100))
	amount := minAmount.Add(randAmount)

	return amount.Round(2)
}