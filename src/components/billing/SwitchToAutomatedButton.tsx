'use client'

import { Subscription } from '@prisma/client'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { switchToAutomatedPayment } from '@/lib/actions/subscription'

import { SwitchToAutomatedModal } from './SwitchToAutomatedModal'

interface SwitchToAutomatedButtonProps {
  subscription: Subscription
}

export function SwitchToAutomatedButton({
  subscription,
}: SwitchToAutomatedButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleButtonClick = () => {
    if (subscription.externalId) {
      switchToAutomatedPayment(subscription.tenantId).then((result) => {
        setIsOpen(!result.success)
      })
    } else {
      setIsOpen(true)
    }
  }

  return (
    <>
      <Button onClick={handleButtonClick} className={styles.button}>
        Switch to Automated Payments
      </Button>

      <SwitchToAutomatedModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        subscription={subscription}
      />
    </>
  )
}

const styles = {
  button: 'w-full sm:w-auto',
}
