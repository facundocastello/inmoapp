'use client'

import { redirect, useParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Form } from '@/components/ui/form/Form'
import { Input } from '@/components/ui/form/Input'

type LoginFormValues = {
  email: string
  password: string
}

export function LoginForm() {
  const { tenant } = useParams<{ tenant: string }>()
  const tenantId = tenant === 'login' ? null : tenant
  const [error, setError] = useState<string | null>(null)
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: tenantId ? 'admin@tenant.example.com' : 'superadmin@example.com',
      password: tenantId ? 'AdminSecure123!' : 'SuperSecure123!',
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
      tenantSubdomain: tenantId || '',
    })

    if (result?.error) {
      setError(result.error)
      return
    }

    // Redirect to admin dashboard on success
    redirect(tenantId ? '/admin' : '/super-admin')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Please sign in to your account</p>

          <div className={styles.inputGroup}>
            <Input
              type="email"
              name="email"
              placeholder="Email"
              registerOptions={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              registerOptions={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              }}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" className={styles.submitButton}>
            Sign in
          </Button>
        </div>
      </form>
    </Form>
  )
}

const styles = {
  form: 'w-full min-h-screen flex items-center justify-center bg-gray-50',
  formContainer:
    'w-full max-w-md p-8 space-y-6 bg-primary-100 rounded-xl shadow-lg',
  title: 'text-2xl font-bold text-center text-primary-900',
  subtitle: 'text-sm text-center text-primary-700 mb-8',
  inputGroup: 'space-y-4',
  submitButton: 'w-full py-2.5 mt-6',
  error: 'text-red-500 text-center',
}
