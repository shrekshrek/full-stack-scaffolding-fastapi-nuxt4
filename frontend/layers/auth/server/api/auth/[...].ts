import { NuxtAuthHandler } from '#auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import { z } from 'zod'
import type { User } from '../../../../../types/user'
import type { Token } from '../../../../../types/auth'

const runtimeConfig = useRuntimeConfig()

// Using zod to validate the credentials
const credentialsSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
})

export const authOptions = {
  secret: runtimeConfig.NUXT_SECRET as string,
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'test' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials) return null
        
        try {
          const { username, password } = credentialsSchema.parse(credentials)

          // Use form data format as expected by FastAPI
          const formData = new URLSearchParams()
          formData.append('username', username)
          formData.append('password', password)

          const tokenResponse = await $fetch<Token>(
            `${runtimeConfig.public.apiBase}/auth/token`,
            {
              method: 'POST',
              body: formData,
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            },
          )

          if (!tokenResponse || !tokenResponse.access_token) {
            return null
          }

          const userResponse = await $fetch<User>(
            `${runtimeConfig.public.apiBase}/users/me`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            },
          )

          if (!userResponse) {
            return null
          }

          return {
            ...userResponse,
            accessToken: tokenResponse.access_token,
          }
        } catch (error) {
          console.error('Authorization Error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    // The `user` parameter can be of different types depending on the trigger.
    // Using `any` is a pragmatic way to handle this without complex type guards.
    // This block is only reliably triggered with our custom user object on initial sign-in.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles,
          created_at: user.created_at,
          updated_at: user.updated_at,
        }
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // The type augmentation in `auth.d.ts` ensures `session.user` and `session.accessToken` are correctly typed.
                session.user = token.user as User
      session.accessToken = token.accessToken as string
      return session
    },
  },
}

export default NuxtAuthHandler(authOptions)
