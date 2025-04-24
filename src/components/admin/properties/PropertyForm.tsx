'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Property } from '@prisma/client'
import React, { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/forms/Input'
import { PropertyMap } from '@/components/ui/PropertyMap'
import { createProperty, updateProperty } from '@/lib/actions/tenant/property'
import { type PropertyForm, propertySchema } from '@/lib/actions/tenant/schemas'
import { useGeocode } from '@/lib/hooks/useGeocode'

export default function PropertyForm({
  defaultValues,
  onSuccess,
}: {
  defaultValues?: PropertyForm & { id?: string }
  onSuccess?: (property: Property) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const methods = useForm({
    defaultValues,
    resolver: zodResolver(propertySchema),
  })
  const { result, geocodeAddress } = useGeocode()

  const onSubmit = (data: PropertyForm) => {
    setIsLoading(true)
    setError(null)
    ;(defaultValues?.id
      ? updateProperty({ id: defaultValues.id, data })
      : createProperty({ data })
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

  const handleAddressSearch = () => {
    const address =
      `${methods.watch('address')}, ${methods.watch('city')}, ${methods.watch('state')}, ${methods.watch('zip')}, ${methods.watch('country')}`.trim()
    console.log(address)
    if (address) {
      geocodeAddress(address).then((res) => {
        if (res.success && res.data) {
          methods.setValue('latitude', res.data.latitude)
          methods.setValue('longitude', res.data.longitude)
        }
      })
    }
  }

  return (
    <FormProvider {...methods}>
      <form className={styles.form} onSubmit={methods.handleSubmit(onSubmit)}>
        <Input name="name" label="Name" />
        <div className={styles.addressContainer}>
          <h2 className={styles.addressTitle}>Address</h2>
          <Input name="address" label="Address" />
          <Input name="city" label="City" />
          <Input name="state" label="Province" />
          <Input name="zip" label="Zip" />
          <Input name="country" label="Country" />
          <Input name="floorUnit" label="Floor/Unit" />
          <Input
            name="latitude"
            label="Latitude"
            containerClassName={styles.hidden}
          />
          <Input
            name="longitude"
            label="Longitude"
            containerClassName={styles.hidden}
          />
          <Button
            type="button"
            onClick={handleAddressSearch}
            disabled={result.loading}
          >
            {result.loading ? 'Searching...' : 'Search Address'}
          </Button>
          {result.error && (
            <div className="text-red-500 col-span-3">{result.error}</div>
          )}
          <div className="col-span-3">
            <PropertyMap
              latitude={result.latitude}
              longitude={result.longitude}
              className="mt-4"
            />
          </div>
          <div></div>
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </FormProvider>
  )
}

const styles = {
  // grid of 3 columns
  form: 'flex flex-col gap-4',
  hidden: 'hidden',
  addressContainer: 'grid grid-cols-3 gap-4',
  addressTitle: 'col-span-3 text-lg font-bold',
}
