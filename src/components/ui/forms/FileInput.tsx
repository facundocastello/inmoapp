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
  defaultValue?: string | null | File | (string | File)[]
  disabled?: boolean
}

export const FileInput = ({
  className,
  disabled,
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
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      if (multiple) {
        setValue(name, files, { shouldValidate: true })
      } else {
        setValue(name, files[0], { shouldValidate: true })
      }
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
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      if (multiple) {
        setValue(name, files, { shouldValidate: true })
      } else {
        setValue(name, files[0], { shouldValidate: true })
      }
    }
  }

  const removeFile = (index: number) => {
    if (Array.isArray(value)) {
      const newFiles = [...value]
      newFiles.splice(index, 1)
      setValue(name, newFiles.length > 0 ? newFiles : null, {
        shouldValidate: true,
      })
    } else {
      setValue(name, null, { shouldValidate: true })
    }
  }

  const renderPreview = (file: File | string, index: number) => {
    return (
      <div key={index} className={styles.previewContainer}>
        {(file instanceof File && file.type === 'application/pdf') ||
        (typeof file === 'string' && file.includes('.pdf')) ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-primary-50 p-4">
            <svg
              className="w-16 h-16 text-primary-800"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-sm text-primary-800 mt-2 text-center break-all">
              {file instanceof File ? file.name : file.split('/').pop()}
            </span>
          </div>
        ) : file instanceof File ? (
          <img
            src={URL.createObjectURL(file)}
            alt={`Preview ${index + 1}`}
            className={styles.preview}
          />
        ) : (
          <Image
            fileKey={file as string}
            alt={`Preview ${index + 1}`}
            className={styles.preview}
          />
        )}
        {!disabled && (
          <button
            type="button"
            className={styles.removeButton}
            onClick={() => removeFile(index)}
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
        )}
      </div>
    )
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
          disabled && styles.dropzoneDisabled,
          className,
        )}
        onDragOver={!disabled ? handleDragOver : undefined}
        onDragLeave={!disabled ? handleDragLeave : undefined}
        onDrop={!disabled ? handleDrop : undefined}
      >
        <input
          id={name}
          type="file"
          accept={accept}
          multiple={multiple}
          className={cn(styles.input, disabled && styles.inputDisabled)}
          onChange={handleFileChange}
          disabled={disabled}
          {...props}
        />
        {(!value || (Array.isArray(value) && value.length === 0)) && (
          <div className={styles.placeholder}>
            <svg
              className={cn(
                styles.placeholderIcon,
                disabled && styles.placeholderIconDisabled,
              )}
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
            <p
              className={cn(
                styles.placeholderText,
                disabled && styles.placeholderTextDisabled,
              )}
            >
              {disabled
                ? 'File upload disabled'
                : multiple
                  ? 'Drag and drop your files here, or click to select'
                  : 'Drag and drop your file here, or click to select'}
            </p>
          </div>
        )}
        {value && (
          <div className={styles.previewGrid}>
            {Array.isArray(value)
              ? value.map((file, index) => renderPreview(file, index))
              : renderPreview(value, 0)}
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
    relative flex items-center justify-center w-full min-h-[16rem]
    border-2 border-dashed rounded-lg 
    border-primary-800 hover:bg-primary-50
    transition-colors duration-200 ease-in-out
    cursor-pointer
  `,
  dropzoneDragging: 'border-primary-500 bg-primary-50',
  dropzoneError: 'border-error-500',
  dropzoneDisabled:
    'border-neutral-300 bg-neutral-50 cursor-not-allowed hover:bg-neutral-50',
  input: 'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
  inputDisabled: 'cursor-not-allowed',
  placeholder: 'flex flex-col items-center justify-center space-y-2',
  placeholderIcon: 'w-10 h-12 text-primary-800',
  placeholderIconDisabled: 'text-neutral-400',
  placeholderText: 'text-sm text-primary-800 text-center',
  placeholderTextDisabled: 'text-neutral-400',
  previewGrid:
    'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 w-full',
  previewContainer: 'relative aspect-square',
  preview: 'w-full h-full object-cover rounded-lg',
  removeButton: `
    absolute top-2 right-2 p-1
    bg-primary-900/50 hover:bg-primary-900/75
    rounded-full text-white
    transition-colors duration-200 ease-in-out
  `,
  removeIcon: 'w-4 h-4',
  error: 'text-sm text-error-500',
}
