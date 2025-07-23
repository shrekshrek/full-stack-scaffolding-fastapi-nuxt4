import type { Role, Permission, RoleCreate, RoleUpdate, PermissionCreate, PermissionUpdate, RoleListResponse, PermissionListResponse } from '../types'

export const useRbacApi = () => {
  const { apiRequest, useApiData, showSuccess, showError } = useApi()

  // 角色管理
  const getRoles = (params?: Record<string, unknown>) => {
    return useApiData<RoleListResponse>('/rbac/roles', {
      query: params,
      key: computed(() => {
        const p = unref(params);
        return `rbac-roles-list-${p?.page || 1}-${p?.page_size || 10}`;
      })
    })
  }

  const getRole = (id: number) => {
    return useApiData<Role>(`/rbac/roles/${id}`, {
      key: `rbac-role-${id}`,
    })
  }

  const createRole = async (data: RoleCreate) => {
    try {
      const result = await apiRequest<Role>('/rbac/roles', {
        method: 'POST',
        body: data,
      })
      showSuccess('角色创建成功！')
      return result
    } catch (error) {
      showError('角色创建失败')
      throw error
    }
  }

  const updateRole = async (id: number, data: RoleUpdate) => {
    try {
      const result = await apiRequest<Role>(`/rbac/roles/${id}`, {
        method: 'PUT',
        body: data,
      })
      showSuccess('角色更新成功！')
      return result
    } catch (error) {
      showError('角色更新失败')
      throw error
    }
  }

  const updateRolePermissions = async (roleId: number, permissionIds: number[]) => {
    try {
      const result = await apiRequest<Role>(`/rbac/roles/${roleId}`, {
        method: 'PUT',
        body: { permission_ids: permissionIds },
      })
      showSuccess('角色权限更新成功！')
      return result
    } catch (error) {
      showError('角色权限更新失败')
      throw error
    }
  }

  const deleteRole = async (id: number) => {
    try {
      await apiRequest(`/rbac/roles/${id}`, {
        method: 'DELETE',
      })
      showSuccess('角色删除成功！')
      return true
    } catch (error) {
      showError('角色删除失败')
      throw error
    }
  }

  // 权限管理
  const getPermissions = (params?: Record<string, unknown>) => {
    return useApiData<PermissionListResponse>('/rbac/permissions', {
      query: params,
      key: computed(() => {
        const p = unref(params);
        return `rbac-permissions-list-${p?.page || 1}-${p?.page_size || 10}`;
      })
    })
  }

  const getPermission = (id: number) => {
    return useApiData<Permission>(`/rbac/permissions/${id}`, {
      key: `rbac-permission-${id}`,
    })
  }

  const createPermission = async (data: PermissionCreate) => {
    try {
      const result = await apiRequest<Permission>('/rbac/permissions', {
        method: 'POST',
        body: data,
      })
      showSuccess('权限创建成功！')
      return result
    } catch (error) {
      showError('权限创建失败')
      throw error
    }
  }

  const updatePermission = async (id: number, data: PermissionUpdate) => {
    try {
      const result = await apiRequest<Permission>(`/rbac/permissions/${id}`, {
        method: 'PUT',
        body: data,
      })
      showSuccess('权限更新成功！')
      return result
    } catch (error) {
      showError('权限更新失败')
      throw error
    }
  }

  const deletePermission = async (id: number) => {
    try {
      await apiRequest(`/rbac/permissions/${id}`, {
        method: 'DELETE',
      })
      showSuccess('权限删除成功！')
      return true
    } catch (error) {
      showError('权限删除失败')
      throw error
    }
  }

  // 角色权限关联
  const getRolePermissions = (roleId: number) => {
    return useApiData<Permission[]>(`/rbac/roles/${roleId}/permissions`, {
      key: `rbac-role-permissions-${roleId}`,
    })
  }

  const assignRolePermissions = async (roleId: number, permissionIds: number[]) => {
    try {
      await apiRequest(`/rbac/roles/${roleId}/permissions`, {
        method: 'POST',
        body: { permission_ids: permissionIds },
      })
      showSuccess('权限分配成功！')
      return true
    } catch (error) {
      showError('权限分配失败')
      throw error
    }
  }

  // 用户角色关联
  const getUserRoles = (userId: number) => {
    return useApiData<Role[]>(`/rbac/users/${userId}/roles`, {
      key: `rbac-user-roles-${userId}`,
    })
  }

  const assignUserRoles = async (userId: number, roleIds: number[]) => {
    try {
      await apiRequest(`/rbac/users/${userId}/roles`, {
        method: 'POST',
        body: { role_ids: roleIds },
      })
      showSuccess('角色分配成功！')
      return true
    } catch (error) {
      showError('角色分配失败')
      throw error
    }
  }



  // 用户权限查询
  const getUserPermissions = (userId: number) => {
    return useApiData<Permission[]>(`/rbac/users/${userId}/permissions`, {
      key: `rbac-user-permissions-${userId}`,
    })
  }

  return {
    // 角色管理
    getRoles,
    getRole,
    createRole,
    updateRole,
    updateRolePermissions,
    deleteRole,
    
    // 权限管理
    getPermissions,
    getPermission,
    createPermission,
    updatePermission,
    deletePermission,
    
    // 角色权限关联
    getRolePermissions,
    assignRolePermissions,
    
    // 用户角色关联
    getUserRoles,
    assignUserRoles,
    
    // 用户权限查询
    getUserPermissions,
  }
} 