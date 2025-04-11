import React from 'react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  deleteDropletDO,
  getAllDropletsDO,
} from '@/lib/utils/digital-ocean/droplets'

export default async function page() {
  const droplets = await getAllDropletsDO()
  return (
    <div>
      <h1>Droplets</h1>
      <div>
        {droplets.map((droplet) => (
          <Card key={droplet.id}>
            <CardHeader>
              <CardTitle>{droplet.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <FeatureItem
                label="IP"
                value={droplet.networks.v4[0]?.ip_address}
              />
              <FeatureItem
                label="Netmask"
                value={droplet.networks.v4[0]?.netmask}
              />
              <FeatureItem
                label="Gateway"
                value={droplet.networks.v4[0]?.gateway}
              />
              <FeatureItem label="Type" value={droplet.networks.v4[0]?.type} />
              <FeatureItem label="Disk" value={droplet.disk.toString()} />
              <FeatureItem label="Memory" value={droplet.memory.toString()} />
              <FeatureItem label="CPUs" value={droplet.vcpus.toString()} />
              <FeatureItem label="Status" value={droplet.status} />
              <FeatureItem label="Created at" value={droplet.created_at} />
              <FeatureItem
                label="Features"
                value={droplet.features.join(', ')}
              />
              <FeatureItem label="Image" value={droplet.image.name} />
            </CardContent>
            {droplet.image.name === 'dcm4chee' && (
              <Button
                onClick={async () => {
                  'use server'
                  await deleteDropletDO(droplet.id)
                }}
              >
                Delete
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

const FeatureItem = ({ label, value }: { label: string; value?: string }) => {
  return (
    <p className="border p-1 rounded">
      <span className="font-bold">{label}:</span> {value}
    </p>
  )
}
