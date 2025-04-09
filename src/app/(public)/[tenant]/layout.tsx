import Link from 'next/link'

import { getFeaturedPages } from '@/lib/actions/tenant/page'

interface Page {
  id: string
  title: string
  slug: string
}

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}) {
  const { tenant } = await params
  const featuredPages = await getFeaturedPages()

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <div className={styles.navContent}>
            <div className={styles.navContentLeft}>
              <div className={styles.navContentLeftItem}>
                <Link
                  href={`/${tenant}`}
                  className={styles.navContentLeftItemLink}
                >
                  {tenant}
                </Link>
              </div>
              <div className={styles.navContentRight}>
                {featuredPages.map((page: Page) => (
                  <Link
                    key={page.id}
                    href={`/${tenant}/${page.slug}`}
                    className={styles.navContentRightItem}
                  >
                    {page.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  )
}

const styles = {
  container: 'min-h-screen bg-primary-200',
  nav: 'bg-primary-100 shadow-sm',
  navContainer: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  navContent: 'flex justify-between h-16',
  navContentLeft: 'flex-shrink-0 flex items-center',
  navContentRight: 'hidden sm:ml-6 sm:flex sm:space-x-8',
  navContentLeftItem: 'flex-shrink-0 flex items-center',
  navContentLeftItemLink: 'text-xl font-bold',
  navContentRightItem:
    'inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-500',
  main: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
}
