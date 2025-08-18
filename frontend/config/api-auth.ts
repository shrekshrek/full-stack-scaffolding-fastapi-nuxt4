/**
 * API认证配置
 * 统一管理API路径的认证要求，避免硬编码分散在各处
 * 
 * 使用说明：
 * 1. public - 完全公开的API，无需认证
 * 2. protected - 需要认证的API（默认所有未列出的路径）
 */

// API路径认证规则
export const API_AUTH_CONFIG = {
  // 公开API路径（无需认证）
  public: [
    // 认证相关
    '/auth/login',
    '/auth/register',
    '/auth/token',
    '/auth/request-password-reset',
    '/auth/reset-password',
    '/auth/logout',
    
    // 公共资源
    '/public',
    '/health',
    '/version',
  ],
  
  // 需要认证但有特殊处理的路径（预留扩展）
  special: {
    // 例如：只读访问
    readOnly: [
      '/announcements',
      '/public-stats'
    ]
  }
}

/**
 * 检查API路径是否需要认证
 * @param path - API路径（已清理，不含/api/v1前缀）
 * @returns 是否需要认证
 */
export function requiresAuthentication(path: string): boolean {
  // 空路径或根路径不需要认证
  if (!path || path === '/') {
    return false
  }
  
  // 检查是否为公开路径
  for (const publicPath of API_AUTH_CONFIG.public) {
    // 完全匹配
    if (path === publicPath) {
      return false
    }
    
    // 前缀匹配（如 /auth/* 匹配所有auth下的路径）
    if (path.startsWith(publicPath + '/')) {
      return false
    }
  }
  
  // 默认需要认证
  return true
}

/**
 * 添加新的公开路径（动态配置）
 * @param paths - 要添加的公开路径
 */
export function addPublicPaths(paths: string[]): void {
  API_AUTH_CONFIG.public.push(...paths)
}

/**
 * 检查是否为只读路径
 * @param path - API路径
 */
export function isReadOnlyPath(path: string): boolean {
  return API_AUTH_CONFIG.special.readOnly.some(p => 
    path === p || path.startsWith(p + '/')
  )
}

// 导出类型定义
export type ApiAuthConfig = typeof API_AUTH_CONFIG