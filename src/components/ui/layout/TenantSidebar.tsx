'use client'

import { LogOut, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { name: 'Users', href: '/admin/users', icon: 'Users' },
  { name: 'Content', href: '/admin/content', icon: 'FileText' },
  { name: 'Settings', href: '/admin/settings', icon: 'Settings' },
]

export const TenantSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className={cn(styles.mobileMenuButton, 'md:hidden')}
      >
        <Menu size={24} />
      </button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          styles.sidebar,
          isCollapsed && styles.collapsed,
          isMobileMenuOpen && styles.mobileOpen,
        )}
      >
        <div className={styles.header}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={styles.toggleButton}
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
          {!isCollapsed && (
            <Link href="/admin" className={styles.logo}>
              Admin
            </Link>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(styles.mobileCloseButton, 'md:hidden')}
          >
            <X size={20} />
          </button>
        </div>

        <nav className={styles.navigation}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                styles.link,
                pathname === item.href && styles.activeLink,
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className={styles.icon}>
                {item.icon === 'LayoutDashboard' && <Menu size={20} />}
                {item.icon === 'Users' && <Menu size={20} />}
                {item.icon === 'FileText' && <Menu size={20} />}
                {item.icon === 'Settings' && <Menu size={20} />}
              </span>
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false)
              signOut()
            }}
            className={cn(styles.link, 'mt-auto')}
          >
            <span className={styles.icon}>
              <LogOut size={20} />
            </span>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </nav>
      </aside>
    </>
  )
}

const styles = {
  mobileMenuButton: `
    fixed top-4 left-4 z-50 p-2 rounded-md
    bg-primary-200 text-primary-900 hover:bg-primary-300
    transition-colors duration-200
    md:hidden
  `,
  sidebar: `
    h-screen min-w-48
    bg-primary-200 border-r border-primary-300
    transition-all duration-300 ease-in-out
    md:relative md:translate-x-0
    fixed left-0 top-0 z-40 -translate-x-full
    will-change-transform
  `,
  mobileOpen: 'translate-x-0',
  collapsed: 'w-16',
  header:
    'flex items-center justify-between h-16 px-4 border-b border-primary-300',
  toggleButton:
    'text-primary-900 p-2 rounded-md hover:bg-primary-300 transition-colors duration-200',
  mobileCloseButton:
    'text-primary-900 p-2 rounded-md hover:bg-primary-300 transition-colors duration-200',
  logo: 'text-lg font-semibold text-primary-900 transition-opacity duration-200',
  navigation: 'flex flex-col space-y-1 p-2',
  link: `
    flex items-center space-x-3 px-3 py-2 rounded-md text-sm
    text-primary-900 hover:bg-primary-300
    transition-all duration-200
  `,
  activeLink: 'bg-primary-300',
  icon: 'flex-shrink-0',
}
