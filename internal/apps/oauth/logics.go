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

package oauth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/linux-do/credit/internal/common"
	"github.com/linux-do/credit/internal/config"
	"github.com/linux-do/credit/internal/db"
	"github.com/linux-do/credit/internal/model"
	"github.com/linux-do/credit/internal/otel_trace"
	"go.opentelemetry.io/otel/codes"
	"gorm.io/gorm"
)

func GetUserIDFromSession(s sessions.Session) uint64 {
	userID, ok := s.Get(UserIDKey).(uint64)
	if !ok {
		return 0
	}
	return userID
}

func GetUserIDFromContext(c *gin.Context) uint64 {
	session := sessions.Default(c)
	return GetUserIDFromSession(session)
}

// doOAuth 执行 OAuth2/OIDC 认证流程
func doOAuth(ctx context.Context, code string, nonce string) (*model.User, error) {
	ctx, span := otel_trace.Start(ctx, "OAuth")
	defer span.End()

	// 使用授权码换取 Token
	token, err := oauthConf.Exchange(ctx, code)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	var userInfo model.OAuthUserInfo

	if oidcVerifier != nil {
		if rawIDToken, ok := token.Extra("id_token").(string); ok {
			idToken, verifyErr := oidcVerifier.Verify(ctx, rawIDToken)
			if verifyErr != nil {
				err := fmt.Errorf("%s: %w", IDTokenVerifyFailed, verifyErr)
				span.SetStatus(codes.Error, err.Error())
				return nil, err
			}
			if nonce != "" && idToken.Nonce != nonce {
				span.SetStatus(codes.Error, NonceMismatch)
				return nil, errors.New(NonceMismatch)
			}
			if claimsErr := idToken.Claims(&userInfo); claimsErr != nil {
				span.SetStatus(codes.Error, claimsErr.Error())
				return nil, claimsErr
			}
		}
	}

	if userInfo.GetID() == 0 {
		client := oauthConf.Client(ctx, token)
		resp, httpErr := client.Get(config.Config.OAuth2.UserEndpoint)
		if httpErr != nil {
			span.SetStatus(codes.Error, httpErr.Error())
			return nil, httpErr
		}
		defer resp.Body.Close()

		responseData, readErr := io.ReadAll(resp.Body)
		if readErr != nil {
			span.SetStatus(codes.Error, readErr.Error())
			return nil, readErr
		}
		if unmarshalErr := json.Unmarshal(responseData, &userInfo); unmarshalErr != nil {
			span.SetStatus(codes.Error, unmarshalErr.Error())
			return nil, unmarshalErr
		}
	}

	if !userInfo.Active {
		err = errors.New(common.BannedAccount)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	// 处理用户信息同步逻辑
	var user model.User

	txByUsername := db.DB(ctx).Where("username = ?", userInfo.Username).First(&user)
	if txByUsername.Error != nil {
		txByID := user.GetByID(db.DB(ctx), userInfo.GetID())
		if txByID == nil {
			// ID 存在但 username 不匹配(用户改名)
			if err = user.CheckActive(); err != nil {
				span.SetStatus(codes.Error, err.Error())
				return nil, err
			}
			user.UpdateFromOAuthInfo(&userInfo)
			if err = db.DB(ctx).Save(&user).Error; err != nil {
				span.SetStatus(codes.Error, err.Error())
				return nil, err
			}
		} else if errors.Is(txByUsername.Error, gorm.ErrRecordNotFound) {
			// ID 和 username 都不存在(全新用户)
			user = model.User{}
			if err = user.CreateWithInitialCredit(ctx, &userInfo); err != nil {
				span.SetStatus(codes.Error, err.Error())
				return nil, err
			}
		} else {
			// query failed
			span.SetStatus(codes.Error, txByUsername.Error.Error())
			return nil, txByUsername.Error
		}
	} else {
		if user.ID != userInfo.GetID() {
			// username 相同但 ID 不同(账户注销后被新用户占用)
			if err = user.CreateWithInitialCredit(ctx, &userInfo); err != nil {
				span.SetStatus(codes.Error, err.Error())
				return nil, err
			}
		} else {
			if err = user.CheckActive(); err != nil {
				span.SetStatus(codes.Error, err.Error())
				return nil, err
			}
			user.UpdateFromOAuthInfo(&userInfo)
			if err = db.DB(ctx).Save(&user).Error; err != nil {
				span.SetStatus(codes.Error, err.Error())
				return nil, err
			}
		}
	}
	return &user, nil
}
