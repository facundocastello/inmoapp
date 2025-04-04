'use client'

import { useFormContext } from 'react-hook-form'

import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  name: string
  label: string
  options: SelectOption[]
  error?: string
}

export const Select = ({ name, label, options, error }: SelectProps) => {
  const { register } = useFormContext()

  return (
    <div className={styles.container}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <select
        id={name}
        className={cn(styles.select, error && styles.error)}
        {...register(name)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  )
}

const styles = {
  container: 'space-y-2',
  label: 'block text-sm font-medium text-primary-900',
  select: `
    block w-full rounded-md border border-primary-300
    bg-primary-100 px-3 py-2 text-primary-900
    focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500
    disabled:cursor-not-allowed disabled:opacity-50
  `,
  error: 'border-error-500 focus:border-error-500 focus:ring-error-500',
  errorMessage: 'text-sm text-error-500',
}
