import { prisma } from '@/lib/prisma'

export interface SecurityBondCompany {
  id: string
  name: string
}

export const searchSecurityBondCompanies = async ({
  query,
}: {
  query: string
}) => {
  try {
    const companies = await prisma.securityBondCompany.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
      },
      take: 10,
    })

    return { success: true, data: companies }
  } catch (error) {
    console.error('Error searching security bond companies:', error)
    return { success: false, error: 'Failed to search security bond companies' }
  }
}
