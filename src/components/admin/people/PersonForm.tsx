'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Person } from '@prisma/client'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/forms/DatePicker'
import ErrorBox from '@/components/ui/forms/ErrorBox'
import { Input } from '@/components/ui/forms/Input'
import { Select } from '@/components/ui/forms/Select'
import { createPerson, updatePerson } from '@/lib/actions/tenant/person'
import {
  type PersonForm as PersonFormType,
  personSchema,
} from '@/lib/actions/tenant/schemas'

export default function PersonForm({
  defaultValues,
  onSuccess,
}: {
  defaultValues?: PersonFormType & { id?: string }
  onSuccess?: (person: Person) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const methods = useForm({
    defaultValues,
    resolver: zodResolver(personSchema),
  })

  const onSubmit = (data: PersonFormType) => {
    setIsLoading(true)
    setError(null)
    ;(defaultValues?.id
      ? updatePerson({ id: defaultValues.id, data })
      : createPerson({ data })
    )
      .then((res) => {
        if (res.success && res.data) {
          onSuccess?.(res.data)
        } else if ('error' in res) {
          setError(res.error || 'An unknown error occurred')
        }
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const errors = methods.formState.errors

  return (
    <FormProvider {...methods}>
      <form className={styles.form} onSubmit={methods.handleSubmit(onSubmit)}>
        <div className={styles.grid}>
          <div>
            <Select
              name="documentType"
              label="Document Type"
              options={[
                { value: 'DNI', label: 'DNI' },
                { value: 'PASSPORT', label: 'Passport' },
                { value: 'LE', label: 'LE' },
                { value: 'LC', label: 'LC' },
              ]}
            />
          </div>
          <div>
            <Input name="document" label="Document Number" />
          </div>
        </div>

        <div className={styles.grid}>
          <Input name="firstName" label="First Name" />
          <Input name="lastName" label="Last Name" />
        </div>

        <div className={styles.grid}>
          <Input name="email" label="Email" type="email" />
          <Input name="phoneNumber" label="Phone Number" />
        </div>

        <div>
          <Input name="address" label="Address" />
        </div>

        <div className={styles.grid}>
          <DatePicker name="dateOfBirth" label="Date of Birth" />
          <Input name="taxId" label="Tax ID" />
        </div>

        <div>
          <Input name="emergencyContact" label="Emergency Contact" />
        </div>

        {error && <div className="text-red-500">{error}</div>}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </form>
      <ErrorBox errors={errors} />
    </FormProvider>
  )
}

const styles = {
  form: 'flex flex-col gap-4',
  grid: 'grid grid-cols-1 gap-4 sm:grid-cols-2',
}
