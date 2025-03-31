import { PrismaClient } from "../.prisma/shared";
import { PrismaClient as TenantPrismaClient } from "../.prisma/tenant-client";

let prismaClient: PrismaClient;
let tenantPrismaClient: TenantPrismaClient;

const getPrismaClient = () => {
  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }
  return prismaClient;
};

const getTenantPrismaClient = (tenantSubdomain: string) => {
  if (!tenantPrismaClient) {
    tenantPrismaClient = new TenantPrismaClient({
      datasources: {
        db: { url: process.env.DATABASE_URL_PREFIX + tenantSubdomain },
      },
    });
  }
  return tenantPrismaClient;
};

export { getPrismaClient, getTenantPrismaClient };
