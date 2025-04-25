'use client'

import {
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileCog,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { name: 'Users', href: '/admin/users', icon: 'Users' },
  { name: 'Pages', href: '/admin/pages', icon: 'FileText' },
  { name: 'Billing', href: '/admin/billing', icon: 'CreditCard' },
  {
    name: 'Contracts',
    icon: 'FileSpreadsheet',
    children: [
      {
        name: 'Contract List',
        href: '/admin/contract',
        icon: 'FileSpreadsheet',
      },
      {
        name: 'Contract Templates',
        href: '/admin/contract/templates',
        icon: 'FileText',
      },
      {
        name: 'Contract Settings',
        href: '/admin/contract/settings',
        icon: 'FileCog',
      },
    ],
  },
  { name: 'Settings', href: '/admin/settings', icon: 'Settings' },
]

export const TenantSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {},
  )
  const pathname = usePathname()

  const toggleMenu = (menuName: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }))
  }

  const renderMenuItem = (item: any) => {
    const isActive = pathname === item.href
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedMenus[item.name]

    return (
      <div key={item.name} className={isExpanded ? styles.expanded : ''}>
        <div
          className={cn(
            styles.link,
            isActive && styles.activeLink,
            hasChildren && 'cursor-pointer',
          )}
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.name)
            } else {
              setIsMobileMenuOpen(false)
            }
          }}
        >
          <span className={styles.icon}>
            {item.icon === 'LayoutDashboard' && <LayoutDashboard size={20} />}
            {item.icon === 'Users' && <Users size={20} />}
            {item.icon === 'FileText' && <FileText size={20} />}
            {item.icon === 'CreditCard' && <CreditCard size={20} />}
            {item.icon === 'Settings' && <Settings size={20} />}
            {item.icon === 'FileSpreadsheet' && <FileSpreadsheet size={20} />}
            {item.icon === 'FileCog' && <FileCog size={20} />}
          </span>
          {!isCollapsed && (
            <>
              <span>{item.name}</span>
              {hasChildren && (
                <span className="ml-auto">
                  {isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </span>
              )}
            </>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="my-2">
            {item.children.map((child: any) => (
              <Link
                key={child.name}
                href={child.href}
                className={cn(
                  styles.link,
                  pathname === child.href && styles.activeLink,
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className={styles.icon}>
                  {child.icon === 'FileText' && <FileText size={20} />}
                  {child.icon === 'FileCog' && <FileCog size={20} />}
                  {child.icon === 'FileSpreadsheet' && (
                    <FileSpreadsheet size={20} />
                  )}
                </span>
                {!isCollapsed && <span>{child.name}</span>}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

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
          className={styles.mobileOverlay}
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
          {navigation.map(renderMenuItem)}
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
  mobileOverlay: 'fixed inset-0 z-30 bg-black/50 md:hidden',
  sidebar: `
    h-screen min-w-48
    bg-primary-200 border-r border-primary-300
    transition-all duration-300 ease-in-out
    md:sticky md:translate-x-0
    fixed left-0 top-0 z-100 -translate-x-full
    will-change-transform
  `,
  mobileOpen: 'translate-x-0',
  collapsed: 'w-16 min-w-16',
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
  expanded: 'border border-t-0 rounded-md',
  icon: 'flex-shrink-0',
}
