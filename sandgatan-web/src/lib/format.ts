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
