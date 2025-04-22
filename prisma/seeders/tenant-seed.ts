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

  // Create indexes
  const indexes = [
    {
      id: 'index-ipc',
      name: 'IPC',
      currentValue: 11,
      updateFrequency: 'MONTHLY',
      source: 'INDEC',
      isActive: true,
      historyValues: [{ value: 11, date: new Date() }],
    },
    {
      id: 'index-ripte',
      name: 'RIPTE',
      currentValue: 12,
      updateFrequency: 'MONTHLY',
      source: 'INDEC',
      isActive: true,
      historyValues: [{ value: 12, date: new Date() }],
    },
    {
      id: 'index-uva',
      name: 'UVA',
      currentValue: 13,
      updateFrequency: 'DAILY',
      source: 'BCRA',
      isActive: true,
      historyValues: [{ value: 13, date: new Date() }],
    },
    {
      id: 'index-ucl',
      name: 'UCL',
      currentValue: 14,
      updateFrequency: 'DAILY',
      source: 'BCRA',
      isActive: true,
      historyValues: [{ value: 14, date: new Date() }],
    },
  ]

  for (const index of indexes) {
    await prismaClient.index.upsert({
      where: { id: index.id },
      update: {},
      create: {
        ...index,
        tenantId,
      },
    })
  }

  // Create currencies
  const currencies = [
    {
      id: 'currency-usd',
      type: 'USD',
      name: 'Dólar Estadounidense',
      description: 'Dólar estadounidense',
      valueInPesos: 1000,
      historyValues: [{ value: 1000, date: new Date() }],
    },
    {
      id: 'currency-eur',
      type: 'EUR',
      name: 'Euro',
      description: 'Euro',
      valueInPesos: 1100,
      historyValues: [{ value: 1100, date: new Date() }],
    },
    {
      id: 'currency-soja',
      type: 'SOJA',
      name: 'Soja',
      description: 'Precio de la soja',
      valueInPesos: 500,
      historyValues: [{ value: 500, date: new Date() }],
    },
    {
      id: 'currency-carne',
      type: 'CARNE',
      name: 'Carne',
      description: 'Precio del kilo de carne',
      valueInPesos: 3000,
      historyValues: [{ value: 3000, date: new Date() }],
    },
    {
      id: 'currency-nafta',
      type: 'NAFTA',
      name: 'Nafta',
      description: 'Precio del litro de nafta',
      valueInPesos: 1500,
      historyValues: [{ value: 1500, date: new Date() }],
    },
  ]

  for (const currency of currencies) {
    await prismaClient.currency.upsert({
      where: { id: currency.id },
      update: {},
      create: {
        ...currency,
        tenantId,
      },
    })
  }

  // Create contract types
  const contractTypes = [
    {
      id: 'contract-type-regular',
      name: 'Regular',
      description: 'Contrato de alquiler regular',
      file: 'regular-contract.pdf',
      jurisdiction: 'CABA',
    },
  ]

  for (const contractType of contractTypes) {
    await prismaClient.contractType.upsert({
      where: { id: contractType.id },
      update: {},
      create: {
        ...contractType,
        tenantId,
      },
    })
  }
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
