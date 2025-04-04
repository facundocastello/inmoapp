'use client'

import { Breadcrumb } from './Breadcrumb'
import { Navbar } from './Navbar'
import { PageContainer } from './PageContainer'

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className={styles.layout}>
      <Navbar />
      <PageContainer>
        <div className={styles.breadcrumb}>
          <Breadcrumb />
        </div>
        <main className={styles.main}>{children}</main>
      </PageContainer>
    </div>
  )
}

const styles = {
  layout: 'min-h-screen bg-primary-100',
  breadcrumb: 'mb-6',
  main: 'space-y-6',
}
