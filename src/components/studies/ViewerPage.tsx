'use client'
import React, { useState } from 'react'

import { getDcm4cheeStudyByUID } from '@/lib/actions/tenant/dcm4chee'

const ViewerPage = ({
  studyUID,
  study,
}: {
  studyUID: string
  study: Awaited<ReturnType<typeof getDcm4cheeStudyByUID>>
}) => {
  const [currentSeriesIndex, setCurrentSeriesIndex] = useState(0)
  const [currentInstanceIndex, setCurrentInstanceIndex] = useState(0)
  const [currentFrame, setCurrentFrame] = useState(1)

  const currentSeries = study.series[currentSeriesIndex]
  const currentInstance = study.instances[currentInstanceIndex]
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
      currentInstanceIndex < study.instances.length - 1
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

  const imageUrl = `http://137.184.181.70:8080/dcm4chee-arc/aets/AS_RECEIVED/wado?requestType=WADO&studyUID=${studyUID}&seriesUID=${currentSeries.seriesInstanceUID}&objectUID=${currentInstance.sopInstanceUid}&contentType=image/jpeg&frameNumber=${currentFrame}`

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">DICOM Viewer</h1>

      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-semibold">Series</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleSeriesChange('prev')}
              disabled={currentSeriesIndex === 0}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1">
              {currentSeriesIndex + 1} / {study.series.length}
            </span>
            <button
              onClick={() => handleSeriesChange('next')}
              disabled={currentSeriesIndex === study.series.length - 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-semibold">Instance</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleInstanceChange('prev')}
              disabled={currentInstanceIndex === 0}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1">
              {currentInstanceIndex + 1} / {study.instances.length}
            </span>
            <button
              onClick={() => handleInstanceChange('next')}
              disabled={currentInstanceIndex === study.instances.length - 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {numberOfFrames > 1 && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-semibold">Frame</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleFrameChange('prev')}
                disabled={currentFrame === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 py-1">
                {currentFrame} / {numberOfFrames}
              </span>
              <button
                onClick={() => handleFrameChange('next')}
                disabled={currentFrame === numberOfFrames}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <img
          style={{
            width: currentInstance?.columns,
            height: currentInstance?.rows,
          }}
          src={imageUrl}
          alt="DICOM Image"
          className="max-w-full"
        />
      </div>
    </div>
  )
}

export default ViewerPage
