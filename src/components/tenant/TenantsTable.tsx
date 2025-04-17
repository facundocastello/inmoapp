import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableCellImage,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/table/Table'
import { deleteTenant, Tenants } from '@/lib/actions/tenant'

interface TenantsTableProps {
  tenants: Tenants['data']
  forceDelete?: string
}

export const TenantsTable = ({ tenants, forceDelete }: TenantsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Icon</TableHeaderCell>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Subdomain</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Created At</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tenants.map((tenant) => (
          <TableRow key={tenant.id}>
            <TableCellImage fileKey={tenant.logo} />
            <TableCell>{tenant.name}</TableCell>
            <TableCell>{tenant.subdomain}</TableCell>
            <TableCell>
              <span
                className={`${styles.status} ${
                  tenant.isActive ? styles.active : styles.inactive
                }`}
              >
                {tenant.isActive ? 'Active' : 'Inactive'}
              </span>
            </TableCell>
            <TableCell>
              {new Date(tenant.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className={styles.actions}>
                <Link href={`/super-admin/tenants/${tenant.id}`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <form
                  action={async () => {
                    'use server'
                    const deleteResult = await deleteTenant(
                      tenant.id,
                      forceDelete === tenant.id,
                    )
                    if (
                      !deleteResult.success &&
                      deleteResult.reason === 'Can only delete test tenants'
                    ) {
                      redirect(`/super-admin/tenants?forceDelete=${tenant.id}`)
                    }
                  }}
                >
                  <Button variant="outline" size="sm">
                    {forceDelete === tenant.id ? 'Force' : ''} Delete
                  </Button>
                  <Link
                    className={styles.visitLink}
                    href={`http://${tenant.subdomain}.localhost:3000/login`}
                  >
                    Visit
                  </Link>
                </form>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const styles = {
  status: 'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
  active: 'bg-success-100 text-success-800',
  inactive: 'bg-error-100 text-error-800',
  actions: 'flex space-x-2',
  visitLink: 'text-primary-500 mx-4',
}
