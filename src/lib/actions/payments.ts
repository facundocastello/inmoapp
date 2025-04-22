'use server'

import { PaymentMethod, PaymentStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

import { sendEmail } from '@/lib/email/send'
import { prisma } from '@/lib/prisma'

import { getIsSuperAdmin } from '../auth'
import { uploadFile } from './file'

export async function markPaymentAsPaid(paymentId: string) {
  // check if user is super admin
  const isSuperAdmin = await getIsSuperAdmin()
  if (!isSuperAdmin) {
    throw new Error('Unauthorized')
  }
  try {
    // Get the payment with tenant and plan details
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        subscription: {
          include: {
            tenant: true,
          },
        },
      },
    })

    if (!payment) {
      throw new Error('Payment not found')
    }

    if (payment.status !== 'PENDING') {
      throw new Error('Payment is not in pending status')
    }

    if (!payment.subscription) {
      throw new Error('Tenant has no plan assigned')
    }

    // Calculate next payment date based on plan's billing cycle
    const nextPaymentAt = new Date()
    const billingCycle = payment.subscription.billingCycle // 1 for monthly, 12 for yearly

    if (billingCycle === 1) {
      nextPaymentAt.setMonth(nextPaymentAt.getMonth() + 1)
    } else if (billingCycle === 12) {
      nextPaymentAt.setFullYear(nextPaymentAt.getFullYear() + 1)
    }

    // Update payment and tenant in a transaction
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
        },
      }),
      prisma.subscription.update({
        where: { tenantId: payment.subscription?.tenantId },
        data: {
          nextPaymentAt,
          graceStartedAt: null, // Clear grace period if it exists
        },
      }),
    ])

    // Send confirmation email
    await sendEmail({
      to: payment.subscription?.tenant.email || '',
      subject: 'Payment Confirmed',
      body: `
        Dear ${payment.subscription?.tenant.name},

        Your payment of $${payment.amount} has been confirmed.
        
        Next payment due: ${nextPaymentAt.toLocaleDateString()}
        
        Thank you for your business!

        Best regards,
        Your Service Team
      `,
    })

    // Revalidate the payments page
    revalidatePath('/payments')

    return { success: true }
  } catch (error) {
    console.error('Error marking payment as paid:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    }
  }
}

export async function updatePaymentProof(
  paymentId: string,
  proofOfPayment: File,
) {
  try {
    // Upload file to S3
    const fileKey = await uploadFile(proofOfPayment, {
      shouldOptimize: false,
    })
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        proofOfPayment: fileKey,
        updatedAt: new Date(),
      },
    })

    revalidatePath('/super-admin/payments')
    revalidatePath(`/super-admin/payments/${paymentId}`)
    return { success: true, data: payment }
  } catch (error) {
    console.error('Error updating payment proof:', error)
    return { success: false, error: 'Failed to update payment proof' }
  }
}

interface ProcessPaymentResult {
  success: boolean
  error?: string
  initPoint?: string
}

export async function processPayment(
  tenantId: string,
  amount: number,
  paymentMethod: PaymentMethod,
): Promise<ProcessPaymentResult> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId },
      include: {
        plan: true,
        tenant: true,
      },
    })
    const tenant = subscription?.tenant
    const plan = subscription?.plan
    if (!tenant || !plan) {
      return {
        success: false,
        error: 'Tenant or plan not found',
      }
    }

    // If there's an existing subscription, check its status
    if (subscription) {
      if (subscription.status === 'ACTIVE') {
        return {
          success: false,
          error: 'Tenant already has an active subscription',
        }
      }
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        amount,
        status: PaymentStatus.PENDING,
        paymentMethod,
        dueDate: new Date(),
        subscriptionId: subscription.id,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error processing payment:', error)
    return {
      success: false,
      error: 'Failed to process payment',
    }
  }
}
