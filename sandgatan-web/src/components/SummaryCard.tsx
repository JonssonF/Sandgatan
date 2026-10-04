import { Card, Group, Text, ThemeIcon } from '@mantine/core'
import type { IconProps } from '@tabler/icons-react'
import type { ComponentType } from 'react'
import { formatSek } from '../lib/format'

interface SummaryCardProps {
  label: string
  amount: number
  icon: ComponentType<IconProps>
  color?: string
  emphasis?: boolean
  /** Small dimmed line under the amount. */
  hint?: string
}

export function SummaryCard({ label, amount, icon: IconComp, color = 'brand', emphasis, hint }: SummaryCardProps) {
  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="sm" c="dimmed">{label}</Text>
          <Text size={emphasis ? '2rem' : '1.5rem'} fw={700} c={amount < 0 ? 'red' : undefined}>
            {formatSek(amount)}
          </Text>
          {hint && <Text size="xs" c="dimmed">{hint}</Text>}
        </div>
        <ThemeIcon size={44} radius="md" variant="light" color={color}>
          <IconComp size={24} />
        </ThemeIcon>
      </Group>
    </Card>
  )
}
