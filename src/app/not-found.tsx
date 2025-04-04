import Link from 'next/link'

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>🔍</div>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.message}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.button}>
            Go back home
          </Link>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: 'flex min-h-[400px] items-center justify-center p-4',
  content:
    'w-full max-w-md rounded-xl bg-primary-100 p-8 shadow-xl border border-primary-100',
  icon: 'text-4xl mb-4 text-center',
  title: 'text-2xl font-bold text-primary-900 text-center mb-2',
  message: 'text-primary-900 text-center mb-6',
  actions: 'flex flex-col gap-3',
  button:
    'w-full rounded-lg bg-primary-500 px-4 py-3 text-white font-medium hover:bg-primary-600 transition-colors text-center',
}
