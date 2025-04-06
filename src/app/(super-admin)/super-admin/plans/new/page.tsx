import { PlanForm } from '@/components/plans/PlanForm'
import { PageContainer } from '@/components/ui/layout/PageContainer'

export default function NewPlanPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Create New Plan</h1>
        <PlanForm />
      </div>
    </PageContainer>
  )
}
