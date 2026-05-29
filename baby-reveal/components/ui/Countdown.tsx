'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'

interface CountdownProps {
  targetDate: string
  onComplete?: () => void
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcTimeLeft(targetDate: string): TimeLeft {
  const diff = new Date(targetDate).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function Countdown({ targetDate, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft(targetDate))
  const [prevTime, setPrevTime] = useState<TimeLeft>(calcTimeLeft(targetDate))

  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = calcTimeLeft(targetDate)
      setPrevTime(timeLeft)
      setTimeLeft(newTime)
      if (newTime.days === 0 && newTime.hours === 0 && newTime.minutes === 0 && newTime.seconds === 0) {
        onComplete?.()
        clearInterval(interval)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate, timeLeft, onComplete])

  const units = [
    { label: 'DIAS', value: timeLeft.days },
    { label: 'HRS', value: timeLeft.hours },
    { label: 'MIN', value: timeLeft.minutes },
    { label: 'SEG', value: timeLeft.seconds },
  ]

  return (
    <div className="flex gap-3 justify-center">
      {units.map(({ label, value }) => (
        <GlassCard key={label} className="flex flex-col items-center p-3 min-w-[64px]" glow="blue">
          <motion.span
            key={value}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-black text-white tabular-nums"
          >
            {String(value).padStart(2, '0')}
          </motion.span>
          <span className="text-[10px] font-bold text-white/40 tracking-widest mt-1">{label}</span>
        </GlassCard>
      ))}
    </div>
  )
}
