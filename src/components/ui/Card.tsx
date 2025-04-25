import {
  DetailedHTMLProps,
  DetailsHTMLAttributes,
  forwardRef,
  HTMLAttributes,
} from 'react'

import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  collapsible?: boolean
  customTitle?: string | React.ReactNode
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, collapsible, customTitle, children, ...props }, ref) => {
    if (collapsible) {
      return (
        <details
          ref={ref as unknown as React.RefObject<HTMLDetailsElement>}
          className={cn(
            'group rounded-lg border bg-card text-card-foreground shadow-sm',
            className,
          )}
          {...(props as DetailedHTMLProps<
            DetailsHTMLAttributes<HTMLDetailsElement>,
            HTMLDetailsElement
          >)}
        >
          {customTitle && (
            <summary className="list-none">{customTitle}</summary>
          )}
          {children}
        </details>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border bg-card text-card-foreground shadow-sm',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    >
      {children}
    </div>
  ),
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  ),
)
CardContent.displayName = 'CardContent'

export { Card, CardContent, CardHeader, CardTitle }
