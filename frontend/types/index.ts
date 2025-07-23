// 用户相关类型
export type {
  User,
  UserCreate,
  UserProfile,
} from './user'

// 认证相关类型
export type {
  Token,
  TokenData,
  PasswordResetRequest,
  PasswordReset,
  Msg,
  LoginRequest,
  RegisterRequest,
  AuthStatus,
  ApiResponse,
  ApiError,
} from './auth'

// 通用类型
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  has_next: boolean
  has_prev: boolean
}

// 表单验证类型
export interface FormErrors {
  [key: string]: string[]
}

// 通用状态类型
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// 通用操作结果类型
export interface OperationResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
} 