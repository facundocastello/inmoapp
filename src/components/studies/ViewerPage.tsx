'use client'
import Image from 'next/image'
import React, { useState } from 'react'

import { getDcm4cheeStudyByUID } from '@/lib/actions/tenant/dcm4chee'

import { Button } from '../ui/Button'

const ViewerPage = ({
  studyUID,
  study,
  tenantSubdomain,
}: {
  studyUID: string
  study: Awaited<ReturnType<typeof getDcm4cheeStudyByUID>>
  tenantSubdomain: string
}) => {
  const [currentSeriesIndex, setCurrentSeriesIndex] = useState(0)
  const [currentInstanceIndex, setCurrentInstanceIndex] = useState(0)
  const [currentFrame, setCurrentFrame] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const currentSeries = study.series[currentSeriesIndex]
  const currentInstance = currentSeries.instances[currentInstanceIndex]
  const numberOfFrames = currentInstance?.numberOfFrames || 1

  const getResourceUrl = (
    seriesIndex: number,
    instanceIndex: number,
    frame: number,
  ) => {
    const series = study.series[seriesIndex]
    if (!series) return ''

    const instance = series.instances[instanceIndex]
    if (!instance) return ''

    const isPdf = instance.sopClassUid === '1.2.840.10008.5.1.4.1.1.104.1'
    return `${process.env.NEXT_PUBLIC_IMAGE_PROXY_URL}/${tenantSubdomain}/${studyUID}/${series.seriesInstanceUID}/${instance.sopInstanceUid}/${frame}/${isPdf ? 'pdf' : 'jpg'}`
  }

  const currentResourceUrl = getResourceUrl(
    currentSeriesIndex,
    currentInstanceIndex,
    currentFrame,
  )

  // Create a unique key for caching purposes
  const imageKey = `${tenantSubdomain}-${studyUID}-${currentSeries.seriesInstanceUID}-${currentInstance.sopInstanceUid}-${currentFrame}`

  const handleSeriesChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentSeriesIndex < study.series.length - 1) {
      setCurrentSeriesIndex(currentSeriesIndex + 1)
      setCurrentInstanceIndex(0) // Reset instance index when changing series
      setIsLoading(true)
    } else if (direction === 'prev' && currentSeriesIndex > 0) {
      setCurrentSeriesIndex(currentSeriesIndex - 1)
      setCurrentInstanceIndex(0) // Reset instance index when changing series
      setIsLoading(true)
    }
  }

  const handleInstanceChange = (direction: 'next' | 'prev') => {
    if (
      direction === 'next' &&
      currentInstanceIndex < currentSeries.instances.length - 1
    ) {
      setCurrentInstanceIndex(currentInstanceIndex + 1)
      setIsLoading(true)
    } else if (direction === 'prev' && currentInstanceIndex > 0) {
      setCurrentInstanceIndex(currentInstanceIndex - 1)
      setIsLoading(true)
    }
  }

  const handleFrameChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentFrame < numberOfFrames) {
      setCurrentFrame(currentFrame + 1)
      setIsLoading(true)
    } else if (direction === 'prev' && currentFrame > 1) {
      setCurrentFrame(currentFrame - 1)
      setIsLoading(true)
    }
  }

  const isPdf = currentInstance.sopClassUid === '1.2.840.10008.5.1.4.1.1.104.1'

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">DICOM Viewer</h1>

      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-semibold">Series</span>
          <div className="flex gap-2">
            <Button
              onClick={() => handleSeriesChange('prev')}
              disabled={currentSeriesIndex === 0}
            >
              Prev
            </Button>
            <span className="px-3 py-1">
              {currentSeriesIndex + 1} / {study.series.length}
            </span>
            <Button
              onClick={() => handleSeriesChange('next')}
              disabled={currentSeriesIndex === study.series.length - 1}
            >
              Next
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-semibold">Instance</span>
          <div className="flex gap-2">
            <Button
              onClick={() => handleInstanceChange('prev')}
              disabled={currentInstanceIndex === 0}
            >
              Prev
            </Button>
            <span className="px-3 py-1">
              {currentInstanceIndex + 1} / {currentSeries.instances.length}
            </span>
            <Button
              onClick={() => handleInstanceChange('next')}
              disabled={
                currentInstanceIndex === currentSeries.instances.length - 1
              }
            >
              Next
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-semibold">Frame</span>
          <div className="flex gap-2">
            <Button
              onClick={() => handleFrameChange('prev')}
              disabled={currentFrame === 1}
            >
              Prev
            </Button>
            <span className="px-3 py-1">
              {currentFrame} / {numberOfFrames}
            </span>
            <Button
              onClick={() => handleFrameChange('next')}
              disabled={currentFrame === numberOfFrames}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 relative">
        {isPdf ? (
          <iframe src={currentResourceUrl} width="100%" height="1000px" />
        ) : (
          <>
            {isLoading && (
              <div className="absolute top-4 right-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900 bg-primary-100"></div>
              </div>
            )}
            <Image
              key={imageKey}
              unoptimized
              src={currentResourceUrl}
              alt="DICOM Image"
              className="max-w-full"
              width={1000}
              height={800}
              style={{ width: '100%', height: 'auto' }}
              onLoad={() => setIsLoading(false)}
              priority
            />
          </>
        )}
      </div>
    </div>
  )
}

export default ViewerPage
