import { defineStore } from 'pinia'
import type { UserProfile } from '~/types/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null as UserProfile | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.profile,
    // 所有角色
    userRoles: (state) => state.profile?.roles || [],
    // 是否有多个角色
    hasMultipleRoles: (state) => (state.profile?.roles?.length || 0) > 1,
    // 是否为管理员（拥有admin或super_admin角色）
    isAdmin: (state) => {
      const roles = state.profile?.roles || []
      return roles.includes('admin') || roles.includes('super_admin')
    },
  },

  actions: {
    async fetchProfile() {
      // 如果已经有用户资料，就不再重复获取
      if (this.profile) {
        return
      }

      try {
        // 直接使用getMe，它内部会检查认证状态
        const { getMe } = useAuthApi()
        const data = await getMe()
        
        // 转换为 UserProfile 格式
        this.profile = {
          ...data,
          roles: data.roles.map(role => typeof role === 'string' ? role : role.name),
          avatarUrl: null,
        }
        
        // 只在开发模式下显示日志
        if (import.meta.dev) {
          console.log('User profile fetched successfully:', this.profile)
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        // 获取失败时清空旧数据
        this.profile = null
        // 重新抛出错误，让调用者处理
        throw error
      }
    },
    
    setProfile(userProfile: UserProfile) {
      this.profile = userProfile
    },
    
    updateProfile(updates: Partial<UserProfile>) {
      if (this.profile) {
        Object.assign(this.profile, updates)
      }
    },
    
    clearProfile() {
      this.profile = null
    },
  },
  
  persist: true,
}) 