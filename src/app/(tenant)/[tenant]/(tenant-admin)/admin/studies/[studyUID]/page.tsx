import React from 'react'

import InitializeAETitle from '@/components/studies/InitializeAETitle'
import InitializeDroplet from '@/components/studies/InitializeDroplet'
import ViewerPage from '@/components/studies/ViewerPage'
import { cachedGetCurrentDroplet } from '@/lib/actions/droplet'
import { getCurrentTenantOrRedirect } from '@/lib/actions/tenant'
import { getDcm4cheeStudyByUID } from '@/lib/actions/tenant/dcm4chee'

const StudyPage = async ({
  params,
}: {
  params: Promise<{ studyUID: string }>
}) => {
  const studyUID = (await params).studyUID
  const study = await getDcm4cheeStudyByUID(studyUID)
  const tenant = await getCurrentTenantOrRedirect()
  const droplet = await cachedGetCurrentDroplet()
  if (!tenant?.aetitle)
    return <InitializeAETitle subdomain={tenant!.subdomain} />
  if (!droplet?.ipAddress) return <InitializeDroplet droplet={droplet!} />
  return (
    <div>
      <h1>DICOM Viewer</h1>
      <ViewerPage
        studyUID={studyUID}
        study={study}
        tenantSubdomain={tenant.subdomain}
      />
    </div>
  )
}

export default StudyPage
