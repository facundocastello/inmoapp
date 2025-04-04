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
            <span className={styles.icon}>🏠</span>
            <span>Home</span>
          </Link>
          <span className={styles.separator}>/</span>
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
                <>
                  <Link href={href} className={styles.link}>
                    {label}
                  </Link>
                  <span className={styles.separator}>/</span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

const styles = {
  breadcrumb: 'flex py-4',
  list: 'flex items-center space-x-2 text-sm',
  item: 'flex items-center',
  link: `
    flex items-center space-x-1
    text-primary-600 hover:text-primary-900
    transition-colors duration-200
  `,
  current: 'text-primary-900 font-medium',
  separator: 'mx-2 text-primary-400',
  icon: 'text-base',
}
