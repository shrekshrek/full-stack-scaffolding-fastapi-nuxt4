/**
 * 基于RBAC的权限检查组合函数
 * 
 * 支持细粒度权限检查，遵循KISS原则，专注核心功能
 */

import { PERMISSIONS, isSystemPermission } from '../../config/permissions'
import { usePermissionsStore } from '../../stores/permissions'

export const usePermissions = () => {
  // 在服务端渲染期间，返回安全的默认值
  if (import.meta.server) {
    return {
      // 基础权限检查
      hasPermission: () => false,
      hasAllPermissions: () => false,
      hasAnyPermission: () => false,
      hasSystemPermission: () => false,
      
      // 管理员权限检查
      hasAdminPermissions: readonly(ref(false)),
      
      // 用户权限
      canViewUsers: readonly(ref(false)),
      canManageUsers: readonly(ref(false)),
      canDeleteUsers: readonly(ref(false)),
      canManageUserRoles: readonly(ref(false)),
      canEditUser: () => false,
      canDeleteUser: () => false,
      
      // 角色权限
      canViewRoles: readonly(ref(false)),
      canManageRoles: readonly(ref(false)),
      canDeleteRoles: readonly(ref(false)),
      canEditRole: () => false,
      canDeleteRole: () => false,
      
      // 权限权限
      canViewPermissions: readonly(ref(false)),
      canManagePermissions: readonly(ref(false)),
      canDeletePermissions: readonly(ref(false)),
      canEditPermission: () => false,
      canDeletePermission: () => false,
      
      // 页面访问权限
      canAccessDashboard: readonly(ref(false)),
      canAccessUsersPage: readonly(ref(false)),
      canAccessRolesPage: readonly(ref(false)),
      canAccessPermissionsPage: readonly(ref(false)),
      
      // 用户信息
      currentUserRoles: readonly(ref([])),
      currentUserId: readonly(ref(undefined))
    }
  }

  const { session } = useUserSession()
  const userStore = useUserStore()
  const permissionsStore = usePermissionsStore()
  
  // 获取当前用户所有角色
  const currentUserRoles = computed(() => {
    return session.value?.user?.roles || userStore.profile?.roles || []
  })
  
  // 获取当前用户ID
  const currentUserId = computed(() => {
    return session.value?.user?.id || userStore.profile?.id
  })
  
  // 核心权限检查函数 - 支持多角色权限聚合
  const hasPermission = (permission: string): boolean => {
    if (!permissionsStore.initialized) {
      return false
    }
    
    // 检查用户的任一角色是否拥有该权限
    return currentUserRoles.value.some((role: string) => 
      permissionsStore.hasRolePermission(role, permission)
    )
  }
  
  // 检查多个权限（需要全部满足）
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }
  
  // 检查多个权限（满足任意一个即可）
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }
  
  // 检查是否具有系统级权限
  const hasSystemPermission = (permission: string): boolean => {
    return isSystemPermission(permission) && hasPermission(permission)
  }
  
  // 检查是否具有管理员级别的权限
  const hasAdminPermissions = computed(() => {
    return hasAnyPermission([
      PERMISSIONS.USER_WRITE,
      PERMISSIONS.USER_DELETE,
      PERMISSIONS.ROLE_WRITE,
      PERMISSIONS.PERMISSION_WRITE
    ])
  })
  
  // 常用权限检查（计算属性）
  const canViewUsers = computed(() => hasPermission(PERMISSIONS.USER_READ))
  const canManageUsers = computed(() => hasPermission(PERMISSIONS.USER_WRITE))
  const canDeleteUsers = computed(() => hasPermission(PERMISSIONS.USER_DELETE))
  const canManageUserRoles = computed(() => hasPermission(PERMISSIONS.ROLE_WRITE))
  
  const canViewRoles = computed(() => hasPermission(PERMISSIONS.ROLE_READ))
  const canManageRoles = computed(() => hasPermission(PERMISSIONS.ROLE_WRITE))
  const canDeleteRoles = computed(() => hasPermission(PERMISSIONS.ROLE_DELETE))
  
  const canViewPermissions = computed(() => hasPermission(PERMISSIONS.PERMISSION_READ))
  const canManagePermissions = computed(() => hasPermission(PERMISSIONS.PERMISSION_WRITE))
  const canDeletePermissions = computed(() => hasPermission(PERMISSIONS.PERMISSION_DELETE))
  
  const canAccessDashboard = computed(() => hasPermission(PERMISSIONS.PAGE_DASHBOARD))
  const canAccessUsersPage = computed(() => hasPermission(PERMISSIONS.PAGE_USERS))
  const canAccessRolesPage = computed(() => hasPermission(PERMISSIONS.PAGE_ROLES))
  const canAccessPermissionsPage = computed(() => hasPermission(PERMISSIONS.PAGE_PERMISSIONS))
  
  // 用户操作权限检查
  const canEditUser = (targetUser: { id: number } | null | undefined): boolean => {
    if (!targetUser) return false
    
    // 有用户管理权限可以编辑所有用户
    if (hasPermission(PERMISSIONS.USER_WRITE)) {
      return true
    }
    
    // 用户只能编辑自己
    return targetUser.id === currentUserId.value
  }
  
  const canDeleteUser = (targetUser: { id: number } | null | undefined): boolean => {
    if (!targetUser) return false
    
    // 只有有删除权限的用户可以删除
    if (!hasPermission(PERMISSIONS.USER_DELETE)) {
      return false
    }
    
    // 不能删除自己
    return targetUser.id !== currentUserId.value
  }
  
  // 角色操作权限检查
  const canEditRole = (roleName: string): boolean => {
    if (!hasPermission(PERMISSIONS.ROLE_WRITE)) {
      return false
    }
    
    // 检查是否为系统角色
    if (permissionsStore.isSystemRole(roleName)) {
      // 系统角色只能修改显示名称和描述
      return true
    }
    
    return true
  }
  
  const canDeleteRole = (roleName: string): boolean => {
    if (!hasPermission(PERMISSIONS.ROLE_DELETE)) {
      return false
    }
    
    // 系统角色不能删除
    return !permissionsStore.isSystemRole(roleName)
  }
  
  // 权限操作权限检查
  const canEditPermission = (permissionName: string): boolean => {
    if (!hasPermission(PERMISSIONS.PERMISSION_WRITE)) {
      return false
    }
    
    // 检查是否为系统权限
    if (permissionsStore.isSystemPermission(permissionName)) {
      // 系统权限只能修改显示名称和描述
      return true
    }
    
    return true
  }
  
  const canDeletePermission = (permissionName: string): boolean => {
    if (!hasPermission(PERMISSIONS.PERMISSION_DELETE)) {
      return false
    }
    
    // 系统权限不能删除
    return !permissionsStore.isSystemPermission(permissionName)
  }
  
  return {
    // 基础权限检查
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasSystemPermission,
    
    // 管理员权限检查
    hasAdminPermissions: readonly(hasAdminPermissions),
    
    // 用户权限
    canViewUsers: readonly(canViewUsers),
    canManageUsers: readonly(canManageUsers),
    canDeleteUsers: readonly(canDeleteUsers),
    canManageUserRoles: readonly(canManageUserRoles),
    canEditUser,
    canDeleteUser,
    
    // 角色权限
    canViewRoles: readonly(canViewRoles),
    canManageRoles: readonly(canManageRoles),
    canDeleteRoles: readonly(canDeleteRoles),
    canEditRole,
    canDeleteRole,
    
    // 权限权限
    canViewPermissions: readonly(canViewPermissions),
    canManagePermissions: readonly(canManagePermissions),
    canDeletePermissions: readonly(canDeletePermissions),
    canEditPermission,
    canDeletePermission,
    
    // 页面访问权限
    canAccessDashboard: readonly(canAccessDashboard),
    canAccessUsersPage: readonly(canAccessUsersPage),
    canAccessRolesPage: readonly(canAccessRolesPage),
    canAccessPermissionsPage: readonly(canAccessPermissionsPage),
    
    // 用户信息
    currentUserRoles: readonly(currentUserRoles),
    currentUserId: readonly(currentUserId)
  }
} 