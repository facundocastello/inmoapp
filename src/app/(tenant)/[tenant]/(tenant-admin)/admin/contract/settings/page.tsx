import { ContractTypeForm } from '@/components/admin/contract/settings/contract-type/ContractTypeForm'
import { ContractTypeTable } from '@/components/admin/contract/settings/contract-type/ContractTypeTable'
import { CurrencyForm } from '@/components/admin/contract/settings/currency/CurrencyForm'
import { CurrencyTable } from '@/components/admin/contract/settings/currency/CurrencyTable'
import { IndexForm } from '@/components/admin/contract/settings/index/IndexForm'
import { IndexTable } from '@/components/admin/contract/settings/index/IndexTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Indexes</CardTitle>
        </CardHeader>
        <CardContent>
          <IndexForm />
          <IndexTable />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Currencies</CardTitle>
        </CardHeader>
        <CardContent>
          <CurrencyForm />
          <CurrencyTable />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contract Types</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractTypeForm />
          <ContractTypeTable />
        </CardContent>
      </Card>
    </div>
  )
}
