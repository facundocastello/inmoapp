import { sendEmail } from '@/lib/email/send'
import { prisma } from '@/lib/prisma'

import { getGracePeriodStatus } from './grace-period'
import { processPayment } from './payment-processor'
import { PaymentMethod, PaymentStatus, SubscriptionType } from '.prisma/shared'

interface CheckResult {
  success: boolean
  error?: string
}

export async function checkSubscriptions(): Promise<CheckResult> {
  try {
    // Find all tenants that need payment
    const tenantsNeedingPayment = await prisma.tenant.findMany({
      where: {
        isActive: true,
        nextPaymentAt: {
          lt: new Date(),
        },
      },
      include: {
        plan: true,
      },
    })

    // Process each tenant's payment
    for (const tenant of tenantsNeedingPayment) {
      if (!tenant.plan) continue

      const graceStatus = getGracePeriodStatus(
        tenant.graceStartedAt,
        tenant.gracePeriodDays,
      )
      const shouldStartGracePeriod =
        !graceStatus.isActive && !graceStatus.isExpired

      if (tenant.subscriptionType === SubscriptionType.MANUAL) {
        if (shouldStartGracePeriod) {
          await manualPaymentCreation(tenant)
          continue
        }
      } else {
        const result = await processPayment(
          tenant.id,
          tenant.plan.price,
          PaymentMethod.AUTOMATED,
        )

        if (result.success) continue
      }
      if (graceStatus.isExpired) {
        await sendEmail({
          to: tenant.email || '',
          subject: 'Payment Required - Grace Period Finished',
          body: emailTemplates.serviceDeactivated(tenant),
        })
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            isActive: false,
          },
        })
      } else {
        await sendEmail({
          to: tenant.email || '',
          subject: 'Payment Required - Grace Period Reminder',
          body: emailTemplates.gracePeriodReminder(
            tenant,
            tenant.plan,
            graceStatus,
          ),
        })
      }
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

const manualPaymentCreation = async (tenant: any) => {
  await prisma.payment.create({
    data: {
      amount: tenant.plan.price,
      status: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.MANUAL,
      dueDate: tenant.nextPaymentAt!,
      tenantId: tenant.id,
    },
  })

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      graceStartedAt: new Date(),
    },
  })

  await sendEmail({
    to: tenant.email || '',
    subject: 'Payment Required - Grace Period Started',
    body: emailTemplates.gracePeriodStarted(tenant, tenant.plan),
  })
}

// Email templates
const emailTemplates = {
  gracePeriodStarted: (tenant: any, plan: any) => `
    Dear ${tenant.name},

    Your subscription payment is due. A grace period of ${tenant.gracePeriodDays} days has started.
    Please make the payment before the grace period ends to avoid service interruption.

    Amount: $${plan.price}
    Due Date: ${tenant.nextPaymentAt!.toLocaleDateString()}

    Best regards,
    Your Service Team
  `,

  gracePeriodReminder: (tenant: any, plan: any, graceStatus: any) => `
    Dear ${tenant.name},

    Your subscription payment is still due. You have ${graceStatus.daysRemaining} days remaining in your grace period.
    Please make the payment before ${graceStatus.endsAt?.toLocaleDateString()} to avoid service interruption.

    Amount: $${plan.price}
    Due Date: ${tenant.nextPaymentAt!.toLocaleDateString()}

    Best regards,
    Your Service Team
  `,

  paymentFailed: (tenant: any, plan: any) => `
    Dear ${tenant.name},

    We were unable to process your payment. A grace period of ${tenant.gracePeriodDays} days has started.
    Please update your payment information or contact support.

    Amount: $${plan.price}
    Due Date: ${tenant.nextPaymentAt!.toLocaleDateString()}

    Best regards,
    Your Service Team
  `,

  paymentFailedReminder: (tenant: any, plan: any, graceStatus: any) => `
    Dear ${tenant.name},

    We were unable to process your payment again. You have ${graceStatus.daysRemaining} days remaining in your grace period.
    Please update your payment information before ${graceStatus.endsAt?.toLocaleDateString()}.

    Amount: $${plan.price}
    Due Date: ${tenant.nextPaymentAt!.toLocaleDateString()}

    Best regards,
    Your Service Team
  `,

  serviceDeactivated: (tenant: any) => `
    Dear ${tenant.name},

    Your service has been deactivated due to payment failure and expiration of the grace period.
    
    To reactivate your service, please contact our support team and arrange for payment.

    We value your business and hope to restore your service soon.

    Best regards,
    Your Service Team
  `,
}
