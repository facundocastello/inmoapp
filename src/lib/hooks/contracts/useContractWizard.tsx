import { Property } from '@prisma/client'
import { Person } from '@prisma/client'
import { ContractType, PriceCalculation } from '@prisma/client'
import { Contract } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { ContractTypeStep } from '@/components/admin/contract-creation/steps/ContractTypeStep'
import { GuaranteeStep } from '@/components/admin/contract-creation/steps/GuaranteeStep'
import { PersonStep } from '@/components/admin/contract-creation/steps/PersonStep'
import { PriceCalculationStep } from '@/components/admin/contract-creation/steps/PriceCalculationStep'
import { PropertyStep } from '@/components/admin/contract-creation/steps/PropertyStep'
import { Input } from '@/components/ui/forms/Input'
import {
  appendGuarantee,
  createContract,
  updateContract,
} from '@/lib/actions/tenant/contract'
import { GuaranteeWithRelations } from '@/lib/actions/tenant/guarantee'
import { getPerson } from '@/lib/actions/tenant/person'
import { updateProperty } from '@/lib/actions/tenant/property'
import { ContractForm } from '@/lib/actions/tenant/schemas'

export interface ContractWizardProps {
  mode: 'draft' | 'create' | 'edit'
  contractId?: string
  defaultValues?: ContractState
  _onComplete?: (contract: Contract) => void
}

interface ContractState {
  name: string
  property: Property | null
  owner: Person | null
  applicant: Person | null
  occupant: Person | null
  contractType: ContractType | null
  priceCalculation: PriceCalculation | null
  guarantees: GuaranteeWithRelations[]
  status:
    | 'DRAFT'
    | 'PENDING'
    | 'ACTIVE'
    | 'TERMINATED'
    | 'EXPIRED'
    | 'CANCELLED'
}

