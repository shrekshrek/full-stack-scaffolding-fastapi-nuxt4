/**
 * 认证初始化插件
 * 
 * 在客户端应用启动时统一初始化认证状态
 */
export default defineNuxtPlugin(async () => {
  if (import.meta.server) return

  const { status, data } = useAuth()
  const { useUserStore } = await import('../../layers/auth/stores/user')
  const { usePermissionsStore } = await import('../../stores/permissions')
  const userStore = useUserStore()
  const permissionsStore = usePermissionsStore()

  // 等待认证状态稳定（最多3秒）
  await new Promise<void>((resolve) => {
    let stopWatching: (() => void) | null = null
    
    // 3秒超时保护，避免无限等待
    const timeout = setTimeout(() => {
      console.warn('[Auth Init] Authentication status check timeout after 3 seconds')
      if (stopWatching) stopWatching()
      resolve()
    }, 3000)
    
    stopWatching = watch(
      () => status.value,
      (newStatus) => {
        if (newStatus !== 'loading') {
          clearTimeout(timeout)
          if (stopWatching) stopWatching()
          resolve()
        }
      },
      { immediate: true }
    )
  })

  // 检查认证状态和token的有效性
  const isAuthenticated = status.value === 'authenticated'
  const hasValidToken = data.value?.accessToken && data.value.accessToken.length > 0

  // 如果用户已认证且有有效token，获取用户信息和权限配置
  if (isAuthenticated && hasValidToken) {
    try {
      // 并行获取用户信息和权限配置
      await Promise.all([
        userStore.fetchProfile(),
        permissionsStore.fetchPermissionsConfig()
      ])
    } catch {
      // 如果获取用户信息失败，可能token已过期，清除认证状态
      const { signOut } = useAuth()
      await signOut({ redirect: false })
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