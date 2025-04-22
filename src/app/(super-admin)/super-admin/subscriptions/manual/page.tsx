import { SubscriptionStatus } from '@prisma/client'

import { ManualPaymentTable } from '@/components/payments/ManualPaymentTable'
import MarkAsPaidButton from '@/components/payments/MarkAsPaidButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { prisma } from '@/lib/prisma'

const getData = async () => {
  const pendingPayments = await prisma.payment.findMany({
    where: {
      status: 'PENDING',
      paymentMethod: 'MANUAL',
    },
    include: {
      subscription: {
        include: {
          plan: true,
          tenant: true,
        },
      },
    },
    orderBy: {
      dueDate: 'asc',
    },
  })

  const gracePeriodsubscriptions = await prisma.subscription.findMany({
    where: {
      graceStartedAt: {
        not: null,
      },
      status: SubscriptionStatus.ACTIVE,
    },
    include: {
      plan: true,
      payments: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
      tenant: true,
    },
  })

  return { pendingPayments, gracePeriodsubscriptions }
}

export default async function ManualPaymentsPage() {
  const { pendingPayments, gracePeriodsubscriptions } = await getData()

  return (
    <div className={styles.container}>
      <Card>
        <CardHeader>
          <CardTitle>Pending Manual Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <ManualPaymentTable payments={pendingPayments || []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tenants in Grace Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.gracePeriodContainer}>
            {gracePeriodsubscriptions.map((sub) => (
              <div key={sub.id} className={styles.gracePeriodItem}>
                <div>
                  <h3 className={styles.tenantName}>{sub.tenant.name}</h3>
                  <p className={styles.gracePeriodEnd}>
                    Grace period ends:{' '}
                    {new Date(
                      new Date(sub.graceStartedAt!).getTime() +
                        (sub.gracePeriodDays || 15) * 24 * 60 * 60 * 1000,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <MarkAsPaidButton />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const styles = {
  container: 'grid gap-6',
  gracePeriodContainer: 'space-y-4',
  gracePeriodItem: 'flex items-center justify-between p-4 border rounded-lg',
  tenantName: 'font-medium',
  gracePeriodEnd: 'text-sm text-gray-500',
}
