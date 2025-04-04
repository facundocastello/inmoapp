import { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The maximum width of the container
   * @default 'max-w-7xl'
   */
  maxWidth?: string
  /**
   * Whether to center the container horizontally
   * @default true
   */
  center?: boolean
}

/**
 * A container component that provides consistent padding and max-width for page content
 */
export const PageContainer = ({
  className,
  maxWidth = 'max-w-7xl',
  center = true,
  ...props
}: PageContainerProps) => {
  return (
    <div
      className={cn(styles.base, maxWidth, center && styles.center, className)}
      {...props}
    />
  )
}

const styles = {
  base: 'w-full px-4 sm:px-6 lg:px-8 py-5',
  center: 'mx-auto',
}
