import { hash } from 'bcryptjs'

import { PrismaClient } from '../../.prisma/shared/index.js'

let prismaClient: PrismaClient

const getPrismaClient = () => {
  if (!prismaClient) {
    prismaClient = new PrismaClient()
  }
  return prismaClient
}

async function main() {
  const prisma = getPrismaClient()
  try {
    // Create a test tenant
    const tenant = await prisma.tenant.upsert({
      where: {
        subdomain: 'test',
      },
      update: {},
      create: {
        name: 'Test Tenant',
        subdomain: 'test',
        isActive: true,
        theme: {
          primary: '#2186EB',
          secondary: '#47A3F3',
          accent: '#7CC4FA',
        },
        databaseName: 'test',
      },
    })

    // Create a super admin for the test tenant
    const hashedPassword = await hash('SuperSecure123!', 12)
    await prisma.superAdmin.upsert({
      where: {
        email: 'superadmin@example.com',
      },
      update: {},
      create: {
        email: 'superadmin@example.com',
        password: hashedPassword,
        name: 'Super Admin',
        tenantId: tenant.id,
      },
    })

    // Create a regular admin for the test tenant
    const adminPassword = await hash('AdminSecure123!', 12)
    await prisma.admin.upsert({
      where: {
        email: 'admin@test.example.com',
      },
      update: {},
      create: {
        email: 'admin@test.example.com',
        password: adminPassword,
        name: 'Test Admin',
        tenantId: tenant.id,
      },
    })
  } catch (error) {
    console.error('Error seeding shared database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
