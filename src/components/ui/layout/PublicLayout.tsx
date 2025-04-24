import Link from 'next/link'

import { getFeaturedPages } from '@/lib/actions/tenant/page'

interface Page {
  id: string
  title: string
  slug: string
}

export default async function PublicLayout({
  children,
  tenant,
}: {
  children: React.ReactNode
  tenant: string
}) {
  const featuredPages = await getFeaturedPages()

  return (
    <div id="public-layout" className={styles.container}>
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
  container: 'min-h-screen bg-secondary-200',
  nav: 'bg-secondary-100 shadow-sm',
  navContainer: 'md:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  navContent: 'flex justify-between h-16',
  navContentLeft: 'flex-shrink-0 flex items-center',
  navContentRight: 'hidden sm:ml-6 sm:flex sm:space-x-8',
  navContentLeftItem: 'flex-shrink-0 flex items-center',
  navContentLeftItemLink: 'text-xl font-bold text-secondary-900',
  navContentRightItem:
    'inline-flex items-center px-1 pt-1 text-sm font-medium text-secondary-900 hover:text-secondary-500',
  main: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
}
