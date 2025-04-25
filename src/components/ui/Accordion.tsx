'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

interface CustomAccordionProps {
  children: React.ReactNode
  className?: string
  value?: string
  onValueChange?: (value: string) => void
}

interface CustomAccordionItemProps {
  children: React.ReactNode
  className?: string
  value: string
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

interface CustomAccordionTriggerProps {
  children: React.ReactNode
  className?: string
}

interface CustomAccordionContentProps {
  children: React.ReactNode
  className?: string
}

const AccordionContext = React.createContext<{
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}>({
  isOpen: false,
  setIsOpen: () => {},
})

const Accordion = ({
  children,
  className,
  value,
  onValueChange,
}: CustomAccordionProps) => {
  return (
    <div className={cn('w-full', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<CustomAccordionItemProps>(child)) {
          return React.cloneElement(child, {
            isOpen: value === child.props.value,
            onOpenChange: onValueChange
              ? (isOpen) => {
                  if (isOpen) {
                    onValueChange(child.props.value)
                  } else {
                    onValueChange('')
                  }
                }
              : undefined,
          })
        }
        return child
      })}
    </div>
  )
}

const CustomAccordionItem = ({
  children,
  className,
  isOpen: controlledIsOpen,
  onOpenChange,
}: CustomAccordionItemProps) => {
  const isControlled = onOpenChange !== undefined
  const [localIsOpen, setLocalIsOpen] = React.useState(false)
  const isOpen = isControlled ? !!controlledIsOpen : localIsOpen
  const setIsOpen = isControlled ? onOpenChange : setLocalIsOpen
  return (
    <AccordionContext.Provider value={{ isOpen, setIsOpen }}>
      <div className={cn('mb-0.5', className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

const CustomAccordionTrigger = ({
  children,
  className,
}: CustomAccordionTriggerProps) => {
  const { isOpen, setIsOpen } = React.useContext(AccordionContext)

  return (
    <div
      className={cn(
        'top-16 z-10 bg-primary-200 px-2 rounded-lg',
        isOpen && 'bg-primary-300 sticky',
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between py-4 font-medium transition-all hover:text-primary-600',
          className,
        )}
      >
        {children}
        <svg
          className={cn(
            'h-4 w-4 shrink-0 transition-transform duration-200',
            isOpen ? 'rotate-180' : '',
          )}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </div>
  )
}

const CustomAccordionContent = ({
  children,
  className,
}: CustomAccordionContentProps) => {
  const { isOpen } = React.useContext(AccordionContext)

  return (
    <div
      className={cn(
        styles.contentContainer,
        isOpen ? styles.contentIsOpen : styles.contentIsClose,
        className,
      )}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  )
}

export {
  Accordion,
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
}

const styles = {
  contentContainer:
    'text-sm px-1 opacity-0 h-0 transition-all transition-duration-1000 -top-full -translate-y-full',
  contentIsOpen: 'py-3 opacity-100 h-auto translate-y-0',
  contentIsClose: 'overflow-hidden',
}
