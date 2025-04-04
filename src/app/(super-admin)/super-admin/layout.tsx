'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import colors from '@/theme/colors'

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: colors.background[100],
  },
  sidebar: {
    width: '250px',
    backgroundColor: colors.primary[100],
    color: colors.primary[800],
    padding: '1rem',
    transition: 'all 0.3s ease',
  },
  sidebarHidden: {
    width: '0',
    padding: '0',
  },
  main: {
    flex: 1,
    padding: '1rem',
  },
  menuButton: {
    position: 'fixed' as const,
    top: '1rem',
    left: '1rem',
    zIndex: 100,
    backgroundColor: colors.primary[100],
    padding: '0.5rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  navLink: {
    padding: '0.75rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    color: colors.primary[800],
    transition: 'all 0.2s ease',
  },
  navLinkActive: {
    backgroundColor: colors.primary[200],
    color: colors.primary[900],
  },
  navLinkHover: {
    backgroundColor: colors.primary[200],
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div style={styles.layout}>
      <button
        style={styles.menuButton}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        style={{
          ...styles.sidebar,
          ...(isSidebarOpen ? {} : styles.sidebarHidden),
        }}
      >
        <nav style={styles.nav}>
          <Link
            href="/super-admin/tenants"
            style={{
              ...styles.navLink,
              ...(pathname === '/super-admin/tenants' && styles.navLinkActive),
            }}
          >
            Tenants
          </Link>
          <Link
            href="/super-admin/users"
            style={{
              ...styles.navLink,
              ...(pathname === '/super-admin/users' && styles.navLinkActive),
            }}
          >
            Users
          </Link>
        </nav>
      </aside>

      <main style={styles.main}>{children}</main>
    </div>
  )
}
