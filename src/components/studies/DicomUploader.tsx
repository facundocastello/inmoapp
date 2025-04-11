'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { uploadDicomFile } from '@/lib/actions/tenant/dcm4chee'
import { useToast } from '@/lib/hooks/useToast'

interface DicomUploaderProps {
  aetitle: string
  onUploadComplete?: () => void
}

export function DicomUploader({
  aetitle,
  onUploadComplete,
}: DicomUploaderProps) {
  const { showToast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      setIsUploading(true)
      setUploadProgress(0)

      try {
        for (const file of acceptedFiles) {
          await uploadDicomFile({ file, aetitle })
        }
        showToast('DICOM files uploaded successfully')
        onUploadComplete?.()
      } catch (error) {
        console.error('Upload error:', error)
        showToast('Failed to upload DICOM files', 'error')
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [aetitle, onUploadComplete],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/dicom': ['.dcm'],
    },
    multiple: true,
  })

  return (
    <div className="w-full max-w-2xl mx-auto">
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
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragActive
                ? 'Drop the DICOM files here'
                : 'Drag and drop DICOM files here, or click to select files'}
            </p>
            <p className="text-sm text-gray-500">
              Only .dcm files are supported
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
