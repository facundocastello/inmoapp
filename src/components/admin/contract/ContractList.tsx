import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getContracts } from '@/lib/actions/tenant/contract'

export default async function ContractList() {
  const contracts = await getContracts()

  if (!contracts.success) {
    return (
      <div>
        Error: {'error' in contracts ? contracts.error : 'Unknown error'}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contratos</h1>
        <Link href="/admin/contract/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Contrato
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contracts.data?.map((contract) => (
          <Link
            key={contract.id}
            href={`/admin/contract/${
              contract.status === 'DRAFT' ? 'new?contractId=' : ''
            }${contract.id}`}
            className="block"
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">{contract.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Propiedad:</span>{' '}
                    {contract.property?.name || 'Sin propiedad asignada'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Dirección:</span>{' '}
                    {contract.property?.address || 'No definida'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Ocupante:</span>{' '}
                    {contract.occupant
                      ? `${contract.occupant?.firstName} ${contract.occupant?.lastName}`
                      : 'No definido'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Applicant:</span>{' '}
                    {contract.applicant
                      ? `${contract.applicant?.firstName} ${contract.applicant?.lastName}`
                      : 'No definido'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Inicio:</span>{' '}
                    {contract.startDate
                      ? format(contract.startDate, 'PPP', { locale: es })
                      : 'No definido'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Fin:</span>{' '}
                    {contract.endDate
                      ? format(contract.endDate, 'PPP', { locale: es })
                      : 'No definido'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Duración:</span>{' '}
                    {contract.duration
                      ? `${contract.duration} meses`
                      : 'No definida'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Estado:</span>{' '}
                    {contract.status}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
