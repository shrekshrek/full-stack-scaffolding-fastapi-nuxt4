/**
 * 统一路由守卫中间件
 * 
 * 整合认证和权限检查，基于配置文件自动处理所有路由的安全控制
 * 遵循 Nuxt 3 最佳实践：简洁、高效、可维护
 */

import { getRoutePermission, checkRoutePermission, DEFAULT_REDIRECT_ROUTES, AuthRequirement } from '../../config/routes'

export default defineNuxtRouteMiddleware((to) => {
  // 跳过服务端渲染时的检查（避免性能问题）
  if (import.meta.server) return
  
  // 获取当前路由的权限配置
  const routeConfig = getRoutePermission(to.path)
  
  // 获取认证状态和用户信息
  const { status, data } = useAuth()
  
  // 如果认证状态还在加载中，等待
  if (status.value === 'loading') {
    return
  }
  
  // 检查认证状态
  const isAuthenticated = status.value === 'authenticated' && 
                         data.value?.accessToken && 
                         data.value.accessToken.length > 0
  
  const user = data.value?.user || null
  const authReq = routeConfig.auth || AuthRequirement.REQUIRED
  
  // 处理不同的认证要求
  switch (authReq) {
    case AuthRequirement.NONE:
      // 公开页面，无需检查
      return
      
    case AuthRequirement.GUEST_ONLY:
      // 仅未认证用户可访问
      if (isAuthenticated) {
        const redirectPath = routeConfig.redirectTo || DEFAULT_REDIRECT_ROUTES.DASHBOARD
        return navigateTo(redirectPath)
      }
      return
      
    case AuthRequirement.REQUIRED:
      // 需要认证
      if (!isAuthenticated) {
        const redirectPath = routeConfig.redirectTo || DEFAULT_REDIRECT_ROUTES.LOGIN
        return navigateTo(redirectPath)
      }
      break
  }
  
  // 如果不需要权限检查，直接通过
  if (!routeConfig.permissions && !routeConfig.requireAll && !routeConfig.customCheck) {
    return
  }
  
  // 进行权限检查
  const permissions = usePermissions()
  
  const permissionChecker = {
    hasPermission: (permission: string) => permissions.hasPermission(permission)
  }
  
  // 类型转换：UserRead -> UserInfo
  const userInfo = user ? {
    id: user.id,
    roles: user.roles.map((role: string | { name: string }) => typeof role === 'string' ? role : role.name),
    username: user.username,
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at
  } : null
  
  const result = checkRoutePermission(userInfo, permissionChecker, routeConfig)
  
  // 如果权限检查失败，处理错误
  if (!result.allowed) {
    // 重定向到配置的路径，不显示Toast避免在路由跳转时出错
    const redirectPath = routeConfig.redirectTo || DEFAULT_REDIRECT_ROUTES.DASHBOARD
    return navigateTo(redirectPath)
  }
}) 