'use client'

import { ContractTemplate } from '@prisma/client'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ContractWithRelations } from '@/lib/actions/tenant/contract'
import {
  createContractTemplate,
  removeFromContractType,
  updateContractTemplate,
} from '@/lib/actions/tenant/contract-templates'
import { useToast } from '@/lib/hooks/useToast'
import { cn } from '@/lib/utils'

interface ContractTemplateEditorProps {
  contractTypeId: string
  templates: ContractTemplate[]
}

type TemplateVariable = {
  label: string
  value: string
  render: (contract: ContractWithRelations) => string
}

type TemplateVariables = {
  [key: string]: TemplateVariable[]
}

export const AVAILABLE_VARIABLES: TemplateVariables = {
  'Detalles del Inmueble': [
    {
      label: 'Manual',
      value: '$MANUAL',
      render: (contract: ContractWithRelations) =>
        contract.property?.address || '',
    },
    {
      label: 'Dirección del Inmueble',
      value: '$DIRECCION_INMUEBLE',
      render: (contract: ContractWithRelations) =>
        contract.property?.address || '',
    },
    {
      label: 'Piso',
      value: '$PISO',
      render: (contract: ContractWithRelations) =>
        contract.property?.floorUnit || '',
    },
    {
      label: 'Ciudad',
      value: '$CIUDAD',
      render: (contract: ContractWithRelations) =>
        contract.property?.city || '',
    },
    {
      label: 'Provincia',
      value: '$PROVINCIA',
      render: (contract: ContractWithRelations) =>
        contract.property?.state || '',
    },
  ],
  'Detalles del Propietario': [
    {
      label: 'Nombre del Propietario',
      value: '$NOMBRE_PROPIETARIO',
      render: (contract: ContractWithRelations) =>
        `${contract.property?.owner?.firstName || ''} ${contract.property?.owner?.lastName || ''}`.trim(),
    },
    {
      label: 'DNI Propietario',
      value: '$DNI_PROPIETARIO',
      render: (contract: ContractWithRelations) =>
        contract.property?.owner?.document || '',
    },
    {
      label: 'Dirección Propietario',
      value: '$DIRECCION_PROPIETARIO',
      render: (contract: ContractWithRelations) =>
        contract.property?.owner?.address || '',
    },
    {
      label: 'Email Propietario',
      value: '$EMAIL_PROPIETARIO',
      render: (contract: ContractWithRelations) =>
        contract.property?.owner?.email || '',
    },
    {
      label: 'Teléfono Propietario',
      value: '$TELEFONO_PROPIETARIO',
      render: (contract: ContractWithRelations) =>
        contract.property?.owner?.phoneNumber || '',
    },
  ],
  'Detalles del Applicante': [
    {
      label: 'Nombre del Applicante',
      value: '$NOMBRE_APPLICANTE',
      render: (contract: ContractWithRelations) =>
        `${contract.applicant?.firstName || ''} ${contract.applicant?.lastName || ''}`.trim(),
    },
    {
      label: 'DNI Applicante',
      value: '$DNI_APPLICANTE',
      render: (contract: ContractWithRelations) =>
        contract.applicant?.document || '',
    },
    {
      label: 'Dirección Applicante',
      value: '$DIRECCION_APPLICANTE',
      render: (contract: ContractWithRelations) =>
        contract.applicant?.address || '',
    },
    {
      label: 'Email Applicante',
      value: '$EMAIL_APPLICANTE',
      render: (contract: ContractWithRelations) =>
        contract.applicant?.email || '',
    },
    {
      label: 'Teléfono Applicante',
      value: '$TELEFONO_APPLICANTE',
      render: (contract: ContractWithRelations) =>
        contract.applicant?.phoneNumber || '',
    },
  ],
  'Detalles del Inquilino': [
    {
      label: 'Nombre del Inquilino',
      value: '$NOMBRE_INQUILINO',
      render: (contract: ContractWithRelations) =>
        `${contract.occupant?.firstName || ''} ${contract.occupant?.lastName || ''}`.trim(),
    },
    {
      label: 'DNI Inquilino',
      value: '$DNI_INQUILINO',
      render: (contract: ContractWithRelations) =>
        contract.occupant?.document || '',
    },
    {
      label: 'Dirección Inquilino',
      value: '$DIRECCION_INQUILINO',
      render: (contract: ContractWithRelations) =>
        contract.occupant?.address || '',
    },
    {
      label: 'Email Inquilino',
      value: '$EMAIL_INQUILINO',
      render: (contract: ContractWithRelations) =>
        contract.occupant?.email || '',
    },
    {
      label: 'Teléfono Inquilino',
      value: '$TELEFONO_INQUILINO',
      render: (contract: ContractWithRelations) =>
        contract.occupant?.phoneNumber || '',
    },
  ],
  'Detalles del Contrato': [
    {
      label: 'Fecha Inicio',
      value: '$FECHA_INICIO',
      render: (contract: ContractWithRelations) =>
        contract.startDate?.toLocaleDateString() || '',
    },
    {
      label: 'Fecha Fin',
      value: '$FECHA_FIN',
      render: (contract: ContractWithRelations) =>
        contract.endDate?.toLocaleDateString() || '',
    },
    {
      label: 'Duración Contrato',
      value: '$DURACION_CONTRATO',
      render: (contract: ContractWithRelations) =>
        contract.duration?.toString() || '',
    },
    {
      label: 'Monto Alquiler',
      value: '$MONTO_ALQUILER',
      render: (contract: ContractWithRelations) =>
        (contract.priceCalculation?.initialPrice || 0).toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
        }),
    },
    // {
    //   label: 'Monto Depósito',
    //   value: '$MONTO_DEPOSITO',
    //   render: (contract: ContractWithRelations) =>
    //     contract.priceCalculation?.depositAmount.toLocaleString('es-AR', {
    //       style: 'currency',
    //       currency: 'ARS',
    //     }),
    // },
    // {
    //   label: 'Destino',
    //   value: '$DESTINO',
    //   render: (contract: ContractWithRelations) => contract.purpose,
    // },
  ],
}

