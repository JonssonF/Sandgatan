import { nextMonth } from './month'

/** Mirrors the backend's LoanMath.MonthlyInterest: balance × rate / 12, whole kronor. */
export function monthlyInterest(balance: number, annualRatePercent: number): number {
  return Math.round((balance * annualRatePercent) / 100 / 12)
}

export interface LoanProjectionRow {
  year: number
  month: number
  balance: number
  interest: number
  amortization: number
  total: number
}

/**
 * Month-by-month projection starting with the given month, using the same roll-forward rule as
 * the backend's carry-over: next balance = balance − amortization, interest recalculated.
 */
export function projectLoan(
  start: { year: number; month: number },
  balance: number,
  annualRatePercent: number,
  amortization: number,
  months: number,
): LoanProjectionRow[] {
  const rows: LoanProjectionRow[] = []
  let period = start
  let current = balance
  for (let i = 0; i < months && current > 0; i++) {
    const amort = Math.min(amortization, current)
    const interest = monthlyInterest(current, annualRatePercent)
    rows.push({ ...period, balance: current, interest, amortization: amort, total: interest + amort })
    current = Math.max(0, current - amort)
    period = nextMonth(period.year, period.month)
  }
  return rows
}
