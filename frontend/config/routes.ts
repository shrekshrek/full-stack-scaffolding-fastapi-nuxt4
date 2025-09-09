/**
 * 统一路由权限配置（简化版）
 * 
 * 所有路由权限在一个地方配置，避免分散管理
 */

import { PERMISSIONS } from './permissions'
import type { Permission } from '../types/permissions'

// ============================================================================
// 路由权限映射（统一管理所有权限）
// ============================================================================

export const ROUTE_PERMISSIONS: Record<string, Permission | Permission[] | null> = {
  // ========================================================================
  // 基础页面（只需登录，无特定权限要求）
  // ========================================================================
  '/dashboard': null,  // 所有登录用户都可访问
  '/profile': null,
  '/settings': null,
  '/charts': null,
  
  // ========================================================================
  // 用户管理模块
  // ========================================================================
  '/users': PERMISSIONS.USER_MGMT_ACCESS,
  '/users/create': PERMISSIONS.USER_WRITE,
  '/users/[id]': PERMISSIONS.USER_READ,
  '/users/[id]/edit': PERMISSIONS.USER_WRITE,
  '/users/[id]/roles': PERMISSIONS.USER_WRITE,
  
  // ========================================================================
  // RBAC管理模块
  // ========================================================================
  '/rbac': PERMISSIONS.ROLE_MGMT_ACCESS,
  '/rbac/roles': PERMISSIONS.ROLE_MGMT_ACCESS,
  '/rbac/roles/create': PERMISSIONS.ROLE_WRITE,
  '/rbac/roles/[id]': PERMISSIONS.ROLE_READ,
  '/rbac/roles/[id]/edit': PERMISSIONS.ROLE_WRITE,
  '/rbac/roles/[id]/permissions': PERMISSIONS.ROLE_WRITE,
  '/rbac/permissions': PERMISSIONS.PERM_MGMT_ACCESS,
  '/rbac/permissions/[id]': PERMISSIONS.PERMISSION_READ,
  
  // ========================================================================
  // 扩展示例（根据需要添加）
  // ========================================================================
  // '/reports': { target: 'reports', action: 'access' },
  // '/reports/create': { target: 'reports', action: 'write' },
  // '/reports/export': { target: 'reports', action: 'export' },
  // 
  // // 需要多个权限的示例
  // '/system/advanced': [
  //   { target: 'user', action: 'write' },
  //   { target: 'role', action: 'write' }
  // ],
}

/**
 * 获取路由所需权限
 */
export function getRoutePermissions(path: string): Permission | Permission[] | null {
  // 1. 精确匹配
  if (ROUTE_PERMISSIONS[path] !== undefined) {
    return ROUTE_PERMISSIONS[path]
  }
  
  // 2. 动态路由匹配（处理 [id] 等参数）
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (route.includes('[')) {
      // 将动态路由模式转换为正则
      // /users/[id]/edit -> /users/[^/]+/edit
      const pattern = route.replace(/\[.*?\]/g, '[^/]+')
      const regex = new RegExp(`^${pattern}$`)
      if (regex.test(path)) {
        return permission
      }
    }
  }
  
  // 3. 模块前缀匹配（兜底策略）
  // 如果没有精确匹配，检查模块级权限
  const pathParts = path.split('/')
  if (pathParts.length >= 2) {
    const modulePrefix = '/' + pathParts[1]
    if (ROUTE_PERMISSIONS[modulePrefix] !== undefined) {
      return ROUTE_PERMISSIONS[modulePrefix]
    }
  }
  
  // 4. 无权限要求（默认只需登录）
  return null
}

/**
 * 检查是否为公开页面（无需登录）
 */
export function isPublicPage(path: string): boolean {
  const publicPages = [
    '/',           // 首页
    '/401',        // 未授权
    '/403',        // 禁止访问
    '/404',        // 页面不存在
    '/500',        // 服务器错误
  ]
  return publicPages.includes(path)
}

/**
 * 检查是否为客人专用页面（已登录用户不能访问）
 */
export function isGuestOnlyPage(path: string): boolean {
  const guestPages = [
    '/login',
    '/register',
    '/reset-password',
    '/request-password-reset',
  ]
  return guestPages.some(page => path.startsWith(page))
}

// ============================================================================
// 导出用户信息接口（用于类型安全）
// ============================================================================

export interface UserInfo {
  id: number
  roles: string[]
  username: string
  email: string
  created_at: string
  updated_at: string
}