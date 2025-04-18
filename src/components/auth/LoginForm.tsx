'use client'

import { redirect, useParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/forms/Input'
import { Loader } from '@/components/ui/Loader'

type LoginFormValues = {
  email: string
  password: string
}

export function LoginForm({ oneUseToken }: { oneUseToken?: string }) {
  const { tenant } = useParams<{ tenant: string }>()
  const tenantSubdomain = tenant === 'login' ? null : tenant
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: tenantSubdomain ? 'test@test.com' : 'superadmin@example.com',
      password: tenantSubdomain ? 'Test1234' : 'SuperSecure123!',
    },
  })

  useEffect(() => {
    if (oneUseToken) {
      setIsLoading(true)
      signIn('credentials', {
        oneUseToken,
        tenantSubdomain: tenantSubdomain,
        redirect: false,
      })
        .then((result) => {
          if (result?.error) {
            setError(result.error)
            return
          }
          redirect('/admin')
        })
        .catch(() => setIsLoading(false))
    }
  }, [oneUseToken])

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
        tenantSubdomain: tenantSubdomain || '',
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      // Redirect to admin dashboard on success
      redirect(tenantSubdomain ? '/admin' : '/super-admin')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && <Loader />}
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formContainer}>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>Please sign in to your account</p>

            <div className={styles.inputGroup}>
              <Input type="email" name="email" label="Email" />
              <Input type="password" name="password" label="Password" />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <Button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              Sign in
            </Button>
          </div>
        </form>
      </FormProvider>
    </>
  )
}

const styles = {
  form: 'w-full min-h-screen flex items-center justify-center',
  formContainer:
    'w-full max-w-md p-8 space-y-6 bg-primary-100 rounded-xl shadow-lg',
  title: 'text-2xl font-bold text-center text-primary-900',
  subtitle: 'text-sm text-center text-primary-700 mb-8',
  inputGroup: 'space-y-4',
  submitButton: 'w-full py-2.5 mt-6',
  error: 'text-red-500 text-center',
}
