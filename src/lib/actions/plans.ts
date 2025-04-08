'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/prisma'

export type PlanData = {
  name: string
  description?: string | null
  price: number
  features: Record<string, any>
}

export async function getPlans() {
  const plans = await prisma.plan.findMany()
  return plans
}

export async function createPlan(data: PlanData) {
  try {
    const plan = await prisma.plan.create({
      data,
    })

    revalidatePath('/super-admin/plans')
    return { success: true, plan }
  } catch (error) {
    console.error('Error creating plan:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    }
  }
}

export async function updatePlan(id: string, data: Partial<PlanData>) {
  try {
    const plan = await prisma.plan.update({
      where: { id },
      data,
    })

    revalidatePath('/super-admin/plans')
    return { success: true, plan }
  } catch (error) {
    console.error('Error updating plan:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    }
  }
}

export async function deletePlan(id: string) {
  try {
    await prisma.plan.delete({
      where: { id },
    })

    revalidatePath('/super-admin/plans')
    return { success: true }
  } catch (error) {
    console.error('Error deleting plan:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    }
  }
}
