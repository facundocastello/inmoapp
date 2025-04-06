import { PaymentProofUpload } from '@/components/payments/PaymentProofUpload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getCurrentTenant } from '@/lib/actions/tenant'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'

export default async function BillingPage() {
  const tenant = await getCurrentTenant()
  if (!tenant) {
    return null
  }

  const payments = await prisma.payment.findMany({
    where: {
      tenantId: tenant.id,
    },
    include: {
      tenant: {
        include: {
          plan: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const now = new Date()
  const isPaymentOverdue = tenant.nextPaymentAt && tenant.nextPaymentAt < now
  const isInGracePeriod = tenant.graceStartedAt !== null
  const gracePeriodEnd = tenant.graceStartedAt
    ? new Date(
        tenant.graceStartedAt.getTime() +
          tenant.gracePeriodDays * 24 * 60 * 60 * 1000,
      )
    : null
  const isGracePeriodExpired = gracePeriodEnd && gracePeriodEnd < now

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Billing</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {tenant.plan ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-lg font-medium">{tenant.plan.name}</p>
                  <p className="text-sm text-neutral-600">
                    ${tenant.plan.price} per{' '}
                    {tenant.plan.billingCycle === 1 ? 'month' : 'year'}
                  </p>
                </div>

                {isPaymentOverdue && (
                  <div
                    className={cn(
                      'rounded-md p-3',
                      isInGracePeriod
                        ? 'bg-warning-50 text-warning-800'
                        : 'bg-error-50 text-error-800',
                    )}
                  >
                    <p className="font-medium">
                      {isInGracePeriod
                        ? 'Payment Overdue - Grace Period Active'
                        : 'Payment Overdue - Please Pay Immediately'}
                    </p>
                    {isInGracePeriod && gracePeriodEnd && (
                      <p className="text-sm mt-1">
                        Grace period ends on{' '}
                        {gracePeriodEnd.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {tenant.nextPaymentAt && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-neutral-600">
                      {isPaymentOverdue ? 'Payment Due' : 'Next Payment Due'}
                    </p>
                    <p
                      className={cn(
                        'text-sm',
                        isPaymentOverdue
                          ? 'text-error-600 font-medium'
                          : 'text-neutral-600',
                      )}
                    >
                      {new Date(tenant.nextPaymentAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {isGracePeriodExpired && (
                  <div className="rounded-md bg-error-50 p-3 text-error-800">
                    <p className="font-medium">Grace Period Expired</p>
                    <p className="text-sm mt-1">
                      Your account will be suspended if payment is not made
                      immediately.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-neutral-600">No plan selected</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {payments.some((payment) => payment.status === 'PENDING') && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Upload Payment Proof</h3>
                <div className="space-y-4">
                  {payments
                    .filter((payment) => payment.status === 'PENDING')
                    .map((payment) => (
                      <div key={payment.id} className="space-y-2">
                        <p className="text-sm text-neutral-600">
                          Payment due on{' '}
                          {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                        <PaymentProofUpload payment={payment} />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
