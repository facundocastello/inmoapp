'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { DicomUploader } from '@/components/studies/DicomUploader'
import { getDcm4cheeStudies } from '@/lib/actions/tenant/dcm4chee'
import { StudyResponse } from '@/lib/utils/dcm4chee/types/study'

export default function StudiesPage() {
  const [studies, setStudies] = useState<StudyResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const fetchStudies = async () => {
      try {
        const data = await getDcm4cheeStudies({ limit: 10, offset: 0 })
        setStudies(data)
      } catch (error) {
        console.error('Error fetching studies:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudies()
  }, [])

  const handleUploadComplete = () => {
    // Refresh studies list after upload
    const fetchStudies = async () => {
      try {
        const data = await getDcm4cheeStudies({ limit: 10, offset: 0 })
        setStudies(data)
      } catch (error) {
        console.error('Error fetching studies:', error)
      }
    }

    fetchStudies()
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>DICOM Studies</h1>
      <div className={styles.uploader}>
        <DicomUploader onUploadComplete={handleUploadComplete} />
      </div>

      {isLoading ? (
        <p>Loading studies...</p>
      ) : studies?.studies.length === 0 ? (
        <p>No studies found</p>
      ) : (
        <div className={styles.studyGrid}>
          {studies?.studies.map((study) => (
            <Link
              key={study.studyInstanceUID}
              href={`/admin/studies/${study.studyInstanceUID}`}
              className={styles.studyCard}
            >
              <h2 className={styles.studyCardTitle}>{study.patientName}</h2>
              <p className={styles.studyCardText}>
                Study Date: {study.studyDate}
              </p>
              <p className={styles.studyCardText}>
                Modality: {study.modalitiesInStudy?.join(', ')}
              </p>
              {study.studyDescription && (
                <p className={styles.studyCardText}>
                  Description: {study.studyDescription}
                </p>
              )}
              {study.numberOfStudyRelatedInstances && (
                <p className={styles.studyCardText}>
                  Instances: {study.numberOfStudyRelatedInstances}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: 'container mx-auto py-8',
  title: 'text-2xl font-bold mb-8',
  uploader: 'mb-8',
  studyGrid: 'grid gap-4',
  studyCard: 'border rounded-lg p-4 hover:bg-primary-200',
  studyCardTitle: 'font-medium',
  studyCardText: 'text-sm text-gray-500',
}
