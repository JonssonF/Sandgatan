import { Button, Group, NumberInput, Popover, SimpleGrid, Stack, Text, UnstyledButton } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { useUpdateExpense } from '../api/expenses'
import type { ExpenseDto } from '../api/types'
import { formatSek } from '../lib/format'
import { monthlyInterest } from '../lib/loanMath'
import { MONTH_NAMES_SV } from '../lib/month'

interface LoanQuickEditProps {
  expense: ExpenseDto
  /** Content of the clickable trigger. */
  children: ReactNode
}

/** Quick update of a loan's debt, interest rate and amortization for one month. */
export function LoanQuickEdit({ expense, children }: LoanQuickEditProps) {
  const [opened, setOpened] = useState(false)

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom-start" withArrow shadow="md" trapFocus width={300}>
      <Popover.Target>
        <UnstyledButton
          className="quick-edit-trigger"
          onClick={() => setOpened((o) => !o)}
          aria-label={`Uppdatera lån ${expense.name}`}
        >
          {children}
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown>
        {opened && <LoanQuickEditForm expense={expense} onDone={() => setOpened(false)} />}
      </Popover.Dropdown>
    </Popover>
  )
}

type NumberValue = number | string

function toNumber(v: NumberValue): number | null {
  return v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v)
}

function LoanQuickEditForm({ expense, onDone }: { expense: ExpenseDto; onDone: () => void }) {
  const updateExpense = useUpdateExpense(expense.year, expense.month)
  const [balance, setBalance] = useState<NumberValue>(expense.loanBalance ?? '')
  const [rate, setRate] = useState<NumberValue>(expense.interestRatePercent ?? '')
  const [amortization, setAmortization] = useState<NumberValue>(expense.amortizationAmount ?? '')

  const b = toNumber(balance)
  const r = toNumber(rate)
  const a = toNumber(amortization) ?? 0
  const canCalculate = b != null && r != null
  const interest = canCalculate ? monthlyInterest(b, r) : null
  const incomplete = (b == null) !== (r == null)

  async function handleSave() {
    if (incomplete) return
    await updateExpense.mutateAsync({
      id: expense.id,
      dto: {
        name: expense.name,
        // Calculated loans: backend sets amount = interest + amortization.
        amount: canCalculate ? null : expense.amount,
        interestAmount: canCalculate ? null : expense.interestAmount ?? null,
        amortizationAmount: toNumber(amortization),
        loanBalance: b,
        interestRatePercent: r,
        categoryId: expense.categoryId,
        expenseType: expense.expenseType,
        month: expense.month,
        year: expense.year,
        isRecurring: expense.isRecurring,
        dueDay: expense.dueDay ?? null,
        notes: expense.notes ?? null,
      },
    })
    notifications.show({ message: `${expense.name} uppdaterades`, color: 'teal' })
    onDone()
  }

  const onEnter = (e: KeyboardEvent) => e.key === 'Enter' && handleSave()

  return (
    <Stack gap="xs">
      <div>
        <Text fw={600} size="sm" truncate>{expense.name}</Text>
        <Text size="xs" c="dimmed">{MONTH_NAMES_SV[expense.month - 1]} {expense.year}</Text>
      </div>
      <NumberInput
        label="Total skuld"
        value={balance}
        onChange={setBalance}
        onKeyDown={onEnter}
        onFocus={(e) => e.currentTarget.select()}
        min={0}
        thousandSeparator=" "
        suffix=" kr"
        allowNegative={false}
        data-autofocus
      />
      <SimpleGrid cols={2} spacing="xs">
        <NumberInput
          label="Räntesats"
          value={rate}
          onChange={setRate}
          onKeyDown={onEnter}
          onFocus={(e) => e.currentTarget.select()}
          min={0}
          max={100}
          decimalScale={3}
          decimalSeparator=","
          suffix=" %"
          allowNegative={false}
        />
        <NumberInput
          label="Amortering/mån"
          value={amortization}
          onChange={setAmortization}
          onKeyDown={onEnter}
          onFocus={(e) => e.currentTarget.select()}
          min={0}
          thousandSeparator=" "
          suffix=" kr"
          allowNegative={false}
        />
      </SimpleGrid>
      {incomplete ? (
        <Text size="xs" c="red">Fyll i både skuld och räntesats.</Text>
      ) : interest != null ? (
        <Text size="xs" c="dimmed">
          Ränta {formatSek(interest)} + amortering {formatSek(a)} = <b>{formatSek(interest + a)}</b> denna månad
        </Text>
      ) : null}
      <Group justify="flex-end" gap="xs">
        <Button variant="default" size="xs" onClick={onDone}>Avbryt</Button>
        <Button size="xs" onClick={handleSave} disabled={incomplete} loading={updateExpense.isPending}>Spara</Button>
      </Group>
    </Stack>
  )
}
