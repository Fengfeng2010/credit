/*
 * MIT License
 *
 * Copyright (c) 2025 linux.do
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

package db

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/linux-do/pay/internal/config"
	"github.com/redis/go-redis/extra/redisotel/v9"
	"github.com/redis/go-redis/v9"
)

var (
	Redis redis.UniversalClient
)

func init() {
	cfg := config.Config.Redis

	if !cfg.Enabled {
		log.Println("[Redis] is disabled, skipping Redis initialization")
		return
	}

	if cfg.ClusterMode {
		// Cluster 模式
		Redis = redis.NewClusterClient(&redis.ClusterOptions{
			Addrs:           cfg.Addrs,
			Username:        cfg.Username,
			Password:        cfg.Password,
			PoolSize:        cfg.PoolSize,
			MinIdleConns:    cfg.MinIdleConn,
			DialTimeout:     time.Duration(cfg.DialTimeout) * time.Second,
			ReadTimeout:     time.Duration(cfg.ReadTimeout) * time.Second,
			WriteTimeout:    time.Duration(cfg.WriteTimeout) * time.Second,
			MaxRetries:      cfg.MaxRetries,
			PoolTimeout:     time.Duration(cfg.PoolTimeout) * time.Second,
			ConnMaxIdleTime: time.Duration(cfg.ConnMaxIdleTime) * time.Second,
		})
		log.Println("[Redis] initialized in Cluster mode")
	} else {
		// Standalone 或 Sentinel 模式
		Redis = redis.NewUniversalClient(&redis.UniversalOptions{
			Addrs:           cfg.Addrs,
			MasterName:      cfg.MasterName, // 非空时启用 Sentinel
			Username:        cfg.Username,
			Password:        cfg.Password,
			DB:              cfg.DB,
			PoolSize:        cfg.PoolSize,
			MinIdleConns:    cfg.MinIdleConn,
			DialTimeout:     time.Duration(cfg.DialTimeout) * time.Second,
			ReadTimeout:     time.Duration(cfg.ReadTimeout) * time.Second,
			WriteTimeout:    time.Duration(cfg.WriteTimeout) * time.Second,
			MaxRetries:      cfg.MaxRetries,
			PoolTimeout:     time.Duration(cfg.PoolTimeout) * time.Second,
			ConnMaxIdleTime: time.Duration(cfg.ConnMaxIdleTime) * time.Second,
		})
		if cfg.MasterName != "" {
			log.Println("[Redis] initialized in Sentinel mode")
		} else {
			log.Println("[Redis] initialized in Standalone mode")
		}
	}

	// OpenTelemetry 追踪（UniversalClient 兼容）
	if err := redisotel.InstrumentTracing(Redis); err != nil {
		log.Fatalf("[Redis] failed to init trace: %v\n", err)
	}

	// 测试连接
	_, err := Redis.Ping(context.Background()).Result()
	if err != nil {
		log.Fatalf("[Redis] failed to connect to redis: %v\n", err)
	}
}

// PrefixedKey 返回带前缀的 Key
func PrefixedKey(key string) string {
	prefix := config.Config.Redis.KeyPrefix
	if prefix == "" {
		return key
	}
	return prefix + key
}

// HSetJSON 将泛型数据序列化为 JSON 并设置到 Redis Hash
// ctx: 上下文
// hashKey: Redis Hash key
// fieldKey: Hash field key
// data: 要存储的数据（泛型）
func HSetJSON[T any](ctx context.Context, hashKey, fieldKey string, data T) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	if err := Redis.HSet(ctx, PrefixedKey(hashKey), fieldKey, jsonData).Err(); err != nil {
		return fmt.Errorf("failed to set redis hash: %w", err)
	}

	return nil
}

// HGetJSON 从 Redis Hash 获取数据并反序列化为泛型类型
// ctx: 上下文
// hashKey: Redis Hash key
// fieldKey: Hash field key
// data: 用于接收数据的指针（泛型）
func HGetJSON[T any](ctx context.Context, hashKey, fieldKey string, data *T) error {
	val, err := Redis.HGet(ctx, PrefixedKey(hashKey), fieldKey).Result()
	if err != nil {
		return err
	}

	if err := json.Unmarshal([]byte(val), data); err != nil {
		return fmt.Errorf("failed to unmarshal data: %w", err)
	}

	return nil
}
