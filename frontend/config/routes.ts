/**
 * 路由权限配置
 * 
 * 集中管理所有路由的权限要求，支持灵活的权限检查
 */

import { PERMISSIONS } from './permissions'

// 权限检查器接口
interface PermissionChecker {
  hasPermission: (permission: string) => boolean
}

// 用户信息接口（与UserRead保持一致）
interface UserInfo {
  id: number
  roles: string[]  // 用户的角色名称数组
  username: string
  email: string
  created_at: string
  updated_at: string
}

// 认证要求枚举
export enum AuthRequirement {
  NONE = 'none',           // 无需认证（公开页面）
  REQUIRED = 'required',   // 需要认证
  GUEST_ONLY = 'guest_only' // 仅未认证用户（如登录页）
}

// 路由权限配置类型
export interface RoutePermissionConfig {
  // 认证要求
  auth?: AuthRequirement
  // 需要的权限（满足任意一个即可）
  permissions?: string[]
  // 需要的权限组（必须全部满足）
  requireAll?: string[]
  // 自定义权限检查函数
  customCheck?: (user: UserInfo | null, permissions: PermissionChecker) => boolean
  // 权限不足时的重定向路径
  redirectTo?: string
  // 错误消息
  errorMessage?: string
}

// 默认重定向路径
export const DEFAULT_REDIRECT_ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  FORBIDDEN: '/403'
}

// 路由权限映射（简化版）
export const ROUTE_PERMISSIONS: Record<string, RoutePermissionConfig> = {
  // 公开页面
  '/': { auth: AuthRequirement.NONE },
  
  // 仅未认证用户可访问
  '/login': { 
    auth: AuthRequirement.GUEST_ONLY,
    redirectTo: DEFAULT_REDIRECT_ROUTES.DASHBOARD
  },
  '/register': { 
    auth: AuthRequirement.GUEST_ONLY,
    redirectTo: DEFAULT_REDIRECT_ROUTES.DASHBOARD
  },
  '/reset-password': { 
    auth: AuthRequirement.GUEST_ONLY,
    redirectTo: DEFAULT_REDIRECT_ROUTES.DASHBOARD
  },
  '/request-password-reset': { 
    auth: AuthRequirement.GUEST_ONLY,
    redirectTo: DEFAULT_REDIRECT_ROUTES.DASHBOARD
  },
  
  // 需要认证的页面
  '/dashboard': {
    auth: AuthRequirement.REQUIRED,
    permissions: [PERMISSIONS.PAGE_DASHBOARD],
    errorMessage: '需要工作台访问权限'
  },
  
  '/profile': { auth: AuthRequirement.REQUIRED },
  '/settings': { auth: AuthRequirement.REQUIRED },
  
  // 权限示例页面（仅开发/演示用）
  '/example-permissions': {
    auth: AuthRequirement.REQUIRED,
    permissions: [PERMISSIONS.PAGE_DASHBOARD],
    errorMessage: '需要基础权限才能查看权限示例'
  },
  
  // 用户管理
  '/users': {
    auth: AuthRequirement.REQUIRED,
    permissions: [PERMISSIONS.PAGE_USERS],
    errorMessage: '需要用户管理页面访问权限'
  },
  
  '/users/[id]': {
    auth: AuthRequirement.REQUIRED,
    permissions: [PERMISSIONS.USER_READ],
    errorMessage: '需要查看用户权限'
  },
  
  '/users/[id]/edit': {
    auth: AuthRequirement.REQUIRED,
    permissions: [PERMISSIONS.USER_WRITE],
    errorMessage: '需要编辑用户权限'
  },
  
  // RBAC 管理
  '/rbac/roles': {
    auth: AuthRequirement.REQUIRED,
    permissions: [PERMISSIONS.PAGE_ROLES],
    errorMessage: '需要角色管理页面访问权限'
  },
  
  '/rbac/permissions': {
    auth: AuthRequirement.REQUIRED,
    permissions: [PERMISSIONS.PAGE_PERMISSIONS],
    errorMessage: '需要权限管理页面访问权限'
  },
  
  '/rbac/roles/create': {
    auth: AuthRequirement.REQUIRED,
    permissions: [PERMISSIONS.ROLE_WRITE],
    errorMessage: '需要创建角色权限'
  },
  
  '/rbac/roles/[id]/edit': {
    auth: AuthRequirement.REQUIRED,
    permissions: [PERMISSIONS.ROLE_WRITE],
    errorMessage: '需要编辑角色权限'
  },
  
  '/rbac/permissions/create': {
    auth: AuthRequirement.REQUIRED,
    permissions: [PERMISSIONS.PERMISSION_WRITE],
    errorMessage: '需要创建权限权限'
  },
  
  '/rbac/permissions/[id]/edit': {
    auth: AuthRequirement.REQUIRED,
    permissions: [PERMISSIONS.PERMISSION_WRITE],
    errorMessage: '需要编辑权限权限'
  },
  
  // 图表页面
  '/charts': {
    auth: AuthRequirement.REQUIRED,
    permissions: [PERMISSIONS.PAGE_DASHBOARD],
    errorMessage: '需要工作台访问权限'
  },
  
  // 系统管理页面（需要多个权限）
  '/system': {
    auth: AuthRequirement.REQUIRED,
    requireAll: [PERMISSIONS.USER_WRITE, PERMISSIONS.ROLE_WRITE, PERMISSIONS.PERMISSION_READ],
    errorMessage: '需要系统管理权限'
  },
  
  // 高级设置页面（自定义权限检查）
  '/advanced': {
    auth: AuthRequirement.REQUIRED,
    customCheck: (user, permissions) => {
      // 只有超级管理员或拥有所有核心权限的用户可以访问
      if (user?.roles?.includes('super_admin')) {
        return true
      }
      return permissions.hasPermission(PERMISSIONS.USER_DELETE) && 
             permissions.hasPermission(PERMISSIONS.ROLE_DELETE) && 
             permissions.hasPermission(PERMISSIONS.PERMISSION_DELETE)
    },
    errorMessage: '需要高级管理权限'
  }
}

