/**
 * Button Component
 * Premium button with variants, sizes, and smooth interactions
 */
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-accent-cyan text-dark-bg hover:bg-accent-cyan-dark hover:shadow-glow active:scale-[0.97]',
      secondary: 'bg-dark-elevated text-dark-text-primary border border-dark-border hover:bg-dark-hover hover:border-accent-cyan/30 active:scale-[0.97]',
      ghost: 'text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text-primary active:scale-[0.97]',
      danger: 'bg-accent-red text-white hover:bg-accent-red/90 hover:shadow-glow active:scale-[0.97]',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <motion.button
        ref={ref}
        type={props.type}
        onClick={props.onClick}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export default Button
