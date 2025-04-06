import { notFound } from 'next/navigation'

import { PlanForm } from '@/components/plans/PlanForm'
import { PageContainer } from '@/components/ui/layout/PageContainer'
import { prisma } from '@/lib/prisma'

interface EditPlanPageProps {
  params: {
    id: string
  }
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  const plan = await prisma.plan.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!plan) {
    notFound()
  }

  // Convert features from JsonValue to Record<string, any>
  const initialData = {
    ...plan,
    features: (plan.features as Record<string, any>) || {},
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Edit Plan</h1>
        <PlanForm initialData={initialData} />
      </div>
    </PageContainer>
  )
}
