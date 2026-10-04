import { Card, Group, Progress, Text } from '@mantine/core'
import { formatSek } from '../lib/format'

interface DistributionBarProps {
  fixed: number
  variable: number
  purchases: number
  savings: number
}

export function DistributionBar({ fixed, variable, purchases, savings }: DistributionBarProps) {
  const total = fixed + variable + purchases + savings

  const sections = total === 0
    ? []
    : [
        { value: (fixed / total) * 100, color: 'blue', label: 'Fasta utgifter', amount: fixed },
        { value: (variable / total) * 100, color: 'orange', label: 'Rörliga utgifter', amount: variable },
        { value: (purchases / total) * 100, color: 'yellow', label: 'Vardagsköp', amount: purchases },
        { value: (savings / total) * 100, color: 'teal', label: 'Sparande', amount: savings },
      ]

  return (
    <Card withBorder padding="lg" radius="md">
      <Text size="sm" c="dimmed" mb="sm">Fördelning: fasta / rörliga / vardagsköp / sparande</Text>
      {total === 0 ? (
        <Text c="dimmed" size="sm">Ingen data för vald månad ännu.</Text>
      ) : (
        <>
          <Progress.Root size={28} radius="md" mb="sm">
            {sections.map((s) => (
              <Progress.Section key={s.label} value={s.value} color={s.color}>
                <Progress.Label>{s.value >= 10 ? `${Math.round(s.value)}%` : ''}</Progress.Label>
              </Progress.Section>
            ))}
          </Progress.Root>
          <Group gap="lg">
            {sections.map((s) => (
              <Group key={s.label} gap={6} wrap="nowrap">
                <div style={{ width: 10, height: 10, borderRadius: 3, background: `var(--mantine-color-${s.color}-6)` }} />
                <Text size="sm">{s.label}: {formatSek(s.amount)}</Text>
              </Group>
            ))}
          </Group>
        </>
      )}
    </Card>
  )
}
