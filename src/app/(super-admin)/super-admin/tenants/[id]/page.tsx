import { notFound } from 'next/navigation'

import { TenantForm } from '@/components/tenant/TenantForm'
import { PageContainer } from '@/components/ui/layout/PageContainer'
import { getPlans } from '@/lib/actions/plans'
import { prisma } from '@/lib/prisma'

interface TenantPageProps {
  params: Promise<{ id: string }>
}

export default async function TenantPage({ params }: TenantPageProps) {
  const subscription = await prisma.subscription.findUnique({
    where: {
      tenantId: (await params).id,
    },
    include: {
      plan: true,
      tenant: true,
    },
  })
  const tenant = subscription?.tenant
  const plans = await getPlans()

  if (!tenant) {
    notFound()
  }

  return (
    <PageContainer>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Edit Tenant</h1>
        </div>

        <div className={styles.formContainer}>
          <TenantForm
            plans={plans}
            initialData={{
              id: tenant.id,
              name: tenant.name,
              subdomain: tenant.subdomain,
              description: tenant.description,
              logo: tenant.logo,
              isActive: tenant.isActive,
              planId: subscription?.planId,
              subscriptionType: subscription?.paymentMethod,
            }}
          />
        </div>
      </div>
    </PageContainer>
  )
}

const styles = {
  container: 'space-y-6',
  header: 'flex items-center justify-between',
  title: 'text-2xl font-semibold',
  formContainer: 'rounded-lg border border-primary-200 p-6',
}
