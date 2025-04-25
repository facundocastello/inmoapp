'use client'

import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

import {
  Accordion,
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { updateContractStatus } from '@/lib/actions/tenant/contract'
import {
  ContractWizardProps,
  contractWizardSections,
  useContractWizard,
} from '@/lib/hooks/contracts/useContractWizard'
import { getStepValidation } from '@/lib/hooks/contracts/useContractWizard'
import { cn } from '@/lib/utils'

export const ContractWizard = (props: ContractWizardProps) => {
  const router = useRouter()
  const contractWizardHandlers = useContractWizard(props)
  const {
    state,
    currentStep,
    setCurrentStep,
    isLoading,
    handlePreviousStep,
    handleNextStep,
  } = contractWizardHandlers
  const validationMessages = getStepValidation(state)
  console.log(props.defaultValues?.status)
  const handleCreateContract = async () => {
    if (!props.contractId) return
    await updateContractStatus(props.contractId, 'PENDING')
    router.push(`/admin/contracts`)
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
            {contractWizardSections.map((section, index) => (
              <div
                key={section.id}
                className={cn(
                  styles.progressDot,
                  validationMessages[index] && styles.progressDotDisabled,
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
        value={currentStep === -1 ? '' : contractWizardSections[currentStep].id}
        onValueChange={(value: string) => {
          const index = contractWizardSections.findIndex(
            (section) => section.id === value,
          )
          setCurrentStep(index)
        }}
      >
        {contractWizardSections.map((section, index) => (
          <CustomAccordionItem key={section.id} value={section.id}>
            <CustomAccordionTrigger>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{section.title}</span>
                {section.subtitle && (
                  <span className="text-xs text-gray-500">
                    ({section.subtitle(state)?.toString()})
                  </span>
                )}
                {validationMessages[index] && (
                  <span className="text-xs text-red-500">
                    ({validationMessages[index]})
                  </span>
                )}
              </div>
            </CustomAccordionTrigger>
            <CustomAccordionContent>
              {section.content(state, contractWizardHandlers, isLoading)}
            </CustomAccordionContent>
          </CustomAccordionItem>
        ))}
      </Accordion>

      <div className={styles.footer}>
        <Button
          onClick={handleCreateContract}
          type="submit"
          disabled={isLoading}
        >
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
