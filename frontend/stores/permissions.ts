/**
 * 权限配置 Store
 * 
 * 管理从后端动态获取的权限配置，包括权限定义和角色权限映射
 * 使用 Options API 模式确保 SSR Hydration 兼容性
 */
import { defineStore } from 'pinia'

export interface Permission {
  id: number
  name: string
  display_name: string
  resource: string
  action: string
  description?: string
  is_system?: boolean  // 添加系统级权限标识
  created_at?: string
}

interface Role {
  id: number
  name: string
  display_name: string
  description?: string
  is_system?: boolean  // 添加系统级角色标识
  permissions: Permission[]
}

interface PermissionsState {
  permissions: Permission[]
  roles: Role[]
  rolePermissions: Record<string, string[]>
  initialized: boolean
  loading: boolean
  error: string | null
}

export const usePermissionsStore = defineStore('permissions', {
  state: (): PermissionsState => ({
    permissions: [],
    roles: [],
    rolePermissions: {},
    initialized: false,
    loading: false,
    error: null
  }),

  getters: {
    // 获取角色的权限列表
    getRolePermissions: (state) => (roleName: string): string[] => {
      return state.rolePermissions[roleName] || []
    },

    // 检查角色是否有特定权限
    hasRolePermission: (state) => (roleName: string, permission: string): boolean => {
      const rolePermissions = state.rolePermissions[roleName] || []
      return rolePermissions.includes(permission)
    },

    // 检查多个角色是否有特定权限（任一角色拥有即可）
    hasAnyRolePermission: (state) => (roleNames: string[], permission: string): boolean => {
      return roleNames.some(roleName => {
        const rolePermissions = state.rolePermissions[roleName] || []
        return rolePermissions.includes(permission)
      })
    },

    // 获取多个角色的聚合权限列表
    getAggregatedPermissions: (state) => (roleNames: string[]): string[] => {
      const allPermissions = new Set<string>()
      roleNames.forEach(roleName => {
        const rolePermissions = state.rolePermissions[roleName] || []
        rolePermissions.forEach(permission => allPermissions.add(permission))
      })
      return Array.from(allPermissions)
    },

    // 获取权限显示名称
    getPermissionDisplayName: (state) => (permissionName: string): string => {
      const permission = state.permissions.find(p => p.name === permissionName)
      return permission?.display_name || permissionName
    },

    // 获取角色显示名称
    getRoleDisplayName: (state) => (roleName: string): string => {
      const role = state.roles.find(r => r.name === roleName)
      return role?.display_name || roleName
    },

    // 检查权限是否为系统级权限
    isSystemPermission: (state) => (permissionName: string): boolean => {
      const permission = state.permissions.find(p => p.name === permissionName)
      return permission?.is_system || false
    },

    // 检查角色是否为系统级角色
    isSystemRole: (state) => (roleName: string): boolean => {
      const role = state.roles.find(r => r.name === roleName)
      return role?.is_system || false
    },

    // 获取系统级权限列表
    getSystemPermissions: (state) => (): Permission[] => {
      return state.permissions.filter(p => p.is_system)
    },

    // 获取业务级权限列表
    getBusinessPermissions: (state) => (): Permission[] => {
      return state.permissions.filter(p => !p.is_system)
    }
  },

  actions: {
    /**
     * 获取权限配置
     */
    async fetchPermissionsConfig() {
      if (this.loading) return
      
      this.loading = true
      try {
        const { loggedIn } = useUserSession()
        
        // 检查是否已认证
        if (loggedIn.value) {
          const { apiRequest } = useApi()
          
          // 获取所有权限和角色数据（分批获取）
          const [allPermissions, allRoles] = await Promise.all([
            this.fetchAllPermissions(apiRequest),
            this.fetchAllRoles(apiRequest)
          ])
          
          this.permissions = allPermissions
          this.roles = allRoles
          
          // 构建角色权限映射
          this.rolePermissions = {}
          this.roles.forEach(role => {
            this.rolePermissions[role.name] = role.permissions.map(p => p.name)
          })
          
          this.initialized = true
        } else {
          // 未认证时使用默认配置
          this.permissions = []
          this.roles = []
          this.rolePermissions = {}
          this.initialized = true
        }
      } catch (error) {
        console.error('获取权限配置失败:', error)
        // 使用默认配置
        this.permissions = []
        this.roles = []
        this.rolePermissions = {}
        this.initialized = true
      } finally {
        this.loading = false
      }
    },

    /**
     * 分批获取所有权限
     */
    async fetchAllPermissions(apiRequest: <T = unknown>(path: string, options?: Record<string, unknown>) => Promise<T>): Promise<Permission[]> {
      const allPermissions: Permission[] = []
      let page = 1
      const pageSize = 100 // 后端允许的最大分页大小
      
      while (true) {
        const response = await apiRequest<{ items: Permission[], total: number }>(`/rbac/permissions?page=${page}&page_size=${pageSize}`)
        
        if (response.items && response.items.length > 0) {
          allPermissions.push(...response.items)
          
          // 如果获取的数据少于页面大小，说明已经是最后一页
          if (response.items.length < pageSize) {
            break
          }
          page++
        } else {
          break
        }
      }
      
      return allPermissions
    },

    /**
     * 分批获取所有角色
     */
    async fetchAllRoles(apiRequest: <T = unknown>(path: string, options?: Record<string, unknown>) => Promise<T>): Promise<Role[]> {
      const allRoles: Role[] = []
      let page = 1
      const pageSize = 100 // 后端允许的最大分页大小
      
      while (true) {
        const response = await apiRequest<{ items: Role[], total: number }>(`/rbac/roles?page=${page}&page_size=${pageSize}`)
        
        if (response.items && response.items.length > 0) {
          allRoles.push(...response.items)
          
          // 如果获取的数据少于页面大小，说明已经是最后一页
          if (response.items.length < pageSize) {
            break
          }
          page++
        } else {
          break
        }
      }
      
      return allRoles
    },

    // 设置默认配置（降级处理）
    setDefaultConfig() {
      // 基础权限定义（与后端保持一致）
      this.permissions = [
        { id: 1, name: 'user:read', display_name: '查看用户', resource: 'user', action: 'read', is_system: true },
        { id: 2, name: 'user:write', display_name: '编辑用户', resource: 'user', action: 'write', is_system: true },
        { id: 3, name: 'user:delete', display_name: '删除用户', resource: 'user', action: 'delete', is_system: true },
        { id: 4, name: 'role:read', display_name: '查看角色', resource: 'role', action: 'read', is_system: true },
        { id: 5, name: 'role:write', display_name: '编辑角色', resource: 'role', action: 'write', is_system: true },
        { id: 6, name: 'role:delete', display_name: '删除角色', resource: 'role', action: 'delete', is_system: true },
        { id: 7, name: 'permission:read', display_name: '查看权限', resource: 'permission', action: 'read', is_system: true },
        { id: 8, name: 'permission:write', display_name: '编辑权限', resource: 'permission', action: 'write', is_system: true },
        { id: 9, name: 'permission:delete', display_name: '删除权限', resource: 'permission', action: 'delete', is_system: true },
        { id: 10, name: 'page:dashboard', display_name: '访问工作台', resource: 'page', action: 'access', is_system: false },
        { id: 11, name: 'page:users', display_name: '访问用户管理', resource: 'page', action: 'access', is_system: true },
        { id: 12, name: 'page:roles', display_name: '访问角色管理', resource: 'page', action: 'access', is_system: true },
        { id: 13, name: 'page:permissions', display_name: '访问权限管理', resource: 'page', action: 'access', is_system: true },
      ]
      
      this.roles = [
        {
          id: 1,
          name: 'super_admin',
          display_name: '超级管理员',
          is_system: true,
          permissions: this.permissions
        },
        {
          id: 2,
          name: 'admin',
          display_name: '管理员',
          is_system: true,
          permissions: this.permissions.filter(p => !p.name.includes('permission:delete'))
        },
        {
          id: 3,
          name: 'user',
          display_name: '普通用户',
          is_system: true,
          permissions: this.permissions.filter(p => p.name === 'page:dashboard')
        }
      ]
      
      this.rolePermissions = {
        super_admin: this.permissions.map(p => p.name),
        admin: this.permissions.filter(p => !p.name.includes('permission:delete')).map(p => p.name),
        user: ['page:dashboard']
      }
      
      this.initialized = true
      
      console.warn('使用默认权限配置')
    },

    // 重置权限配置
    reset() {
      this.permissions = []
      this.roles = []
      this.rolePermissions = {}
      this.initialized = false
      this.loading = false
      this.error = null
    }
  }
}) 