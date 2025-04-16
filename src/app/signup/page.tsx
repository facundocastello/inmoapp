import { PlansSection } from '@/components/plans/PlansSection'
import { PublicSignupForm } from '@/components/tenant/PublicSignupForm'
import { getPlans } from '@/lib/actions/plans'

export default async function SignupPage() {
  const plans = await getPlans()
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Your Tenant</h1>
          <p className={styles.subtitle}>
            Get started with your own InmoApp platform instance
          </p>
        </div>

        <PublicSignupForm plans={plans} />
      </div>
      <PlansSection title="Plans" withButton={false} />
    </div>
  )
}

const styles = {
  container: 'min-h-screen bg-primary-100 py-12 px-4 sm:px-6 lg:px-8',
  formContainer: 'max-w-md mx-auto',
  header: 'text-center mb-8',
  title: 'text-3xl font-bold text-primary-900',
  subtitle: 'mt-2 text-primary-700',
}
