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

package util

// Response 通用响应体
type Response[T any] struct {
	ErrorMsg string `json:"error_msg"`
	Data     T      `json:"data"`
}

// ResponseAny 用于 Swagger 文档的响应类型（非泛型）
// swag 不支持泛型，使用此类型替代 Response[T]
type ResponseAny struct {
	ErrorMsg string      `json:"error_msg" example:""`
	Data     interface{} `json:"data"`
}

// OK 构造成功响应
func OK[T any](data T) Response[T] {
	return Response[T]{Data: data}
}

// OKNil 构造成功响应（data 为 null）
func OKNil() Response[any] {
	return Response[any]{Data: nil}
}

// Err 构造错误响应
func Err(msg string) Response[any] {
	return Response[any]{ErrorMsg: msg, Data: nil}
}
