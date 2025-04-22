import { Button } from '@/components/ui/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/table/Table'
import {
  addCurrencyValue,
  deleteCurrency,
  getCurrencies,
} from '@/lib/actions/tenant/currency'
import { revalidateTenantSubdomainPath } from '@/lib/get-tenant'

import AddHistoricValue from '../AddHistoricValue'

export async function CurrencyTable() {
  const result = await getCurrencies()
  if (!result.success || !result.data)
    return <div>Error loading currencies</div>
  const currencies = result.data

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Type</TableHeaderCell>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Description</TableHeaderCell>
          <TableHeaderCell>Value in Pesos</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {currencies.map((currency) => (
          <TableRow key={currency.id}>
            <TableCell>{currency.type}</TableCell>
            <TableCell>{currency.name}</TableCell>
            <TableCell>{currency.description}</TableCell>
            <TableCell>{currency.valueInPesos}</TableCell>
            <TableCell>
              <Button
                onClick={async () => {
                  'use server'
                  const result = await deleteCurrency({ id: currency.id })
                  if (result.success)
                    revalidateTenantSubdomainPath('/admin/contract/settings')
                }}
              >
                Delete
              </Button>
              <AddHistoricValue
                handleAddHistoricValue={async (value) => {
                  'use server'
                  const result = await addCurrencyValue({
                    id: currency.id,
                    value: parseFloat(value),
                  })
                  if (result.success)
                    revalidateTenantSubdomainPath('/admin/contract/settings')
                }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
