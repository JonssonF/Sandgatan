import { Anchor, Card, Group, Loader, SimpleGrid, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useExpenses } from '../api/expenses'
import { useIncomes } from '../api/incomes'
import { useSavings } from '../api/savings'
import type { IncomeDto } from '../api/types'
import { formatSek } from '../lib/format'
import { previousMonth } from '../lib/month'
import { IncomeQuickEdit } from './IncomeQuickEdit'

interface Row {
  id: number
  name: string
  amount: number
}

interface ListCardProps<T extends Row> {
  title: string
  to: string
  rows: T[] | undefined
  isLoading: boolean
  emptyText: string
  /** Optional wrapper around a row's content, e.g. to make it clickable. */
  wrapRow?: (row: T, content: ReactNode) => ReactNode
}

function ListCard<T extends Row>({ title, to, rows, isLoading, emptyText, wrapRow }: ListCardProps<T>) {
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
          {rows.map((row) => {
            const content = (
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm" truncate>{row.name}</Text>
                <Text size="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>{formatSek(row.amount)}</Text>
              </Group>
            )
            return <div key={row.id}>{wrapRow ? wrapRow(row, content) : content}</div>
          })}
        </Stack>
      )}
    </Card>
  )
}

export function CompactOverview({ year, month }: { year: number; month: number }) {
  const incomes = useIncomes(year, month)
  const prev = previousMonth(year, month)
  const previousIncomes = useIncomes(prev.year, prev.month)
  const expenses = useExpenses(year, month)
  const savings = useSavings(year, month)

  const previousAmountByName = new Map((previousIncomes.data ?? []).map((i) => [i.name, i.amount]))

  return (
    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
      <ListCard<IncomeDto>
        title="Inkomster"
        to="/inkomster"
        rows={incomes.data}
        isLoading={incomes.isLoading}
        emptyText="Inga inkomster"
        wrapRow={(income, content) => (
          <IncomeQuickEdit income={income} previousAmount={previousAmountByName.get(income.name)}>
            {content}
          </IncomeQuickEdit>
        )}
      />
      <ListCard title="Utgifter" to="/utgifter" rows={expenses.data} isLoading={expenses.isLoading} emptyText="Inga utgifter" />
      <ListCard title="Sparande" to="/sparande" rows={savings.data} isLoading={savings.isLoading} emptyText="Inget sparande" />
    </SimpleGrid>
  )
}
