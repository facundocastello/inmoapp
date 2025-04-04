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
    <div className="min-h-screen bg-primary-100">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl font-bold mb-6 text-primary-800">
          Welcome to {tenant?.name}
        </h1>
        <p className="text-xl text-primary-700 max-w-2xl mx-auto mb-8">
          Your all-in-one platform for managing your business needs efficiently
          and effectively.
        </p>
        <Button
          size="lg"
          className="text-lg bg-primary-400 hover:bg-primary-500"
        >
          Get Started
        </Button>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary-800">
          Why Choose {tenant?.name}?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
            <div
              key={index}
              className="p-6 rounded-lg border border-primary-300 bg-primary-200"
            >
              <CheckCircle className="w-8 h-8 text-primary-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-primary-800">
                {feature.title}
              </h3>
              <p className="text-primary-700">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-primary-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-primary-800">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-700 mb-8">
            Join thousands of satisfied users who have transformed their
            business with {tenant?.name}.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="text-lg border-primary-400 text-primary-400 hover:bg-primary-300"
          >
            Sign Up Now
          </Button>
        </div>
      </section>
    </div>
  )
}
