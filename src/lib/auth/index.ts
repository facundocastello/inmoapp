import { compare } from 'bcryptjs'
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next'
import type { NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { prisma } from '@/lib/prisma'

import { UserRole } from '.prisma/shared'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        tenantSubdomain: { label: 'Tenant Subdomain', type: 'text' },
        oneUseToken: { label: 'One-Time Use Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) throw new Error('No credentials provided')

        try {
          if (credentials.oneUseToken && credentials.tenantSubdomain)
            return await authenticateWithOneTimeToken(credentials)

          if (!credentials.tenantSubdomain)
            return await authenticateSuperAdmin(credentials)

          return await authenticateTenantUser(credentials)
        } catch (error) {
          console.error('Authentication error:', error)
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      return { ...session, user: token.user }
    },
    async jwt({ token, user }) {
      if (user) token.user = user as unknown as User
      return token
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  logger: undefined,
  secret: process.env.NEXTAUTH_SECRET,
}

// You'll need to import and pass this
// to `NextAuth` in `app/api/auth/[...nextauth]/route.ts`
export const config = {
  providers: [], // rest of your config
} satisfies NextAuthOptions

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions)
}

export const getIsSuperAdmin = async () => {
  const session = await auth()
  return session?.user.role === 'super-admin'
}

export const getIsAdmin = async () => {
  const session = await auth()
  return session?.user.role === 'ADMIN'
}

async function authenticateSuperAdmin({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const user = await prisma.superAdmin.findUnique({
    where: { email },
  })
  if (!user) throw new Error('User not found')

  const isPasswordValid = await compare(password, user.password)
  if (!isPasswordValid) throw new Error('Invalid password')

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: 'super-admin' as const,
    tenantSubdomain: user.tenantSubdomain,
    isTenantUser: false,
  }
}

async function authenticateTenantUser({
  email,
  password,
  tenantSubdomain,
}: {
  email: string
  password: string
  tenantSubdomain: string
}) {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: tenantSubdomain },
  })
  if (!tenant) throw new Error('Tenant not found')

  const user = await prisma.user.findUnique({
    where: { email_tenantSubdomain: { email, tenantSubdomain } },
  })
  if (!user) throw new Error('User not found')

  const isPasswordValid = await compare(password, user.password)
  if (!isPasswordValid) throw new Error('Invalid password')

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantSubdomain: tenant.subdomain,
    isTenantUser: true,
  }
}

async function authenticateWithOneTimeToken({
  tenantSubdomain,
  oneUseToken,
}: {
  tenantSubdomain: string
  oneUseToken: string
}) {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: tenantSubdomain },
  })
  if (!tenant || tenant.oneUseToken !== oneUseToken) {
    throw new Error('Invalid one-time use token')
  }

  const user = await prisma.user.findFirst({
    where: { tenantSubdomain },
  })
  if (!user) throw new Error('User not found')

  // Invalidate the one-time token after use
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { oneUseToken: null },
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantSubdomain: tenant.subdomain,
    isTenantUser: true,
  }
}

interface User {
  id: string
  email: string
  name: string
  tenantSubdomain: string
  role: UserRole | 'super-admin'
  isTenantUser: boolean
}

declare module 'next-auth' {
  interface Session {
    user: User
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: User
  }
}
