import Link from 'next/link'

import { PlansTable } from '@/components/plans/PlansTable'
import { Button } from '@/components/ui/Button'
import { prisma } from '@/lib/prisma'

export default async function PlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: {
      price: 'asc',
    },
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Subscription Plans</h1>
        <Link href="/super-admin/plans/new">
          <Button>Create New Plan</Button>
        </Link>
      </div>

      <PlansTable plans={plans} />
    </div>
  )
}

const styles = {
  container: 'space-y-6',
  header: 'flex justify-between items-center',
  title: 'text-2xl font-bold',
}
