'use server'

import { revalidateTag } from 'next/cache'

import { getTenantId } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { Dcm4cheeService } from '@/lib/utils/dcm4chee/service'

import { cachedGetCurrentDroplet } from '../droplet'

export async function getDcm4cheeDeviceInfo() {
  const service = await getDcm4cheeService()
  return service.getDeviceInfo()
}

export async function getDcm4cheeStudies({
  limit = 10,
  offset = 0,
}: {
  limit?: number
  offset?: number
} = {}) {
  const service = await getDcm4cheeService()
  return service.getStudies({ limit, offset })
}

export async function createDcm4cheeAETitle({
  aetitle,
  description,
}: {
  aetitle: string
  description: string
}) {
  const service = await getDcm4cheeService()
  return service.createAETitle(aetitle, description)
}

export async function uploadDicomFile({
  file,
}: {
  file: File
  aetitle: string
  baseUrl?: string
}) {
  const service = await getDcm4cheeService()
  await service.uploadDicom(file)
}

export async function getDcm4cheeStudyByUID(studyUID: string) {
  const dcm4cheeService = new Dcm4cheeService()
  return dcm4cheeService.getStudyByUIDWithSeriesAndInstances(studyUID)
}

const getDcm4cheeService = async () => {
  const tenant = await prisma.tenant.findUnique({
    where: {
      id: (await getTenantId())!,
    },
    include: {
      droplet: true,
    },
  })
  let ipAddress = tenant?.droplet?.ipAddress
  if (!ipAddress) {
    const droplet = await cachedGetCurrentDroplet()
    if (!droplet?.ipAddress)
      throw new Error(droplet ? 'Droplet not found' : 'Droplet ip not found')
    ipAddress = droplet.ipAddress
  }

  const dcm4cheeService = new Dcm4cheeService({
    aet: tenant?.aetitle || undefined,
    host: ipAddress,
  })
  return dcm4cheeService
}

export const pingDcm4chee = async () => {
  try {
    const service = await getDcm4cheeService()
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 2000),
    )
    const ping = await Promise.race([service.pingService(), timeout])
    return ping
  } catch (error) {
    return false
  }
}

export const initializeAETitle = async (subdomain: string) => {
  const service = await getDcm4cheeService()
  await service.createAETitle(subdomain, subdomain)
  await prisma.tenant.update({
    where: {
      subdomain: subdomain,
    },
    data: {
      aetitle: subdomain,
    },
  })
  revalidateTag(`tenant-${subdomain}`)
}
