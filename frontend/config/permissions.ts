/**
 * 权限配置文件
 * 
 * 集中管理角色权限映射，确保前后端权限配置一致
 * 支持系统级权限保护机制
 */

// 系统级权限定义（不可删除，受保护）
export const SYSTEM_PERMISSIONS = {
  // 用户管理权限
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',
  
  // 角色管理权限
  ROLE_READ: 'role:read',
  ROLE_WRITE: 'role:write',
  ROLE_DELETE: 'role:delete',
  
  // 权限管理权限
  PERMISSION_READ: 'permission:read',
  PERMISSION_WRITE: 'permission:write',
  PERMISSION_DELETE: 'permission:delete',
  
  // RBAC核心页面权限
  PAGE_USERS: 'page:users',
  PAGE_ROLES: 'page:roles',
  PAGE_PERMISSIONS: 'page:permissions',
} as const

// 业务级权限定义（可删除，可扩展）
export const BUSINESS_PERMISSIONS = {
  // 业务页面访问权限
  PAGE_DASHBOARD: 'page:dashboard',
} as const

// 统一权限定义（向后兼容）
export const PERMISSIONS = {
  ...SYSTEM_PERMISSIONS,
  ...BUSINESS_PERMISSIONS,
} as const

// 系统级角色定义（不可删除）
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user',
} as const

// 权限分类工具函数
export const isSystemPermission = (permission: string): boolean => {
  return Object.values(SYSTEM_PERMISSIONS).includes(permission as (typeof SYSTEM_PERMISSIONS)[keyof typeof SYSTEM_PERMISSIONS])
}

export const isBusinessPermission = (permission: string): boolean => {
  return Object.values(BUSINESS_PERMISSIONS).includes(permission as (typeof BUSINESS_PERMISSIONS)[keyof typeof BUSINESS_PERMISSIONS])
}

export const isSystemRole = (role: string): boolean => {
  return Object.values(SYSTEM_ROLES).includes(role as (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES])
}

// 权限分组（用于UI展示）
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: {
    label: '用户管理',
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.USER_WRITE,
      PERMISSIONS.USER_DELETE,
    ]
  },
  ROLE_MANAGEMENT: {
    label: '角色管理',
    permissions: [
      PERMISSIONS.ROLE_READ,
      PERMISSIONS.ROLE_WRITE,
      PERMISSIONS.ROLE_DELETE,
    ]
  },
  PERMISSION_MANAGEMENT: {
    label: '权限管理',
    permissions: [
      PERMISSIONS.PERMISSION_READ,
      PERMISSIONS.PERMISSION_WRITE,
      PERMISSIONS.PERMISSION_DELETE,
    ]
  },
  PAGE_ACCESS: {
    label: '页面访问',
    permissions: [
      PERMISSIONS.PAGE_DASHBOARD,
      PERMISSIONS.PAGE_USERS,
      PERMISSIONS.PAGE_ROLES,
      PERMISSIONS.PAGE_PERMISSIONS,
    ]
  }
} as const

// 角色权限映射（默认配置，实际权限从后端获取）
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  [SYSTEM_ROLES.SUPER_ADMIN]: [
    // 超级管理员拥有所有权限
    ...Object.values(PERMISSIONS)
  ],
  [SYSTEM_ROLES.ADMIN]: [
    // 管理员拥有大部分权限，但不能删除权限
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.ROLE_WRITE,
    PERMISSIONS.PERMISSION_READ,
    PERMISSIONS.PAGE_DASHBOARD,
    PERMISSIONS.PAGE_USERS,
    PERMISSIONS.PAGE_ROLES,
    PERMISSIONS.PAGE_PERMISSIONS,
  ],
  [SYSTEM_ROLES.USER]: [
    // 普通用户只能访问基础功能
    PERMISSIONS.PAGE_DASHBOARD,
  ],
}

// 权限检查工具函数
export const getPermissionGroup = (permission: string): string | null => {
  for (const [groupKey, group] of Object.entries(PERMISSION_GROUPS)) {
    if (group.permissions.some(p => p === permission)) {
      return groupKey
    }
  }
  return null
}

// 获取权限显示名称
export const getPermissionDisplayName = (permission: string): string => {
  const displayNames: Record<string, string> = {
    [PERMISSIONS.USER_READ]: '查看用户',
    [PERMISSIONS.USER_WRITE]: '编辑用户',
    [PERMISSIONS.USER_DELETE]: '删除用户',
    [PERMISSIONS.ROLE_READ]: '查看角色',
    [PERMISSIONS.ROLE_WRITE]: '编辑角色',
    [PERMISSIONS.ROLE_DELETE]: '删除角色',
    [PERMISSIONS.PERMISSION_READ]: '查看权限',
    [PERMISSIONS.PERMISSION_WRITE]: '编辑权限',
    [PERMISSIONS.PERMISSION_DELETE]: '删除权限',
    [PERMISSIONS.PAGE_DASHBOARD]: '访问工作台',
    [PERMISSIONS.PAGE_USERS]: '访问用户管理',
    [PERMISSIONS.PAGE_ROLES]: '访问角色管理',
    [PERMISSIONS.PAGE_PERMISSIONS]: '访问权限管理',
  }
  return displayNames[permission] || permission
}

// 获取角色显示名称
export const getRoleDisplayName = (role: string): string => {
  const displayNames: Record<string, string> = {
    [SYSTEM_ROLES.SUPER_ADMIN]: '超级管理员',
    [SYSTEM_ROLES.ADMIN]: '管理员',
    [SYSTEM_ROLES.USER]: '普通用户',
  }
  return displayNames[role] || role
} 