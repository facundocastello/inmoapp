'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { checkAutomatedSubscription } from '@/lib/actions/subscription'

import { Subscription } from '.prisma/shared'

interface CheckSubscriptionProps {
  subscription: Subscription
}

export function CheckSubscription({ subscription }: CheckSubscriptionProps) {
  const [success, setSuccess] = useState(false)
  const handleButtonClick = () => {
    checkAutomatedSubscription({ subscriptionId: subscription.id }).then(
      (res) => {
        if (res?.success) {
          setSuccess(true)
        }
      },
    )
  }

  return success ? (
    <div className={styles.success}>
      Subscription check completed successfully!
    </div>
  ) : (
    <Button onClick={handleButtonClick} className={styles.button}>
      Check Subscription
    </Button>
  )
}

const styles = {
  button: 'w-full sm:w-auto',
  success: 'text-green-600 font-medium',
}
