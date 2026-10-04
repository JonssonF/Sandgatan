const sekFormatter = new Intl.NumberFormat('sv-SE', {
  style: 'currency',
  currency: 'SEK',
  maximumFractionDigits: 0,
})

export function formatSek(amount: number): string {
  return sekFormatter.format(amount)
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString('sv-SE', { maximumFractionDigits: 1 })}%`
}

const shortDateFormatter = new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short' })

/** "4 okt." from an ISO date (yyyy-MM-dd), read as a local date. */
export function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return shortDateFormatter.format(new Date(y, m - 1, d))
}
