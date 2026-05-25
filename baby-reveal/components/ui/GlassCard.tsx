import { cn } from '@/utils/cn'
import { HTMLAttributes } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'purple' | 'blue' | 'pink' | 'none'
}

export function GlassCard({ className, children, glow = 'none', ...props }: GlassCardProps) {
  const glowMap = {
    purple: 'shadow-purple-500/20 border-purple-500/30',
    blue: 'shadow-blue-500/20 border-blue-500/30',
    pink: 'shadow-pink-500/20 border-pink-500/30',
    none: 'border-white/10',
  }

  return (
    <div
      className={cn(
        'bg-white/5 backdrop-blur-xl border rounded-3xl shadow-xl',
        glowMap[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
