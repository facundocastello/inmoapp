'use client'

import { XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { uploadPdfToStudy } from '@/lib/actions/tenant/dcm4chee'
import { useToast } from '@/lib/hooks/useToast'

import { Button } from '../ui/Button'

interface PdfUploaderProps {
  studyInstanceUID: string
  onUploadComplete?: () => void
}

export function PdfUploader({
  studyInstanceUID,
  onUploadComplete,
}: PdfUploaderProps) {
  const { showToast } = useToast()
  const router = useRouter()
  const [showUploader, setShowUploader] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const processFile = useCallback(
    async (file: File) => {
      if (!file) return

      setIsUploading(true)
      setUploadProgress(0)

      try {
        await uploadPdfToStudy({
          pdfFile: file,
          studyInstanceUID,
        })
        setUploadProgress(100)
        showToast(`PDF file uploaded successfully`)
        onUploadComplete?.()
        router.refresh()
      } catch (error) {
        console.error('Upload error:', error)
        showToast('Failed to upload PDF file', 'error')
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [onUploadComplete, showToast, studyInstanceUID, router],
  )

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        await processFile(acceptedFiles[0])
      }
    },
    [processFile],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    // Only accept one file at a time
    maxFiles: 1,
  })

  if (!showUploader)
    return (
      <Button size="sm" onClick={() => setShowUploader(true)}>
        Append PDF to Study
      </Button>
    )

  return (
    <div className="w-full mx-auto bg-primary-200 p-4 rounded-lg">
      <div className="flex justify-end">
        <Button variant="text" onClick={() => setShowUploader(false)}>
          <XIcon className="w-4 h-4" />
        </Button>
      </div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Uploading PDF... ({uploadProgress}%)
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragActive
                ? 'Drop the PDF file here'
                : 'Drag and drop a PDF file here, or click to select file'}
            </p>
            <p className="text-sm text-gray-500">
              Only .pdf files are supported
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
