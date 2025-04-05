'use client'

import { HTMLAttributes, useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { Image } from '@/components/ui/Image'
import { cn } from '@/lib/utils'

interface FileInputProps
  extends Omit<HTMLAttributes<HTMLInputElement>, 'defaultValue'> {
  name: string
  label?: string
  error?: string
  accept?: string
  multiple?: boolean
  defaultValue?: string | null
}

export const FileInput = ({
  className,
  name,
  label,
  error,
  accept,
  multiple = false,
  defaultValue,
  ...props
}: FileInputProps) => {
  const { setValue, watch } = useFormContext()
  const [isDragging, setIsDragging] = useState(false)
  const value = watch(name)

  useEffect(() => {
    if (defaultValue) {
      setValue(name, defaultValue)
    }
  }, [defaultValue, name, setValue])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue(name, file, { shouldValidate: true })
    } else {
      setValue(name, null, { shouldValidate: true })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setValue(name, file, { shouldValidate: true })
    }
  }

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      )}
      <div
        className={cn(
          styles.dropzone,
          isDragging && styles.dropzoneDragging,
          error && styles.dropzoneError,
          className,
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id={name}
          type="file"
          accept={accept}
          multiple={multiple}
          className={styles.input}
          onChange={handleFileChange}
          {...props}
        />
        {!value && (
          <div className={styles.placeholder}>
            <svg
              className={styles.placeholderIcon}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5.44 5.44 0 0115.9 3H16a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className={styles.placeholderText}>
              Drag and drop your file here, or click to select
            </p>
          </div>
        )}
        {value && (
          <div className={styles.previewContainer}>
            {value instanceof File ? (
              <img
                src={URL.createObjectURL(value)}
                alt="Preview"
                className={styles.preview}
              />
            ) : (
              <Image
                fileKey={value as string}
                alt="Preview"
                className={styles.preview}
              />
            )}
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => {
                setValue(name, null, { shouldValidate: true })
              }}
            >
              <svg
                className={styles.removeIcon}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}

const styles = {
  container: 'space-y-2',
  label: 'block text-sm font-medium text-primary-900',
  dropzone: `
    relative flex items-center justify-center w-full h-64
    border-2 border-dashed rounded-lg 
    border-primary-800 hover:bg-primary-50
    transition-colors duration-200 ease-in-out
    cursor-pointer
  `,
  dropzoneDragging: 'border-primary-500 bg-primary-50',
  dropzoneError: 'border-error-500',
  input: 'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
  placeholder: 'flex flex-col items-center justify-center space-y-2',
  placeholderIcon: 'w-10 h-12 text-primary-800',
  placeholderText: 'text-sm text-primary-800 text-center',
  previewContainer: 'relative w-full h-full',
  preview: 'w-full h-full object-contain rounded-lg',
  removeButton: `
    absolute top-2 right-2 p-1
    bg-primary-900/50 hover:bg-primary-900/75
    rounded-full text-white
    transition-colors duration-200 ease-in-out
  `,
  removeIcon: 'w-4 h-4',
  error: 'text-sm text-error-500',
}
