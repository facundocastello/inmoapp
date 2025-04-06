import { prisma } from '@/lib/prisma'

import { PaymentMethod, PaymentStatus } from '.prisma/shared'

interface ProcessPaymentResult {
  success: boolean
  error?: string
}

export async function processPayment(
  tenantId: string,
  amount: number,
  paymentMethod: PaymentMethod,
): Promise<ProcessPaymentResult> {
  try {
    // For now, simulate payment success/failure
    // This will be replaced with actual payment gateway integration
    const isSuccessful = Math.random() >= 0.5

    await prisma.payment.create({
      data: {
        amount,
        status: isSuccessful ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
        paymentMethod,
        dueDate: new Date(),
        paidAt: isSuccessful ? new Date() : null,
        tenantId,
      },
    })

    if (isSuccessful) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { plan: true },
      })

      const nextPaymentDate = new Date()
      // billingCycle is in months
      nextPaymentDate.setMonth(
        nextPaymentDate.getMonth() + tenant!.plan!.billingCycle,
      )

      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          nextPaymentAt: nextPaymentDate,
          graceStartedAt: null,
        },
      })

      return { success: true }
    } else {
      // Start grace period
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          graceStartedAt: new Date(),
        },
      })

      return {
        success: false,
        error: 'Payment failed. Grace period started.',
      }
    }
  } catch (error) {
    console.error('Payment processing failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
