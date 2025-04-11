'use client'

import { XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { uploadDicomFile } from '@/lib/actions/tenant/dcm4chee'
import { useToast } from '@/lib/hooks/useToast'

import { Button } from '../ui/Button'

interface DicomUploaderProps {
  onUploadComplete?: () => void
}

export function DicomUploader({ onUploadComplete }: DicomUploaderProps) {
  const { showToast } = useToast()
  const router = useRouter()
  const [showUploader, setShowUploader] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState(0)

  const processFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return

      setIsUploading(true)
      setUploadProgress(0)
      setTotalFiles(files.length)
      setUploadedFiles(0)

      try {
        for (let i = 0; i < files.length; i++) {
          await uploadDicomFile({ file: files[i] })
          setUploadedFiles((prev) => prev + 1)
          setUploadProgress(Math.round(((i + 1) / files.length) * 100))
        }
        showToast(`${files.length} DICOM files uploaded successfully`)
        onUploadComplete?.()
        router.refresh()
      } catch (error) {
        console.error('Upload error:', error)
        showToast('Failed to upload DICOM files', 'error')
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
        setTotalFiles(0)
        setUploadedFiles(0)
      }
    },
    [onUploadComplete, showToast],
  )

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      await processFiles(acceptedFiles)
    },
    [processFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/dicom': ['.dcm'],
    },
    multiple: true,
    // Enable directory/folder upload support
    noDrag: false,
    noClick: false,
    noKeyboard: false,
    useFsAccessApi: false,
  })

  // Function to handle directory selection
  const handleSelectDirectory = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    // Use type assertion to handle the non-standard property
    ;(input as any).webkitdirectory = true

    input.onchange = async (e: Event) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      if (files.length === 0) return

      // Filter for DICOM files
      const dicomFiles = files.filter(
        (file) =>
          file.name.toLowerCase().endsWith('.dcm') ||
          file.type === 'application/dicom',
      )

      if (dicomFiles.length === 0) {
        showToast('No DICOM files found in the selected folder', 'error')
        return
      }

      await processFiles(dicomFiles)
    }

    input.click()
  }, [processFiles, showToast])
  if (!showUploader)
    return (
      <Button onClick={() => setShowUploader(true)}>Upload DICOM Files</Button>
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
              Uploading... {uploadedFiles} of {totalFiles} files (
              {uploadProgress}%)
            </p>
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
      <div className="mt-4 text-center font-bold">OR</div>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleSelectDirectory}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Upload Folder
        </button>
      </div>
    </div>
  )
}
