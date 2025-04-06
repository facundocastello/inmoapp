'use server'

import { hash } from 'bcryptjs'

import { getTenantPrismaClient, prisma } from '@/lib/prisma'
import { checkSubscriptions } from '@/lib/subscription/subscription-checker'

import { createTenantDatabase } from '../prisma/db'

const ONE_DAY = 24 * 60 * 60 * 1000

export async function createTestTenant(scenario: string) {
  // Get a random plan
  const plans = await prisma.plan.findMany()
  if (plans.length === 0) {
    throw new Error('No plans found. Please create a plan first.')
  }
  const randomPlan = plans[Math.floor(Math.random() * plans.length)]

  // Calculate dates based on scenario
  const now = new Date()
  let nextPaymentAt: Date
  let graceStartedAt: Date | null = null

  switch (scenario) {
    case 'expires-in-10-days':
      nextPaymentAt = new Date(now.getTime() + 10 * ONE_DAY)
      break
    case 'expires-today':
      nextPaymentAt = now
      break
    case 'grace-5-days':
      nextPaymentAt = now
      graceStartedAt = new Date(now.getTime() - 5 * ONE_DAY)
      break
    case 'expired-20-days':
      nextPaymentAt = new Date(now.getTime() - 20 * ONE_DAY)
      graceStartedAt = new Date(now.getTime() - 20 * ONE_DAY)
      break
    default:
      throw new Error('Invalid scenario')
  }

  const subdomain = `test-${scenario}-${Date.now()}`
  console.log(`Creating tenant with subdomain: ${subdomain}`)

  // Create tenant database
  const dbResult = await createTenantDatabase(subdomain)
  if (!dbResult.success) {
    throw new Error('Failed to create tenant database')
  }

  // Create test tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: `Test Tenant (${scenario})`,
      subdomain,
      description: `Test tenant for ${scenario} scenario`,
      isActive: true,
      databaseName: subdomain,
      planId: randomPlan.id,
      subscriptionType: 'MANUAL',
      nextPaymentAt,
      graceStartedAt,
      gracePeriodDays: 15, // Default grace period
    },
  })

  const tenantPrisma = getTenantPrismaClient(subdomain)
  await tenantPrisma.user.create({
    data: {
      email: 'test@test.com',
      password: await hash('test', 12),
      name: 'Test User',
      role: 'ADMIN',
    },
  })

  return tenant
}

export async function runSubscriptionCheck() {
  await checkSubscriptions()
}
