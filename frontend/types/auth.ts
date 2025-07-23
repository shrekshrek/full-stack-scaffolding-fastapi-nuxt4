// 与后端 Token schema 同步的令牌类型
export interface Token {
  access_token: string;
  token_type: string;
}

// 与后端 TokenData schema 同步的令牌数据类型
export interface TokenData {
  username: string | null;
}

// 与后端 PasswordResetRequest schema 同步的密码重置请求类型
export interface PasswordResetRequest {
  email: string;
}

// 与后端 PasswordReset schema 同步的密码重置类型
export interface PasswordReset {
  token: string;
  new_password: string;
}

// 与后端 Msg schema 同步的消息类型
export interface Msg {
  msg: string;
}

// 登录请求类型（用于表单）
export interface LoginRequest {
  username: string;
  password: string;
}

// 注册请求类型（用于表单）
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string; // 前端表单验证用
}

// 认证状态类型
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

// API 响应包装类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 错误响应类型
export interface ApiError {
  detail: string | Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
} 