'use client'

import { format } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

import { Button } from '@/components/ui/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/table/Table'
import { MappedStudy } from '@/lib/utils/dcm4chee/helper'

import { PdfUploader } from '../studies/PdfUploader'

interface DicomStudiesListProps {
  studies: MappedStudy[]
  isLoading?: boolean
  total: number
  page: number
  pageSize: number
}

export function DicomStudiesTable({
  studies,
  isLoading,
  total,
  page,
  pageSize,
}: DicomStudiesListProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (studies.length === 0) {
    return (
      <div className="w-full py-16 text-center">
        <h3 className="text-lg font-medium text-gray-900">No studies found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search filters to find what you're looking for.
        </p>
      </div>
    )
  }

  // Calculate pagination info
  const startIndex = (page - 1) * pageSize + 1
  const endIndex = Math.min(page * pageSize, total)

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Patient</TableHeaderCell>
            <TableHeaderCell>Study Date</TableHeaderCell>
            <TableHeaderCell>Modality</TableHeaderCell>
            <TableHeaderCell>Accession Number</TableHeaderCell>
            <TableHeaderCell>Instances</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>View</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {studies.map((study) => (
            <TableRow key={study.studyInstanceUID}>
              <TableCell>
                {study.patientID} - {study.patientName}
              </TableCell>
              <TableCell>{study.studyDate}</TableCell>
              <TableCell>{study.modalitiesInStudy.join(', ')}</TableCell>
              <TableCell>{study.accessionNumber}</TableCell>
              <TableCell>{study.numberOfStudyRelatedInstances}</TableCell>
              <TableCell>{formatDicomDate(study.studyDate)}</TableCell>
              <TableCell>
                <Link href={`/admin/studies/${study.studyInstanceUID}`}>
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(`/admin/studies/${study.studyInstanceUID}`)
                    }
                  >
                    View
                  </Button>
                </Link>
                <PdfUploader
                  studyInstanceUID={study.studyInstanceUID}
                  onUploadComplete={() => {
                    router.refresh()
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>
          Showing {startIndex} to {endIndex} of {total} studies
        </div>
      </div>
    </div>
  )
}

// Helper function to format DICOM date (YYYYMMDD) to human-readable format
function formatDicomDate(dicomDate: string): string {
  if (!dicomDate || dicomDate.length !== 8) return dicomDate

  try {
    const year = parseInt(dicomDate.substring(0, 4))
    const month = parseInt(dicomDate.substring(4, 6)) - 1
    const day = parseInt(dicomDate.substring(6, 8))

    const date = new Date(year, month, day)
    return format(date, 'MMM d, yyyy')
  } catch (error) {
    return dicomDate
  }
}
