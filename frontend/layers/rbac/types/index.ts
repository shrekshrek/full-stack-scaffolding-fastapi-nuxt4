// RBAC 相关类型定义
export interface Role {
  id: number
  name: string
  display_name: string
  description?: string
  is_system: boolean
  created_at: string
  updated_at: string
  permissions?: Permission[]
}

export interface Permission {
  id: number
  name: string
  display_name: string
  resource: string
  action: string
  description?: string
  is_system: boolean
  created_at: string
  updated_at: string
}

export interface RolePermission {
  role_id: number
  permission_id: number
  created_at: string
}

export interface UserRole {
  user_id: number
  role_id: number
  created_at: string
}

// 表单相关类型
export interface RoleCreate {
  name: string
  display_name: string
  description?: string
}

export interface RoleUpdate {
  name?: string
  display_name?: string
  description?: string
}

export interface PermissionCreate {
  name: string
  display_name: string
  resource: string
  action: string
  description?: string
}

export interface PermissionUpdate {
  name?: string
  display_name?: string
  resource?: string
  action?: string
  description?: string
}

// 分页相关类型
export interface PaginationParams {
  page?: number
  page_size?: number
  search?: string
}

export interface PaginationResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// API 响应类型
export interface RoleListResponse {
  items: Role[]
  total: number
  page: number
  page_size: number
}

export interface PermissionListResponse {
  items: Permission[]
  total: number
  page: number
  page_size: number
} 