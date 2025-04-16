'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/forms/Input'
import { switchToAutomatedPayment } from '@/lib/actions/subscription'

import { Subscription } from '.prisma/shared'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

interface SwitchToAutomatedModalProps {
  isOpen: boolean
  subscription: Subscription
  onClose: () => void
}

export function SwitchToAutomatedModal({
  isOpen,
  subscription,
  onClose,
}: SwitchToAutomatedModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  })

  const {
    handleSubmit,
    formState: { errors },
  } = methods

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      setIsLoading(true)
      const response = await switchToAutomatedPayment(
        subscription.tenantSubdomain,
        data.email,
      )
      if (!response || response.success) {
        onClose()
      } else {
        setError(response.error?.toString() ?? 'An unknown error occurred')
      }
    } catch (error: any) {
      console.error('Failed to switch to automated payments:', error)
      setError(error?.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Switch to Automated Payments</h2>
        <p className={styles.description}>
          Please enter your MercadoPago email to switch to automated payments.
        </p>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <Input
              name="email"
              label="MercadoPago Email"
              type="email"
              error={errors.email?.message?.toString()}
            />

            <div className={styles.actions}>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Confirm
              </Button>
            </div>
          </form>
          {error && (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          )}
        </FormProvider>
      </div>
    </div>
  )
}

const styles = {
  modalOverlay: `
    fixed inset-0 z-50 flex items-center justify-center
    bg-black/50 backdrop-blur-sm
  `,
  modal: `
    w-full max-w-md p-6 space-y-4
    bg-primary-100 rounded-lg shadow-lg
  `,
  title: 'text-xl font-semibold text-primary-900',
  description: 'text-sm text-primary-700',
  form: 'space-y-4',
  actions: 'flex justify-end space-x-2 mt-6',
  error: 'text-error-500 text-sm mt-2',
}
