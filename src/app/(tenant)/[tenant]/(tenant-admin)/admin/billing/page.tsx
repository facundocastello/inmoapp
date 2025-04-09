import CurrentPlanCard from '@/components/billing/CurrentPlanCard'
import { PaymentProofUpload } from '@/components/payments/PaymentProofUpload'
import { PaymentTable } from '@/components/payments/PaymentTable'
import { PlansTable } from '@/components/plans/PlansTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { checkAutomatedSubscription } from '@/lib/actions/subscription'
import { getCurrentTenantOrRedirect } from '@/lib/actions/tenant'
import { prisma } from '@/lib/prisma'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ preapproval_id?: string }>
}) {
  const tenant = await getCurrentTenantOrRedirect()
  if (!tenant) return null

  const { preapproval_id } = await searchParams
  if (preapproval_id)
    await checkAutomatedSubscription({
      externalId: preapproval_id,
      withoutRedirect: true,
    })

  const subscription = await prisma.subscription.findUnique({
    where: {
      tenantId: tenant.id,
    },
    include: {
      plan: true,
      payments: true,
    },
  })

  const plan = subscription?.plan ?? null
  const hasPendingPayments = subscription?.payments.some(
    (payment) => payment.status === 'PENDING',
  )

  return (
    <>
      <CurrentPlanCard plan={plan} subscription={subscription} />
      {plan && <PlansTable plans={[plan]} />}

      {hasPendingPayments && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <div className={styles.paymentSection}>
              <h3 className={styles.uploadTitle}>Upload Payment Proof</h3>
              <div className={styles.paymentList}>
                {subscription?.payments.map((payment) => (
                  <div key={payment.id} className={styles.paymentItem}>
                    <p className={styles.paymentDue}>
                      Payment due on{' '}
                      {new Date(payment.dueDate).toLocaleDateString()}
                    </p>
                    <PaymentProofUpload payment={payment} />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <PaymentTable payments={subscription?.payments || []} />
    </>
  )
}

const styles = {
  cardContent: 'space-y-6',
  paymentSection: 'space-y-4',
  uploadTitle: 'text-sm font-medium',
  paymentList: 'space-y-4',
  paymentItem: 'space-y-2',
  paymentDue: 'text-sm text-neutral-600',
}
