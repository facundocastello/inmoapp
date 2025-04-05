import Link from 'next/link'

import { TenantsTable } from '@/components/tenant/TenantsTable'
import { Button } from '@/components/ui/Button'
import { PageContainer } from '@/components/ui/layout/PageContainer'
import { getTenants } from '@/lib/actions/tenant'

interface TenantsPageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
  }>
}

export default async function TenantsPage({ searchParams }: TenantsPageProps) {
  const awaitedParams = await searchParams
  const page = Number(awaitedParams.page || 1)
  const limit = Number(awaitedParams.limit || 10)

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Tenants</h1>
          <Link href="/super-admin/tenants/new">
            <Button>Create Tenant</Button>
          </Link>
        </div>

        <TenantsTable tenants={tenants} />

        <div className="flex items-center justify-between">
          <div className="text-sm text-primary-800">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{' '}
            of {total} tenants
          </div>
          <div className="flex space-x-2">
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
