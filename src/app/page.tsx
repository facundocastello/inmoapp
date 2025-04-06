import Link from 'next/link'

export default function LandingPage() {
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
      </main>
    </div>
  )
}

const styles = {
  page: 'min-h-screen bg-background',
  header: 'border-b',
  headerContainer: 'container mx-auto px-4 py-4',
  title: 'text-2xl font-bold',
  main: 'container mx-auto px-4 py-16',
  content: 'mx-auto max-w-3xl text-center',
  heading: 'text-4xl font-bold tracking-tight',
  description: 'mt-6 text-lg text-muted-foreground',
  actions: 'mt-10 flex items-center justify-center gap-x-6',
  primaryLink:
    'rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90',
  secondaryLink: 'text-sm font-semibold leading-6 text-foreground',
}
