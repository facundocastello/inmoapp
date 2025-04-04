import { HTMLAttributes } from 'react'
import { useFormContext } from 'react-hook-form'

import { cn } from '@/lib/utils'

interface InputProps extends HTMLAttributes<HTMLInputElement> {
  name: string
  label?: string
  error?: string
}

export const Input = ({
  className,
  name,
  label,
  error,
  ...props
}: InputProps) => {
  const { register } = useFormContext()

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={name}
        className={cn(styles.input, error && styles.inputError, className)}
        {...register(name)}
        {...props}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}

const styles = {
  container: 'space-y-2',
  label: 'block text-sm font-medium text-primary-100',
  input:
    'w-full rounded-md border border-primary-200 bg-primary-100 px-3 py-2 text-sm placeholder:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
  inputError: 'border-error-500 focus:ring-error-500',
  error: 'text-sm text-error-500',
}
