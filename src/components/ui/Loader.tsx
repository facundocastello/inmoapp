'use client'

import { cn } from '@/lib/utils'

interface LoaderProps {
  className?: string
}

export function Loader({ className }: LoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-100/80 backdrop-blur-sm">
      <div className={cn('relative h-16 w-16', className)}>
        <div className="absolute h-full w-full animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    </div>
  )
}
