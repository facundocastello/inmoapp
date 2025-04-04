'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const Breadcrumb = () => {
  const pathname = usePathname()
  const paths = pathname.split('/').filter(Boolean)

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link href="/admin" className={styles.link}>
            Home
          </Link>
        </li>
        {paths.map((path, index) => {
          const href = `/${paths.slice(0, index + 1).join('/')}`
          const isLast = index === paths.length - 1
          const label = path
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')

          return (
            <li key={href} className={styles.item}>
              {isLast ? (
                <span className={styles.current}>{label}</span>
              ) : (
                <Link href={href} className={styles.link}>
                  {label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

const styles = {
  breadcrumb: 'flex',
  list: 'flex items-center space-x-2',
  item: 'flex items-center',
  link: 'text-sm font-medium text-primary-900 hover:text-primary-900',
  current: 'text-sm font-medium text-primary-900',
}
