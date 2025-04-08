import { ManualPaymentTable } from '@/components/payments/ManualPaymentTable'
import MarkAsPaidButton from '@/components/payments/MarkAsPaidButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { prisma } from '@/lib/prisma'

import { SubscriptionStatus } from '.prisma/shared'

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
    <div className="grid gap-6">
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
          <div className="space-y-4">
            {gracePeriodsubscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{sub.tenant.name}</h3>
                  <p className="text-sm text-gray-500">
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
