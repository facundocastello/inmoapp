import InitializeAETitle from '@/components/studies/InitializeAETitle'
import InitializeDroplet from '@/components/studies/InitializeDroplet'
import StartingDcm4chee from '@/components/studies/StartingDcm4chee'
import StudiesPage from '@/components/studies/StudiesPage'
import { cachedGetCurrentDroplet } from '@/lib/actions/droplet'
import { getCurrentTenantOrRedirect } from '@/lib/actions/tenant'
import { pingDcm4chee } from '@/lib/actions/tenant/dcm4chee'

export default async function page() {
  const droplet = await cachedGetCurrentDroplet()
  if (!droplet?.ipAddress) return <InitializeDroplet droplet={droplet!} />
  const isDcm4cheeReady = await pingDcm4chee()
  const tenant = await getCurrentTenantOrRedirect()
  if (!tenant?.aetitle)
    return <InitializeAETitle subdomain={tenant!.subdomain} />

  if (!isDcm4cheeReady) return <StartingDcm4chee />
  return <StudiesPage />
}
