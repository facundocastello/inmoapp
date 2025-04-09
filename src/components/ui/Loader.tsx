'use client'

import { cn } from '@/lib/utils'

interface LoaderProps {
  className?: string
}

export function Loader({ className }: LoaderProps) {
  return (
    <div className={styles.overlay}>
      <div className={cn(styles.loader, className)}>
        <div className={styles.spinner} />
      </div>
    </div>
  )
}

const styles = {
  overlay:
    'fixed inset-0 z-50 flex items-center justify-center bg-primary-100/80 backdrop-blur-sm',
  loader: 'relative h-16 w-16',
  spinner:
    'absolute h-full w-full animate-spin rounded-full border-4 border-primary-200 border-t-primary-600',
}
