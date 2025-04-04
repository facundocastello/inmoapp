'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'outline',
      size = 'default',
      isLoading,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        className={cn(
          styles.base,
          styles.variants[variant],
          styles.sizes[size],
          className,
        )}
        ref={ref}
        {...props}
      >
        {isLoading ? 'Loading...' : children}
      </button>
    )
  },
)

Button.displayName = 'Button'

export { Button }

const styles = {
  base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-900',
  variants: {
    default: 'bg-primary-600 text-primary-900 hover:bg-primary-600/90',
    outline:
      'border border-primary-200 bg-primary-600 hover:bg-primary-600/90 hover:text-primary-900',
    ghost:
      'text-primary-900 bg-primary-200 hover:bg-primary-500 hover:text-primary-800',
  },
  sizes: {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
  },
}
