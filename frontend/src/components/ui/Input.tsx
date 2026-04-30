/**
 * Input Component
 * Premium input with focus states and icons
 */
import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-muted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 bg-dark-elevated border border-dark-border rounded-2xl',
              'text-dark-text-primary placeholder:text-dark-text-muted',
              'focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent',
              'transition-all duration-200',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-accent-red focus:ring-accent-red',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-accent-red">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
