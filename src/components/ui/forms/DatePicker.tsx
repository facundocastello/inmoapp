'use client'

import { useFormContext } from 'react-hook-form'

import { cn } from '@/lib/utils'

interface DatePickerProps {
  name: string
  label: string
  error?: string
  helperText?: string
  maxYear?: number
  minYear?: number
}

export const DatePicker = ({
  name,
  label,
  error,
  helperText,
  maxYear = new Date().getFullYear(),
  minYear = new Date().getFullYear() - 100,
}: DatePickerProps) => {
  const { register } = useFormContext()

  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-primary-900"
      >
        {label}
      </label>

      <input
        type="date"
        id={name}
        className={cn(
          'w-full rounded-md border border-primary-300 bg-primary-100 px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          error && 'border-error-500 focus:ring-error-500',
        )}
        {...register(name, { valueAsDate: true })}
        max={`${maxYear}-12-31`}
        min={`${minYear}-01-01`}
      />

      {error && <p className="text-sm text-error-500">{error}</p>}
      {helperText && (
        <p className="text-[11px] text-primary-700">{helperText}</p>
      )}
    </div>
  )
}
