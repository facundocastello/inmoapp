import { ContractType } from '@prisma/client'
import { useEffect, useState } from 'react'

import { Select } from '@/components/ui/forms/Select'
import { getContractTypes } from '@/lib/actions/tenant/contract-type'

interface ContractTypeStepProps {
  contractType: ContractType | null
  setContractType: (contractType: ContractType | null) => void
}

export const ContractTypeStep = ({
  contractType,
  setContractType,
}: ContractTypeStepProps) => {
  const [contractTypes, setContractTypes] = useState<ContractType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedContractTypeId, setSelectedContractTypeId] = useState<
    string | null
  >(null)
  const handleSetContractType = (contractTypeId: string) => {
    const selectedType = contractTypes.find(
      (type) => type.id === contractTypeId,
    )
    setSelectedContractTypeId(contractTypeId)
    setContractType(selectedType || null)
  }
  useEffect(() => {
    const fetchContractTypes = async () => {
      const result = await getContractTypes()
      if (result.success && result.data) {
        setContractTypes(result.data)
      }
      setIsLoading(false)
    }

    fetchContractTypes()
  }, [])

  if (isLoading) {
    return <div>Loading contract types...</div>
  }

  return (
    <div className="p-4">
      <Select
        shouldRegister={false}
        name="contractType"
        label="Contract Type"
        options={[
          { value: '', label: 'Select a contract type' },
          ...contractTypes.map((type) => ({
            value: type.id,
            label: type.name,
          })),
        ]}
        value={selectedContractTypeId || ''}
        onChange={(e) => handleSetContractType(e.target.value)}
      />
      {contractType && (
        <div className="mt-4 text-sm text-gray-500">
          {contractType.description}
        </div>
      )}
    </div>
  )
}
