import type { CategoryDto } from '../api/types'

/**
 * Fixed categorical palette (colorblind-validated order), with separate steps for light and dark
 * surfaces. Categories store the key (e.g. "blue") in `Category.Color`, never a raw hex, so the
 * dark-mode step can be chosen at render time.
 */
export const CATEGORY_COLORS = [
  { key: 'blue', label: 'Blå', light: '#2a78d6', dark: '#3987e5' },
  { key: 'orange', label: 'Orange', light: '#eb6834', dark: '#d95926' },
  { key: 'aqua', label: 'Turkos', light: '#1baf7a', dark: '#199e70' },
  { key: 'yellow', label: 'Gul', light: '#eda100', dark: '#c98500' },
  { key: 'magenta', label: 'Rosa', light: '#e87ba4', dark: '#d55181' },
  { key: 'green', label: 'Grön', light: '#008300', dark: '#008300' },
  { key: 'violet', label: 'Lila', light: '#4a3aa7', dark: '#9085e9' },
  { key: 'red', label: 'Röd', light: '#e34948', dark: '#e66767' },
] as const

export type CategoryColorKey = (typeof CATEGORY_COLORS)[number]['key']

/** Neutral used for the folded "Övrigt" slice — never a palette hue. */
export const OTHER_COLOR = { light: '#9a9993', dark: '#6f6e69' }

export function colorHex(key: string | null | undefined, scheme: 'light' | 'dark'): string | null {
  const entry = CATEGORY_COLORS.find((c) => c.key === key)
  return entry ? entry[scheme] : null
}

/**
 * Resolves a color key per category for one chart. Categories with a chosen color keep it;
 * the rest take the first palette slot not already used by the visible set, in category-id order,
 * so visible slices never share a hue unless the user picked the same color twice.
 */
export function resolveCategoryColors(categories: Pick<CategoryDto, 'id' | 'color'>[]): Map<number, CategoryColorKey> {
  const result = new Map<number, CategoryColorKey>()
  const used = new Set<string>()
  for (const c of categories) {
    const entry = CATEGORY_COLORS.find((p) => p.key === c.color)
    if (entry) {
      result.set(c.id, entry.key)
      used.add(entry.key)
    }
  }
  const free = CATEGORY_COLORS.filter((p) => !used.has(p.key))
  const unassigned = categories.filter((c) => !result.has(c.id)).sort((a, b) => a.id - b.id)
  unassigned.forEach((c, i) => {
    const slot = free[i] ?? CATEGORY_COLORS[i % CATEGORY_COLORS.length]
    result.set(c.id, slot.key)
  })
  return result
}
