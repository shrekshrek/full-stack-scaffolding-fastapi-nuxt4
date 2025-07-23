// 角色类型定义
export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  is_system: boolean;
}

// 完整的用户模型（与后端 UserRead schema 同步）
export interface User {
  id: number;
  username: string;
  email: string;
  roles: Role[]; // 用户的角色对象数组
  created_at: string; // ISO 8601 格式的时间字符串
  updated_at: string; // ISO 8601 格式的时间字符串
}

// 与后端 UserCreate schema 同步的用户创建类型
export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

// 用户资料（用于前端状态管理）
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  roles: string[]; // 用户的角色名称数组
  created_at: string;
  updated_at: string;
  // 前端扩展字段
  avatarUrl?: string | null;
} 