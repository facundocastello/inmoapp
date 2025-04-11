import React from 'react'

import { cachedGetCurrentDroplet } from '@/lib/actions/droplet'
import {
  getDropletDO,
  getDropletFirewallRules,
} from '@/lib/utils/digital-ocean/droplets'

export default async function page() {
  const droplet = await cachedGetCurrentDroplet()
  if (!droplet?.dropletId) return <></>
  const DODroplet = await getDropletDO(droplet?.dropletId)
  return (
    <div>
      <h1>Settings</h1>
      <p>{droplet?.name}</p>
      <p>{DODroplet.status}</p>
      <p>{DODroplet.networks.v4?.[0]?.ip_address}</p>
      <FirewallCard dropletId={parseInt(droplet?.dropletId)} />
    </div>
  )
}

const FirewallCard = async ({ dropletId }: { dropletId: number }) => {
  const DODropletFirewall = await getDropletFirewallRules(dropletId)
  return (
    <div>
      <h1>Firewall</h1>
      <div>
        <p>Inbound</p>
        <p>
          {DODropletFirewall?.inbound_rules.sources
            ?.map((rule) => rule.ip_address)
            .join(', ')}
        </p>
      </div>
      <div>
        <p>Outbound</p>
        <p>
          {DODropletFirewall?.outbound_rules.destinations
            ?.map((rule) => rule.ip_address)
            .join(', ')}
        </p>
      </div>
    </div>
  )
}
