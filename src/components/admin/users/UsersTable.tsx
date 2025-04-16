import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/table/Table'
import { TableCellImage } from '@/components/ui/table/Table'
import { deleteUser } from '@/lib/actions/user'

import { Prisma } from '.prisma/shared'

type Users = Prisma.UserGetPayload<{
  include: {
    content: true
  }
}>

interface UsersTableProps {
  users: Users[]
}

export const UsersTable = ({ users }: UsersTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Avatar</TableHeaderCell>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
          <TableHeaderCell>Content</TableHeaderCell>
          <TableHeaderCell>Created At</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCellImage fileKey={user.avatar as string} />
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <span
                className={`${styles.role} ${
                  user.role === 'ADMIN'
                    ? styles.admin
                    : user.role === 'EDITOR'
                      ? styles.editor
                      : styles.viewer
                }`}
              >
                {user.role}
              </span>
            </TableCell>
            <TableCell>{user.content.length}</TableCell>
            <TableCell>
              {new Date(user.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className={styles.actions}>
                <Link href={`/admin/users/${user.id}`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <form
                  action={async () => {
                    'use server'
                    await deleteUser(user.id)
                  }}
                >
                  <Button variant="outline" size="sm">
                    Delete
                  </Button>
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
  role: 'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
  admin: 'bg-primary-100 text-primary-800',
  editor: 'bg-secondary-100 text-secondary-800',
  viewer: 'bg-tertiary-100 text-tertiary-800',
  actions: 'flex space-x-2',
}
