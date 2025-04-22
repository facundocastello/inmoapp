import { PrismaClient } from '@prisma/client/index.js'
import { hash } from 'bcryptjs'

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
      },
    })

    await prisma.plan.upsert({
      where: {
        id: '1',
      },
      update: {},
      create: {
        id: '1',
        name: 'Cheapest',
        price: 100000,
        features: {
          'feature-1': true,
          'feature-2': true,
          'feature-3': true,
        },
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
