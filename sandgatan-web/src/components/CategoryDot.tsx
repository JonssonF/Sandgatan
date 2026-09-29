import { useComputedColorScheme } from '@mantine/core'
import { colorHex } from '../lib/categoryColors'

/** Small color marker next to a category name. Renders nothing when the category has no chosen color. */
export function CategoryDot({ color, size = 10 }: { color: string | null | undefined; size?: number }) {
  const scheme = useComputedColorScheme('light')
  const hex = colorHex(color, scheme)
  if (!hex) return null
  return <span aria-hidden style={{ display: 'inline-block', width: size, height: size, borderRadius: 3, background: hex, flexShrink: 0 }} />
}
