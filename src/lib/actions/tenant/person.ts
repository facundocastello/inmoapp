'use server'

import { revalidatePath } from 'next/cache'

import { requireTenantId } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'

import { PersonForm } from './schemas'

export async function getPeople() {
  try {
    const { tenantId } = await requireTenantId()
    const people = await prisma.person.findMany({
      where: { tenantId },
      orderBy: { firstName: 'asc' },
    })
    return { success: true, data: people }
  } catch (error) {
    return { success: false, error: 'Failed to fetch people' }
  }
}

export async function getPerson({ id }: { id: string }) {
  try {
    const { tenantId } = await requireTenantId()
    const person = await prisma.person.findUnique({
      where: { id, tenantId },
    })
    if (!person) {
      return { success: false, error: 'Person not found' }
    }
    return { success: true, data: person }
  } catch (error) {
    return { success: false, error: 'Failed to fetch person' }
  }
}

export async function createPerson({ data }: { data: PersonForm }) {
  try {
    const { tenantId } = await requireTenantId()
    const person = await prisma.person.create({
      data: {
        ...data,
        tenantId,
      },
    })
    revalidatePath('/admin/people')
    return { success: true, data: person }
  } catch (error) {
    return { success: false, error: 'Failed to create person' }
  }
}

export async function updatePerson({
  id,
  data,
}: {
  id: string
  data: Partial<PersonForm>
}) {
  try {
    const { tenantId } = await requireTenantId()
    const person = await prisma.person.update({
      where: { id, tenantId },
      data,
    })
    revalidatePath('/admin/people')
    return { success: true, data: person }
  } catch (error) {
    return { success: false, error: 'Failed to update person' }
  }
}

export async function deletePerson({ id }: { id: string }) {
  try {
    const { tenantId } = await requireTenantId()
    await prisma.person.delete({
      where: { id, tenantId },
    })
    revalidatePath('/admin/people')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete person' }
  }
}

export async function searchPeople({ query }: { query: string }) {
  try {
    const { tenantId } = await requireTenantId()
    const people = await prisma.person.findMany({
      where: {
        tenantId,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { document: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    })
    return { success: true, data: people }
  } catch (error) {
    return { success: false, error: 'Failed to search people' }
  }
}
