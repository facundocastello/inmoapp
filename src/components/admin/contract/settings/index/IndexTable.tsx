import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/table/StatusBadge'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/table/Table'
import {
  addIndexValue,
  deleteIndex,
  getIndexes,
} from '@/lib/actions/tenant/index'
import { revalidateTenantSubdomainPath } from '@/lib/get-tenant'

import AddHistoricValue from '../AddHistoricValue'

export async function IndexTable() {
  const result = await getIndexes()
  if (!result.success) {
    return <div>Error loading indexes</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Current Value</TableHeaderCell>
          <TableHeaderCell>Update Frequency</TableHeaderCell>
          <TableHeaderCell>Source</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {result.data?.map((index) => (
          <TableRow key={index.id}>
            <TableCell>{index.name}</TableCell>
            <TableCell>{index.currentValue}</TableCell>
            <TableCell>{index.updateFrequency}</TableCell>
            <TableCell>{index.source}</TableCell>
            <TableCell>
              <StatusBadge status={index.isActive ? 'active' : 'inactive'}>
                {index.isActive ? 'Active' : 'Inactive'}
              </StatusBadge>
            </TableCell>
            <TableCell>
              <Button
                onClick={async () => {
                  'use server'
                  const result = await deleteIndex({ id: index.id })
                  if (result.success)
                    revalidateTenantSubdomainPath('/admin/contract/settings')
                }}
              >
                Delete
              </Button>
              <AddHistoricValue
                handleAddHistoricValue={async (value) => {
                  'use server'
                  const result = await addIndexValue({
                    id: index.id,
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
