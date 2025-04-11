'use client'
import React, { useState } from 'react'

import { getDcm4cheeStudyByUID } from '@/lib/actions/tenant/dcm4chee'

import { Button } from '../ui/Button'

const ViewerPage = ({
  studyUID,
  study,
  aetitle,
  ipAddress,
}: {
  studyUID: string
  study: Awaited<ReturnType<typeof getDcm4cheeStudyByUID>>
  aetitle: string
  ipAddress: string
}) => {
  const [currentSeriesIndex, setCurrentSeriesIndex] = useState(0)
  const [currentInstanceIndex, setCurrentInstanceIndex] = useState(0)
  const [currentFrame, setCurrentFrame] = useState(1)

  const currentSeries = study.series[currentSeriesIndex]
  const currentInstance = currentSeries.instances[currentInstanceIndex]
  const numberOfFrames = currentInstance?.numberOfFrames || 1

  const handleSeriesChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentSeriesIndex < study.series.length - 1) {
      setCurrentSeriesIndex(currentSeriesIndex + 1)
      setCurrentInstanceIndex(0) // Reset instance index when changing series
    } else if (direction === 'prev' && currentSeriesIndex > 0) {
      setCurrentSeriesIndex(currentSeriesIndex - 1)
      setCurrentInstanceIndex(0) // Reset instance index when changing series
    }
  }

  const handleInstanceChange = (direction: 'next' | 'prev') => {
    if (
      direction === 'next' &&
      currentInstanceIndex < currentSeries.instances.length - 1
    ) {
      setCurrentInstanceIndex(currentInstanceIndex + 1)
    } else if (direction === 'prev' && currentInstanceIndex > 0) {
      setCurrentInstanceIndex(currentInstanceIndex - 1)
    }
  }

  const handleFrameChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentFrame < numberOfFrames) {
      setCurrentFrame(currentFrame + 1)
    } else if (direction === 'prev' && currentFrame > 1) {
      setCurrentFrame(currentFrame - 1)
    }
  }
  const isPdf = currentInstance.sopClassUid === '1.2.840.10008.5.1.4.1.1.104.1'
  const resourceUrl = isPdf
    ? `http://${ipAddress}:8080/dcm4chee-arc/aets/${aetitle}/wado?requestType=WADO&studyUID=${studyUID}&seriesUID=${currentSeries.seriesInstanceUID}&objectUID=${currentInstance.sopInstanceUid}&contentType=application/pdf&frameNumber=${currentFrame}`
    : `http://${ipAddress}:8080/dcm4chee-arc/aets/${aetitle}/wado?requestType=WADO&studyUID=${studyUID}&seriesUID=${currentSeries.seriesInstanceUID}&objectUID=${currentInstance.sopInstanceUid}&contentType=image/jpeg&frameNumber=${currentFrame}`

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

      <div className="mt-4">
        {isPdf ? (
          <iframe src={resourceUrl} width="100%" height="1000px" />
        ) : (
          <img
            style={{
              width: currentInstance?.columns,
              height: currentInstance?.rows,
            }}
            src={resourceUrl}
            alt="DICOM Image"
            className="max-w-full"
          />
        )}
      </div>
    </div>
  )
}

export default ViewerPage
