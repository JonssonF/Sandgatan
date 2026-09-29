import { Button, Group, NumberInput, Popover, Stack, Text, UnstyledButton } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useState, type ReactNode } from 'react'
import { useUpdateIncome } from '../api/incomes'
import type { IncomeDto } from '../api/types'
import { formatSek } from '../lib/format'
import { MONTH_NAMES_SV, previousMonth } from '../lib/month'

interface IncomeQuickEditProps {
  income: IncomeDto
  /** Same-named income's amount in the previous month, shown as a reference. */
  previousAmount?: number | null
  /** Content of the clickable trigger (e.g. the name + amount row). */
  children: ReactNode
}

/**
 * One-tap amount update for a month's income (e.g. this month's salary). Only the amount
 * changes — everything else is kept as is.
 */
export function IncomeQuickEdit({ income, previousAmount, children }: IncomeQuickEditProps) {
  const [opened, setOpened] = useState(false)

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom" withArrow shadow="md" trapFocus width={280}>
      <Popover.Target>
        <UnstyledButton
          className="quick-edit-trigger"
          onClick={() => setOpened((o) => !o)}
          aria-label={`Uppdatera belopp för ${income.name}`}
        >
          {children}
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown>
        {/* Rendered only while open, so the input starts from the current amount every time. */}
        {opened && <QuickEditForm income={income} previousAmount={previousAmount} onDone={() => setOpened(false)} />}
      </Popover.Dropdown>
    </Popover>
  )
}

function QuickEditForm({ income, previousAmount, onDone }: { income: IncomeDto; previousAmount?: number | null; onDone: () => void }) {
  const updateIncome = useUpdateIncome(income.year, income.month)
  const [amount, setAmount] = useState<number | string>(income.amount)
  const prev = previousMonth(income.year, income.month)

  async function handleSave() {
    const value = Number(amount)
    if (amount === '' || Number.isNaN(value) || value < 0) return
    if (value !== income.amount) {
      await updateIncome.mutateAsync({
        id: income.id,
        dto: {
          name: income.name,
          amount: value,
          person: income.person,
          categoryId: income.categoryId ?? null,
          month: income.month,
          year: income.year,
          isRecurring: income.isRecurring,
          notes: income.notes ?? null,
        },
      })
      notifications.show({ message: `${income.name}: ${formatSek(value)} för ${MONTH_NAMES_SV[income.month - 1].toLowerCase()}`, color: 'teal' })
    }
    onDone()
  }

  return (
    <Stack gap="xs">
      <div>
        <Text fw={600} size="sm" truncate>{income.name}</Text>
        <Text size="xs" c="dimmed">Belopp för {MONTH_NAMES_SV[income.month - 1].toLowerCase()} {income.year}</Text>
      </div>
      <NumberInput
        value={amount}
        onChange={setAmount}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        onFocus={(e) => e.currentTarget.select()}
        min={0}
        thousandSeparator=" "
        suffix=" kr"
        allowNegative={false}
        data-autofocus
        aria-label={`Belopp för ${income.name}`}
      />
      {previousAmount != null && (
        <Text size="xs" c="dimmed">
          {MONTH_NAMES_SV[prev.month - 1]}: {formatSek(previousAmount)}
        </Text>
      )}
      <Group justify="flex-end" gap="xs">
        <Button variant="default" size="xs" onClick={onDone}>Avbryt</Button>
        <Button size="xs" onClick={handleSave} loading={updateIncome.isPending}>Spara</Button>
      </Group>
    </Stack>
  )
}
