import { Badge, Button, Checkbox, Divider, Group, Loader, Modal, ScrollArea, Stack, Text, type ButtonProps } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconCopy } from '@tabler/icons-react'
import { useState } from 'react'
import { useCopyToNextMonth } from '../api/budget'
import { useExpenses } from '../api/expenses'
import { useIncomes } from '../api/incomes'
import { useSavings } from '../api/savings'
import { useBudgetPeriod } from '../context/BudgetPeriodContext'
import { formatSek } from '../lib/format'
import { MONTH_NAMES_SV, nextMonth } from '../lib/month'

type Kind = 'income' | 'expense' | 'saving'

interface Row {
  key: string
  kind: Kind
  id: number
  name: string
  amount: number
  /** An entry with the same name already exists next month — copying it again would create a duplicate. */
  alreadyCopied: boolean
}

const GROUPS: { kind: Kind; label: string }[] = [
  { kind: 'income', label: 'Inkomster' },
  { kind: 'expense', label: 'Utgifter' },
  { kind: 'saving', label: 'Sparande' },
]

/**
 * Lets the user pick entries in the selected month (or tick "Markera alla") and copy them to the next month.
 * Entries whose name already exists next month are shown as already copied and can't be selected,
 * matching the backend which skips them too.
 */
export function CopyToNextMonthButton({ variant = 'light' }: { variant?: ButtonProps['variant'] }) {
  const { year, month } = useBudgetPeriod()
  const [opened, setOpened] = useState(false)
  const next = nextMonth(year, month)

  return (
    <>
      <Button variant={variant} leftSection={<IconCopy size={18} />} onClick={() => setOpened(true)}>
        Kopiera till {MONTH_NAMES_SV[next.month - 1].toLowerCase()}
      </Button>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Kopiera poster till nästa månad" centered size="lg">
        {opened && <CopyToNextMonthForm year={year} month={month} onDone={() => setOpened(false)} />}
      </Modal>
    </>
  )
}

function CopyToNextMonthForm({ year, month, onDone }: { year: number; month: number; onDone: () => void }) {
  const next = nextMonth(year, month)
  const incomes = useIncomes(year, month)
  const expenses = useExpenses(year, month)
  const savings = useSavings(year, month)
  const nextIncomes = useIncomes(next.year, next.month)
  const nextExpenses = useExpenses(next.year, next.month)
  const nextSavings = useSavings(next.year, next.month)
  const copy = useCopyToNextMonth()
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const fromName = MONTH_NAMES_SV[month - 1].toLowerCase()
  const toName = `${MONTH_NAMES_SV[next.month - 1].toLowerCase()}${next.year !== year ? ` ${next.year}` : ''}`

  const queries = [incomes, expenses, savings, nextIncomes, nextExpenses, nextSavings]
  if (queries.some((q) => q.isLoading)) {
    return <Group justify="center" py="xl"><Loader /></Group>
  }

  function toRows<T extends { id: number; name: string; amount: number }>(kind: Kind, items: T[] = [], nextItems: T[] = []): Row[] {
    const nextNames = new Set(nextItems.map((i) => i.name))
    return items.map((i) => ({
      key: `${kind}:${i.id}`,
      kind,
      id: i.id,
      name: i.name,
      amount: i.amount,
      alreadyCopied: nextNames.has(i.name),
    }))
  }

  const rows = [
    ...toRows('income', incomes.data, nextIncomes.data),
    ...toRows('expense', expenses.data, nextExpenses.data),
    ...toRows('saving', savings.data, nextSavings.data),
  ]
  const selectable = rows.filter((r) => !r.alreadyCopied)
  const allSelected = selectable.length > 0 && selectable.every((r) => selected.has(r.key))
  const someSelected = selectable.some((r) => selected.has(r.key))

  function toggle(key: string) {
    setSelected((prev) => {
      const nextSet = new Set(prev)
      if (nextSet.has(key)) nextSet.delete(key)
      else nextSet.add(key)
      return nextSet
    })
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(selectable.map((r) => r.key)))
  }

  async function handleCopy() {
    const chosen = selectable.filter((r) => selected.has(r.key))
    const idsOf = (kind: Kind) => chosen.filter((r) => r.kind === kind).map((r) => r.id)
    try {
      const result = await copy.mutateAsync({
        year,
        month,
        selection: { incomeIds: idsOf('income'), expenseIds: idsOf('expense'), savingIds: idsOf('saving') },
      })
      const parts = [
        result.incomesCopied && `${result.incomesCopied} inkomster`,
        result.expensesCopied && `${result.expensesCopied} utgifter`,
        result.savingsCopied && `${result.savingsCopied} sparanden`,
      ].filter(Boolean)
      notifications.show({
        title: `Kopierat till ${toName}`,
        message: parts.length > 0 ? `${parts.join(', ')} kopierades.` : 'Inget nytt behövde kopieras.',
        color: 'teal',
      })
      onDone()
    } catch {
      notifications.show({ message: 'Kopieringen misslyckades. Försök igen.', color: 'red' })
    }
  }

  if (rows.length === 0) {
    return <Text c="dimmed">Det finns inga poster i {fromName} att kopiera.</Text>
  }

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Välj vilka poster i {fromName} som ska kopieras till {toName}. Poster som redan finns där (samma namn) är
        bockade och kan inte kopieras igen, så det blir inga dubbletter. Lån räknas fram med ny skuld efter amortering.
      </Text>

      <Checkbox
        label={<b>Markera alla</b>}
        checked={allSelected || selectable.length === 0}
        indeterminate={someSelected && !allSelected}
        disabled={selectable.length === 0}
        onChange={toggleAll}
      />
      <Divider />

      <ScrollArea.Autosize mah="50vh" offsetScrollbars>
        <Stack gap="md">
          {GROUPS.map(({ kind, label }) => {
            const groupRows = rows.filter((r) => r.kind === kind)
            if (groupRows.length === 0) return null
            return (
              <Stack key={kind} gap={6}>
                <Text size="sm" fw={600}>{label}</Text>
                {groupRows.map((r) => (
                  <Group key={r.key} justify="space-between" wrap="nowrap" gap="sm">
                    <Checkbox
                      label={r.name}
                      checked={r.alreadyCopied || selected.has(r.key)}
                      disabled={r.alreadyCopied}
                      onChange={() => toggle(r.key)}
                    />
                    <Group gap="xs" wrap="nowrap">
                      {r.alreadyCopied && <Badge variant="light" color="teal" size="sm">Redan kopierad</Badge>}
                      <Text size="sm" c={r.alreadyCopied ? 'dimmed' : undefined}>{formatSek(r.amount)}</Text>
                    </Group>
                  </Group>
                ))}
              </Stack>
            )
          })}
        </Stack>
      </ScrollArea.Autosize>

      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {selectable.length === 0 ? `Allt finns redan i ${toName}.` : `${selected.size} av ${selectable.length} valda`}
        </Text>
        <Group gap="sm">
          <Button variant="default" onClick={onDone}>Avbryt</Button>
          <Button onClick={handleCopy} loading={copy.isPending} disabled={selected.size === 0}>
            Kopiera {selected.size > 0 ? selected.size : ''} {selected.size === 1 ? 'post' : 'poster'}
          </Button>
        </Group>
      </Group>
    </Stack>
  )
}
