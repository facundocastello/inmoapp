'use server'

import { revalidateTag } from 'next/cache'

import { getTenantId } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { Dcm4cheeService, DicomFilter } from '@/lib/utils/dcm4chee/service'

import { cachedGetCurrentDroplet } from '../droplet'

export async function getDcm4cheeDeviceInfo() {
  const service = await getDcm4cheeService()
  return service.getDeviceInfo()
}

export async function getDcm4cheeStudies({
  limit = 10,
  offset = 0,
  filters = {},
}: {
  limit?: number
  offset?: number
  filters?: DicomFilter
} = {}) {
  const service = await getDcm4cheeService()
  return service.getStudies({ limit, offset, filters })
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

export async function uploadDicomFile({ file }: { file: File }) {
  const service = await getDcm4cheeService()
  await service.uploadDicom(file)
}

export async function uploadPdfToStudy({
  pdfFile,
  studyInstanceUID,
}: {
  pdfFile: File
  studyInstanceUID: string
}) {
  try {
    const service = await getDcm4cheeService()

    // Call the service method with improved error handling
    const result = await service.uploadPdfToDicom(pdfFile, studyInstanceUID)

    // Log success and return result
    if (result.error) {
      throw new Error(result.error)
    }
    console.log('PDF successfully uploaded to study', studyInstanceUID)
    return result
  } catch (error) {
    console.error('Error in uploadPdfToStudy:', error)
    // Rethrow for component-level error handling
    throw error
  }
}

export async function getDcm4cheeStudyByUID(studyUID: string) {
  const dcm4cheeService = await getDcm4cheeService()
  return dcm4cheeService.getStudyByUIDWithSeriesAndInstances(studyUID)
}

const getDcm4cheeService = async () => {
  const tenant = await prisma.tenant.findUnique({
    where: {
      subdomain: (await getTenantId())!,
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
