import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

import { CheckSubscription } from './CheckSubscription'
import { SwitchToAutomatedButton } from './SwitchToAutomatedButton'
import { Plan, Subscription } from '.prisma/shared'

interface CurrentPlanCardProps {
  plan: Plan | null
  subscription: Subscription | null
}

export default function CurrentPlanCard({
  plan,
  subscription,
}: CurrentPlanCardProps) {
  const now = new Date()
  if (!subscription) return null
  const isPaymentOverdue = Boolean(
    subscription?.nextPaymentAt && subscription.nextPaymentAt < now,
  )
  const isInGracePeriod = Boolean(subscription?.graceStartedAt !== null)
  const gracePeriodEnd = subscription?.graceStartedAt
    ? new Date(
        subscription.graceStartedAt.getTime() +
          subscription.gracePeriodDays * 24 * 60 * 60 * 1000,
      )
    : null
  const isGracePeriodExpired = Boolean(gracePeriodEnd && gracePeriodEnd < now)
  const daysUntilGraceEnd = gracePeriodEnd
    ? Math.ceil(
        (gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      )
    : null

  const isManualPayment = subscription?.paymentMethod === 'MANUAL'

  console.log('suscription', subscription)

  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle className={styles.title}>Subscription Status</CardTitle>
      </CardHeader>
      <CardContent>
        {plan ? (
          <div className={styles.content}>
            <div className={styles.planInfo}>
              <p className={styles.planName}>{plan.name}</p>
              <p className={styles.planPrice}>
                ${plan.price} per{' '}
                {subscription?.billingCycle === 1 ? 'month' : 'year'}
              </p>
            </div>

            {isManualPayment && (
              <div className={cn(styles.alert, styles.info)}>
                <p className={styles.alertTitle}>Manual Payment</p>
                <p className={styles.alertSubtitle}>
                  This is a manual payment subscription. Please contact our
                  support team to receive payment instructions.
                </p>
                <div className={styles.switchContainer}>
                  <p className={styles.switchText}>
                    Want to switch to automated payments? Subscribe with Mercado
                    Pago for hassle-free billing.
                  </p>
                </div>
              </div>
            )}
            {subscription.paymentMethod !== 'AUTOMATED' ? (
              <SwitchToAutomatedButton subscription={subscription} />
            ) : (
              (isPaymentOverdue || subscription.status === 'PENDING') && (
                <CheckSubscription subscription={subscription} />
              )
            )}
            <CheckSubscription subscription={subscription} />

            {isPaymentOverdue && !isInGracePeriod && (
              <div className={cn(styles.alert, styles.error)}>
                <p className={styles.alertTitle}>⚠️ Payment Overdue</p>
                <p className={styles.alertSubtitle}>
                  Your payment is overdue. Please make the payment immediately
                  to avoid service interruption.
                </p>
              </div>
            )}

            {isInGracePeriod && gracePeriodEnd && (
              <div className={cn(styles.alert, styles.warning)}>
                <p className={styles.alertTitle}>⚠️ Grace Period Active</p>
                <p className={styles.alertSubtitle}>
                  You have {daysUntilGraceEnd}{' '}
                  {daysUntilGraceEnd === 1 ? 'day' : 'days'} left before your
                  account is suspended.
                </p>
                <p className={styles.alertSubtitle}>
                  Please make the payment before{' '}
                  {gracePeriodEnd.toLocaleDateString()} to avoid service
                  interruption.
                </p>
              </div>
            )}

            {isGracePeriodExpired && (
              <div className={cn(styles.alert, styles.error)}>
                <p className={styles.alertTitle}>
                  🚨 Account Suspension Imminent
                </p>
                <p className={styles.alertSubtitle}>
                  Your grace period has expired. Your account will be suspended
                  immediately if payment is not made.
                </p>
              </div>
            )}

            {!isPaymentOverdue && subscription?.nextPaymentAt && (
              <div className={styles.paymentInfo}>
                <p className={styles.paymentLabel}>Next Payment Due</p>
                <p className={styles.paymentDate}>
                  {new Date(subscription.nextPaymentAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {subscription?.status === 'CANCELLED' && (
              <div className={cn(styles.alert, styles.info)}>
                <p className={styles.alertTitle}>Subscription Cancelled</p>
                <p className={styles.alertSubtitle}>
                  Your subscription has been cancelled. You will continue to
                  have access until the end of your current billing period.
                </p>
              </div>
            )}

            {subscription?.status === 'PAUSED' && (
              <div className={cn(styles.alert, styles.info)}>
                <p className={styles.alertTitle}>Subscription Paused</p>
                <p className={styles.alertSubtitle}>
                  Your subscription is currently paused. Contact support to
                  reactivate your subscription.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className={cn(styles.alert, styles.info)}>
            <p className={styles.alertTitle}>No Active Plan</p>
            <p className={styles.alertSubtitle}>
              Please select a plan to continue using our services.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const styles = {
  card: 'w-full',
  title: 'text-xl font-semibold',
  content: 'space-y-6',
  planInfo: 'space-y-2 mb-6',
  planName: 'text-2xl font-bold text-primary-900',
  planPrice: 'text-lg text-neutral-600',
  alert: 'rounded-lg p-4 space-y-2',
  warning: 'bg-error-100 text-error-900 border border-error-200',
  error: 'bg-error-100 text-error-800 border border-error-200',
  info: 'bg-primary-50 text-primary-800 border border-primary-200',
  alertTitle: 'font-semibold text-lg',
  alertSubtitle: 'text-sm',
  paymentInfo: 'space-y-1 mt-4',
  paymentLabel: 'text-sm font-medium text-neutral-600',
  paymentDate: 'text-sm text-neutral-800',
  switchContainer: 'mt-4 space-y-3',
  switchText: 'text-sm text-primary-700',
  switchButton: 'w-full sm:w-auto',
}
