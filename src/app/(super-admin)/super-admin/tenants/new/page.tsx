import { TenantForm } from '@/components/tenant/TenantForm'
import { PageContainer } from '@/components/ui/layout/PageContainer'
import { prisma } from '@/lib/prisma'

export default async function NewTenantPage() {
  const plans = await prisma.plan.findMany()
  return (
    <PageContainer>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Tenant</h1>
        </div>

        <div className={styles.formContainer}>
          <TenantForm plans={plans} />
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
