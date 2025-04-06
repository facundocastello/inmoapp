'use client'

import React from 'react'

import { Button } from '@/components/ui/Button'

export default function MarkAsPaidButton() {
  return (
    <Button
      variant="outline"
      onClick={() => {
        // This will be handled by client component
      }}
    >
      Mark as Paid
    </Button>
  )
}
