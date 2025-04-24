'use client'

import {
  Contract,
  ContractType,
  Guarantee,
  Person,
  PriceCalculation,
  Property,
} from '@prisma/client'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import { useState } from 'react'

import {
  Accordion,
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { ContractForm } from '@/lib/actions/tenant/schemas'
import { cn } from '@/lib/utils'

import { PersonStep } from './steps/PersonStep'
import { PropertyStep } from './steps/PropertyStep'

interface ContractWizardProps {
  _mode: 'create' | 'edit'
  _defaultValues?: Partial<ContractForm>
  _contractId?: string
  _onComplete?: (contract: Contract) => void
}

export const ContractWizard = ({
  _mode,
  _defaultValues,
  _contractId,
  _onComplete,
}: ContractWizardProps) => {
  const [property, setProperty] = useState<Property | null>(null)
  const [owner, setOwner] = useState<Person | null>(null)
  const [applicant, setApplicant] = useState<Person | null>(null)
  const [occupant, setOccupant] = useState<Person | null>(null)
  const [contractType] = useState<ContractType | null>(null)
  const [priceCalculation] = useState<PriceCalculation | null>(null)
  const [guarantees] = useState<Guarantee[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading] = useState(false)

  const handleSetProperty = (property: Property | null) => {
    setProperty(property)
    if (!property) return
    setCurrentStep(currentStep + 1)
  }

  const handleSetOwner = (owner: Person | null) => {
    setOwner(owner)
    if (!owner) return
    setCurrentStep(currentStep + 1)
  }

  const handleSetApplicant = (applicant: Person | null) => {
    setApplicant(applicant)
    if (!applicant) return
    if (!occupant) setOccupant(applicant)
    setCurrentStep(currentStep + 1)
  }

  const handleSetOccupant = (occupant: Person | null) => {
    setOccupant(occupant)
    if (!occupant) return
    setCurrentStep(currentStep + 1)
  }

  const sections = [
    {
      id: 'property',
      title: 'Property',
      content: (
        <PropertyStep property={property} setProperty={handleSetProperty} />
      ),
    },
    {
      id: 'owner',
      title: 'Owner',
      content: (
        <PersonStep person={owner} setPerson={handleSetOwner} title="Owner" />
      ),
    },
    {
      id: 'applicant',
      title: 'Applicant',
      content: (
        <PersonStep
          person={applicant}
          setPerson={handleSetApplicant}
          title="Applicant"
        />
      ),
    },
    {
      id: 'occupant',
      title: 'Occupant',
      content: (
        <PersonStep
          person={occupant}
          setPerson={handleSetOccupant}
          title="Occupant"
        />
      ),
    },
    {
      id: 'contract-type',
      title: 'Contract Type',
      content: <div>Contract Type Step</div>,
    },
    {
      id: 'price-calculation',
      title: 'Price Calculation',
      content: <div>Price Calculation Step</div>,
    },
    {
      id: 'guarantees',
      title: 'Guarantees',
      content: <div>Guarantees Step</div>,
    },
    { id: 'summary', title: 'Summary', content: <div>Summary Step</div> },
  ]

  const buttonIsDisabledReasonMap = [
    !property && 'Please select a property',
    !owner && 'Please select an owner',
    !applicant
      ? 'Please select an applicant'
      : applicant?.id === owner?.id && 'Applicant cannot be the same as owner',
    !occupant && 'Please select an occupant',
    !contractType && 'Please select a contract type',
    !priceCalculation && 'Please select a price calculation',
    !guarantees && 'Please select guarantees',
  ]

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1)
  }

  return (
    <div className={styles.form}>
      <div className={styles.header}>
        <h2 className={styles.title}>Create Contract</h2>
      </div>

      <div className={styles.navigation}>
        <div className={styles.navButtons}>
          <Button
            type="button"
            onClick={handlePreviousStep}
            disabled={currentStep <= 0}
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <div className={styles.progress}>
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={cn(
                  styles.progressDot,
                  buttonIsDisabledReasonMap[index] &&
                    styles.progressDotDisabled,
                  index === currentStep
                    ? 'bg-primary-500'
                    : index < currentStep
                      ? 'bg-primary-200'
                      : 'bg-primary-900',
                )}
              />
            ))}
          </div>
          <Button type="button" onClick={handleNextStep}>
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Accordion
        className="w-full"
        value={currentStep === -1 ? '' : sections[currentStep].id}
        onValueChange={(value: string) => {
          const index = sections.findIndex((section) => section.id === value)
          setCurrentStep(index)
        }}
      >
        {sections.map((section, index) => (
          <CustomAccordionItem key={section.id} value={section.id}>
            <CustomAccordionTrigger>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{section.title}</span>
                {buttonIsDisabledReasonMap[index] && (
                  <span className="text-xs text-red-500">
                    ({buttonIsDisabledReasonMap[index]})
                  </span>
                )}
              </div>
            </CustomAccordionTrigger>
            <CustomAccordionContent>{section.content}</CustomAccordionContent>
          </CustomAccordionItem>
        ))}
      </Accordion>

      <div className={styles.footer}>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Create Contract'}
        </Button>
      </div>
    </div>
  )
}

const styles = {
  form: 'flex flex-col space-y-6',
  header: 'flex items-center justify-between mb-6',
  title: 'text-lg font-medium',
  progressDotDisabled: 'border-1 border-error-500',
  navigation:
    'sticky top-0 bg-primary-100 py-2 px-3 rounded-xl shadow-sm mb-3 z-50',
  progress: 'flex items-center space-x-2 mx-auto',
  progressDot: 'w-3 h-3 rounded-full',
  navButtons: 'flex justify-between items-center',
  content: 'mt-6 pt-6 px-6 bg-primary-200/30 min-h-[50rem] rounded-xl',
  footer: 'flex justify-end mb-2',
  buttonPrimary:
    'px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90',
  buttonSecondary:
    'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50',
  buttonContent: 'group relative',
  buttonDisabledReason: 'text-red-500',
}
