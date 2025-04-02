'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'

import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string
  registerOptions?: Parameters<ReturnType<typeof useFormContext>['register']>[1]
}

const Input = ({
  className,
  type,
  name,
  registerOptions,
  ...props
}: InputProps) => {
  const { register } = useFormContext()
  return (
    <input
      type={type}
      className={cn(styles.input, className)}
      {...register(name, registerOptions)}
      {...props}
    />
  )
}

const styles = {
  input:
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-4 disabled:cursor-not-allowed disabled:opacity-50',
}

export { Input }
