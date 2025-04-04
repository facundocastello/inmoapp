import Link from 'next/link'

import { UsersTable } from '@/components/admin/users/UsersTable'
import { Button } from '@/components/ui/Button'
import { getTenantId } from '@/lib/get-tenant'
import { getTenantPrismaClient } from '@/lib/prisma'

export default async function UsersPage() {
  const prisma = await getTenantPrismaClient((await getTenantId()) as string)
  const users = await prisma.user.findMany({
    include: {
      content: true,
    },
  })

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Users</h1>
        <Link href="/admin/users/new">
          <Button>Create User</Button>
        </Link>
      </div>
      <UsersTable users={users} />
    </>
  )
}

const styles = {
  header: 'flex items-center justify-between mb-6',
  title: 'text-2xl font-semibold text-primary-900',
}
