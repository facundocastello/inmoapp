import { PrismaClient } from "../../../.prisma/shared";
import { PrismaClient as TenantPrismaClient } from "../../../.prisma/tenant-client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  tenantPrisma: Record<string, TenantPrismaClient> | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

export const getTenantPrismaClient = (tenantSubdomain: string) => {
  if(!globalForPrisma.tenantPrisma) globalForPrisma.tenantPrisma = {}
  if (!globalForPrisma.tenantPrisma[tenantSubdomain]) {
    globalForPrisma.tenantPrisma[tenantSubdomain] = new TenantPrismaClient({
      datasources: {
        db: { url: process.env.DATABASE_URL_PREFIX + tenantSubdomain },
      },
    });
  }
  return globalForPrisma.tenantPrisma[tenantSubdomain];
};


