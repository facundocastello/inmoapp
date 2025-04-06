'use client'

import { useEffect, useRef, useState } from 'react'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
  timestamp: number
}

const MAX_TOASTS = 10
const TOAST_DURATION = 5000
const ANIMATION_DURATION = 300

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const toastElementsRef = useRef<Map<number, HTMLDivElement>>(new Map())
  const timeoutRefs = useRef<Map<number, NodeJS.Timeout>>(new Map())

  // Initialize container
  useEffect(() => {
    if (!containerRef.current) {
      const container = document.createElement('div')
      container.id = 'toast-container'
      container.className =
        'fixed top-4 right-4 z-50 flex flex-col gap-2 hidden'
      document.body.appendChild(container)
      containerRef.current = container
    }

    return () => {
      if (containerRef.current) {
        document.body.removeChild(containerRef.current)
        containerRef.current = null
      }
      timeoutRefs.current.forEach(clearTimeout)
      timeoutRefs.current.clear()
    }
  }, [])

  const createToastElement = (toast: Toast) => {
    const toastElement = document.createElement('div')
    toastElement.className = `relative p-4 rounded-md shadow-lg ${
      toast.type === 'success'
        ? 'bg-green-500 text-white'
        : 'bg-red-500 text-white'
    }`
    toastElement.style.opacity = '0'
    toastElement.style.transform = 'translateX(100%)'
    toastElement.style.transition = 'all 0.3s ease-in-out'

    const closeButton = document.createElement('button')
    closeButton.className =
      'absolute top-1 right-1 text-white hover:text-gray-200 text-xl font-bold'
    closeButton.innerHTML = '×'
    closeButton.onclick = () => removeToast(toast.id)

    const messageElement = document.createElement('div')
    messageElement.className = 'pr-6'
    messageElement.textContent = toast.message

    toastElement.appendChild(messageElement)
    toastElement.appendChild(closeButton)
    return toastElement
  }

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success',
  ) => {
    const id = Date.now()
    const newToast = { id, message, type, timestamp: Date.now() }

    setToasts((prev) => {
      if (prev.length >= MAX_TOASTS) {
        // Remove the oldest toast (last in array) and add new one at the beginning
        const oldestToast = prev[prev.length - 1]
        removeToast(oldestToast.id)
        return [newToast, ...prev.slice(0, -1)]
      }
      return [newToast, ...prev]
    })

    const timeout = setTimeout(() => removeToast(id), TOAST_DURATION)
    timeoutRefs.current.set(id, timeout)
  }

  const removeToast = (id: number) => {
    const toastElement = toastElementsRef.current.get(id)
    if (!toastElement) return

    const timeout = timeoutRefs.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeoutRefs.current.delete(id)
    }

    toastElement.style.transform = 'translateX(100%)'
    toastElement.style.opacity = '0'

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
      toastElement.remove()
      toastElementsRef.current.delete(id)
    }, ANIMATION_DURATION)
  }

  // Handle toast DOM updates
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Update container visibility based on toast count
    if (toasts.length === 0) {
      container.classList.add('hidden')
    } else if (toasts.length === 1) {
      container.classList.remove('hidden')
    }

    // Clean up removed toasts
    const currentIds = new Set(toasts.map((t) => t.id))
    for (const [id, element] of toastElementsRef.current.entries()) {
      if (!currentIds.has(id)) {
        element.remove()
        toastElementsRef.current.delete(id)
        const timeout = timeoutRefs.current.get(id)
        if (timeout) {
          clearTimeout(timeout)
          timeoutRefs.current.delete(id)
        }
      }
    }

    // Add new toasts
    toasts.forEach((toast) => {
      if (toastElementsRef.current.has(toast.id)) return

      const toastElement = createToastElement(toast)

      if (container.firstChild) {
        container.insertBefore(toastElement, container.firstChild)
      } else {
        container.appendChild(toastElement)
      }

      toastElementsRef.current.set(toast.id, toastElement)

      requestAnimationFrame(() => {
        toastElement.style.transform = 'translateX(0)'
        toastElement.style.opacity = '1'
      })
    })
  }, [toasts])

  return { showToast }
}
