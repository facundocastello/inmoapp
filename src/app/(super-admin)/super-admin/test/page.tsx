'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { createTestTenant, runSubscriptionCheck } from '@/lib/actions/test'
import { useToast } from '@/lib/hooks/useToast'

export default function TestPage() {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const { showToast } = useToast()

  const handleCreateTestTenant = async (scenario: string) => {
    try {
      setIsLoading((prev) => ({ ...prev, [scenario]: true }))
      const tenant = await createTestTenant(scenario)
      showToast(`Test tenant created: ${tenant.name}`, 'success')
    } catch (error) {
      console.error('Error creating test tenant:', error)
      showToast('Failed to create test tenant', 'error')
    } finally {
      setIsLoading((prev) => ({ ...prev, [scenario]: false }))
    }
  }

  const handleRunSubscriptionCheck = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, check: true }))
      await runSubscriptionCheck()
      showToast('Subscription check completed', 'success')
    } catch (error) {
      console.error('Error running subscription check:', error)
      showToast('Failed to run subscription check', 'error')
    } finally {
      setIsLoading((prev) => ({ ...prev, check: false }))
    }
  }

  return (
    <div className={styles.container}>
      <Card>
        <CardHeader>
          <CardTitle>Test Tenants</CardTitle>
        </CardHeader>
        <CardContent className={styles.cardContent}>
          <div className={styles.buttonGrid}>
            <Button
              onClick={() => handleCreateTestTenant('expires-in-10-days')}
              isLoading={isLoading['expires-in-10-days']}
            >
              Create Tenant (Expires in 10 days)
            </Button>
            <Button
              onClick={() => handleCreateTestTenant('expires-today')}
              isLoading={isLoading['expires-today']}
            >
              Create Tenant (Expires today)
            </Button>
            <Button
              onClick={() => handleCreateTestTenant('grace-5-days')}
              isLoading={isLoading['grace-5-days']}
            >
              Create Tenant (5 days in grace)
            </Button>
            <Button
              onClick={() => handleCreateTestTenant('expired-20-days')}
              isLoading={isLoading['expired-20-days']}
            >
              Create Tenant (Expired 20 days)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Check</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleRunSubscriptionCheck}
            isLoading={isLoading.check}
          >
            Run Subscription Check
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

const styles = {
  container: 'space-y-6',
  cardContent: 'space-y-4',
  buttonGrid: 'grid grid-cols-1 gap-4 sm:grid-cols-2',
}
