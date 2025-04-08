'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/table/Table'

type Payment = {
  id: string
  amount: number
  status: string
  dueDate: Date
  reason: string | null
}

interface PaymentTableProps {
  payments: Payment[]
}

export function PaymentTable({ payments }: PaymentTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Reason</TableHeaderCell>
          <TableHeaderCell>Amount</TableHeaderCell>
          <TableHeaderCell>Due Date</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{payment.reason}</TableCell>
            <TableCell>${payment.amount}</TableCell>
            <TableCell>
              {new Date(payment.dueDate).toLocaleDateString()}
            </TableCell>
            <TableCell>{payment.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
