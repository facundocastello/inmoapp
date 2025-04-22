'use client'

import { Plan, Tenant } from '@prisma/client'
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
import { markPaymentAsPaid } from '@/lib/actions/payments'
import { useToast } from '@/lib/hooks/useToast'

type Payment = {
  id: string
  amount: number
  status: string
  dueDate: Date
  subscription: {
    plan: Plan | null
    tenant: Tenant | null
  } | null
}

interface ManualPaymentTableProps {
  payments: Payment[]
}

export function ManualPaymentTable({ payments }: ManualPaymentTableProps) {
  const { showToast } = useToast()

  const [loadingPayments, setLoadingPayments] = useState<
    Record<string, boolean>
  >({})

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      setLoadingPayments((prev) => ({ ...prev, [paymentId]: true }))

      const result = await markPaymentAsPaid(paymentId)

      if (result.success) {
        showToast('Payment marked as paid successfully')
      } else {
        showToast(result.error || 'Failed to mark payment as paid', 'error')
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error')
    } finally {
      setLoadingPayments((prev) => ({ ...prev, [paymentId]: false }))
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Tenant</TableHeaderCell>
          <TableHeaderCell>Plan</TableHeaderCell>
          <TableHeaderCell>Amount</TableHeaderCell>
          <TableHeaderCell>Due Date</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              {payment.subscription?.tenant?.name || 'No tenant'}
            </TableCell>
            <TableCell>
              {payment.subscription?.plan?.name || 'No plan'}
            </TableCell>
            <TableCell>${payment.amount}</TableCell>
            <TableCell>
              {new Date(payment.dueDate).toLocaleDateString()}
            </TableCell>
            <TableCell>{payment.status}</TableCell>
            <TableCell>
              <Button
                onClick={() => handleMarkAsPaid(payment.id)}
                disabled={
                  loadingPayments[payment.id] || payment.status !== 'PENDING'
                }
              >
                {loadingPayments[payment.id] ? 'Processing...' : 'Mark as Paid'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
