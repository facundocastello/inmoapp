'use client'

import { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to show the wave animation
   * @default true
   */
  wave?: boolean
}

export const Skeleton = ({
  className,
  wave = true,
  ...props
}: SkeletonProps) => {
  return (
    <div
      className={cn(styles.containerWave, wave && styles.wave, className)}
      {...props}
    >
      {wave && <div className={styles.shine} />}
    </div>
  )
}

const styles = {
  containerWave:
    'w-full h-full relative overflow-hidden rounded-lg bg-gradient-to-r from-primary-50 via-primary-100 to-primary-50 bg-[length:400%_100%]',
  wave: 'animate-skeleton-wave',
  shine:
    'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-skeleton-shine',
}
