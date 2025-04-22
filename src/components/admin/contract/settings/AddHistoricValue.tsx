'use client'
import React, { useState } from 'react'

import { Button } from '@/components/ui/Button'

export default function AddHistoricValue({
  handleAddHistoricValue,
}: {
  handleAddHistoricValue: (value: string) => Promise<void>
}) {
  const [showModal, setShowModal] = useState(false)
  const [value, setValue] = useState('')
  return (
    <>
      <Button onClick={() => setShowModal(true)}>Add Value</Button>
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Add Historic Value</h2>
            <input
              className={styles.input}
              type="text"
              placeholder="Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <Button
              onClick={() =>
                handleAddHistoricValue(value).finally(() => setShowModal(false))
              }
            >
              Add
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

const styles = {
  modal: 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  modalContent: 'bg-primary-900 p-4 rounded-lg shadow-lg text-primary-100',
  input: 'bg-primary-800 p-2 rounded-lg text-primary-100',
}
