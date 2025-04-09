import { PlanForm } from '@/components/plans/PlanForm'
import { PageContainer } from '@/components/ui/layout/PageContainer'

export default function NewPlanPage() {
  return (
    <PageContainer>
      <div className={styles.container}>
        <h1 className={styles.title}>Create New Plan</h1>
        <PlanForm />
      </div>
    </PageContainer>
  )
}

const styles = {
  container: 'space-y-6',
  title: 'text-2xl font-semibold',
}
