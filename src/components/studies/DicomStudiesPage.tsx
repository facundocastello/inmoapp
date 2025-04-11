'use client'

import React, { useEffect, useState } from 'react'

import { DicomSearchFilter } from '@/components/dicom/DicomSearchFilter'
import { DicomStudiesTable } from '@/components/dicom/DicomStudiesTable'
import { PageContainer } from '@/components/ui/layout/PageContainer'
import { getDcm4cheeStudies } from '@/lib/actions/tenant/dcm4chee'
import { MappedStudy } from '@/lib/utils/dcm4chee/helper'
import { DicomFilter } from '@/lib/utils/dcm4chee/service'
import { StudyResponse } from '@/lib/utils/dcm4chee/types/study'

import { DicomUploader } from './DicomUploader'

interface DicomStudiesPageProps {
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

export default function DicomStudiesPage(props: DicomStudiesPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [studies, setStudies] = useState<MappedStudy[]>([])
  const [total, setTotal] = useState(0)

  // Determine current page and page size from URL
  const pageSize = Number(props.limit || 20)
  const offset = Number(props.offset || 0)
  const currentPage = Math.floor(offset / pageSize) + 1

  // Fetch studies based on search parameters
  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setIsLoading(true)
        const limit = Number(props.limit || 20)
        const offset = Number(props.offset || 0)
        const filters: DicomFilter = {
          includefield: 'all',
          ...props,
          PatientName: props.PatientName ? `*${props.PatientName}*` : '',
          fuzzymatching: props.fuzzymatching === 'true',
          orderdir: props.orderdir as 'asc' | 'desc' | undefined,
        }

        const response: StudyResponse = await getDcm4cheeStudies({
          limit,
          offset,
          filters,
        })

        setStudies(response.studies)
        setTotal(response.total)
      } catch (error) {
        console.error('Error fetching studies:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudies()
  }, [props])

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6">DICOM Studies</h1>

      <DicomSearchFilter {...props} />
      <div className="flex justify-end mt-6">
        <DicomUploader />
      </div>

      <div className="mt-6">
        <DicomStudiesTable
          studies={studies}
          isLoading={isLoading}
          total={total}
          page={currentPage}
          pageSize={pageSize}
        />
      </div>
    </PageContainer>
  )
}
