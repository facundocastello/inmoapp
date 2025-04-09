'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/forms/Input'
import { Textarea } from '@/components/ui/forms/Textarea'
import { createContent, updateContent } from '@/lib/actions/tenant/content'

const contentSchema = z.object({
  contents: z.array(
    z.object({
      id: z.string().nullable(),
      title: z.string().min(1, 'Title is required'),
      body: z.string().min(1, 'Body is required'),
    }),
  ),
})

type ContentFormData = z.infer<typeof contentSchema>

interface ContentFormProps {
  initialData?: {
    title: string
    body: string
  }[]
  pageId: string
}

export function ContentForm({ initialData, pageId }: ContentFormProps) {
  const methods = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      contents: initialData || [{ id: '', title: '', body: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'contents',
  })

  const {
    formState: { errors },
  } = methods

  const onSubmit = async (data: ContentFormData) => {
    data.contents.forEach((d) => {
      d.id
        ? updateContent(d.id, d)
        : createContent({
            ...d,
            authorId: '1',
            pageId,
          })
    })
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={styles.form}>
        {fields.map((field, index) => (
          <div key={field.id} className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                Content Section {index + 1}
              </h3>
              {index > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Remove Section
                </Button>
              )}
            </div>

            <Input
              name={`contents.${index}.id`}
              label="id"
              className={styles.hidden}
              error={errors.contents?.[index]?.id?.message}
            />
            <Input
              name={`contents.${index}.title`}
              label="Content Title"
              error={errors.contents?.[index]?.title?.message}
            />

            <Textarea
              name={`contents.${index}.body`}
              label="Content Body"
              error={errors.contents?.[index]?.body?.message}
              rows={10}
            />
          </div>
        ))}

        <div className={styles.formActions}>
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ id: null, title: '', body: '' })}
          >
            Add Content Section
          </Button>
          <Button type="submit">
            {initialData ? 'Update Content' : 'Save Content'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

const styles = {
  form: 'space-y-6',
  contentSection: 'space-y-4 p-4 border rounded-lg',
  sectionHeader: 'flex justify-between items-center',
  sectionTitle: 'text-lg font-medium',
  hidden: 'hidden',
  formActions: 'flex justify-between',
}
