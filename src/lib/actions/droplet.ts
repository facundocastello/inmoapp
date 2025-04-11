'use server'

import { revalidateTag, unstable_cache } from 'next/cache'

import { prisma } from '@/lib/prisma'

import { getTenantId } from '../get-tenant'
import { cloneDropletDO, getDropletDO } from '../utils/digital-ocean/droplets'

export async function getDroplet(tenantId: string) {
  const droplet = await prisma.droplet.findUnique({ where: { tenantId } })
  return droplet
}

export async function deleteDroplet(tenantId: string) {
  const droplet = await prisma.droplet.delete({ where: { tenantId } })
  return droplet
}

export async function initializeDroplet(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { subscription: true },
  })
  if (!tenant?.subscription?.planId)
    throw new Error('Tenant has no subscription')
  const plan = await prisma.plan.findUnique({
    where: { id: tenant?.subscription?.planId },
  })
  if (!plan) throw new Error('Plan not found')

  const hasDedicatedDroplet =
    plan?.features &&
    typeof plan.features === 'object' &&
    'hasDedicatedDroplet' in plan.features
      ? plan.features.hasDedicatedDroplet
      : false
  let dropletId = null as string | null
  if (hasDedicatedDroplet) {
    const DODroplet = await cloneDropletDO({ name: tenant.subdomain })
    const droplet = await prisma.droplet.create({
      data: {
        name: tenant.subdomain,
        dropletId: DODroplet.id.toString(),
        isPool: false,
        tenantId: tenant.id,
      },
    })
    dropletId = droplet.id
  } else {
    const poolDroplet = await prisma.droplet.findFirst({
      where: {
        isPool: true,
      },
    })
    if (!poolDroplet) {
      const DODroplet = await cloneDropletDO({ name: tenant.subdomain })
      const randomName = Math.random().toString(36).substring(2, 15)
      const droplet = await prisma.droplet.create({
        data: {
          name: `multi-tenant-${randomName}`,
          isPool: true,
          dropletId: DODroplet.id.toString(),
          tenantId: tenant.id,
        },
      })
      dropletId = droplet.id
    } else {
      dropletId = poolDroplet.id
    }
  }
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { dropletId },
  })
}

export async function getCurrentDroplet(tenantId: string) {
  const droplet = await prisma.droplet.findFirst({
    where: {
      tenant: {
        subdomain: tenantId,
      },
    },
  })

  return droplet
}

export const cachedGetCurrentDroplet = async () => {
  const tenantId = await getTenantId()
  if (!tenantId) return null

  return unstable_cache(getCurrentDroplet, ['current-droplet'], {
    tags: [`droplet-${tenantId}`],
  })(tenantId)
}

export async function initializeDropletIp(
  dropletId: string,
  DODropletId: string,
) {
  const dropletDO = await getDropletDO(DODropletId)
  if (!dropletDO.networks.v4?.[0]?.ip_address) return null
  const droplet = await prisma.droplet.update({
    where: { id: dropletId },
    data: { ipAddress: dropletDO.networks.v4?.[0]?.ip_address },
    include: { tenant: true },
  })
  revalidateTag(`droplet-${droplet.tenant.subdomain}`)
  return droplet
}