export const useContractWizard = ({
  mode,
  contractId: initialContractId,
  defaultValues,
}: ContractWizardProps) => {
  const router = useRouter()
  const [state, setState] = useState<ContractState>({
    name: defaultValues?.name || '',
    property: defaultValues?.property || null,
    owner: defaultValues?.owner || null,
    applicant: defaultValues?.applicant || null,
    occupant: defaultValues?.occupant || null,
    contractType: defaultValues?.contractType || null,
    priceCalculation: defaultValues?.priceCalculation || null,
    guarantees: defaultValues?.guarantees || [],
    status: defaultValues?.status || 'DRAFT',
  })
  const [currentStep, setCurrentStep] = useState<number>(
    checkEmptyField(defaultValues) || 0,
  )

  const [isLoading, setIsLoading] = useState(false)
  const [contractId, setContractId] = useState<string | null>(
    initialContractId || null,
  )

  const updateContractState = async (
    updates: Partial<ContractForm>,
    force = false,
  ) => {
    if (!contractId || (mode === 'edit' && !force)) return

    try {
      await updateContract({
        id: contractId,
        data: updates,
      })
    } catch (error) {
      console.error('Error updating contract:', error)
    }
  }

  const handleSetContractName = async (name: string) => {
    setState((prev) => ({ ...prev, name }))
    if (!name) return
    if (mode === 'create') {
      setIsLoading(true)
      try {
        const result = await createContract({
          data: { name, status: 'DRAFT' },
        })

        if (result.success && result.data) {
          setContractId(result.data.id)
          router.push(`/admin/contract/new?contractId=${result.data.id}`)
        }
      } catch (error) {
        console.error('Error creating contract:', error)
      } finally {
        setIsLoading(false)
      }
    }

    handleNextStep()
  }

  const handleSetProperty = async (property: Property | null) => {
    const owner = property?.ownerId
      ? await getPerson({ id: property?.ownerId })
      : { data: null }
    setState((prev) => ({ ...prev, property, owner: owner.data || null }))
    if (!property || !contractId) return
    await updateContractState({ propertyId: property.id })
    setCurrentStep((prev) => prev + (owner.data ? 2 : 1))
  }

  const handleSetOwner = async (owner: Person | null) => {
    setState((prev) => ({ ...prev, owner }))
    if (!owner || !contractId || !state.property) return

    await updateProperty({
      id: state.property.id,
      data: { ownerId: owner.id },
    })
    handleNextStep()
  }

  const handleSetApplicant = async (applicant: Person | null) => {
    setState((prev) => ({ ...prev, applicant }))
    if (!applicant || !contractId) return

    await updateContractState({
      applicantId: applicant.id,
      occupantId: state.occupant?.id || applicant.id,
    })

    if (!state.occupant) {
      setState((prev) => ({ ...prev, occupant: applicant }))
    }
    handleNextStep()
  }

  const handleSetOccupant = async (occupant: Person | null) => {
    setState((prev) => ({ ...prev, occupant }))
    if (!occupant || !contractId) return

    await updateContractState({ occupantId: occupant.id })
    handleNextStep()
  }

  const handleSetContractType = async (contractType: ContractType | null) => {
    setState((prev) => ({ ...prev, contractType }))
    if (!contractType || !contractId) return

    await updateContractState({
      contractTypeId: contractType.id,
    })
    handleNextStep()
  }

  const handleSetPriceCalculation = async (
    priceCalculation: PriceCalculation | null,
  ) => {
    setState((prev) => ({ ...prev, priceCalculation }))
    if (!priceCalculation || !contractId) return

    await updateContractState({
      priceCalculationId: priceCalculation.id,
    })
    handleNextStep()
  }

  const handleAppendGuarantee = async (guarantee: GuaranteeWithRelations) => {
    if (!guarantee.id || !contractId) return

    await appendGuarantee({
      id: contractId,
      guaranteeId: guarantee.id,
    })
    setState((prev) => ({
      ...prev,
      guarantees: [...prev.guarantees, guarantee],
    }))
  }

  const handleDeleteGuarantee = async (guaranteeId: string) => {
    setState((prev) => ({
      ...prev,
      guarantees: prev.guarantees.filter((g) => g.id !== guaranteeId),
    }))
  }

  const handleUpdateGuarantee = async (guarantee: GuaranteeWithRelations) => {
    setState((prev) => ({
      ...prev,
      guarantees: prev.guarantees.map((g) =>
        g.id === guarantee.id ? guarantee : g,
      ),
    }))
  }
  const handlePreviousStep = () => setCurrentStep((prev) => prev - 1)
  const handleNextStep = () =>
    setCurrentStep(checkEmptyField(state) || currentStep + 1)

  return {
    state,
    setState,
    currentStep,
    setCurrentStep,
    isLoading,
    contractId,
    handleAppendGuarantee,
    handleUpdateGuarantee,
    handleDeleteGuarantee,
    handleSetContractName,
    handleSetProperty,
    handleSetOwner,
    handleSetApplicant,
    handleSetOccupant,
    handleSetContractType,
    handleSetPriceCalculation,
    handlePreviousStep,
    handleNextStep,
    updateContractState,
  }
}

type ContractWizardHandlers = ReturnType<typeof useContractWizard>

