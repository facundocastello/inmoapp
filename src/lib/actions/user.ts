'use server'

import { hash } from 'bcryptjs'

import { prisma } from '@/lib/prisma'

import { requireTenantSubdomain } from '../get-tenant'
import { uploadFile } from './file'

export type UserFormData = {
  name: string
  email: string
  password?: string
  role: 'ADMIN' | 'EDITOR' | 'VIEWER'
  avatar?: File | string | null
}

export const getUsers = async () => {
  const { tenantSubdomain } = await requireTenantSubdomain()
  return prisma.user.findMany({
    where: {
      tenantSubdomain,
    },
  })
}

export const getUser = async (id: string) => {
  const { tenantSubdomain } = await requireTenantSubdomain()
  return prisma.user.findUnique({
    where: { id, tenantSubdomain },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
    },
  })
}

export const createUser = async (data: UserFormData) => {
  const { tenantSubdomain } = await requireTenantSubdomain()

  const parsedAvatar =
    data.avatar instanceof File ? await uploadFile(data.avatar) : data.avatar
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password || '', // In a real app, you'd hash this
      role: data.role,
      avatar: parsedAvatar,
      tenantSubdomain,
    },
  })

  return { data: user }
}

export const updateUser = async (id: string, data: UserFormData) => {
  const { tenantSubdomain } = await requireTenantSubdomain()
  const parsedAvatar =
    data.avatar instanceof File ? await uploadFile(data.avatar) : data.avatar
  const user = await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      ...(data.password && { password: await hash(data.password, 12) }), // Only update password if provided, also hash this
      role: data.role,
      avatar: parsedAvatar,
      tenantSubdomain,
    },
  })
  return { data: user }
}

export const deleteUser = async (id: string) => {
  const { tenantSubdomain } = await requireTenantSubdomain()
  await prisma.user.delete({
    where: { id, tenantSubdomain },
  })
}
