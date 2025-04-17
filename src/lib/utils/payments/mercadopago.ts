'use server'

import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago'
import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes'
import { PreApprovalResponse } from 'mercadopago/dist/clients/preApproval/commonTypes'
import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/prisma'

import { PaymentMethod, PaymentStatus } from '.prisma/shared'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const preapproval = new PreApproval(client)
const payment = new Payment(client)

interface CreateSubscriptionParams {
  tenantId: string
  planId: string
  email: string
  amount: number
  frequency: number // 1 for monthly, 12 for yearly
  currency: string
}

export async function createMercadoPagoSubscription({
  tenantId,
  planId,
  email,
  amount,
  frequency,
  currency,
}: CreateSubscriptionParams) {
  console.log('Creating Mercado Pago subscription:', {
    tenantId,
    planId,
    email,
    amount,
    frequency,
    currency,
  })
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  })
  if (!plan) {
    throw new Error('Plan not found')
  }
  try {
    const subscription = await preapproval.create({
      body: {
        reason: `Subscription for plan ${plan.name}`,
        external_reference: tenantId,
        payer_email: email,
        auto_recurring: {
          frequency,
          frequency_type: 'months',
          transaction_amount: amount,
          currency_id: currency,
        },
        back_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/billing`,
        status: 'pending',
      },
    })
    if (!subscription?.id)
      throw new Error(
        'Failed to create subscription: No subscription ID returned',
      )
    return { subscription: parseMPSubscription(subscription), success: true }
  } catch (error) {
    console.error('Error creating subscription:', {
      error,
      tenantId,
      planId,
      amount,
    })
    return {
      success: false,
      error: 'Failed to create subscription',
    }
  }
}

export async function getMercadoPagoSubscription(subscriptionId: string) {
  console.log('Getting Mercado Pago subscription:', { subscriptionId })

  const subscription = await preapproval.get({ id: subscriptionId })
  if (!subscription) throw new Error('Subscription not found')
  return { subscription: parseMPSubscription(subscription), success: true }
}

export async function updateMercadoPagoSubscriptionPrice({
  subscriptionId,
  newAmount,
}: {
  subscriptionId: string
  newAmount: number
}) {
  try {
    const result = await preapproval.update({
      id: subscriptionId,
      body: {
        auto_recurring: {
          transaction_amount: newAmount,
          currency_id: 'ARS',
        },
      },
    })
    return {
      success: true,
      result,
    }
  } catch (error) {
    console.error('Error updating subscription price:', {
      error,
      subscriptionId,
      newAmount,
    })
    return {
      success: false,
      error: 'Failed to update subscription price',
    }
  }
}

export async function cancelMercadoPagoSubscription(subscriptionId: string) {
  try {
    const result = await preapproval.update({
      id: subscriptionId,
      body: { status: 'cancelled' },
    })
    return {
      success: true,
      result,
    }
  } catch (error) {
    console.error('Error canceling subscription:', {
      error,
      subscriptionId,
    })
    return {
      success: false,
      error: 'Failed to cancel subscription',
    }
  }
}

export async function handlePaymentNotification(paymentId: string) {
  console.log('Processing payment notification:', { paymentId })

  try {
    const { status, amount, externalSubscriptionId } = parseMPPayment(
      await payment.get({ id: paymentId }),
    )

    console.log('Mercado Pago payment details:', {
      status,
      amount,
      externalSubscriptionId,
    })

    if (!paymentId) {
      console.error('Invalid payment ID received from Mercado Pago:', {
        paymentId,
      })
      throw new Error('Invalid payment ID received from Mercado Pago')
    }

    // Update payment status based on Mercado Pago status

    const subscription = await prisma.subscription.findUnique({
      where: { externalId: externalSubscriptionId },
      include: { plan: true },
    })

    if (!subscription) {
      console.error('Subscription not found in database:', {
        subscriptionId: externalSubscriptionId,
      })
      throw new Error('Subscription not found in database')
    }

    const dbPayment = await prisma.payment.upsert({
      where: { externalId: paymentId },
      update: {
        status,
        paidAt: status === PaymentStatus.COMPLETED ? new Date() : null,
      },
      create: {
        externalId: paymentId,
        status: PaymentStatus.PENDING,
        subscriptionId: subscription.id,
        dueDate: new Date(),
        paymentMethod: PaymentMethod.AUTOMATED,
        amount,
        reason: subscription.plan?.name,
      },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    })

    revalidatePath(`/admin/billing`)

    // If payment is completed, update tenant's next payment date
    if (status === PaymentStatus.COMPLETED && dbPayment.subscription?.plan) {
      const nextPaymentDate = new Date()
      nextPaymentDate.setMonth(
        nextPaymentDate.getMonth() + dbPayment.subscription.billingCycle,
      )

      console.log('Updating tenant next payment date:', {
        subscriptionId: dbPayment.subscriptionId,
        nextPaymentDate,
      })

      await prisma.subscription.update({
        where: { id: dbPayment.subscription.id },
        data: {
          nextPaymentAt: nextPaymentDate,
          graceStartedAt: null,
        },
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error handling payment notification:', {
      error,
      paymentId,
    })
    return {
      success: false,
      error: 'Failed to handle payment notification',
    }
  }
}

export async function checkMercadoPagoSubscriptionStatus(
  subscriptionId: string,
) {
  console.log('Checking subscription status:', { subscriptionId })

  try {
    const subscription = await preapproval.get({ id: subscriptionId })

    if (!subscription) {
      console.error('Subscription not found:', { subscriptionId })
      return {
        success: false,
        error: 'Subscription not found',
      }
    }

    console.log('Subscription status retrieved:', {
      subscriptionId,
      status: subscription.status,
      nextPaymentDate: subscription.next_payment_date,
    })

    return {
      success: true,
      status: subscription.status,
      nextPaymentDate: subscription.next_payment_date
        ? new Date(subscription.next_payment_date)
        : null,
      paymentMethod: subscription.payment_method_id,
      amount: subscription.auto_recurring?.transaction_amount,
      currency: subscription.auto_recurring?.currency_id,
    }
  } catch (error) {
    console.error('Error checking subscription status:', {
      error,
      subscriptionId,
    })
    return {
      success: false,
      error: 'Failed to check subscription status',
    }
  }
}

const parseMPSubscription = (subscription: PreApprovalResponse) => ({
  frequency: subscription.auto_recurring?.frequency,
  amount: subscription.auto_recurring?.transaction_amount,
  currency: subscription.auto_recurring?.currency_id,
  status: subscription.status,
  nextPaymentDate: subscription.next_payment_date,
  paymentMethod: subscription.payment_method_id,
  id: subscription.id,
  initPoint: subscription.init_point,
  payerEmail: subscription.payer_email,
  reason: subscription.reason,
})

const parseMPPayment = (payment: PaymentResponse) => ({
  paymentId: payment.id?.toString()!,
  status: mapStatus(payment.status!),
  amount: payment.transaction_amount ?? 0,
  externalSubscriptionId: payment.metadata?.preapproval_id,
})

const mapStatus = (status: string) => {
  let parsedStatus: PaymentStatus
  switch (status) {
    case 'approved':
      parsedStatus = PaymentStatus.COMPLETED
      break
    case 'rejected':
      parsedStatus = PaymentStatus.FAILED
      break
    case 'refunded':
      parsedStatus = PaymentStatus.REFUNDED
      break
    default:
      parsedStatus = PaymentStatus.PENDING
  }
  return parsedStatus
}
