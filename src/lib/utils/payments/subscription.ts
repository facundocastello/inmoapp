import {
  PaymentMethod,
  PaymentStatus,
  SubscriptionStatus,
  SubscriptionType,
  Tenant,
} from '@prisma/client'

import { sendEmail } from '@/lib/email/send'
import { prisma } from '@/lib/prisma'

import { getGracePeriodStatus } from './index'

interface CheckResult {
  success: boolean
  error?: string
}

const getSubscriptionsNeedingPayment = () => {
  return prisma.subscription.findMany({
    where: {
      status: SubscriptionStatus.ACTIVE,
      nextPaymentAt: {
        lt: new Date(),
      },
    },
    include: {
      plan: true,
      tenant: true,
    },
  })
}
type Subscription = Awaited<
  ReturnType<typeof getSubscriptionsNeedingPayment>
>[number]

export async function checkSubscriptions(): Promise<CheckResult> {
  try {
    // Find all tenants that need payment
    const subscriptionsNeedingPayment = await getSubscriptionsNeedingPayment()

    // Process each tenant's payment
    for (const subscription of subscriptionsNeedingPayment) {
      await checkSubscription(subscription)
    }

    return { success: true }
  } catch (error) {
    console.error('Subscription check failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

const checkSubscription = async (subscription: Subscription) => {
  const plan = subscription.plan
  const tenant = subscription.tenant
  if (!plan) return

  const graceStatus = getGracePeriodStatus(
    subscription.graceStartedAt,
    subscription.gracePeriodDays,
  )
  const shouldStartGracePeriod = !graceStatus.isActive && !graceStatus.isExpired
  if (tenant.subscriptionType === SubscriptionType.MANUAL) {
    if (shouldStartGracePeriod) {
      await startGracePeriodForManualPayment(subscription)
      return
    }
  }
  if (graceStatus.isExpired) {
    await sendEmail({
      to: tenant.email || '',
      subject: 'Payment Required - Grace Period Finished',
      body: emailTemplates.serviceDeactivated(subscription.tenant),
    })
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { isActive: false },
    })
  } else {
    await sendEmail({
      to: tenant.email || '',
      subject: 'Payment Required - Grace Period Reminder',
      body: emailTemplates.gracePeriodReminder(subscription, graceStatus),
    })
  }
}

const startGracePeriodForManualPayment = async (subscription: Subscription) => {
  await prisma.payment.create({
    data: {
      amount: subscription.plan.price,
      status: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.MANUAL,
      dueDate: subscription.nextPaymentAt!,
      subscriptionId: subscription.id,
    },
  })

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      graceStartedAt: new Date(),
    },
  })

  await sendEmail({
    to: subscription.tenant.email || '',
    subject: 'Payment Required - Grace Period Started',
    body: emailTemplates.gracePeriodStarted(subscription),
  })
}

// Email templates
const emailTemplates = {
  gracePeriodStarted: ({
    tenant,
    plan,
    nextPaymentAt,
    gracePeriodDays,
  }: Subscription) => `
    Dear ${tenant.name},

    Your subscription payment is due. A grace period of ${gracePeriodDays} days has started.
    Please make the payment before the grace period ends to avoid service interruption.

    Amount: $${plan.price}
    Due Date: ${nextPaymentAt!.toLocaleDateString()}

    Best regards,
    Your Service Team
  `,

  gracePeriodReminder: (
    { tenant, plan, nextPaymentAt }: Subscription,
    graceStatus: any,
  ) => `
    Dear ${tenant.name},

    Your subscription payment is still due. You have ${graceStatus.daysRemaining} days remaining in your grace period.
    Please make the payment before ${graceStatus.endsAt?.toLocaleDateString()} to avoid service interruption.

    Amount: $${plan.price}
    Due Date: ${nextPaymentAt!.toLocaleDateString()}

    Best regards,
    Your Service Team
  `,

  paymentFailed: ({
    tenant,
    plan,
    nextPaymentAt,
    gracePeriodDays,
  }: Subscription) => `
    Dear ${tenant.name},

    We were unable to process your payment. A grace period of ${gracePeriodDays} days has started.
    Please update your payment information or contact support.

    Amount: $${plan.price}
    Due Date: ${nextPaymentAt!.toLocaleDateString()}

    Best regards,
    Your Service Team
  `,

  paymentFailedReminder: (
    { tenant, plan, nextPaymentAt }: Subscription,
    graceStatus: any,
  ) => `
    Dear ${tenant.name},

    We were unable to process your payment again. You have ${graceStatus.daysRemaining} days remaining in your grace period.
    Please update your payment information before ${graceStatus.endsAt?.toLocaleDateString()}.

    Amount: $${plan.price}
    Due Date: ${nextPaymentAt!.toLocaleDateString()}

    Best regards,
    Your Service Team
  `,

  serviceDeactivated: (tenant: Tenant) => `
    Dear ${tenant.name},

    Your service has been deactivated due to payment failure and expiration of the grace period.
    
    To reactivate your service, please contact our support team and arrange for payment.

    We value your business and hope to restore your service soon.

    Best regards,
    Your Service Team
  `,
}
