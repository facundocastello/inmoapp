import Link from 'next/link'

import { PagesTable } from '@/components/admin/pages/PagesTable'
import { Button } from '@/components/ui/Button'
import { getPages } from '@/lib/actions/tenant/page'

export default async function PagesPage() {
  const pages = await getPages()

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Pages</h1>
        <Link href="/admin/pages/new">
          <Button>Create Page</Button>
        </Link>
      </div>
      <PagesTable pages={pages} />
    </>
  )
}

const styles = {
  header: 'flex items-center justify-between mb-6',
  title: 'text-2xl font-semibold text-primary-900',
}
