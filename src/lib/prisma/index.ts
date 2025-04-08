import { PrismaClient } from '../../../.prisma/shared'
import { PrismaClient as TenantPrismaClient } from '../../../.prisma/tenant-client'

declare global {
  var prisma: PrismaClient | undefined
  var tenantPrisma: Record<string, TenantPrismaClient> | undefined
}

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

export const prisma = global.prisma

export const getTenantPrismaClient = (tenantSubdomain: string) => {
  if (!global.tenantPrisma) global.tenantPrisma = {}
  if (!global.tenantPrisma[tenantSubdomain]) {
    global.tenantPrisma[tenantSubdomain] = new TenantPrismaClient({
      datasources: {
        db: { url: process.env.DATABASE_URL_PREFIX + tenantSubdomain },
      },
    })
  }
  return global.tenantPrisma[tenantSubdomain]
}
