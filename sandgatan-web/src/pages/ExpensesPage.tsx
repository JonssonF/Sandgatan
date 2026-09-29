import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Drawer,
  Group,
  Loader,
  NumberInput,
  Select,
  SegmentedControl,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconCopy, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useCategories } from '../api/categories'
import {
  useCopyExpenseToNextMonth,
  useCreateExpense,
  useDeleteExpense,
  useExpenses,
  useUpdateExpense,
} from '../api/expenses'
import type { ExpenseDto, ExpenseType, UpsertExpenseDto } from '../api/types'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { useBudgetPeriod } from '../context/BudgetPeriodContext'
import { formatSek } from '../lib/format'

const emptyForm = (year: number, month: number): UpsertExpenseDto => ({
  name: '',
  amount: null,
  interestAmount: null,
  amortizationAmount: null,
  categoryId: 0,
  expenseType: 'Fixed',
  month,
  year,
  isRecurring: false,
  dueDay: null,
  notes: '',
})

export function ExpensesPage() {
  const { year, month } = useBudgetPeriod()
  const { data: expenses, isLoading } = useExpenses(year, month)
  const { data: categories } = useCategories()
  const createExpense = useCreateExpense(year, month)
  const updateExpense = useUpdateExpense(year, month)
  const deleteExpense = useDeleteExpense(year, month)
  const copyExpense = useCopyExpenseToNextMonth(year, month)

  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<UpsertExpenseDto>(emptyForm(year, month))
  const [deleteTarget, setDeleteTarget] = useState<ExpenseDto | null>(null)

  useEffect(() => {
    if ((location.state as { openAdd?: boolean } | null)?.openAdd) {
      openCreate()
      window.history.replaceState({}, '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm(year, month))
    setDrawerOpen(true)
  }

  function openEdit(expense: ExpenseDto) {
    setEditingId(expense.id)
    const breakdownSum = (expense.interestAmount ?? 0) + (expense.amortizationAmount ?? 0)
    const hasBreakdown = expense.interestAmount != null || expense.amortizationAmount != null
    const totalWasDerived = hasBreakdown && expense.amount === breakdownSum
    setForm({
      name: expense.name,
      amount: totalWasDerived ? null : expense.amount,
      interestAmount: expense.interestAmount ?? null,
      amortizationAmount: expense.amortizationAmount ?? null,
      categoryId: expense.categoryId,
      expenseType: expense.expenseType,
      month: expense.month,
      year: expense.year,
      isRecurring: expense.isRecurring,
      dueDay: expense.dueDay ?? null,
      notes: expense.notes ?? '',
    })
    setDrawerOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.categoryId) return
    if (form.amount == null && form.interestAmount == null && form.amortizationAmount == null) {
      notifications.show({
        message: selectedCategory?.isLoan ? 'Ange ett totalbelopp, eller ränta och/eller amortering.' : 'Ange ett belopp.',
        color: 'red',
      })
      return
    }
    if (editingId) {
      await updateExpense.mutateAsync({ id: editingId, dto: form })
      notifications.show({ message: 'Utgiften uppdaterades', color: 'teal' })
    } else {
      await createExpense.mutateAsync(form)
      notifications.show({ message: 'Utgiften lades till', color: 'teal' })
    }
    setDrawerOpen(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteExpense.mutateAsync(deleteTarget.id)
    notifications.show({ message: 'Utgiften togs bort', color: 'teal' })
    setDeleteTarget(null)
  }

  async function handleCopy(expense: ExpenseDto) {
    await copyExpense.mutateAsync(expense.id)
    notifications.show({ message: `${expense.name} kopierades till nästa månad`, color: 'teal' })
  }

  const total = expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0
  const selectedCategory = categories?.find((c) => c.id === form.categoryId)
  const categoryOptions = (categories ?? []).map((c) => ({ value: String(c.id), label: c.name }))

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Utgifter</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={openCreate}>Lägg till utgift</Button>
      </Group>

      <Card withBorder padding={0} radius="md">
        {isLoading ? (
          <Group justify="center" py="xl"><Loader /></Group>
        ) : !expenses || expenses.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">Inga utgifter registrerade för denna månad ännu.</Text>
        ) : (
          <Table.ScrollContainer minWidth={700}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Namn</Table.Th>
                  <Table.Th>Kategori</Table.Th>
                  <Table.Th>Typ</Table.Th>
                  <Table.Th>Återkommande</Table.Th>
                  <Table.Th ta="right">Belopp</Table.Th>
                  <Table.Th ta="right">Åtgärder</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {expenses.map((expense) => (
                  <Table.Tr key={expense.id}>
                    <Table.Td>
                      {expense.name}
                      {(expense.interestAmount != null || expense.amortizationAmount != null) && (
                        <Text size="xs" c="dimmed">
                          Ränta {formatSek(expense.interestAmount ?? 0)} · Amortering {formatSek(expense.amortizationAmount ?? 0)}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>{expense.categoryName}</Table.Td>
                    <Table.Td>
                      <Badge variant="light" color={expense.expenseType === 'Fixed' ? 'blue' : 'orange'}>
                        {expense.expenseType === 'Fixed' ? 'Fast' : 'Rörlig'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{expense.isRecurring ? 'Ja' : 'Nej'}</Table.Td>
                    <Table.Td ta="right">{formatSek(expense.amount)}</Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <ActionIcon variant="subtle" aria-label="Kopiera till nästa månad" onClick={() => handleCopy(expense)}>
                          <IconCopy size={18} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" aria-label="Redigera" onClick={() => openEdit(expense)}>
                          <IconEdit size={18} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red" aria-label="Ta bort" onClick={() => setDeleteTarget(expense)}>
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr>
                  <Table.Th colSpan={4}>Totalt</Table.Th>
                  <Table.Th ta="right">{formatSek(total)}</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Tfoot>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      <Drawer opened={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingId ? 'Redigera utgift' : 'Ny utgift'} position="right">
        <Stack gap="sm">
          <TextInput label="Namn" placeholder="t.ex. Elhandel" value={form.name} onChange={(e) => setForm({ ...form, name: e.currentTarget.value })} required />
          <Select
            label="Kategori"
            placeholder="Välj kategori"
            data={categoryOptions}
            value={form.categoryId ? String(form.categoryId) : null}
            onChange={(value) => setForm({ ...form, categoryId: value ? Number(value) : 0 })}
            required
          />
          <div>
            <Text size="sm" fw={500} mb={4}>Typ</Text>
            <SegmentedControl
              fullWidth
              value={form.expenseType}
              onChange={(value) => setForm({ ...form, expenseType: value as ExpenseType })}
              data={[
                { label: 'Fast', value: 'Fixed' },
                { label: 'Rörlig', value: 'Variable' },
              ]}
            />
          </div>
          <NumberInput
            label={selectedCategory?.isLoan ? 'Totalt belopp (SEK, valfritt)' : 'Belopp (SEK)'}
            description={selectedCategory?.isLoan ? 'Anges ett totalbelopp gäller det. Annars räknas ränta + amortering.' : undefined}
            value={form.amount ?? ''}
            onChange={(v) => setForm({ ...form, amount: v === '' ? null : Number(v) })}
            min={0}
            thousandSeparator=" "
          />
          {selectedCategory?.isLoan && (
            <>
              <NumberInput
                label="Ränta (SEK, valfritt)"
                value={form.interestAmount ?? ''}
                onChange={(v) => setForm({ ...form, interestAmount: v === '' ? null : Number(v) })}
                min={0}
                thousandSeparator=" "
              />
              <NumberInput
                label="Amortering (SEK, valfritt)"
                value={form.amortizationAmount ?? ''}
                onChange={(v) => setForm({ ...form, amortizationAmount: v === '' ? null : Number(v) })}
                min={0}
                thousandSeparator=" "
              />
            </>
          )}
          <NumberInput
            label="Förfallodag (valfritt)"
            value={form.dueDay ?? ''}
            onChange={(v) => setForm({ ...form, dueDay: v === '' ? null : Number(v) })}
            min={1}
            max={31}
          />
          <Switch label="Återkommande varje månad" checked={form.isRecurring} onChange={(e) => setForm({ ...form, isRecurring: e.currentTarget.checked })} />
          <Textarea label="Anteckningar" value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.currentTarget.value })} autosize minRows={2} />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setDrawerOpen(false)}>Avbryt</Button>
            <Button onClick={handleSave} loading={createExpense.isPending || updateExpense.isPending}>Spara</Button>
          </Group>
        </Stack>
      </Drawer>

      <ConfirmDeleteModal
        opened={!!deleteTarget}
        itemName={deleteTarget?.name ?? ''}
        loading={deleteExpense.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Stack>
  )
}
