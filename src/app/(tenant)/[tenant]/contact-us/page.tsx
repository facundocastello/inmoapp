import { prisma } from '@/lib/prisma'

export default async function ContactPage({
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
    <div className="space-y-4">
      <h2 className="text-3xl font-bold">Contact {tenant?.name}</h2>
      <p className="text-lg text-muted-foreground">
        Get in touch with us using the form below.
      </p>
      <form className="space-y-4 max-w-md">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Send Message
        </button>
      </form>
    </div>
  )
}
