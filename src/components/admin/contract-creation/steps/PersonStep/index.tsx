'use client'
import { Person } from '@prisma/client'
import { XIcon } from 'lucide-react'
import { useState } from 'react'

import PersonForm from '@/components/admin/people/PersonForm'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { searchPeople } from '@/lib/actions/tenant/person'

export const PersonStep = ({
  person,
  setPerson,
  title,
}: {
  person: Person | null
  setPerson: (person: Person | null) => void
  title: string
}) => {
  const [shouldCreateNewPerson, setShouldCreateNewPerson] = useState(false)
  const handleSetPerson = (person: Person | null) => {
    setPerson(person)
  }

  const handleShouldCreateNewPerson = () => {
    setShouldCreateNewPerson(!shouldCreateNewPerson)
    handleSetPerson(null)
  }

  if (person) {
    return (
      <div className={styles.selectedContainer}>
        <div>
          <h3>
            {person.firstName} {person.lastName}
          </h3>
          <p>
            {person.documentType}: {person.document}
          </p>
          <p>{person.email}</p>
        </div>
        <XIcon className={styles.xIcon} onClick={() => handleSetPerson(null)} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Select {title}</h2>
      {shouldCreateNewPerson && !person ? (
        <PersonForm onSuccess={handleSetPerson} />
      ) : (
        <SearchInput
          onSelect={(person) => handleSetPerson(person)}
          selectedItem={person}
          handleSearch={searchPeople}
          renderItem={(person) => (
            <div>
              <h3>
                {person.firstName} {person.lastName}
              </h3>
              <p>
                {person.documentType}: {person.document}
              </p>
              <p>{person.email}</p>
            </div>
          )}
        />
      )}
      <Button onClick={handleShouldCreateNewPerson}>
        {shouldCreateNewPerson && !person
          ? 'Cancel and go back to search'
          : 'Or Create New Person'}
      </Button>
    </div>
  )
}

const styles = {
  container: 'flex flex-col space-y-4',
  title: 'text-xl font-semibold',
  selectedContainer: 'flex items-center justify-between',
  xIcon:
    'w-8 h-8 border border-primary-300 rounded-full p-1 hover:border-primary-100 hover:text-primary-300 cursor-pointer',
}
