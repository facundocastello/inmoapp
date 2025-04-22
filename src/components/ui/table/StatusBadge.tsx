import { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'failed'
}

export function StatusBadge({
  className,
  status,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-green-100 text-green-800': status === 'active',
          'bg-red-100 text-red-800': status === 'inactive',
          'bg-yellow-100 text-yellow-800': status === 'pending',
          'bg-blue-100 text-blue-800': status === 'completed',
          'bg-gray-100 text-gray-800': status === 'failed',
        },
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
