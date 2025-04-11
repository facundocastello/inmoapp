'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/forms/Input'

import { DicomAdvancedFilters, MODALITIES } from './DicomAdvancedFilters'

interface DicomSearchFormValues {
  patientName: string
  accessionNumber: string
  patientId: string
  studyDateFrom: Date | null
  studyDateTo: Date | null
  modalities: Record<string, boolean>
  sortBy: string
  sortOrder: 'asc' | 'desc'
  pageSize: string
  fuzzyMatching: boolean
}
interface DicomSearchFilterProps {
  limit: string
  offset: string
  PatientName: string
  PatientID: string
  AccessionNumber: string
  StudyDate: string
  Modality: string
  fuzzymatching: string
  orderby: string
  orderdir: string
}

export function DicomSearchFilter(props: DicomSearchFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)

  const { dateFrom, dateTo } = parseDate(props.StudyDate)
  const modalitiesList = props.Modality?.split(',') || []
  const form = useForm<DicomSearchFormValues>({
    defaultValues: {
      patientName: props.PatientName,
      accessionNumber: props.AccessionNumber,
      patientId: props.PatientID,
      studyDateFrom: dateFrom,
      studyDateTo: dateTo,
      modalities: MODALITIES.reduce(
        (acc, modality) => ({
          ...acc,
          [modality.value]: modalitiesList.includes(modality.value),
        }),
        {},
      ),
      sortBy: props.orderby || 'StudyDate',
      sortOrder: props.orderdir as 'asc' | 'desc',
      pageSize: props.limit || '20',
      fuzzyMatching: props.fuzzymatching === 'true',
    },
  })
  const { handleSubmit, watch, reset } = form

  // Get form values for use in the component
  const formValues = watch()

  // Apply filters and update URL
  const applyFilters = (data: DicomSearchFormValues) => {
    const params = new URLSearchParams()

    if (data.patientName) params.set('PatientName', data.patientName)
    if (data.accessionNumber)
      params.set('AccessionNumber', data.accessionNumber)
    if (data.patientId) params.set('PatientID', data.patientId)
    if (data.studyDateFrom || data.studyDateTo) {
      const formatDate = (date: Date | null) => {
        if (!date) return ''
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}${month}${day}`
      }

      const fromDate = formatDate(data.studyDateFrom)
      const toDate = formatDate(data.studyDateTo)
      params.set('StudyDate', `${fromDate}-${toDate}`)
    }

    // Add modality filter
    const selectedModalities = Object.entries(data.modalities)
      .filter(([_, selected]) => selected)
      .map(([modality]) => modality)

    if (selectedModalities.length > 0)
      params.set('Modality', selectedModalities.join(','))
    if (data.fuzzyMatching) params.set('fuzzymatching', 'true')

    params.set('orderby', data.sortBy)
    params.set('orderdir', data.sortOrder)
    params.set('limit', data.pageSize)
    params.set('offset', String((currentPage - 1) * Number(data.pageSize)))
    params.set('includefield', 'all')

    // Update URL with new parameters
    router.push(`?${params.toString()}`)
  }

  // Reset all filters
  const resetFilters = () => {
    reset({
      patientName: '',
      accessionNumber: '',
      patientId: '',
      studyDateFrom: null,
      studyDateTo: null,
      modalities: MODALITIES.reduce(
        (acc, modality) => ({ ...acc, [modality.value]: false }),
        {},
      ),
      sortBy: 'StudyDate',
      sortOrder: 'desc',
      pageSize: '20',
      fuzzyMatching: false,
    })
    setCurrentPage(1)

    // Reset URL parameters
    router.push('')
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    const params = new URLSearchParams(searchParams.toString())
    params.set('offset', String((newPage - 1) * Number(formValues.pageSize)))
    router.push(`?${params.toString()}`)
  }

  return (
    <FormProvider {...form}>
      <div className={styles.container}>
        <form onSubmit={handleSubmit(applyFilters)}>
          {/* Basic Search Bar */}
          <div className={styles.searchBar}>
            <div className={styles.searchInput}>
              <Input label="Patient Name" name="patientName" />
            </div>
            <div className={styles.buttonGroup}>
              <Button type="submit">Search</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
              >
                {isAdvancedFilterOpen ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {isAdvancedFilterOpen && (
            <DicomAdvancedFilters onResetFilters={resetFilters} />
          )}
        </form>

        {/* Pagination Component - To be shown when results are displayed */}
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            {/* This would be populated with actual data */}
            {/* Showing {startIndex} to {endIndex} of {totalItems} studies */}
          </div>
          <div className={styles.paginationControls}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className={styles.pageIndicator}>Page {currentPage}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              // disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  )
}

const styles = {
  container: 'w-full space-y-4 bg-primary-200 p-4 rounded-md shadow-sm',
  searchBar: 'flex flex-col items-end sm:flex-row gap-2',
  searchInput: 'flex-1',
  buttonGroup: 'flex gap-2',
  pagination: 'flex justify-between items-center pt-4 border-t',
  paginationInfo: 'text-sm text-gray-500',
  paginationControls: 'flex gap-1',
  pageIndicator: 'flex items-center px-3 text-sm',
}

const parseDate = (StudyDate: string) => {
  let dateFrom: Date | null = null
  let dateTo: Date | null = null
  if (StudyDate && StudyDate.includes('-')) {
    const [fromDate, toDate] = StudyDate.split('-')
    if (fromDate) {
      // Convert DICOM date format (YYYYMMDD) to Date object
      const year = parseInt(fromDate.substring(0, 4))
      const month = parseInt(fromDate.substring(4, 6)) - 1
      const day = parseInt(fromDate.substring(6, 8))
      dateFrom = new Date(year, month, day)
    }
    if (toDate) {
      const year = parseInt(toDate.substring(0, 4))
      const month = parseInt(toDate.substring(4, 6)) - 1
      const day = parseInt(toDate.substring(6, 8))
      dateTo = new Date(year, month, day)
    }
  }
  return { dateFrom, dateTo }
}
