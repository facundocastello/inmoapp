import Link from 'next/link'

import { getPlans } from '@/lib/actions/plans'

type PlanFeature = {
  [key: string]: string | number | boolean | null
}

export async function PlansSection({
  title = 'Choose Your Plan',
  withButton = true,
}: {
  title?: string
  withButton?: boolean
}) {
  const plans = await getPlans()

  return (
    <div className={styles.plansSection}>
      <h2 className={styles.plansHeading}>{title}</h2>
      <div className={styles.plansGrid}>
        {plans.map((plan) => (
          <div key={plan.id} className={styles.planCard}>
            <div className={styles.planHeader}>
              <h3 className={styles.planName}>{plan.name}</h3>
              <p className={styles.planPrice}>
                ${plan.price}
                <span className={styles.planPeriod}>/month</span>
              </p>
            </div>
            {plan.description && (
              <p className={styles.planDescription}>{plan.description}</p>
            )}
            <ul className={styles.planFeatures}>
              {Object.entries((plan.features || {}) as PlanFeature).map(
                ([key, value]) => (
                  <li key={key} className={styles.planFeature}>
                    {typeof value === 'boolean' ? (
                      <span
                        className={
                          value
                            ? styles.featureIncluded
                            : styles.featureExcluded
                        }
                      >
                        {value ? '✓' : '✗'} {key}
                      </span>
                    ) : (
                      <span className={styles.featureIncluded}>
                        ✓ {key}: {String(value)}
                      </span>
                    )}
                  </li>
                ),
              )}
            </ul>
            {withButton && (
              <Link
                href={`/signup?plan=${plan.id}`}
                className={styles.planButton}
              >
                Get Started
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  plansSection: 'mt-20',
  plansHeading: 'text-3xl font-bold text-center mb-12 text-primary-800',
  plansGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
  planCard:
    'bg-primary-200 border-2 border-primary-300 rounded-lg shadow-lg p-6 flex flex-col hover:border-primary-400 transition-all hover:shadow-xl',
  planHeader: 'text-center mb-6',
  planName: 'text-xl font-bold mb-2 text-primary-800',
  planPrice: 'text-3xl font-bold text-primary-400',
  planPeriod: 'text-sm text-primary-600',
  planDescription: 'text-primary-700 text-center mb-6',
  planFeatures: 'space-y-3 mb-8 flex-grow',
  planFeature: 'flex items-center',
  featureIncluded: 'text-success-600',
  featureExcluded: 'text-error-600',
  planButton:
    'mt-auto rounded-md bg-primary-400 px-4 py-2 text-center text-primary-800 hover:bg-primary-500 transition-colors',
}
