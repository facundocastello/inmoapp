'use client'

import { HTMLAttributes } from 'react'
import { RegisterOptions, useFormContext } from 'react-hook-form'

import { cn } from '@/lib/utils'

interface InputProps extends HTMLAttributes<HTMLInputElement> {
  className?: string
  containerClassName?: string
  registerOptions?: RegisterOptions
  shouldRegister?: boolean
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'number'
  error?: string
  helperText?: string
  disabled?: boolean
  defaultValue?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const Input = ({
  containerClassName,
  className,
  registerOptions,
  shouldRegister = true,
  name,
  helperText,
  label,
  type = 'text',
  error,
  disabled,
  defaultValue,
  ...props
}: InputProps) => {
  const { register } = shouldRegister ? useFormContext() : { register: () => {} }

  return (
    <div className={cn(styles.container, containerClassName)}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        className={cn(styles.input, error && styles.error, className)}
        {...(shouldRegister &&
          register(name, {
            ...registerOptions,
            //@ts-ignore
            valueAsNumber: type === 'number',
          }))}
        {...props}
        disabled={disabled}
        defaultValue={defaultValue}
      />
      {error && <p className={styles.errorMessage}>{error}</p>}
      {helperText && <p className={styles.helperText}>{helperText}</p>}
    </div>
  )
}

const styles = {
  container: 'space-y-2',
  label: 'block text-sm font-medium text-primary-900',
  input: `
    block w-full rounded-md border border-primary-300
    bg-primary-100 px-3 py-2 text-primary-900
    focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500
    disabled:cursor-not-allowed disabled:opacity-50
  `,
  error: 'border-error-500 focus:border-error-500 focus:ring-error-500',
  errorMessage: 'text-sm text-error-500',
  helperText: 'text-[11px] text-primary-700',
}
