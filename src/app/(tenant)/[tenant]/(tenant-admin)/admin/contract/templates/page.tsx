import { Plus } from 'lucide-react'

import { ContractTemplateEditor } from '@/components/admin/contract/ContractTemplateEditor'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { requireTenantId } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'

export default async function ContractTemplatesPage() {
  const { tenantId } = await requireTenantId()
  const contractTypes = await prisma.contractType.findMany({
    where: { tenantId },
    select: {
      id: true,
      name: true,
      description: true,
      templates: true,
    },
  })

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contract Templates</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Template
        </Button>
      </div>

      <div className="grid gap-6">
        {contractTypes.map((type) => (
          <Card key={type.id}>
            <CardHeader>
              <CardTitle>{type.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ContractTemplateEditor
                contractTypeId={type.id}
                templates={type.templates}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
