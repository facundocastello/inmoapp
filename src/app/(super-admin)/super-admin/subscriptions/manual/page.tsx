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
      tenant: {
        include: {
          plan: true,
        },
      },
    },
    orderBy: {
      dueDate: 'asc',
    },
  })

  const gracePeriodTenants = await prisma.tenant.findMany({
    where: {
      graceStartedAt: {
        not: null,
      },
      isActive: true,
    },
    include: {
      plan: true,
      payments: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  })

  return { pendingPayments, gracePeriodTenants }
}

export default async function ManualPaymentsPage() {
  const { pendingPayments, gracePeriodTenants } = await getData()

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Manual Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <ManualPaymentTable payments={pendingPayments} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tenants in Grace Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gracePeriodTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{tenant.name}</h3>
                  <p className="text-sm text-gray-500">
                    Grace period ends:{' '}
                    {new Date(
                      new Date(tenant.graceStartedAt!).getTime() +
                        (tenant.gracePeriodDays || 15) * 24 * 60 * 60 * 1000,
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
