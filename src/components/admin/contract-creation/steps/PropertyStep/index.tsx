'use client'
import { Property } from '@prisma/client'
import { XIcon } from 'lucide-react'
import { useState } from 'react'

import PropertyForm from '@/components/admin/properties/PropertyForm'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { searchProperties } from '@/lib/actions/tenant/property'

export const PropertyStep = ({
  property,
  setProperty,
}: {
  property: Property | null
  setProperty: (property: Property | null) => void
}) => {
  const [shouldCreateNewProperty, setShouldCreateNewProperty] = useState(false)
  const handleSetProperty = (property: Property | null) => {
    setProperty(property)
  }

  const handleShouldCreateNewProperty = () => {
    setShouldCreateNewProperty(!shouldCreateNewProperty)
    handleSetProperty(null)
  }

  if (property) {
    return (
      <div className={styles.selectedContainer}>
        <div>
          <h3>{property.address}</h3>
          <p>
            {property.city}, {property.state}, {property.zip}
          </p>
        </div>
        <XIcon
          className={styles.xIcon}
          onClick={() => handleSetProperty(null)}
        />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Select Property</h2>
      {shouldCreateNewProperty && !property ? (
        <PropertyForm onSuccess={handleSetProperty} />
      ) : (
        <SearchInput
          onSelect={(property) => handleSetProperty(property)}
          selectedItem={property}
          handleSearch={searchProperties}
          renderItem={(property) => (
            <div>
              <h3>{property.address}</h3>
              <p>
                {property.city}, {property.state}, {property.zip}
              </p>
            </div>
          )}
        />
      )}
      <Button onClick={handleShouldCreateNewProperty}>
        {shouldCreateNewProperty
          ? 'Cancel and go back to search'
          : 'Or Create New Property'}
      </Button>
    </div>
  )
}

const styles = {
  container: 'flex flex-col space-y-4',
  title: 'text-xl font-semibold',
  form: 'flex flex-col space-y-4',
  selectedContainer: 'flex items-center justify-between',
  xIcon:
    'w-8 h-8 border border-primary-300 rounded-full p-1 hover:border-primary-100 hover:text-primary-300 cursor-pointer',
}
