import { CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { prisma } from '@/lib/prisma'

export default async function TenantPage({
  params,
}: {
  params: { tenant: string }
}) {
  const tenantParams = (await params).tenant
  const tenant = await prisma.tenant.findUnique({
    where: {
      subdomain: tenantParams,
      isActive: true,
    },
  })

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Welcome to {tenant?.name}</h1>
        <p className={styles.heroSubtitle}>
          Your all-in-one platform for managing your business needs efficiently
          and effectively.
        </p>
        <Button size="lg" className={styles.heroButton}>
          Get Started
        </Button>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.featuresTitle}>Why Choose {tenant?.name}?</h2>
        <div className={styles.featuresGrid}>
          {[
            {
              title: 'Easy to Use',
              description:
                'Intuitive interface designed for seamless navigation and quick adoption.',
            },
            {
              title: 'Powerful Features',
              description:
                'Comprehensive tools to help you manage your business effectively.',
            },
            {
              title: '24/7 Support',
              description:
                'Dedicated support team ready to help you whenever you need assistance.',
            },
          ].map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <CheckCircle className={styles.featureIcon} />
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of satisfied users who have transformed their
            business with {tenant?.name}.
          </p>
          <Button size="lg" variant="outline" className={styles.ctaButton}>
            Sign Up Now
          </Button>
        </div>
      </section>
    </div>
  )
}

const styles = {
  container: 'min-h-screen bg-primary-100',
  hero: 'py-20 px-4 text-center',
  heroTitle: 'text-5xl font-bold mb-6 text-primary-800',
  heroSubtitle: 'text-xl text-primary-700 max-w-2xl mx-auto mb-8',
  heroButton: 'text-lg bg-primary-400 hover:bg-primary-500',
  features: 'py-16 px-4',
  featuresTitle: 'text-3xl font-bold text-center mb-12 text-primary-800',
  featuresGrid: 'grid md:grid-cols-3 gap-8 max-w-6xl mx-auto',
  featureCard: 'p-6 rounded-lg border border-primary-300 bg-primary-200',
  featureIcon: 'w-8 h-8 text-primary-400 mb-4',
  featureTitle: 'text-xl font-semibold mb-2 text-primary-800',
  featureDescription: 'text-primary-700',
  cta: 'py-16 px-4 bg-primary-200',
  ctaContent: 'max-w-4xl mx-auto text-center',
  ctaTitle: 'text-3xl font-bold mb-6 text-primary-800',
  ctaSubtitle: 'text-xl text-primary-700 mb-8',
  ctaButton: 'text-lg border-primary-400 text-primary-400 hover:bg-primary-300',
}
