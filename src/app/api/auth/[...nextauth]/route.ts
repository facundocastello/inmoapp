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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        if (!credentials.tenantSubdomain) {
          const user = await prisma.superAdmin.findUnique({
            where: { email: credentials.email },
          })
          if (!user) throw new Error('User not found')
          const isPasswordValid = await compare(
            credentials.password,
            user.password,
          )

          if (!isPasswordValid) throw new Error('Invalid password')

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: 'super-admin',
            isTenantUser: false,
          }
        }
        const prismaTenant = await prisma.tenant.findUnique({
          where: { subdomain: credentials.tenantSubdomain },
        })
        if (!prismaTenant) throw new Error('Tenant not found')
        const tenantPrisma = getTenantPrismaClient(prismaTenant.databaseName)
        const tenantUser = await tenantPrisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!tenantUser) throw new Error('User not found')
        const isPasswordValid = await compare(
          credentials.password,
          tenantUser.password,
        )
        if (!isPasswordValid) throw new Error('Invalid password')
        return {
          id: tenantUser.id,
          email: tenantUser.email,
          name: tenantUser.name,
          role: tenantUser.role,
          isTenantUser: true,
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
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// export default NextAuth(authOptions)
