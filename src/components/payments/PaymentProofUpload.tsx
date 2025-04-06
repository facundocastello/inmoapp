'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import * as z from 'zod'

import { FileInput } from '@/components/ui/forms/FileInput'
import { updatePaymentProof } from '@/lib/actions/payments'
import { useToast } from '@/lib/hooks/useToast'

import { Button } from '../ui/Button'
import { Payment } from '.prisma/shared'

interface PaymentProofUploadProps {
  payment: Payment
  onSuccess?: () => void
}

const schema = z.object({
  proofOfPayment: z.union([z.instanceof(File), z.string()]).nullable(),
})

type FormData = z.infer<typeof schema>

export function PaymentProofUpload({
  payment,
  onSuccess,
}: PaymentProofUploadProps) {
  const { showToast } = useToast()
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      proofOfPayment: payment?.proofOfPayment || null,
    },
  })

  const handleSubmit = async (data: FormData) => {
    try {
      if (!data.proofOfPayment || typeof data.proofOfPayment === 'string')
        return
      setIsUploading(true)
      // Update payment with proof
      const updateResult = await updatePaymentProof(
        payment?.id,
        data.proofOfPayment as File,
      )

      if (updateResult.success) {
        showToast('Proof of payment uploaded successfully')
        // Refresh the page to show updated payment status
        window.location.reload()
        onSuccess?.()
      } else {
        showToast(updateResult.error || 'Failed to update payment', 'error')
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <FormProvider {...form}>
      <div className="flex flex-col items-center gap-4">
        <FileInput
          className="w-64"
          name="proofOfPayment"
          accept="image/jpeg,image/png,application/pdf"
          disabled={isUploading}
        />
        {isUploading && <span>Uploading...</span>}
        <Button
          variant="outline"
          type="submit"
          onClick={form.handleSubmit(handleSubmit)}
          disabled={isUploading}
          className="w-full"
        >
          Upload
        </Button>
      </div>
    </FormProvider>
  )
}
