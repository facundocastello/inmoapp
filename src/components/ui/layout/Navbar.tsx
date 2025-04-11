'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Tenants', href: '/super-admin/tenants' },
  { name: 'Users', href: '/super-admin/users' },
  { name: 'Plans', href: '/super-admin/plans' },
  { name: 'Subscriptions', href: '/super-admin/subscriptions/manual' },
  { name: 'Droplets', href: '/super-admin/droplets' },
  { name: 'Settings', href: '/super-admin/settings' },
]

export const Navbar = () => {
  const pathname = usePathname()

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/admin" className={styles.logoLink}>
            Multi-Tenant Platform
          </Link>
        </div>
        <div className={styles.navigation}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                styles.link,
                pathname === item.href && styles.activeLink,
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

const styles = {
  navbar: 'border-b bg-primary-200',
  container: 'container mx-auto flex h-16 items-center justify-between px-4',
  logo: 'flex items-center',
  logoLink: 'text-lg font-semibold text-primary-900',
  navigation: 'flex items-center space-x-4',
  link: 'text-sm font-medium text-primary-900 hover:text-primary-900',
  activeLink: 'text-primary-900',
  userMenu: 'flex items-center',
}
