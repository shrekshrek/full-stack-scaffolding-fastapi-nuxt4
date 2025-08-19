/**
 * 统一路由守卫中间件
 * 
 * 整合认证和权限检查，基于配置文件自动处理所有路由的安全控制
 * 遵循 Nuxt 4 最佳实践：简洁、高效、可维护
 */

import { getRoutePermission, checkRoutePermission, DEFAULT_REDIRECT_ROUTES, AuthRequirement } from '../../config/routes'

export default defineNuxtRouteMiddleware(async (to) => {
  // 获取当前路由的权限配置
  const routeConfig = getRoutePermission(to.path)
  
  // 获取认证状态和用户信息
  const { loggedIn, session, fetch: fetchSession } = useUserSession()
  
  // 服务端特殊处理 - 只做基础认证检查
  if (import.meta.server) {
    const authReq = routeConfig.auth || AuthRequirement.REQUIRED
    
    // 需要认证的路由，检查是否有token
    if (authReq === AuthRequirement.REQUIRED && !session.value?.accessToken) {
      return navigateTo(DEFAULT_REDIRECT_ROUTES.LOGIN)
    }
    
    // 已认证用户不能访问的路由（如登录页）
    if (authReq === AuthRequirement.GUEST_ONLY && session.value?.accessToken) {
      return navigateTo(routeConfig.redirectTo || DEFAULT_REDIRECT_ROUTES.DASHBOARD)
    }
    
    // 服务端不进行复杂的权限检查，交给客户端处理
    return
  }
  
  // 客户端：如果session还未加载，先加载
  if (!session.value && loggedIn.value === undefined) {
    await fetchSession()
  }
  
  // 检查认证状态
  const isAuthenticated = loggedIn.value && 
                         session.value?.accessToken && 
                         session.value.accessToken.length > 0
  
  const user = session.value?.user || null
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
    roles: user.roles || [],
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