'use client'

import { ContractType } from '@prisma/client'
import { useEffect, useState } from 'react'

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
  deleteContractType,
  getContractTypes,
} from '@/lib/actions/tenant/contract-type'

export function ContractTypeTable() {
  const [contractTypes, setContractTypes] = useState<ContractType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadContractTypes()
  }, [])

  const loadContractTypes = async () => {
    try {
      const result = await getContractTypes()
      if (result.success && result.data) setContractTypes(result.data)
    } catch (error) {
      console.error('Error loading contract types:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteContractType({ id })
      if (result.success) {
        setContractTypes(contractTypes.filter((type) => type.id !== id))
      }
    } catch (error) {
      console.error('Error deleting contract type:', error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Description</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contractTypes.map((type) => (
          <TableRow key={type.id}>
            <TableCell>{type.name}</TableCell>
            <TableCell>{type.description}</TableCell>
            <TableCell>
              <Button onClick={() => handleDelete(type.id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
