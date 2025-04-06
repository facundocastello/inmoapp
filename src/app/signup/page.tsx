import { PublicSignupForm } from '@/components/tenant/PublicSignupForm'
import { getPlans } from '@/lib/actions/plans'

export default async function SignupPage() {
  const plans = await getPlans()
  return (
    <div className="min-h-screen bg-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-900">
            Create Your Tenant
          </h1>
          <p className="mt-2 text-primary-700">
            Get started with your own multi-tenant platform instance
          </p>
        </div>

        <PublicSignupForm plans={plans} />
      </div>
    </div>
  )
}
