'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { redirect } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/Button'
import { FileInput } from '@/components/ui/forms/FileInput'
import { Input } from '@/components/ui/forms/Input'
import { Select } from '@/components/ui/forms/Select'
import { createUser, updateUser, type UserFormData } from '@/lib/actions/user'

import { User } from '.prisma/shared'

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .optional()
    .or(z.literal('')),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']),
  avatar: z
    .union([z.instanceof(File), z.string()])
    .optional()
    .nullable(),
})

interface UserFormProps {
  initialData?: Omit<User, 'password' | 'createdAt' | 'updatedAt' | 'tenantId'>
  isLoading?: boolean
}

export const UserForm = ({ initialData, isLoading = false }: UserFormProps) => {
  const methods = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'VIEWER',
      avatar: undefined,
      ...initialData,
    },
  })

  const {
    formState: { errors },
  } = methods

  const onSubmit = async (data: UserFormData) => {
    let id = initialData?.id
    if (id) {
      await updateUser(id, data)
    } else {
      const user = await createUser(data)
      id = user.data?.id
    }
    redirect('/admin/users')
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.grid}>
          <div>
            <Input
              name="name"
              label="Name"
              error={errors.name?.message?.toString()}
            />
          </div>
          <div>
            <Input
              name="email"
              label="Email"
              type="email"
              error={errors.email?.message?.toString()}
            />
          </div>
        </div>

        <div className={styles.grid}>
          <div>
            <Input
              name="password"
              label="Password"
              type="password"
              error={errors.password?.message?.toString()}
            />
          </div>
          <div>
            <Select
              name="role"
              label="Role"
              options={[
                { value: 'ADMIN', label: 'Admin' },
                { value: 'EDITOR', label: 'Editor' },
                { value: 'VIEWER', label: 'Viewer' },
              ]}
              error={errors.role?.message?.toString()}
            />
          </div>
        </div>

        <div>
          <FileInput
            name="avatar"
            label="Avatar"
            accept="image/*"
            defaultValue={initialData?.avatar || undefined}
            error={errors.avatar?.message?.toString()}
          />
        </div>

        <div className={styles.actions}>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

const styles = {
  form: 'space-y-6',
  grid: 'grid grid-cols-1 gap-6 sm:grid-cols-2',
  actions: 'flex justify-end',
}
