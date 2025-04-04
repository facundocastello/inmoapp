'use server'

import { hash } from 'bcryptjs'

import { getTenantClient } from '../get-tenant'

export type UserFormData = {
  name: string
  email: string
  password?: string
  role: 'ADMIN' | 'EDITOR' | 'VIEWER'
}

export const getUser = async (id: string) => {
  const prisma = await getTenantClient()
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  })
}

export const createUser = async (data: UserFormData) => {
  const prisma = await getTenantClient()
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password || '', // In a real app, you'd hash this
      role: data.role,
    },
  })
  return { data: user }
}

export const updateUser = async (id: string, data: UserFormData) => {
  const prisma = await getTenantClient()
  const user = await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      ...(data.password && { password: await hash(data.password, 12) }), // Only update password if provided, also hash this
      role: data.role,
    },
  })
  return { data: user }
}

export const deleteUser = async (id: string) => {
  const prisma = await getTenantClient()
  await prisma.user.delete({
    where: { id },
  })
}
