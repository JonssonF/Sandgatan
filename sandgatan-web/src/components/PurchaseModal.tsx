import { Button, Chip, Group, Modal, NumberInput, Stack, Text, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'
import { useCategories } from '../api/categories'
import { useCreatePurchase, useUpdatePurchase } from '../api/purchases'
import type { PurchaseDto } from '../api/types'
import { useBudgetPeriod } from '../context/BudgetPeriodContext'
import { formatSek } from '../lib/format'
import { toIsoDate } from '../lib/payday'
import { CategoryDot } from './CategoryDot'

interface PurchaseModalProps {
  opened: boolean
  onClose: () => void
  /** Edit this purchase; omit to log a new one. */
  purchase?: PurchaseDto | null
}

/** Quick logging of an everyday purchase: amount, what, category — the date defaults to today. */
export function PurchaseModal({ opened, onClose, purchase }: PurchaseModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={purchase ? 'Redigera köp' : 'Nytt köp'} centered>
      {/* Remount per open so the form starts fresh. */}
      {opened && <PurchaseForm purchase={purchase ?? null} onDone={onClose} />}
    </Modal>
  )
}

function defaultDate(year: number, month: number): string {
  const today = new Date()
  // Logging into another month than today's: start on that month's first day.
  if (today.getFullYear() === year && today.getMonth() + 1 === month) return toIsoDate(today)
  return toIsoDate(new Date(year, month - 1, 1))
}

function PurchaseForm({ purchase, onDone }: { purchase: PurchaseDto | null; onDone: () => void }) {
  const { year, month } = useBudgetPeriod()
  const { data: categories } = useCategories()
  const create = useCreatePurchase()
  const update = useUpdatePurchase()

  const [amount, setAmount] = useState<number | ''>(purchase?.amount ?? '')
  const [name, setName] = useState(purchase?.name ?? '')
  const [categoryId, setCategoryId] = useState<string | null>(purchase ? String(purchase.categoryId) : null)
  const [date, setDate] = useState(purchase?.date ?? defaultDate(year, month))

  // Loans are bills, not everyday purchases.
  const options = (categories ?? []).filter((c) => c.type === 'Expense' && !c.isLoan)
  const canSave = amount !== '' && amount > 0 && name.trim() !== '' && categoryId !== null && date !== ''

  async function handleSave() {
    if (!canSave) return
    const dto = { name: name.trim(), amount: Number(amount), categoryId: Number(categoryId), date }
    try {
      if (purchase) {
        await update.mutateAsync({ id: purchase.id, dto })
        notifications.show({ message: `${dto.name} uppdaterades`, color: 'teal' })
      } else {
        await create.mutateAsync(dto)
        notifications.show({ message: `${dto.name}: ${formatSek(dto.amount)} lades till`, color: 'teal' })
      }
      onDone()
    } catch {
      notifications.show({ message: 'Köpet kunde inte sparas. Försök igen.', color: 'red' })
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void handleSave() }}>
      <Stack gap="sm">
        <NumberInput
          label="Belopp"
          placeholder="0"
          value={amount}
          onChange={(v) => setAmount(v === '' ? '' : Number(v))}
          min={0}
          thousandSeparator=" "
          suffix=" kr"
          allowNegative={false}
          inputMode="decimal"
          size="lg"
          data-autofocus
          required
        />
        <TextInput
          label="Vad"
          placeholder="t.ex. ICA, skor till barnen, punka"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />
        <div>
          <Text size="sm" fw={500} mb={6}>Kategori</Text>
          <Chip.Group value={categoryId} onChange={(v) => setCategoryId(v as string)}>
            <Group gap={6}>
              {options.map((c) => (
                <Chip key={c.id} value={String(c.id)} size="sm" variant="light">
                  <Group gap={6} wrap="nowrap" component="span">
                    <CategoryDot color={c.color} size={8} />
                    {c.name}
                  </Group>
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        </div>
        <TextInput label="Datum" type="date" value={date} onChange={(e) => setDate(e.currentTarget.value)} required />
        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={onDone}>Avbryt</Button>
          <Button type="submit" disabled={!canSave} loading={create.isPending || update.isPending}>
            {purchase ? 'Spara' : 'Lägg till'}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
