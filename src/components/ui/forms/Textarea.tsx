import { HTMLAttributes } from 'react'
import { useFormContext } from 'react-hook-form'

import { cn } from '@/lib/utils'

interface TextareaProps extends HTMLAttributes<HTMLTextAreaElement> {
  name: string
  label?: string
  error?: string
  rows?: number
}

export const Textarea = ({
  className,
  name,
  label,
  error,
  rows = 3,
  ...props
}: TextareaProps) => {
  const { register } = useFormContext()

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        id={name}
        rows={rows}
        className={cn(
          styles.textarea,
          error && styles.textareaError,
          className,
        )}
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
  textarea:
    'w-full rounded-md border border-primary-200 bg-primary-100 px-3 py-2 text-sm placeholder:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
  textareaError: 'border-error-500 focus:ring-error-500',
  error: 'text-sm text-error-500',
}
