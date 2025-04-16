'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { prisma } from '@/lib/prisma'

import {
  createMercadoPagoSubscription,
  getMercadoPagoSubscription,
} from '../utils/payments/mercadopago'
import { PaymentMethod, SubscriptionStatus } from '.prisma/shared'

interface ProcessPaymentResult {
  success: boolean
  error?: string
  initPoint?: string
}

export async function createSubscription({
  tenantSubdomain,
  planId,
  externalId,
  paymentMethod,
}: {
  tenantSubdomain: string
  planId: string
  externalId: string
  paymentMethod: PaymentMethod
}): Promise<ProcessPaymentResult> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { tenantSubdomain },
    })

    // Check if tenant already has a subscription
    if (subscription) {
      return {
        success: false,
        error: 'Tenant already has a subscription',
      }
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantSubdomain },
    })
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    })
    if (!tenant || !plan) {
      return {
        success: false,
        error: 'Tenant or plan not found',
      }
    }

    // Create subscription
    const newSubscription = await prisma.subscription.create({
      data: {
        tenantSubdomain,
        planId,
        externalId,
        paymentMethod,
        status: 'ACTIVE',
      },
    })

    // Update tenant's subscription type
    await prisma.tenant.update({
      where: { id: tenantSubdomain },
      data: {
        subscriptionType: paymentMethod,
        subscription: { connect: { id: newSubscription.id } },
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error creating subscription:', error)
    return {
      success: false,
      error: 'Failed to create subscription',
    }
  }
}

export async function switchToAutomatedPayment(
  tenantSubdomain: string,
  email?: string,
) {
  const subscription = await prisma.subscription.findUnique({
    where: { tenantSubdomain },
    include: {
      plan: true,
      tenant: true,
    },
  })
  if (
    subscription?.paymentMethod === PaymentMethod.AUTOMATED &&
    subscription.status === SubscriptionStatus.ACTIVE
  ) {
    return {
      success: false,
      error: 'Tenant already has automated payment',
    }
  }
  if (!subscription?.plan || !subscription?.tenant) {
    return {
      success: false,
      error: 'Tenant or plan not found',
    }
  }
  if (!email && !subscription.externalId)
    return {
      success: false,
      error: 'Email is required',
    }

  const result = subscription.externalId
    ? await getMercadoPagoSubscription(subscription.externalId)
    : await createMercadoPagoSubscription({
        tenantSubdomain,
        planId: subscription?.planId,
        email: email as string,
        amount: subscription?.plan?.price,
        frequency: subscription?.billingCycle,
        currency: 'ARS',
      })
  if (!result.success || !result.subscription) {
    return { success: false, error: 'Failed to switch to automated payment' }
  }

  await prisma.subscription.update({
    where: { tenantSubdomain },
    data: {
      paymentMethod: PaymentMethod.AUTOMATED,
      externalId: result.subscription.id,
      status:
        result.subscription.status === 'authorized'
          ? SubscriptionStatus.ACTIVE
          : SubscriptionStatus.PENDING,
    },
  })

  revalidatePath('/admin/billing')

  if (result.subscription.initPoint) redirect(result.subscription.initPoint)
  return { success: true }
}

export async function checkAutomatedSubscription({
  subscriptionId,
  externalId,
  withoutRedirect = false,
}: {
  subscriptionId?: string
  externalId?: string
  withoutRedirect?: boolean
}) {
  const subscription = await prisma.subscription.findUnique({
    where: externalId ? { externalId } : { id: subscriptionId },
  })
  if (!subscription?.externalId)
    return { success: false, error: 'External ID not found' }

  const isOutdated =
    subscription.nextPaymentAt && subscription.nextPaymentAt <= new Date()
  if (subscription.status === SubscriptionStatus.ACTIVE && !isOutdated)
    return { success: true }
  if (subscription.paymentMethod !== PaymentMethod.AUTOMATED)
    return { success: false, error: 'Subscription is not automated' }
  const result = await getMercadoPagoSubscription(subscription.externalId)
  if (!result.success)
    return { success: false, error: 'Failed to get Mercado Pago subscription' }

  const updatedSubscription =
    result.subscription.status === 'authorized'
      ? await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            graceStartedAt: null,
            nextPaymentAt: new Date(
              result.subscription.nextPaymentDate as string,
            ),
            status: SubscriptionStatus.ACTIVE,
          },
        })
      : await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            paymentMethod: PaymentMethod.AUTOMATED,
            status: SubscriptionStatus.PENDING,
            externalId: result.subscription.id,
          },
        })

  if (result.subscription.initPoint && !withoutRedirect) {
    revalidatePath('/admin/billing')
    if (result.subscription.status !== 'authorized')
      redirect(result.subscription.initPoint)
  }

  return { success: true, subscription: updatedSubscription }
}