export function ContractTemplateEditor({
  contractTypeId,
  templates: initialTemplates,
}: ContractTemplateEditorProps) {
  const { showToast } = useToast()
  const [activeTemplate, setActiveTemplate] = useState<ContractTemplate | null>(
    null,
  )
  const [content, setContent] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [templates, setTemplates] = useState(initialTemplates || [])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAddTemplate = async () => {
    try {
      const updatedTemplates = await createContractTemplate({
        data: {
          name: templateName,
          template: '',
          isPublic: false,
          contractTypeIds: [contractTypeId],
        },
      })

      if (!updatedTemplates.success || !updatedTemplates.data) {
        throw new Error('Failed to add template')
      }

      setTemplates([...templates, updatedTemplates.data])
      setActiveTemplate(updatedTemplates.data)
      showToast('Template added successfully', 'success')
    } catch (error) {
      showToast('Failed to add template', 'error')
    }
  }

  const handleSaveTemplate = async () => {
    try {
      if (!activeTemplate?.id) return showToast('No template selected', 'error')
      const updatedTemplates = await updateContractTemplate({
        id: activeTemplate?.id,
        data: {
          template: content,
          name: templateName,
        },
      })

      if (!updatedTemplates.success || !updatedTemplates.data) {
        throw new Error('Failed to update template')
      }

      setTemplates(
        templates.map((t) =>
          t.id === activeTemplate?.id ? updatedTemplates.data : t,
        ),
      )
      showToast('Template updated successfully', 'success')
    } catch (error) {
      showToast('Failed to update template', 'error')
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const deletedTemplate = await removeFromContractType({
        contractTypeId,
        templateId,
      })
      if (!deletedTemplate.success || !deletedTemplate.data) {
        throw new Error('Failed to delete template')
      }
      setTemplates(templates.filter(({ id }) => id !== templateId))
      setActiveTemplate(null)
      showToast('Template deleted successfully', 'success')
    } catch (error) {
      showToast('Failed to delete template', 'error')
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: activeTemplate?.template || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setContent(html)
    },
  })

  useEffect(() => {
    if (editor && activeTemplate) {
      editor.commands.setContent(activeTemplate.template || '')
    }
  }, [activeTemplate?.id])

  const handleInsertVariable = (variable: string) => {
    if (!editor) return
    editor.commands.insertContent(variable)
  }

  if (!mounted) {
    return <div>Loading editor...</div>
  }

  return (
    <div className="">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Available Variables
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(AVAILABLE_VARIABLES).map(([category, variables]) => (
            <details className="w-full" key={category}>
              <summary className="text-sm font-medium mb-2">{category}</summary>
              <div className="flex flex-wrap gap-2">
                {variables.map((variable) => (
                  <Button
                    key={variable.value}
                    variant="text"
                    className={cn(
                      'border',
                      activeTemplate?.template?.includes(variable.value)
                        ? 'bg-primary-400'
                        : 'bg-primary-200',
                    )}
                    onClick={() => handleInsertVariable(variable.value)}
                  >
                    {variable.label}
                  </Button>
                ))}
              </div>
            </details>
          ))}
        </CardContent>
      </Card>
      <div className="md:col-span-3">
        <Tabs value={activeTemplate?.id}>
          <TabsList>
            {templates.map((template) => (
              <TabsTrigger
                key={template.id}
                value={template.id}
                onClick={() => {
                  setActiveTemplate(template)
                  setTemplateName(template.name || '')
                }}
              >
                {template.name || 'No Name'}
              </TabsTrigger>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={handleAddTemplate}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TabsList>
          {templates.map((template) => (
            <TabsContent key={`template-${template.id}`} value={template.id}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveTemplate}
                  >
                    Save Template
                  </Button>
                </div>
                <input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Nombre de la plantilla"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <div className="space-y-4">
                  <div className="border rounded-md">
                    <div className="border-b p-2 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          editor?.chain().focus().toggleBold().run()
                        }
                        className={cn(
                          editor?.isActive('bold') ? 'bg-primary-200' : '',
                        )}
                      >
                        Bold
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          editor?.chain().focus().toggleItalic().run()
                        }
                        className={cn(
                          editor?.isActive('italic') ? 'bg-primary-200' : '',
                        )}
                      >
                        Italic
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          editor?.chain().focus().toggleStrike().run()
                        }
                        className={cn(
                          editor?.isActive('strike') ? 'bg-primary-200' : '',
                        )}
                      >
                        Strike
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 1 })
                            .run()
                        }
                        className={cn(
                          editor?.isActive('heading', { level: 1 })
                            ? 'bg-primary-200'
                            : '',
                        )}
                      >
                        H1
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run()
                        }
                        className={cn(
                          editor?.isActive('heading', { level: 2 })
                            ? 'bg-primary-200'
                            : '',
                        )}
                      >
                        H2
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          editor?.chain().focus().toggleBulletList().run()
                        }
                        className={cn(
                          editor?.isActive('bulletList')
                            ? 'bg-primary-200'
                            : '',
                        )}
                      >
                        Bullet List
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          editor?.chain().focus().toggleOrderedList().run()
                        }
                        className={cn(
                          editor?.isActive('orderedList')
                            ? 'bg-primary-200'
                            : '',
                        )}
                      >
                        Numbered List
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          editor?.chain().focus().setTextAlign('left').run()
                        }
                        className={cn(
                          editor?.isActive({ textAlign: 'left' })
                            ? 'bg-primary-200'
                            : '',
                        )}
                      >
                        Left
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          editor?.chain().focus().setTextAlign('center').run()
                        }
                        className={cn(
                          editor?.isActive({ textAlign: 'center' })
                            ? 'bg-primary-200'
                            : '',
                        )}
                      >
                        Center
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          editor?.chain().focus().setTextAlign('right').run()
                        }
                        className={cn(
                          editor?.isActive({ textAlign: 'right' })
                            ? 'bg-primary-200'
                            : '',
                        )}
                      >
                        Right
                      </Button>
                    </div>
                    <EditorContent
                      editor={editor}
                      className="h-[500px] bg-primary-900 text-primary-100 overflow-scroll"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
