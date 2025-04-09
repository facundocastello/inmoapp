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
import { formatDate } from '@/lib/utils/date'

interface Page {
  id: string
  title: string
  slug: string
  isActive: boolean
  isFeatured: boolean
  isHome: boolean
  createdAt: Date
  author: {
    name: string
    email: string
  }
  content: {
    id: string
    title: string
  }[]
}

interface PagesTableProps {
  pages: Page[]
}

export function PagesTable({ pages }: PagesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Title</TableHeaderCell>
          <TableHeaderCell>Slug</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Sections</TableHeaderCell>
          <TableHeaderCell>Author</TableHeaderCell>
          <TableHeaderCell>Created</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pages.map((page) => (
          <TableRow key={page.id}>
            <TableCell>{page.title}</TableCell>
            <TableCell>{page.slug}</TableCell>
            <TableCell>
              <div className={styles.statusContainer}>
                {page.isHome && <span className={styles.homeBadge}>Home</span>}
                {page.isFeatured && (
                  <span className={styles.featuredBadge}>Featured</span>
                )}
                {page.isActive ? (
                  <span className={styles.activeBadge}>Active</span>
                ) : (
                  <span className={styles.inactiveBadge}>Inactive</span>
                )}
              </div>
            </TableCell>
            <TableCell>{page.content.length}</TableCell>
            <TableCell>
              <div>
                <div className={styles.authorName}>{page.author.name}</div>
                <div className={styles.authorEmail}>{page.author.email}</div>
              </div>
            </TableCell>
            <TableCell>{formatDate(page.createdAt)}</TableCell>
            <TableCell>
              <div className={styles.actions}>
                <Link href={`/admin/pages/${page.id}`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const styles = {
  statusContainer: 'flex gap-2',
  homeBadge: 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-800',
  featuredBadge: 'px-2 py-1 text-xs rounded bg-purple-100 text-purple-800',
  activeBadge: 'px-2 py-1 text-xs rounded bg-green-100 text-green-800',
  inactiveBadge: 'px-2 py-1 text-xs rounded bg-red-100 text-red-800',
  authorName: 'font-medium',
  authorEmail: 'text-sm text-gray-500',
  actions: 'flex gap-2',
}
