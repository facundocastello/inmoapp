import { hash } from 'bcryptjs'

import { PrismaClient as TenantPrismaClient } from '../../.prisma/tenant-client/index.js'

let tenantPrismaClient: TenantPrismaClient

const getTenantPrismaClient = (tenantSubdomain: string) => {
  if (!tenantPrismaClient) {
    tenantPrismaClient = new TenantPrismaClient({
      datasources: {
        db: { url: process.env.DATABASE_URL_PREFIX + tenantSubdomain },
      },
    })
  }
  return tenantPrismaClient
}

const defaultDb = 'test'

async function main() {
  // Create an admin user
  const adminPassword = await hash('AdminSecure123!', 12)

  const prismaClient = getTenantPrismaClient(defaultDb)
  await prismaClient.user.upsert({
    where: {
      email: 'admin@tenant.example.com',
    },
    update: {},
    create: {
      email: 'admin@tenant.example.com',
      password: adminPassword,
      name: 'Tenant Admin',
      role: 'ADMIN',
    },
  })

  // Create an editor user
  const editorPassword = await hash('EditorSecure123!', 12)
  const editor = await prismaClient.user.upsert({
    where: {
      email: 'editor@tenant.example.com',
    },
    update: {},
    create: {
      email: 'editor@tenant.example.com',
      password: editorPassword,
      name: 'Content Editor',
      role: 'EDITOR',
    },
  })

  await prismaClient.page.upsert({
    where: {
      title: 'About Us',
    },
    update: {},
    create: {
      title: 'About Us',
      slug: 'about-us',
      isActive: true,
      isFeatured: false,
      isHome: false,
      authorId: editor.id,
      content: {
        create: {
          title: 'About Us',
          body: `
            <h1>About Us</h1>
            <p>This is a sample about page.</p>
            <p>Customize this content to tell your story.</p>
          `,
          authorId: editor.id,
        },
      },
    },
  })

  await prismaClient.page.upsert({
    where: {
      title: 'Contact Us',
    },
    update: {},
    create: {
      title: 'Contact Us',
      slug: 'contact-us',
      isActive: true,
      isFeatured: false,
      isHome: false,
      authorId: editor.id,
      content: {
        create: {
          title: 'About Us',
          body: `
            <h1>About Us</h1>
            <p>This is a sample about page.</p>
            <p>Customize this content to tell your story.</p>
          `,
          authorId: editor.id,
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
    const prismaClient = getTenantPrismaClient(defaultDb)
    await prismaClient.$disconnect()
  })
