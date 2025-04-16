import { hash } from 'bcryptjs'

import { PrismaClient } from '../../.prisma/shared/index.js'

let prismaClient: PrismaClient

const getPrismaClient = () => {
  if (!prismaClient) {
    prismaClient = new PrismaClient()
  }
  return prismaClient
}
const tenantSubdomain = 'test'

async function main() {
  // Create an admin user
  const adminPassword = await hash('Test1234', 12)

  const prismaClient = getPrismaClient()
  await prismaClient.user.upsert({
    where: {
      email_tenantSubdomain: {
        email: 'test@test.com',
        tenantSubdomain,
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
      tenantSubdomain,
    },
  })

  // Create an editor user
  const editorPassword = await hash('Test1234', 12)
  const editor = await prismaClient.user.upsert({
    where: {
      email_tenantSubdomain: {
        email: 'edit@test.com',
        tenantSubdomain,
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
      tenantSubdomain,
    },
  })

  await prismaClient.page.upsert({
    where: {
      slug_tenantSubdomain: {
        slug: 'about-us',
        tenantSubdomain,
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
      tenantSubdomain,
      content: {
        create: {
          title: 'About Us',
          body: `
            <h1>About Us</h1>
            <p>This is a sample about page.</p>
            <p>Customize this content to tell your story.</p>
          `,
          authorId: editor.id,
          tenantSubdomain,
        },
      },
    },
  })

  await prismaClient.page.upsert({
    where: {
      slug_tenantSubdomain: {
        slug: 'contact-us',
        tenantSubdomain,
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
      tenantSubdomain,
      content: {
        create: {
          title: 'About Us',
          body: `
            <h1>About Us</h1>
            <p>This is a sample about page.</p>
            <p>Customize this content to tell your story.</p>
          `,
          authorId: editor.id,
          tenantSubdomain,
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
