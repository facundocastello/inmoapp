import { compare } from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { getTenantPrismaClient, prisma } from '@/lib/prisma'

import { UserRole } from '.prisma/tenant-client'

interface User {
  id: string
  email: string
  name: string
  tenantId: string
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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// export default NextAuth(authOptions)

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
    tenantId: user.tenantId,
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

  const tenantPrisma = getTenantPrismaClient(tenant.databaseName)
  const user = await tenantPrisma.user.findUnique({
    where: { email },
  })
  if (!user) throw new Error('User not found')

  const isPasswordValid = await compare(password, user.password)
  if (!isPasswordValid) throw new Error('Invalid password')

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: tenant.id,
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

  const tenantPrisma = getTenantPrismaClient(tenant.databaseName)
  const user = await tenantPrisma.user.findFirst()
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
    tenantId: tenant.id,
    isTenantUser: true,
  }
}
