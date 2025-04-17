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
  // Create an admin user
  const adminPassword = await hash('Test1234', 12)

  const prismaClient = getPrismaClient()

  const tenant = await prismaClient.tenant.upsert({
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
      subscription: {
        create: {
          planId: '1',
          paymentMethod: 'MANUAL',
          status: 'ACTIVE',
          gracePeriodDays: 15,
          nextPaymentAt: new Date(),
        },
      },
    },
  })
  const tenantId = tenant.id

  await prismaClient.user.upsert({
    where: {
      email_tenantId: {
        email: 'test@test.com',
        tenantId,
      },
    },
    update: {
      password: adminPassword,
    },
    create: {
      email: 'test@test.com',
      password: adminPassword,
      name: 'Tenant Admin',
      role: 'ADMIN',
      tenantId,
    },
  })

  // Create an editor user
  const editorPassword = await hash('Test1234', 12)
  const editor = await prismaClient.user.upsert({
    where: {
      email_tenantId: {
        email: 'edit@test.com',
        tenantId,
      },
    },
    update: {
      password: editorPassword,
    },
    create: {
      email: 'edit@test.com',
      password: editorPassword,
      name: 'Content Editor',
      role: 'EDITOR',
      tenantId,
    },
  })

  await prismaClient.page.upsert({
    where: {
      slug_tenantId: {
        slug: 'about-us',
        tenantId,
      },
    },
    update: {},
    create: {
      title: 'About Us',
      slug: 'about-us',
      isActive: true,
      isFeatured: false,
      isHome: false,
      authorId: editor.id,
      tenantId,
      content: {
        create: {
          title: 'About Us',
          body: `
            <h1>About Us</h1>
            <p>This is a sample about page.</p>
            <p>Customize this content to tell your story.</p>
          `,
          authorId: editor.id,
          tenantId,
        },
      },
    },
  })

  await prismaClient.page.upsert({
    where: {
      slug_tenantId: {
        slug: 'contact-us',
        tenantId,
      },
    },
    update: {},
    create: {
      title: 'Contact Us',
      slug: 'contact-us',
      isActive: true,
      isFeatured: false,
      isHome: false,
      authorId: editor.id,
      tenantId,
      content: {
        create: {
          title: 'About Us',
          body: `
            <h1>About Us</h1>
            <p>This is a sample about page.</p>
            <p>Customize this content to tell your story.</p>
          `,
          authorId: editor.id,
          tenantId,
        },
      },
    },
  })
}
main()
  .catch((e) => {
    console.error('Error seeding tenant template database:', e)
    process.exit(1)
  })
  .finally(async () => {
    const prismaClient = getPrismaClient()
    await prismaClient.$disconnect()
  })
