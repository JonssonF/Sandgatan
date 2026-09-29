import { Box, Card, Group, Loader, SimpleGrid, Stack, Text, UnstyledButton, useComputedColorScheme } from '@mantine/core'
import { useMemo, useState } from 'react'
import { useCategories } from '../api/categories'
import { useExpenses } from '../api/expenses'
import { colorHex, OTHER_COLOR, resolveCategoryColors } from '../lib/categoryColors'
import { formatPercent, formatSek } from '../lib/format'

/** More slices than this and the smallest fold into "Övrigt" — a pie can't carry more hues legibly. */
const MAX_SLICES = 7

interface Slice {
  key: string
  label: string
  amount: number
  share: number
  color: string
}

const SIZE = 240
const CENTER = SIZE / 2
const OUTER = 110
const INNER = 72
const HOVER_GROW = 6

function polar(r: number, angle: number) {
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)]
}

/** Annular sector from angle a0 to a1 (radians, 0 = 3 o'clock, clockwise). */
function sectorPath(r0: number, r1: number, a0: number, a1: number) {
  // A full 360° arc degenerates to nothing in SVG, so cap just below it.
  const end = Math.min(a1, a0 + Math.PI * 2 - 0.0001)
  const large = end - a0 > Math.PI ? 1 : 0
  const [x0, y0] = polar(r1, a0)
  const [x1, y1] = polar(r1, end)
  const [x2, y2] = polar(r0, end)
  const [x3, y3] = polar(r0, a0)
  return `M${x0} ${y0} A${r1} ${r1} 0 ${large} 1 ${x1} ${y1} L${x2} ${y2} A${r0} ${r0} 0 ${large} 0 ${x3} ${y3} Z`
}

export function ExpensesByCategoryChart({ year, month }: { year: number; month: number }) {
  const scheme = useComputedColorScheme('light')
  const { data: expenses, isLoading } = useExpenses(year, month)
  const { data: categories } = useCategories()
  const [hovered, setHovered] = useState<string | null>(null)

  const { slices, total } = useMemo(() => {
    const totals = new Map<number, { name: string; amount: number }>()
    for (const e of expenses ?? []) {
      const entry = totals.get(e.categoryId) ?? { name: e.categoryName, amount: 0 }
      entry.amount += e.amount
      totals.set(e.categoryId, entry)
    }
    const sum = [...totals.values()].reduce((s, t) => s + t.amount, 0)
    const sorted = [...totals.entries()]
      .map(([id, t]) => ({ id, ...t }))
      .filter((t) => t.amount > 0)
      .sort((a, b) => b.amount - a.amount)

    const shown = sorted.length > MAX_SLICES ? sorted.slice(0, MAX_SLICES - 1) : sorted
    const rest = sorted.slice(shown.length)

    const colorKeys = resolveCategoryColors(
      shown.map((s) => ({ id: s.id, color: categories?.find((c) => c.id === s.id)?.color ?? null })),
    )
    const result: Slice[] = shown.map((s) => ({
      key: String(s.id),
      label: s.name,
      amount: s.amount,
      share: sum === 0 ? 0 : (s.amount / sum) * 100,
      color: colorHex(colorKeys.get(s.id), scheme) ?? OTHER_COLOR[scheme],
    }))
    if (rest.length > 0) {
      const restAmount = rest.reduce((s, r) => s + r.amount, 0)
      result.push({
        key: 'other',
        label: `Övrigt (${rest.length} kategorier)`,
        amount: restAmount,
        share: (restAmount / sum) * 100,
        color: OTHER_COLOR[scheme],
      })
    }
    return { slices: result, total: sum }
  }, [expenses, categories, scheme])

  // Card surface, used as the 2px gap between slices.
  const surface = scheme === 'dark' ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-white)'
  const active = slices.find((s) => s.key === hovered) ?? null

  const arcs = slices.map((s, i) => {
    const before = slices.slice(0, i).reduce((sum, p) => sum + p.share, 0)
    const a0 = -Math.PI / 2 + (before / 100) * Math.PI * 2
    const a1 = a0 + (s.share / 100) * Math.PI * 2
    return { ...s, a0, a1 }
  })

  return (
    <Card withBorder padding="lg" radius="md">
      <Text fw={600} mb={2}>Utgifter per kategori</Text>
      <Text size="sm" c="dimmed" mb="md">Var pengarna tar vägen den här månaden</Text>

      {isLoading ? (
        <Group justify="center" py="xl"><Loader /></Group>
      ) : slices.length === 0 ? (
        <Text c="dimmed" size="sm">Inga utgifter registrerade för vald månad ännu.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" style={{ alignItems: 'center' }}>
          <Box style={{ display: 'grid', placeItems: 'center' }}>
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              width="100%"
              style={{ maxWidth: SIZE, overflow: 'visible' }}
              role="img"
              aria-label={`Utgifter per kategori: ${slices.map((s) => `${s.label} ${formatPercent(s.share)}`).join(', ')}`}
              onMouseLeave={() => setHovered(null)}
            >
              {arcs.map((s) => {
                const isActive = s.key === hovered
                return (
                  <path
                    key={s.key}
                    d={sectorPath(INNER, OUTER + (isActive ? HOVER_GROW : 0), s.a0, s.a1)}
                    fill={s.color}
                    stroke={surface}
                    strokeWidth={arcs.length > 1 ? 2 : 0}
                    strokeLinejoin="round"
                    opacity={hovered && !isActive ? 0.45 : 1}
                    style={{ cursor: 'pointer', transition: 'opacity 120ms' }}
                    onMouseEnter={() => setHovered(s.key)}
                    onClick={() => setHovered(isActive ? null : s.key)}
                  />
                )
              })}
              <text x={CENTER} y={CENTER - 8} textAnchor="middle" fontSize={12} fill="var(--mantine-color-dimmed)">
                {active ? truncate(active.label, 20) : 'Totalt'}
              </text>
              <text x={CENTER} y={CENTER + 14} textAnchor="middle" fontSize={18} fontWeight={700} fill="var(--mantine-color-text)">
                {formatSek(active ? active.amount : total)}
              </text>
              {active && (
                <text x={CENTER} y={CENTER + 32} textAnchor="middle" fontSize={12} fill="var(--mantine-color-dimmed)">
                  {formatPercent(active.share)}
                </text>
              )}
            </svg>
          </Box>

          <Stack gap={4}>
            {slices.map((s) => (
              <UnstyledButton
                key={s.key}
                onMouseEnter={() => setHovered(s.key)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(s.key)}
                onBlur={() => setHovered(null)}
                onClick={() => setHovered(hovered === s.key ? null : s.key)}
                px="xs"
                py={6}
                style={{
                  borderRadius: 'var(--mantine-radius-sm)',
                  background: hovered === s.key ? 'var(--mantine-color-default-hover)' : undefined,
                }}
              >
                <Group justify="space-between" wrap="nowrap" gap="sm">
                  <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                    <span aria-hidden style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                    <Text size="sm" truncate>{s.label}</Text>
                  </Group>
                  <Group gap="md" wrap="nowrap">
                    <Text size="sm" fw={500} style={{ fontVariantNumeric: 'tabular-nums' }}>{formatSek(s.amount)}</Text>
                    <Text size="sm" c="dimmed" w={48} ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatPercent(Math.round(s.share))}
                    </Text>
                  </Group>
                </Group>
              </UnstyledButton>
            ))}
          </Stack>
        </SimpleGrid>
      )}
    </Card>
  )
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}
