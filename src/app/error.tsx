'use client'

import Link from 'next/link'
import { useEffect } from 'react'

import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>⚠️</div>
        <h2 className={styles.title}>Oops! Something went wrong</h2>
        <p className={styles.message}>
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className={styles.actions}>
          <Button onClick={() => reset()} className={styles.button}>
            Try again
          </Button>
          <Link href="/" className={styles.secondaryButton}>
            Go to homepage
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
    'w-full rounded-lg bg-primary-500 px-4 py-3 text-white font-medium hover:bg-primary-600 transition-colors',
  secondaryButton:
    'w-full rounded-lg bg-primary-100 px-4 py-3 text-primary-700 font-medium hover:bg-primary-200 transition-colors text-center',
}
