// 角色类型定义
export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  is_system: boolean;
}

// 用户相关类型定义
export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[]; // 用户的角色名称数组（与后端UserRead schema一致）
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  password?: string;
}

// 分页相关类型
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  page_size: number;
}

// @nuxt/ui 兼容的颜色类型
export type UIColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' 

// 用户相关的特定类型可以在这里定义 