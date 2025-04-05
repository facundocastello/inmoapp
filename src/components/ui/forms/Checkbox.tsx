import { HTMLAttributes } from 'react'
import { useFormContext } from 'react-hook-form'

import { cn } from '@/lib/utils'

interface CheckboxProps extends HTMLAttributes<HTMLInputElement> {
  name: string
  label?: string
  error?: string
}

export const Checkbox = ({
  className,
  name,
  label,
  error,
  ...props
}: CheckboxProps) => {
  const { register } = useFormContext()

  return (
    <div className={styles.container}>
      <div className={styles.checkboxContainer}>
        <input
          id={name}
          type="checkbox"
          className={cn(
            styles.checkbox,
            error && styles.checkboxError,
            className,
          )}
          {...register(name)}
          {...props}
        />
        {label && (
          <label htmlFor={name} className={styles.label}>
            {label}
          </label>
        )}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}

const styles = {
  container: 'space-y-2',
  checkboxContainer: 'flex items-center',
  checkbox:
    'h-4 w-4 rounded border-primary-300 text-primary-900 focus:ring-primary-500',
  checkboxError: 'border-error-500 focus:ring-error-500',
  label: 'ml-2 block text-sm text-primary-900',
  error: 'text-sm text-error-500',
}
