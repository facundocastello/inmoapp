import { notFound, redirect } from 'next/navigation'

import { ContractWizard } from '@/components/admin/contract-creation/ContractWizard'
import { getContract } from '@/lib/actions/tenant/contract'

export default async function NewContractPage({
  searchParams,
}: {
  searchParams: Promise<{ contractId?: string }>
}) {
  const { contractId } = await searchParams
  const contract = contractId ? await getContract({ id: contractId }) : null
  if (contractId && !contract) return notFound()

  if (contract?.data?.status === 'PENDING')
    redirect(`/admin/contract/${contractId}`)
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create New Contract</h1>
      <ContractWizard
        mode={contractId ? 'draft' : 'create'}
        contractId={contractId}
        defaultValues={
          contract?.data
            ? {
                name: contract.data.name,
                property: contract.data.property,
                owner: contract.data.property?.owner || null,
                occupant: contract.data.occupant,
                applicant: contract.data.applicant,
                contractType: contract.data.contractType,
                priceCalculation: contract.data.priceCalculation,
                guarantees: contract.data.guarantees,
                status: contract.data.status,
              }
            : undefined
        }
      />
    </div>
  )
}

const styles = {
  container: 'container mx-auto py-6',
  title: 'text-2xl font-bold mb-6',
}
