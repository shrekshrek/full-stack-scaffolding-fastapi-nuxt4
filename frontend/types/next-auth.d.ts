import 'next-auth'
import type { User as AppUser } from './user'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: User
    accessToken?: string
  }

  interface User {
    id: string
    accessToken?: string
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    idToken?: string;
    accessToken: string;
    user: AppUser;
  }
} 