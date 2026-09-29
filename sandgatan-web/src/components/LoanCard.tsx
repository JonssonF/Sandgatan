import { Card, Group, Text, ThemeIcon } from '@mantine/core'
import { IconBuildingBank } from '@tabler/icons-react'
import { formatSek } from '../lib/format'

interface LoanCardProps {
  total: number
  interest: number
  amortization: number
  /** Total remaining debt across loans with a balance entered. */
  balance: number
}

export function LoanCard({ total, interest, amortization, balance }: LoanCardProps) {
  const unspecified = total - interest - amortization

  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between" align="flex-start" mb="xs">
        <div>
          <Text size="sm" c="dimmed">Lån</Text>
          <Text size="1.5rem" fw={700}>{formatSek(total)}</Text>
        </div>
        <ThemeIcon size={44} radius="md" variant="light" color="indigo">
          <IconBuildingBank size={24} />
        </ThemeIcon>
      </Group>
      <Group justify="space-between">
        <Text size="sm" c="dimmed">Ränta</Text>
        <Text size="sm" fw={500}>{formatSek(interest)}</Text>
      </Group>
      <Group justify="space-between">
        <Text size="sm" c="dimmed">Amortering</Text>
        <Text size="sm" fw={500}>{formatSek(amortization)}</Text>
      </Group>
      {unspecified > 0 && (
        <Group justify="space-between">
          <Text size="sm" c="dimmed">Utan uppdelning</Text>
          <Text size="sm" fw={500}>{formatSek(unspecified)}</Text>
        </Group>
      )}
      {balance > 0 && (
        <Group justify="space-between" mt={6} pt={6} style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
          <Text size="sm" c="dimmed">Total skuld</Text>
          <Text size="sm" fw={600}>{formatSek(balance)}</Text>
        </Group>
      )}
    </Card>
  )
}
