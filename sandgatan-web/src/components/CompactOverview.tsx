import { Anchor, Card, Group, Loader, SimpleGrid, Stack, Text } from '@mantine/core'
import { Link } from 'react-router-dom'
import { useExpenses } from '../api/expenses'
import { useIncomes } from '../api/incomes'
import { useSavings } from '../api/savings'
import { formatSek } from '../lib/format'

interface Row {
  id: number
  name: string
  amount: number
}

interface ListCardProps {
  title: string
  to: string
  rows: Row[] | undefined
  isLoading: boolean
  emptyText: string
}

function ListCard({ title, to, rows, isLoading, emptyText }: ListCardProps) {
  const total = rows?.reduce((sum, r) => sum + r.amount, 0) ?? 0

  return (
    <Card withBorder padding="md" radius="md">
      <Group justify="space-between" mb="xs">
        <Anchor component={Link} to={to} fw={600} c="inherit">{title}</Anchor>
        <Text fw={600}>{formatSek(total)}</Text>
      </Group>
      {isLoading ? (
        <Group justify="center" py="sm"><Loader size="sm" /></Group>
      ) : !rows || rows.length === 0 ? (
        <Text size="sm" c="dimmed">{emptyText}</Text>
      ) : (
        <Stack gap={4}>
          {rows.map((row) => (
            <Group key={row.id} justify="space-between" wrap="nowrap">
              <Text size="sm" truncate>{row.name}</Text>
              <Text size="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>{formatSek(row.amount)}</Text>
            </Group>
          ))}
        </Stack>
      )}
    </Card>
  )
}

export function CompactOverview({ year, month }: { year: number; month: number }) {
  const incomes = useIncomes(year, month)
  const expenses = useExpenses(year, month)
  const savings = useSavings(year, month)

  return (
    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
      <ListCard title="Inkomster" to="/inkomster" rows={incomes.data} isLoading={incomes.isLoading} emptyText="Inga inkomster" />
      <ListCard title="Utgifter" to="/utgifter" rows={expenses.data} isLoading={expenses.isLoading} emptyText="Inga utgifter" />
      <ListCard title="Sparande" to="/sparande" rows={savings.data} isLoading={savings.isLoading} emptyText="Inget sparande" />
    </SimpleGrid>
  )
}
