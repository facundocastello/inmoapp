import Link from 'next/link'

import { PlansSection } from '@/components/plans/PlansSection'

export default async function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>Multi-Tenant Platform</h1>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.content}>
          <h2 className={styles.heading}>
            Welcome to Our Multi-Tenant Platform
          </h2>
          <p className={styles.description}>
            Create your own tenant and get started with our powerful platform.
          </p>
          <div className={styles.actions}>
            <Link href="/signup" className={styles.primaryLink}>
              Get Started
            </Link>
            <Link href="/admin" className={styles.secondaryLink}>
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <PlansSection />
      </main>
    </div>
  )
}

const styles = {
  page: 'min-h-screen bg-primary-100',
  header: 'border-b border-primary-300',
  headerContainer: 'container mx-auto px-4 py-4',
  title: 'text-2xl font-bold text-primary-800',
  main: 'container mx-auto px-4 py-16',
  content: 'mx-auto max-w-3xl text-center',
  heading: 'text-4xl font-bold tracking-tight text-primary-800',
  description: 'mt-6 text-lg text-primary-700',
  actions: 'mt-10 flex items-center justify-center gap-x-6',
  primaryLink:
    'rounded-md bg-primary-400 px-4 py-2 text-primary-800 hover:bg-primary-500 transition-colors',
  secondaryLink:
    'text-sm font-semibold leading-6 text-primary-700 hover:text-primary-800 transition-colors',
}
