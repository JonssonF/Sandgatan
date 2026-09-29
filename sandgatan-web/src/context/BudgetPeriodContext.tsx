import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { nextMonth, previousMonth } from '../lib/month'

interface BudgetPeriod {
  year: number
  month: number
  goToNextMonth: () => void
  goToPreviousMonth: () => void
  goToMonth: (year: number, month: number) => void
}

const BudgetPeriodContext = createContext<BudgetPeriod | null>(null)

export function BudgetPeriodProvider({ children }: { children: ReactNode }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const value = useMemo<BudgetPeriod>(
    () => ({
      year,
      month,
      goToNextMonth: () => {
        const n = nextMonth(year, month)
        setYear(n.year)
        setMonth(n.month)
      },
      goToPreviousMonth: () => {
        const p = previousMonth(year, month)
        setYear(p.year)
        setMonth(p.month)
      },
      goToMonth: (y, m) => {
        setYear(y)
        setMonth(m)
      },
    }),
    [year, month],
  )

  return <BudgetPeriodContext.Provider value={value}>{children}</BudgetPeriodContext.Provider>
}

export function useBudgetPeriod(): BudgetPeriod {
  const ctx = useContext(BudgetPeriodContext)
  if (!ctx) throw new Error('useBudgetPeriod must be used within BudgetPeriodProvider')
  return ctx
}
