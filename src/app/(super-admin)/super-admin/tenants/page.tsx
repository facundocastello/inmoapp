import Link from 'next/link'

import { TenantsTable } from '@/components/tenant/TenantsTable'
import { Button } from '@/components/ui/Button'
import { PageContainer } from '@/components/ui/layout/PageContainer'
import { getTenants } from '@/lib/actions/tenant'

interface TenantsPageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    forceDelete?: string
  }>
}

export default async function TenantsPage({ searchParams }: TenantsPageProps) {
  const awaitedParams = await searchParams
  const page = Number(awaitedParams.page || 1)
  const limit = Number(awaitedParams.limit || 10)
  const forceDelete = awaitedParams.forceDelete

  const {
    data: tenants,
    total,
    totalPages,
  } = await getTenants({
    page: Number(page),
    limit,
  })

  return (
    <PageContainer>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Tenants</h1>
          <Link href="/super-admin/tenants/new">
            <Button>Create Tenant</Button>
          </Link>
        </div>

        <TenantsTable tenants={tenants} forceDelete={forceDelete} />

        <div className={styles.footer}>
          <div className={styles.paginationInfo}>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{' '}
            of {total} tenants
          </div>
          <div className={styles.paginationButtons}>
            {page > 1 && (
              <Link
                href={`/super-admin/tenants?page=${page - 1}&limit=${limit}`}
              >
                <Button variant="outline" size="sm">
                  Previous
                </Button>
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/super-admin/tenants?page=${page + 1}&limit=${limit}`}
              >
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

const styles = {
  container: 'space-y-6',
  header: 'flex items-center justify-between',
  title: 'text-2xl font-semibold',
  footer: 'flex items-center justify-between',
  paginationInfo: 'text-sm text-primary-800',
  paginationButtons: 'flex space-x-2',
}
