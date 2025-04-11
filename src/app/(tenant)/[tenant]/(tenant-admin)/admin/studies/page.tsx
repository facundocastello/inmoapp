import DicomStudiesPage from '@/components/studies/DicomStudiesPage'
import InitializeAETitle from '@/components/studies/InitializeAETitle'
import InitializeDroplet from '@/components/studies/InitializeDroplet'
import StartingDcm4chee from '@/components/studies/StartingDcm4chee'
import { cachedGetCurrentDroplet } from '@/lib/actions/droplet'
import { getCurrentTenantOrRedirect } from '@/lib/actions/tenant'
import { pingDcm4chee } from '@/lib/actions/tenant/dcm4chee'

interface DicomStudiesPageProps {
  searchParams: Promise<{
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
  }>
}

export default async function page({ searchParams }: DicomStudiesPageProps) {
  const droplet = await cachedGetCurrentDroplet()
  if (!droplet?.ipAddress) return <InitializeDroplet droplet={droplet!} />
  const isDcm4cheeReady = await pingDcm4chee()
  const tenant = await getCurrentTenantOrRedirect()
  console.log(tenant)
  if (!tenant?.aetitle)
    return <InitializeAETitle subdomain={tenant!.subdomain} />

  if (!isDcm4cheeReady) return <StartingDcm4chee />

  const params = await searchParams

  return <DicomStudiesPage {...params} />
}
