'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/table/Table'
import { deletePlan } from '@/lib/actions/plans'

import { Plan } from '.prisma/shared'

interface PlansTableProps {
  plans: Plan[]
}

export function PlansTable({ plans }: PlansTableProps) {
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({})

  const handleDelete = async (planId: string) => {
    try {
      setIsDeleting((prev) => ({ ...prev, [planId]: true }))
      await deletePlan(planId)
    } catch (error) {
      console.error('Error deleting plan:', error)
    } finally {
      setIsDeleting((prev) => ({ ...prev, [planId]: false }))
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Description</TableHeaderCell>
          <TableHeaderCell>Price</TableHeaderCell>
          <TableHeaderCell>Features</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plans.map((plan) => (
          <TableRow key={plan.id}>
            <TableCell>{plan.name}</TableCell>
            <TableCell>{plan.description || '-'}</TableCell>
            <TableCell>${plan.price}</TableCell>
            <TableCell>
              <div className={styles.features}>
                {Object.entries(plan.features as Record<string, any>).map(
                  ([key, value]) => (
                    <div key={key} className={styles.feature}>
                      {key}:{' '}
                      {typeof value === 'number' ? value : value ? 'Yes' : 'No'}
                    </div>
                  ),
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className={styles.actions}>
                <Link href={`/super-admin/plans/${plan.id}/edit`}>
                  <Button variant="outline">Edit</Button>
                </Link>
                <Button
                  variant="ghost"
                  className={styles.deleteButton}
                  onClick={() => handleDelete(plan.id)}
                  disabled={isDeleting[plan.id]}
                >
                  {isDeleting[plan.id] ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const styles = {
  features: 'space-y-1',
  feature: 'text-sm',
  actions: 'space-x-2',
  deleteButton: 'text-red-600 hover:text-red-700',
}
