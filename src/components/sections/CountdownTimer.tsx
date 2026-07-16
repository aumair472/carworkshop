'use client'

import { useEffect, useState } from 'react'

function getNextSundayMidnight(): number {
  const now = new Date()
  const result = new Date(now)
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7
  result.setDate(now.getDate() + daysUntilSunday)
  result.setHours(0, 0, 0, 0)
  return result.getTime()
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function diffToTimeLeft(diffMs: number): TimeLeft {
  const clamped = Math.max(0, diffMs)
  return {
    days: Math.floor(clamped / (1000 * 60 * 60 * 24)),
    hours: Math.floor((clamped / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((clamped / (1000 * 60)) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  }
}

// Countdown to next Sunday midnight, used for limited-time brand-page offers.
export function CountdownTimer({ label = 'Offer ends in' }: { label?: string }) {
  const [target] = useState(getNextSundayMidnight)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    const tick = () => setTimeLeft(diffToTimeLeft(target - Date.now()))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [target])

  if (!timeLeft) return null

  const cells: Array<[string, number]> = [
    ['Days', timeLeft.days],
    ['Hrs', timeLeft.hours],
    ['Min', timeLeft.minutes],
    ['Sec', timeLeft.seconds],
  ]

  return (
    <div className="inline-flex items-center gap-3" role="timer" aria-live="off">
      <span className="text-sm font-semibold text-white/80">{label}</span>
      <div className="flex gap-2">
        {cells.map(([unit, value]) => (
          <div key={unit} className="flex flex-col items-center bg-white/15 rounded-lg px-2.5 py-1.5 min-w-[3rem]">
            <span className="text-lg font-extrabold text-white leading-none tabular-nums">{String(value).padStart(2, '0')}</span>
            <span className="text-[10px] text-white/70 mt-0.5">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
