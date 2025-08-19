/**
 * 认证初始化插件
 * 
 * 在客户端应用启动时统一初始化认证状态
 */
export default defineNuxtPlugin(async () => {
  if (import.meta.server) return

  const { loggedIn, session, fetch: fetchSession, clear: clearSession } = useUserSession()
  const { useUserStore } = await import('../../layers/auth/stores/user')
  const { usePermissionsStore } = await import('../../stores/permissions')
  const userStore = useUserStore()
  const permissionsStore = usePermissionsStore()

  // 初始化session
  await fetchSession()

  // 检查认证状态和token的有效性
  const isAuthenticated = loggedIn.value
  const hasValidToken = session.value?.accessToken && session.value.accessToken.length > 0

  // 如果用户已认证且有有效token，获取用户信息和权限配置
  if (isAuthenticated && hasValidToken) {
    try {
      // 设置用户信息到store
      if (session.value?.user) {
        userStore.setUser(session.value.user)
      }
      
      // 并行获取用户详细信息和权限配置
      await Promise.all([
        userStore.fetchProfile().catch(() => {
          // 如果获取失败，使用session中的用户信息
          if (session.value?.user) {
            userStore.setUser(session.value.user)
          }
        }),
        permissionsStore.fetchPermissionsConfig()
      ])
    } catch (error) {
      console.error('[Auth Init] Failed to initialize user data:', error)
      // 如果获取用户信息失败，可能token已过期，清除认证状态
      await clearSession()
      userStore.clearProfile()
      permissionsStore.reset()
      // 设置默认配置以确保权限检查能正常工作
      permissionsStore.setDefaultConfig()
    }
  } else {
    userStore.clearProfile()
    // 未认证状态下直接使用默认配置
    permissionsStore.setDefaultConfig()
  }
}) 