export const contractWizardSections = [
  {
    id: 'name',
    title: 'Contract Name',
    subtitle: (state: ContractState) => state.name,
    content: (
      state: ContractState,
      handlers: ContractWizardHandlers,
      isLoading: boolean,
    ) => (
      <div className="p-4">
        <Input
          name="name"
          label="Contract Name"
          shouldRegister={false}
          defaultValue={state.name}
          onChange={(e) => {
            handlers.setState((prev) => ({
              ...prev,
              name: (e.target as HTMLInputElement).value,
            }))
          }}
          onBlur={(e) => handlers.handleSetContractName(e.target.value)}
          disabled={isLoading}
        />
      </div>
    ),
  },
  {
    id: 'property',
    title: 'Property',
    subtitle: (state: ContractState) =>
      state.property
        ? `${state.property.name} - ${state.property.address} - ${state.property.city}`
        : '-',
    content: (state: ContractState, handlers: ContractWizardHandlers) => (
      <PropertyStep
        property={state.property}
        setProperty={handlers.handleSetProperty}
      />
    ),
  },
  {
    id: 'owner',
    title: 'Owner',
    subtitle: (state: ContractState) => personSubtitle(state.owner),
    content: (state: ContractState, handlers: ContractWizardHandlers) =>
      state.property ? (
        <PersonStep
          person={state.owner}
          setPerson={handlers.handleSetOwner}
          title="Owner"
        />
      ) : (
        <div>Please select a property</div>
      ),
  },
  {
    id: 'applicant',
    title: 'Applicant',
    subtitle: (state: ContractState) => personSubtitle(state.applicant),
    content: (state: ContractState, handlers: ContractWizardHandlers) => (
      <PersonStep
        person={state.applicant}
        setPerson={handlers.handleSetApplicant}
        title="Applicant"
        ignorePersonIds={state.owner?.id ? [state.owner.id] : []}
      />
    ),
  },
  {
    id: 'occupant',
    title: 'Occupant',
    subtitle: (state: ContractState) => personSubtitle(state.occupant),
    content: (state: ContractState, handlers: ContractWizardHandlers) => (
      <PersonStep
        person={state.occupant}
        setPerson={handlers.handleSetOccupant}
        title="Occupant"
      />
    ),
  },
  {
    id: 'contract-type',
    title: 'Contract Type',
    subtitle: (state: ContractState) => state.contractType?.name,
    content: (state: ContractState, handlers: ContractWizardHandlers) => (
      <ContractTypeStep
        contractType={state.contractType}
        setContractType={handlers.handleSetContractType}
      />
    ),
  },
  {
    id: 'price-calculation',
    title: 'Price Calculation',
    subtitle: (state: ContractState) => state.priceCalculation?.id,
    content: (state: ContractState, handlers: ContractWizardHandlers) => (
      <PriceCalculationStep
        priceCalculation={state.priceCalculation}
        setPriceCalculation={handlers.handleSetPriceCalculation}
      />
    ),
  },
  {
    id: 'guarantees',
    title: 'Guarantees',
    subtitle: (state: ContractState) => `${state.guarantees.length} guarantees`,
    content: (state: ContractState, handlers: ContractWizardHandlers) => (
      <GuaranteeStep
        guarantees={state.guarantees}
        handleNewGuarantee={handlers.handleAppendGuarantee}
        handleUpdateGuarantee={handlers.handleUpdateGuarantee}
        handleDeleteGuarantee={handlers.handleDeleteGuarantee}
        setGuarantees={(guarantees) =>
          handlers.setState((prev) => ({ ...prev, guarantees }))
        }
      />
    ),
  },
]

const personSubtitle = (person: Person | null) =>
  person ? `${person.firstName} ${person.lastName} - ${person.document}` : '-'

export const getStepValidation = (state: ContractState) => [
  !state.name && 'Please enter a contract name',
  !state.property && 'Please select a property',
  !state.owner && 'Please select an owner',
  !state.applicant
    ? 'Please select an applicant'
    : state.applicant?.id === state.owner?.id &&
      'Applicant cannot be the same as owner',
  !state.occupant && 'Please select an occupant',
  !state.contractType && 'Please select a contract type',
  !state.priceCalculation && 'Please select a price calculation',
  !state.guarantees.length && 'Please select guarantees',
]
const stepFields = [
  { field: 'name', step: 0 },
  { field: 'property', step: 1 },
  { field: 'owner', step: 2 },
  { field: 'applicant', step: 3 },
  { field: 'occupant', step: 4 },
  { field: 'contractType', step: 5 },
  { field: 'priceCalculation', step: 6 },
  { field: 'guarantees', step: 7 },
]

const checkEmptyField = (defaultValues: ContractState | undefined) =>
  stepFields.find(({ field }) => {
    const value = defaultValues?.[field as keyof ContractState]
    if (Array.isArray(value)) return value.length === 0
    return !value
  })?.step
