'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/forms/Input'
import { Select } from '@/components/ui/forms/Select'
import { Textarea } from '@/components/ui/forms/Textarea'
import { LoadingMessage } from '@/components/ui/LoadingMessage'
import { createTenant } from '@/lib/actions/tenant'

const signupSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  subdomain: z
    .string()
    .min(1, 'Subdomain is required')
    .regex(
      /^[a-z0-9-]+$/,
      'Subdomain can only contain lowercase letters, numbers, and hyphens',
    ),
  description: z.string().optional(),
  adminName: z.string().min(1, 'Admin name is required'),
  adminEmail: z.string().email('Invalid email address'),
  adminPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  planId: z.string().min(1, 'Plan is required'),
  subscriptionType: z.enum(['MANUAL', 'AUTOMATED']),
})

export type PublicSignupFormData = z.infer<typeof signupSchema>

interface PublicSignupFormProps {
  plans: Array<{
    id: string
    name: string
    price: number
  }>
}

export const PublicSignupForm = ({ plans }: PublicSignupFormProps) => {
  const router = useRouter()
  const methods = useForm<PublicSignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      subdomain: '',
      description: '',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
      subscriptionType: 'MANUAL',
    },
  })

  const {
    formState: { errors, isSubmitting },
  } = methods

  const onSubmit = async (data: PublicSignupFormData) => {
    try {
      const result = await createTenant({
        name: data.name,
        subdomain: data.subdomain,
        description: data.description,
        isActive: true,
        planId: data.planId,
        subscriptionType: data.subscriptionType,
        admin: {
          name: data.adminName,
          email: data.adminEmail,
          password: data.adminPassword,
        },
      })

      if (result.success && result.data?.oneUseToken) {
        // Redirect to the tenant's admin dashboard with the one-time use token
        const scheme = window.location.protocol
        const host = window.location.host
        router.push(
          `${scheme}//${data.subdomain}.${host}/login?oneUseToken=${result.data.oneUseToken}`,
        )
      } else {
        // Handle error
        console.error('Failed to create tenant:', result.error)
      }
    } catch (error) {
      console.error('Error during tenant creation:', error)
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={styles.form}>
        {isSubmitting && (
          <LoadingMessage
            messages={[
              'Creating tenant',
              'Initializing database',
              'Creating server',
              'Creating user',
              'Adding your custom domain',
              'Setting your landing page',
              'Setting your admin panel',
            ]}
          />
        )}
        <div className={styles.container}>
          <h2 className={styles.title}>Company Information</h2>

          <Input
            name="name"
            label="Company Name"
            error={errors.name?.message?.toString()}
          />

          <Input
            name="subdomain"
            label="Subdomain"
            error={errors.subdomain?.message?.toString()}
            helperText="This will be your unique URL (e.g., yourcompany.example.com)"
          />

          <Textarea
            name="description"
            label="Company Description"
            error={errors.description?.message?.toString()}
            rows={3}
          />
        </div>

        <div className={styles.container}>
          <h2 className={styles.title}>Subscription</h2>

          <Select
            name="planId"
            label="Plan"
            options={plans.map((plan) => ({
              value: plan.id,
              label: `${plan.name} ($${plan.price}/month)`,
            }))}
            error={errors.planId?.message?.toString()}
          />

          <Select
            name="subscriptionType"
            label="Payment Method"
            options={[
              { value: 'MANUAL', label: 'Transferencia / Efectivo' },
              { value: 'AUTOMATED', label: 'Mercado Pago' },
            ]}
            error={errors.subscriptionType?.message?.toString()}
          />
        </div>

        <div className={styles.container}>
          <h2 className={styles.title}>Admin Account</h2>

          <Input
            name="adminName"
            label="Admin Name"
            error={errors.adminName?.message?.toString()}
          />

          <Input
            name="adminEmail"
            label="Admin Email"
            type="email"
            error={errors.adminEmail?.message?.toString()}
          />

          <Input
            name="adminPassword"
            label="Admin Password"
            type="password"
            error={errors.adminPassword?.message?.toString()}
          />
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          className={styles.button}
        >
          Create Account
        </Button>
      </form>
    </FormProvider>
  )
}

const styles = {
  form: 'space-y-6',
  input: 'w-full',
  button: 'w-full',
  label: 'text-primary-900',
  error: 'text-error-500',
  helperText: 'text-sm text-muted-foreground',
  textarea: 'w-full',
  textareaError: 'border-error-500 focus:ring-error-500',
  container: 'space-y-2',
  title: 'text-primary-900 text-2xl font-semibold',
}
