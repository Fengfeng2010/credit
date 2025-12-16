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

package task

import (
	"github.com/hibiken/asynq"
	"github.com/linux-do/pay/internal/config"
)

// RedisOpt asynq Redis 连接配置（兼容 Standalone/Sentinel/Cluster）
var RedisOpt asynq.RedisConnOpt

func init() {
	RedisOpt = NewRedisConnOpt()
}

// NewRedisConnOpt 根据配置返回对应的 asynq Redis 连接选项
func NewRedisConnOpt() asynq.RedisConnOpt {
	cfg := config.Config.Redis
	addrs := cfg.Addrs

	if cfg.ClusterMode {
		return asynq.RedisClusterClientOpt{
			Addrs:    addrs,
			Username: cfg.Username,
			Password: cfg.Password,
		}
	}

	if cfg.MasterName != "" {
		return asynq.RedisFailoverClientOpt{
			MasterName:    cfg.MasterName,
			SentinelAddrs: addrs,
			Username:      cfg.Username,
			Password:      cfg.Password,
			DB:            cfg.DB,
		}
	}

	addr := "localhost:6379"
	if len(addrs) > 0 {
		addr = addrs[0]
	}
	return asynq.RedisClientOpt{
		Addr:     addr,
		Username: cfg.Username,
		Password: cfg.Password,
		DB:       cfg.DB,
		PoolSize: cfg.PoolSize,
	}
}

// PrefixedQueue 返回带前缀的队列名，用于 Cluster 模式隔离
func PrefixedQueue(queue string) string {
	prefix := config.Config.Redis.KeyPrefix
	if prefix == "" {
		return queue
	}
	return prefix + queue
}
