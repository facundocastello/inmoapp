'use server'

import { revalidatePath } from 'next/cache'

import { requireTenantId } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'

import { PropertyForm } from './schemas'

export async function getProperties() {
  try {
    const { tenantId } = await requireTenantId()
    const properties = await prisma.property.findMany({
      where: { tenantId },
      orderBy: { address: 'asc' },
    })
    return { success: true, data: properties }
  } catch (error) {
    return { success: false, error: 'Failed to fetch properties' }
  }
}

export async function getProperty({ id }: { id: string }) {
  try {
    const { tenantId } = await requireTenantId()
    const property = await prisma.property.findUnique({
      where: { id, tenantId },
    })
    if (!property) {
      return { success: false, error: 'Property not found' }
    }
    return { success: true, data: property }
  } catch (error) {
    return { success: false, error: 'Failed to fetch property' }
  }
}

export async function createProperty({ data }: { data: PropertyForm }) {
  try {
    const { tenantId } = await requireTenantId()
    const property = await prisma.property.create({
      data: {
        ...data,
        tenantId,
      },
    })
    revalidatePath('/admin/properties')
    return { success: true, data: property }
  } catch (error) {
    return { success: false, error: 'Failed to create property' }
  }
}

export async function updateProperty({
  id,
  data,
}: {
  id: string
  data: Partial<PropertyForm>
}) {
  try {
    const { tenantId } = await requireTenantId()
    const property = await prisma.property.update({
      where: { id, tenantId },
      data,
    })
    revalidatePath('/admin/properties')
    return { success: true, data: property }
  } catch (error) {
    return { success: false, error: 'Failed to update property' }
  }
}

export async function deleteProperty({ id }: { id: string }) {
  try {
    const { tenantId } = await requireTenantId()
    await prisma.property.delete({
      where: { id, tenantId },
    })
    revalidatePath('/admin/properties')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete property' }
  }
}

export async function searchProperties({ query }: { query: string }) {
  try {
    const { tenantId } = await requireTenantId()
    const properties = await prisma.property.findMany({
      where: {
        tenantId,
        OR: [
          { address: { contains: query, mode: 'insensitive' } },
          { propertyType: { contains: query, mode: 'insensitive' } },
          { propertyId: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    })
    return { success: true, data: properties }
  } catch (error) {
    return { success: false, error: 'Failed to search properties' }
  }
}

export async function listProperties(tenantId: string, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: true,
          occupant: true,
          applicant: true,
        },
      }),
      prisma.property.count({ where: { tenantId } }),
    ])

    return {
      success: true,
      data: properties,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error('Error listing properties:', error)
    return { success: false, error: 'Failed to list properties' }
  }
}

export async function addPropertyPhoto(
  tenantId: string,
  propertyId: string,
  url: string,
) {
  try {
    const photo = await prisma.propertyPhoto.create({
      data: {
        propertyId,
        url,
      },
    })

    revalidatePath('/admin/properties')
    return { success: true, data: photo }
  } catch (error) {
    console.error('Error adding property photo:', error)
    return { success: false, error: 'Failed to add property photo' }
  }
}

export async function removePropertyPhoto(tenantId: string, id: string) {
  try {
    await prisma.propertyPhoto.delete({
      where: { id },
    })

    revalidatePath('/admin/properties')
    return { success: true }
  } catch (error) {
    console.error('Error removing property photo:', error)
    return { success: false, error: 'Failed to remove property photo' }
  }
}
