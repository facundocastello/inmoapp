import { ContractWizard } from '@/components/admin/contract-creation/ContractWizard'

export default function NewContractPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create New Contract</h1>
      <ContractWizard _mode="create" />
    </div>
  )
}

const styles = {
  container: 'container mx-auto py-6',
  title: 'text-2xl font-bold mb-6',
}
