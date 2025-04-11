// app/actions/cloneDroplet.ts
'use server'

export async function cloneDropletDO({ name }: { name: string }) {
  console.log(`[Droplet Clone] Starting clone process for droplet: ${name}`)
  const DIGITALOCEAN_API_TOKEN = process.env.DIGITALOCEAN_API_TOKEN!

  try {
    console.log(
      `[Droplet Clone] Making API request to DigitalOcean for droplet: ${name}`,
    )
    const response = await fetch('https://api.digitalocean.com/v2/droplets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DIGITALOCEAN_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        region: 'sfo3',
        size: 's-1vcpu-2gb',
        // dcm4chee 183771894
        // dcm4chee2 183783303
        image: 183783303, // dcm4chee2
        ssh_keys: null,
        backups: false,
        ipv6: false,
        user_data: null,
        monitoring: true,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error(`[Droplet Clone] Failed to clone droplet ${name}:`, error)
      throw new Error(`Failed to clone droplet: ${error.message}`)
    }

    const data = await response.json()
    console.log(
      `[Droplet Clone] Successfully created droplet ${name} with ID: ${data.droplet.id}`,
    )
    return data.droplet as DODroplet
  } catch (error) {
    console.error(
      `[Droplet Clone] Unexpected error while cloning droplet ${name}:`,
      error,
    )
    throw error
  }
}

export async function getDropletDO(id: string) {
  const DIGITALOCEAN_API_TOKEN = process.env.DIGITALOCEAN_API_TOKEN!
  const response = await fetch(
    `https://api.digitalocean.com/v2/droplets/${id}`,
    {
      headers: {
        Authorization: `Bearer ${DIGITALOCEAN_API_TOKEN}`,
      },
    },
  )
  const data = await response.json()
  return data.droplet as DODroplet
}

export async function getAllDropletsDO() {
  const DIGITALOCEAN_API_TOKEN = process.env.DIGITALOCEAN_API_TOKEN!
  const response = await fetch('https://api.digitalocean.com/v2/droplets', {
    headers: {
      Authorization: `Bearer ${DIGITALOCEAN_API_TOKEN}`,
    },
  })
  const data = await response.json()
  return data.droplets as DODroplet[]
}

export async function deleteDropletDO(id: number) {
  const DIGITALOCEAN_API_TOKEN = process.env.DIGITALOCEAN_API_TOKEN!
  console.log(`[Droplet Delete] Deleting droplet ${id}`)
  await fetch(`https://api.digitalocean.com/v2/droplets/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${DIGITALOCEAN_API_TOKEN}`,
    },
  })
  console.log(`[Droplet Delete] Deleted droplet ${id}`)
  return { success: true }
}

export async function getDropletFirewallRules(id: number) {
  const DIGITALOCEAN_API_TOKEN = process.env.DIGITALOCEAN_API_TOKEN!
  const response = await fetch(
    `https://api.digitalocean.com/v2/droplets/${id}/firewalls`,
    {
      headers: {
        Authorization: `Bearer ${DIGITALOCEAN_API_TOKEN}`,
      },
    },
  )
  const data = await response.json()
  return data.firewalls[0] as DODropletFirewall
}

export async function updateDropletDOAllowedIPs(
  id: number,
  allowedIPs: string[],
) {
  const DIGITALOCEAN_API_TOKEN = process.env.DIGITALOCEAN_API_TOKEN!
  await fetch(`https://api.digitalocean.com/v2/droplets/${id}/firewall`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${DIGITALOCEAN_API_TOKEN}`,
    },
    body: JSON.stringify({
      inbound_rules: allowedIPs.map((ip) => ({
        protocol: 'tcp',
        ports: '22',
        sources: { ip_address: ip },
      })),
      outbound_rules: allowedIPs.map((ip) => ({
        protocol: 'tcp',
        ports: '22',
        destinations: { ip_address: ip },
      })),
    }),
  })
}

interface DODropletFirewall {
  id: string
  status: 'waiting' | 'succeeded' | 'failed'
  created_at: string
  pending_changes: {
    droplet_id: number
    removing: string[]
    adding: string[]
  }
  name: string
  droplet_id: number
  inbound_rules: {
    protocol: string
    ports: string
    sources: {
      ip_address: string
      label: string
      uuid: string
    }[]
  }
  outbound_rules: {
    protocol: string
    ports: string
    destinations: {
      ip_address: string
      label: string
      uuid: string
    }[]
  }
}

export interface DODroplet {
  id: number
  name: string
  memory: number
  vcpus: number
  disk: number
  status: string
  created_at: string
  features: string[]
  backup_ids: string[]
  snapshot_ids: string[]
  image: {
    id: number
    name: string
    distribution: string
    slug: string
    public: boolean
    regions: string[]
    created_at: string
    min_disk_size: number
    type: string
    size_gigabytes: number
    tags: string[]
    status: string
  }
  volume_ids: string[]
  size: {
    slug: string
    memory: number
    vcpus: number
    disk: number
    transfer: number
    price_monthly: number
    price_hourly: number
    regions: string[]
    available: boolean
    description: string
    networking_throughput: number
    disk_info: string[]
  }
  size_slug: string
  networks: {
    v4: {
      ip_address: string
      netmask: string
      gateway: string
      type: string
    }[]
    v6: {
      ip_address: string
      netmask: string
      gateway: string
      type: string
    }[]
  }
  region: {
    name: string
    slug: string
  }
}
