/**
 * 认证相关 API 封装
 * 基于 useApi 核心工具，符合前端开发规范
 */

import type { User, UserCreate } from '~/types/user'
import type { Token, Msg, PasswordResetRequest, PasswordReset } from '~/types/auth'

export const useAuthApi = () => {
  const { apiRequest, showSuccess } = useApi()
  
  const register = async (data: UserCreate) => {
    const result = await apiRequest<User>('/auth/register', {
      method: 'POST',
      body: data,
    })
    showSuccess('注册成功！请登录您的账户')
    return result
  }
  
  const login = async (data: { username: string; password: string }) => {
    const formData = new URLSearchParams()
    formData.append('username', data.username)
    formData.append('password', data.password)
    
    return await apiRequest<Token>('/auth/token', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }
  
  const logout = async () => {
    await apiRequest<Msg>('/auth/logout', {
      method: 'POST'
    })
    showSuccess('已安全退出登录')
  }
  
  const getMe = async () => {
    return await apiRequest<User>('/users/me', {
      method: 'GET'
    })
  }
  
  const requestPasswordReset = async (data: PasswordResetRequest) => {
    const result = await apiRequest<Msg>('/auth/request-password-reset', {
      method: 'POST',
      body: data,
    })
    showSuccess('密码重置邮件已发送，请查收邮箱')
    return result
  }
  
  const resetPassword = async (data: PasswordReset) => {
    const result = await apiRequest<Msg>('/auth/reset-password', {
      method: 'POST',
      body: data,
    })
    showSuccess('密码重置成功！请使用新密码登录')
    return result
  }
  
  return {
    register,
    login,
    logout,
    getMe,
    requestPasswordReset,
    resetPassword,
  }
} 