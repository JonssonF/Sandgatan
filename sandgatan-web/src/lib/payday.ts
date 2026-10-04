/** Salary is paid on this day of the month, moved back to the nearest earlier banking day. */
export const PAYDAY_DAY_OF_MONTH = 25

const DAY_MS = 24 * 60 * 60 * 1000

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

/** Easter Sunday (anonymous Gregorian algorithm). */
function easterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)
}

/** Swedish weekday non-banking days (public holidays plus the "eves" banks keep closed). */
function swedishBankHolidays(year: number): Set<string> {
  const easter = easterSunday(year)
  // Midsummer Eve: the Friday between 19 and 25 June.
  const june19 = new Date(year, 5, 19)
  const midsummerEve = addDays(june19, (5 - june19.getDay() + 7) % 7)
  return new Set(
    [
      new Date(year, 0, 1), // Nyårsdagen
      new Date(year, 0, 6), // Trettondedag jul
      addDays(easter, -2), // Långfredagen
      addDays(easter, 1), // Annandag påsk
      new Date(year, 4, 1), // Första maj
      addDays(easter, 39), // Kristi himmelsfärdsdag
      new Date(year, 5, 6), // Nationaldagen
      midsummerEve,
      new Date(year, 11, 24), // Julafton
      new Date(year, 11, 25), // Juldagen
      new Date(year, 11, 26), // Annandag jul
      new Date(year, 11, 31), // Nyårsafton
    ].map(dateKey),
  )
}

function isBankingDay(d: Date, holidays: Set<string>): boolean {
  const weekday = d.getDay()
  return weekday !== 0 && weekday !== 6 && !holidays.has(dateKey(d))
}

/** The payday in a given month (1-based): the 25th, or the last banking day before it. */
export function paydayFor(year: number, month: number): Date {
  const holidays = swedishBankHolidays(year)
  let d = new Date(year, month - 1, PAYDAY_DAY_OF_MONTH)
  while (!isBankingDay(d, holidays)) d = addDays(d, -1)
  return d
}

/** The next payday on or after `today`, and how many days away it is (0 = today). */
export function nextPayday(today: Date = new Date()): { date: Date; daysLeft: number } {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  let date = paydayFor(start.getFullYear(), start.getMonth() + 1)
  if (date < start) {
    const next = start.getMonth() === 11 ? { y: start.getFullYear() + 1, m: 1 } : { y: start.getFullYear(), m: start.getMonth() + 2 }
    date = paydayFor(next.y, next.m)
  }
  // Round to absorb daylight-saving shifts.
  const daysLeft = Math.round((date.getTime() - start.getTime()) / DAY_MS)
  return { date, daysLeft }
}

/** Local date as yyyy-MM-dd (what the API and <input type="date"> expect). */
export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
