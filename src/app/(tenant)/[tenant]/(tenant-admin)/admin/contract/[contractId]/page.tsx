import { notFound, redirect } from 'next/navigation'

import DownloadTemplates from '@/components/admin/contract/DownloadTemplates'
import { ContractWizard } from '@/components/admin/contract-creation/ContractWizard'
import { getContract } from '@/lib/actions/tenant/contract'

export default async function ContractPage({
  params,
}: {
  params: Promise<{ contractId?: string }>
}) {
  const { contractId } = await params
  const contract = contractId ? await getContract({ id: contractId }) : null
  if (contractId && !contract) return notFound()

  if (contract?.data?.status === 'DRAFT')
    redirect(`/admin/contract/new?contractId=${contractId}`)

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit Contract</h1>
      <ContractWizard
        mode="edit"
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
      <div className="p-4">
        {contract?.data && (
          <DownloadTemplates
            contractName={contract?.data?.name || ''}
            templates={contract?.data?.contractType?.templates || []}
            contract={contract?.data}
          />
        )}
      </div>
    </div>
  )
}

const styles = {
  container: 'container mx-auto py-6',
  title: 'text-2xl font-bold mb-6',
}
