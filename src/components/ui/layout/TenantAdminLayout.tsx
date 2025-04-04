'use client'

import { Breadcrumb } from './Breadcrumb'
import { PageContainer } from './PageContainer'
import { TenantSidebar } from './TenantSidebar'

interface TenantAdminLayoutProps {
  children: React.ReactNode
}

export const TenantAdminLayout = ({ children }: TenantAdminLayoutProps) => {
  return (
    <div className={styles.layout}>
      <TenantSidebar />
      <div className={styles.content}>
        <PageContainer>
          <div className={styles.breadcrumb}>
            <Breadcrumb />
          </div>
          <main className={styles.main}>{children}</main>
        </PageContainer>
      </div>
    </div>
  )
}

const styles = {
  layout: `
    min-h-screen bg-primary-100
    grid grid-cols-[auto_1fr]
    transition-all duration-300
  `,
  content: 'min-w-0', // prevents content from overflowing
  breadcrumb: 'mb-6',
  main: 'space-y-6',
}
