'use client'

import { FormProvider, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/forms/Checkbox'
import { Input } from '@/components/ui/forms/Input'
import { Select } from '@/components/ui/forms/Select'
import { createPage, PageFormData, updatePage } from '@/lib/actions/tenant/page'

interface User {
  id: string
  name: string
  email: string
}

interface PageFormProps {
  users: User[]
  id?: string
  initialData?: PageFormData
}

export function PageForm({ users, id, initialData }: PageFormProps) {
  const methods = useForm<PageFormData>({
    defaultValues: initialData,
  })

  const onSubmit = async (data: PageFormData) => {
    if (id) await updatePage(id, data)
    else await createPage(data)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={styles.form}>
        <Input name="title" label="Title" defaultValue={initialData?.title} />

        <Input name="slug" label="Slug" defaultValue={initialData?.slug} />

        <Select
          name="authorId"
          label="Author"
          options={[
            { value: '', label: 'Select an author' },
            ...users.map((user) => ({
              value: user.id,
              label: `${user.name} (${user.email})`,
            })),
          ]}
        />

        <div className={styles.checkboxGroup}>
          <Checkbox
            name="isActive"
            label="Active"
            defaultChecked={initialData?.isActive ?? true}
          />

          <Checkbox
            name="isFeatured"
            label="Featured"
            defaultChecked={initialData?.isFeatured ?? false}
          />

          <Checkbox
            name="isHome"
            label="Home Page"
            defaultChecked={initialData?.isHome ?? false}
          />
        </div>

        <div className={styles.formActions}>
          <Button type="submit">
            {initialData ? 'Update Page' : 'Create Page'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

const styles = {
  form: 'space-y-6',
  checkboxGroup: 'space-y-4',
  formActions: 'flex justify-end',
}
