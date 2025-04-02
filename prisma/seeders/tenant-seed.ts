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

const defaultDb = 'multi_tenant_template'

async function main() {
  // Create an admin user
  const adminPassword = await hash('AdminSecure123!', 12)
  const prismaClient = getTenantPrismaClient(defaultDb)
  const admin = await prismaClient.user.upsert({
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

  // Create some sample content
  await prismaClient.content.upsert({
    where: {
      title: 'Welcome to Your New Site',
    },
    update: {},
    create: {
      title: 'Welcome to Your New Site',
      body: `
        <h1>Welcome to Your New Site</h1>
        <p>This is a sample content page to help you get started.</p>
        <p>You can edit this content or create new pages using the admin panel.</p>
      `,
      authorId: admin.id,
    },
  })

  await prismaClient.content.upsert({
    where: {
      title: 'About Us',
    },
    update: {},
    create: {
      title: 'About Us',
      body: `
        <h1>About Us</h1>
        <p>This is a sample about page.</p>
        <p>Customize this content to tell your story.</p>
      `,
      authorId: editor.id,
    },
  })

  console.log('Tenant template database seeded successfully!')
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
