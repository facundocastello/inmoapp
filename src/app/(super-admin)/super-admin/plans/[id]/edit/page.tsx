import { notFound } from 'next/navigation'

import { PlanForm } from '@/components/plans/PlanForm'
import { PageContainer } from '@/components/ui/layout/PageContainer'
import { prisma } from '@/lib/prisma'

interface EditPlanPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  const plan = await prisma.plan.findUnique({
    where: {
      id: (await params).id,
    },
  })

  if (!plan) {
    notFound()
  }

  // Convert features from JsonValue to Record<string, any>
  const initialData = {
    ...plan,
    features: ((plan.features || {}) as Record<string, any>) || {},
  }

  return (
    <PageContainer>
      <div className={styles.container}>
        <h1 className={styles.title}>Edit Plan</h1>
        <PlanForm initialData={initialData} />
      </div>
    </PageContainer>
  )
}

const styles = {
  container: 'space-y-6',
  title: 'text-2xl font-semibold',
}