// 检查路由是否需要权限
export const getRoutePermission = (path: string): RoutePermissionConfig => {
  // 精确匹配
  if (ROUTE_PERMISSIONS[path]) {
    return ROUTE_PERMISSIONS[path]
  }
  
  // 模糊匹配（支持动态路由）
  for (const [route, config] of Object.entries(ROUTE_PERMISSIONS)) {
    if (route.includes('[') || route.includes(':')) {
      // 处理动态路由匹配
      const pattern = route.replace(/\[.*?\]/g, '[^/]+').replace(/:\w+/g, '[^/]+')
      const regex = new RegExp(`^${pattern}$`)
      if (regex.test(path)) {
        return config
      }
    }
    
    // 前缀匹配
    if (path.startsWith(route) && route !== '/') {
      return config
    }
  }
  
  // 默认配置：需要认证
  return {
    auth: AuthRequirement.REQUIRED,
    redirectTo: DEFAULT_REDIRECT_ROUTES.LOGIN
  }
}

// 检查用户是否有权限访问路由
export const checkRoutePermission = (
  user: UserInfo | null,
  permissions: PermissionChecker,
  config: RoutePermissionConfig
): { allowed: boolean; message?: string } => {
  const authReq = config.auth || AuthRequirement.REQUIRED
  
  // 处理不同的认证要求
  switch (authReq) {
    case AuthRequirement.NONE:
      // 公开页面，无需检查
      break
      
    case AuthRequirement.GUEST_ONLY:
      // 仅未认证用户可访问
      if (user) {
        return { allowed: false, message: '已登录用户无法访问此页面' }
      }
      return { allowed: true }
      
    case AuthRequirement.REQUIRED:
      // 需要认证
      if (!user) {
        return { allowed: false, message: '请先登录' }
      }
      break
  }
  
  // 如果只需要认证，不需要特定权限
  if (!config.permissions && !config.requireAll && !config.customCheck) {
    return { allowed: true }
  }
  
  // 自定义权限检查
  if (config.customCheck) {
    const allowed = config.customCheck(user, permissions)
    return { 
      allowed, 
      message: allowed ? undefined : (config.errorMessage || '权限不足') 
    }
  }
  
  // 检查权限（满足任意一个即可）
  if (config.permissions) {
    const hasPermission = config.permissions.some(permission => 
      permissions.hasPermission(permission)
    )
    if (!hasPermission) {
      return { 
        allowed: false, 
        message: config.errorMessage || '权限不足' 
      }
    }
  }
  
  // 检查权限组（必须全部满足）
  if (config.requireAll) {
    const hasAllPermissions = config.requireAll.every(permission => 
      permissions.hasPermission(permission)
    )
    if (!hasAllPermissions) {
      return { 
        allowed: false, 
        message: config.errorMessage || '权限不足' 
      }
    }
  }
  
  return { allowed: true }
} 