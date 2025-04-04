'use client'

import { HTMLAttributes, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { cn } from '@/lib/utils'

interface FileInputProps extends HTMLAttributes<HTMLInputElement> {
  name: string
  label?: string
  error?: string
  accept?: string
  multiple?: boolean
}

export const FileInput = ({
  className,
  name,
  label,
  error,
  accept,
  multiple = false,
  ...props
}: FileInputProps) => {
  const { register } = useFormContext()
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={name}
        type="file"
        accept={accept}
        multiple={multiple}
        className={cn(styles.input, error && styles.inputError, className)}
        {...register(name, {
          onChange: handleFileChange,
        })}
        {...props}
      />
      {preview && !multiple && (
        <img src={preview} alt="Preview" className={styles.preview} />
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}

const styles = {
  container: 'space-y-2',
  label: 'block text-sm font-medium text-primary-100',
  input:
    'block w-full text-sm text-primary-500 file:mr-4 file:rounded-md file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-100 hover:file:bg-primary-100',
  inputError: 'border-error-500 focus:ring-error-500',
  preview: 'mt-2 h-32 w-32 rounded-md object-cover',
  error: 'text-sm text-error-500',
}
