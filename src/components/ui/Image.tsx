'use client'

import { useEffect, useState } from 'react'

import { cachedGetSignedFileUrl } from '@/lib/actions/file'
import { cn } from '@/lib/utils'

import { Skeleton } from './Skeleton'

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fileKey?: string
}

export const Image = ({ fileKey, className, ...props }: ImageProps) => {
  const [src, setSrc] = useState<string>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (fileKey) {
      cachedGetSignedFileUrl(fileKey)
        .then(setSrc)
        .finally(() => setIsLoading(true))
    }
  }, [fileKey])

  if (!fileKey) return null
  return (
    <>
      {isLoading && <Skeleton className={className} />}
      {src && (
        <img
          src={src}
          onLoad={() => setIsLoading(false)}
          className={cn(className, isLoading && 'hidden')}
          {...props}
        />
      )}
    </>
  )
}
