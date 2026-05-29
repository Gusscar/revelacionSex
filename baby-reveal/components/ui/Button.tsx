'use client'

import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'boy' | 'girl' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
}

const variants = {
  primary: 'bg-gradient-to-r from-blue-600 to-pink-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50',
  secondary: 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20',
  ghost: 'text-white/70 hover:text-white hover:bg-white/10',
  boy: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50',
  girl: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50',
  danger: 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
  xl: 'px-10 py-5 text-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.03 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={cn(
        'relative rounded-2xl font-semibold transition-all duration-200 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...(props as object)}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Cargando...
        </span>
      ) : (
        children
      )}
    </motion.button>
  )
}
