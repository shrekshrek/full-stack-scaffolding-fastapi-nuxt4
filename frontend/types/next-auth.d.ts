import type { User as AppUser } from '~/types/user'

declare module 'next-auth' {
  interface Session {
    user: AppUser
    accessToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: AppUser
    accessToken: string
  }
}

// 扩展 NextAuth 的类型定义
declare module '#auth' {
  interface Session {
    user: AppUser
    accessToken: string
  }
}

// JWT 类型扩展
declare module '#auth/jwt' {
  interface JWT {
    user: AppUser
    accessToken: string
  }
} 