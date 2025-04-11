import React from 'react'

import ViewerPage from '@/components/studies/ViewerPage'
import { getDcm4cheeStudyByUID } from '@/lib/actions/tenant/dcm4chee'

const StudyPage = async ({
  params,
}: {
  params: Promise<{ studyUID: string }>
}) => {
  const studyUID = (await params).studyUID
  const study = await getDcm4cheeStudyByUID(studyUID)

  return (
    <div>
      <h1>DICOM Viewer</h1>
      <ViewerPage studyUID={studyUID} study={study} />
    </div>
  )
}

export default StudyPage
