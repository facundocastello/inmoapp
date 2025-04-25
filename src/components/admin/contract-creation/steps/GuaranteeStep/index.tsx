'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { GuaranteeType, Person, Property } from '@prisma/client'
import { PlusIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form'
import * as z from 'zod'

import {
  Accordion,
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { FileInput } from '@/components/ui/forms/FileInput'
import { Input } from '@/components/ui/forms/Input'
import { Select } from '@/components/ui/forms/Select'
import { SearchInput } from '@/components/ui/SearchInput'
import {
  createGuarantee,
  deleteGuarantee,
  GuaranteeWithRelations,
  updateGuarantee,
} from '@/lib/actions/tenant/guarantee'
import { guaranteeSchema } from '@/lib/actions/tenant/schemas'
import {
  searchSecurityBondCompanies,
  SecurityBondCompany,
} from '@/lib/actions/tenant/security-bond-company'
import { cn } from '@/lib/utils'

import { PersonStep } from '../PersonStep'
import { PropertyStep } from '../PropertyStep'

const guaranteesSchema = z.object({
  guarantees: z.array(guaranteeSchema),
})

type GuaranteesForm = z.infer<typeof guaranteesSchema>

interface GuaranteeStepProps {
  handleNewGuarantee: (guarantee: GuaranteeWithRelations) => void
  handleUpdateGuarantee: (guarantee: GuaranteeWithRelations) => void
  handleDeleteGuarantee: (guaranteeId: string) => void
  guarantees: GuaranteeWithRelations[]
  setGuarantees: (guarantees: GuaranteeWithRelations[]) => void
}

export const GuaranteeStep = ({
  guarantees,
  handleNewGuarantee,
  handleUpdateGuarantee,
  handleDeleteGuarantee,
}: GuaranteeStepProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const methods = useForm<GuaranteesForm>({
    resolver: zodResolver(guaranteesSchema),
    defaultValues: {
      guarantees: guarantees.map((g) => ({
        type: g.type,
        amount: g.amount,
        supportingDocs: g.supportingDocs || [],
        personId: g.personId || undefined,
        propertyId: g.propertyId || undefined,
        companyId: g.companyId || undefined,
        guaranteeId: g.id || undefined,
      })),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'guarantees',
  })

  const { watch } = methods

  const handleSaveGuarantee = async (index: number) => {
    setIsLoading(true)
    try {
      const guarantee = watch(`guarantees.${index}`)
      const {
        supportingDocs,
        amount,
        type,
        guaranteeId,
        personId,
        propertyId,
        companyId,
      } = guarantee
      if (!type) return

      const guaranteeData = {
        type,
        amount: parseFloat(amount?.toString() || '0'),
        supportingDocs: supportingDocs
          ? Array.isArray(supportingDocs)
            ? supportingDocs
            : [supportingDocs]
          : [],
        personId:
          type === 'SALARY_GUARANTEE' && personId ? personId : undefined,
        propertyId:
          type === 'PROPERTY_GUARANTEE' && propertyId ? propertyId : undefined,
        companyId: type === 'COMPANY_BOND' && companyId ? companyId : undefined,
      }

      if (guaranteeId) {
        const guarantee = await updateGuarantee(guaranteeId, guaranteeData)
        handleUpdateGuarantee(guarantee)
      } else {
        const guarantee = await createGuarantee(guaranteeData)
        handleNewGuarantee(guarantee)
        methods.setValue(`guarantees.${index}.guaranteeId`, guarantee.id)
      }
    } catch (error) {
      console.error('Error saving guarantee:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const appendGuarantee = () => {
    append({
      type: 'SALARY_GUARANTEE',
      amount: 0,
      supportingDocs: [],
    })
  }

  const handleRemove = async (index: number) => {
    const guarantee = watch(`guarantees.${index}`)
    if (guarantee.guaranteeId) {
      await deleteGuarantee(guarantee.guaranteeId)
      handleDeleteGuarantee(guarantee.guaranteeId)
    }
    remove(index)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Guarantees</h3>
        <Button onClick={appendGuarantee} type="button">
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>

      <FormProvider {...methods}>
        <Accordion>
          {fields.map((field, index) => (
            <CustomAccordionItem key={field.id} value={`guarantee-${index}`}>
              <CustomAccordionTrigger>
                <div
                  className={cn(
                    'flex items-center justify-between w-full',
                    !field.guaranteeId && 'text-amber-300',
                  )}
                >
                  <span>
                    Guarantee {index + 1} ({!field.guaranteeId && 'DRAFT'})
                  </span>
                  <XIcon
                    className="w-4 h-4 cursor-pointer hover:text-red-500"
                    onClick={() => handleRemove(index)}
                  />
                </div>
              </CustomAccordionTrigger>
              <CustomAccordionContent>
                <GuaranteeForm
                  index={index}
                  field={field}
                  initialRelations={guarantees[index]}
                  handleSaveGuarantee={handleSaveGuarantee}
                  isLoading={isLoading}
                />
              </CustomAccordionContent>
            </CustomAccordionItem>
          ))}
        </Accordion>
      </FormProvider>
    </div>
  )
}

const GuaranteeForm = ({
  index,
  field,
  handleSaveGuarantee,
  isLoading,
  initialRelations,
}: {
  index: number
  field: {
    type: GuaranteeType
    amount: number
    supportingDocs: (string | File)[]
    personId?: string
    propertyId?: string
    companyId?: string
    guaranteeId?: string
    id?: string
  }
  handleSaveGuarantee: (index: number) => void
  isLoading: boolean
  initialRelations: GuaranteeWithRelations
}) => {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(
    initialRelations?.person,
  )
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    initialRelations?.property,
  )
  const [selectedCompany, setSelectedCompany] =
    useState<SecurityBondCompany | null>(initialRelations?.company)
  const { setValue, watch } = useFormContext()

  const handleSetPerson = (person: Person | null) => {
    setSelectedPerson(person)
    setValue(`guarantees.${index}.personId`, person?.id || undefined)
  }

  const handleSetProperty = (property: Property | null) => {
    setSelectedProperty(property)
    setValue(`guarantees.${index}.propertyId`, property?.id || undefined)
  }

  const handleSetCompany = (company: SecurityBondCompany | null) => {
    setSelectedCompany(company)
    setValue(`guarantees.${index}.companyId`, company?.id || undefined)
  }

  const type = watch(`guarantees.${index}.type`)
  const amount = watch(`guarantees.${index}.amount`)
  const personId = watch(`guarantees.${index}.personId`)
  const propertyId = watch(`guarantees.${index}.propertyId`)
  const companyId = watch(`guarantees.${index}.companyId`)

  return (
    <div className="space-y-4 p-4 border rounded">
      <Select
        name={`guarantees.${index}.type`}
        label="Guarantee Type"
        options={[
          { value: '', label: 'Select Type' },
          { value: 'SALARY_GUARANTEE', label: 'Salary Guarantee' },
          {
            value: 'PROPERTY_GUARANTEE',
            label: 'Property Guarantee',
          },
          { value: 'COMPANY_BOND', label: 'Company Bond' },
        ]}
      />
      <Input name={`guarantees.${index}.amount`} label="Amount" type="number" />
      <FileInput
        name={`guarantees.${index}.supportingDocs`}
        label="Supporting Documents"
      />

      {type === 'SALARY_GUARANTEE' && (
        <PersonStep
          person={selectedPerson}
          setPerson={handleSetPerson}
          title="Guarantor"
        />
      )}

      {type === 'PROPERTY_GUARANTEE' && (
        <PropertyStep
          property={selectedProperty}
          setProperty={handleSetProperty}
        />
      )}

      {type === 'COMPANY_BOND' && (
        <SearchInput
          onSelect={handleSetCompany}
          selectedItem={selectedCompany}
          handleSearch={searchSecurityBondCompanies}
          renderItem={(company) => (
            <div>
              <h3>{company.name}</h3>
            </div>
          )}
        />
      )}

      <Button
        onClick={() => handleSaveGuarantee(index)}
        disabled={
          isLoading ||
          !type ||
          !amount ||
          (type === 'SALARY_GUARANTEE' && !personId) ||
          (type === 'PROPERTY_GUARANTEE' && !propertyId) ||
          (type === 'COMPANY_BOND' && !companyId)
        }
        className="w-full"
      >
        <PlusIcon className="w-4 h-4 mr-2" />
        {field.guaranteeId ? 'Update Guarantee' : 'Add Guarantee'}
      </Button>
    </div>
  )
}
