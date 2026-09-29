import {
  ActionIcon,
  Button,
  Card,
  Drawer,
  Group,
  Loader,
  NumberInput,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconCopy, IconEdit, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useCategories } from '../api/categories'
import {
  useCopyIncomeToNextMonth,
  useCreateIncome,
  useDeleteIncome,
  useIncomes,
  useUpdateIncome,
} from '../api/incomes'
import type { IncomeDto, UpsertIncomeDto } from '../api/types'
import { CategoryDot } from '../components/CategoryDot'
import { CategoryModal } from '../components/CategoryModal'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { IncomeQuickEdit } from '../components/IncomeQuickEdit'
import { useBudgetPeriod } from '../context/BudgetPeriodContext'
import { formatSek } from '../lib/format'
import { MONTH_NAMES_SV, previousMonth } from '../lib/month'

const emptyForm = (year: number, month: number): UpsertIncomeDto => ({
  name: '',
  amount: 0,
  person: '',
  categoryId: null,
  month,
  year,
  isRecurring: false,
  notes: '',
})

export function IncomesPage() {
  const { year, month } = useBudgetPeriod()
  const { data: incomes, isLoading } = useIncomes(year, month)
  const prev = previousMonth(year, month)
  const { data: previousIncomes } = useIncomes(prev.year, prev.month)
  const { data: categories } = useCategories()
  const createIncome = useCreateIncome(year, month)
  const updateIncome = useUpdateIncome(year, month)
  const deleteIncome = useDeleteIncome(year, month)
  const copyIncome = useCopyIncomeToNextMonth(year, month)

  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<UpsertIncomeDto>(emptyForm(year, month))
  const [deleteTarget, setDeleteTarget] = useState<IncomeDto | null>(null)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)

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

  function openEdit(income: IncomeDto) {
    setEditingId(income.id)
    setForm({
      name: income.name,
      amount: income.amount,
      person: income.person,
      categoryId: income.categoryId ?? null,
      month: income.month,
      year: income.year,
      isRecurring: income.isRecurring,
      notes: income.notes ?? '',
    })
    setDrawerOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.person.trim()) return
    if (editingId) {
      await updateIncome.mutateAsync({ id: editingId, dto: form })
      notifications.show({ message: 'Inkomsten uppdaterades', color: 'teal' })
    } else {
      await createIncome.mutateAsync(form)
      notifications.show({ message: 'Inkomsten lades till', color: 'teal' })
    }
    setDrawerOpen(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteIncome.mutateAsync(deleteTarget.id)
    notifications.show({ message: 'Inkomsten togs bort', color: 'teal' })
    setDeleteTarget(null)
  }

  async function handleCopy(income: IncomeDto) {
    await copyIncome.mutateAsync(income.id)
    notifications.show({ message: `${income.name} kopierades till nästa månad`, color: 'teal' })
  }

  const total = incomes?.reduce((sum, i) => sum + i.amount, 0) ?? 0
  const previousAmountByName = new Map((previousIncomes ?? []).map((i) => [i.name, i.amount]))
  const incomeCategories = (categories ?? []).filter((c) => c.type === 'Income')
  const categoryById = new Map((categories ?? []).map((c) => [c.id, c]))
  const prevMonthName = MONTH_NAMES_SV[prev.month - 1]

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Inkomster</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={openCreate}>Lägg till inkomst</Button>
      </Group>

      <Card withBorder padding={0} radius="md">
        {isLoading ? (
          <Group justify="center" py="xl"><Loader /></Group>
        ) : !incomes || incomes.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">Inga inkomster registrerade för denna månad ännu.</Text>
        ) : (
          <Table.ScrollContainer minWidth={700}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Namn</Table.Th>
                  <Table.Th>Kategori</Table.Th>
                  <Table.Th>Person</Table.Th>
                  <Table.Th>Återkommande</Table.Th>
                  <Table.Th ta="right">Belopp</Table.Th>
                  <Table.Th ta="right">Åtgärder</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {incomes.map((income) => {
                  const previousAmount = previousAmountByName.get(income.name)
                  const category = income.categoryId ? categoryById.get(income.categoryId) : undefined
                  return (
                    <Table.Tr key={income.id}>
                      <Table.Td>
                        <IncomeQuickEdit income={income} previousAmount={previousAmount}>
                          <Group gap={6} wrap="nowrap">
                            <Text size="sm" fw={500}>{income.name}</Text>
                            <IconPencil size={14} color="var(--mantine-color-dimmed)" />
                          </Group>
                          {previousAmount != null && (
                            <Text size="xs" c="dimmed">
                              {previousAmount === income.amount ? `Samma som ${prevMonthName.toLowerCase()}` : `${prevMonthName}: ${formatSek(previousAmount)}`}
                            </Text>
                          )}
                        </IncomeQuickEdit>
                      </Table.Td>
                      <Table.Td>
                        {category ? (
                          <Group gap="xs" wrap="nowrap">
                            <CategoryDot color={category.color} />
                            {category.name}
                          </Group>
                        ) : (
                          <Text size="sm" c="dimmed">–</Text>
                        )}
                      </Table.Td>
                      <Table.Td>{income.person}</Table.Td>
                      <Table.Td>{income.isRecurring ? 'Ja' : 'Nej'}</Table.Td>
                      <Table.Td ta="right">{formatSek(income.amount)}</Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="flex-end">
                          <ActionIcon variant="subtle" aria-label="Kopiera till nästa månad" onClick={() => handleCopy(income)}>
                            <IconCopy size={18} />
                          </ActionIcon>
                          <ActionIcon variant="subtle" aria-label="Redigera" onClick={() => openEdit(income)}>
                            <IconEdit size={18} />
                          </ActionIcon>
                          <ActionIcon variant="subtle" color="red" aria-label="Ta bort" onClick={() => setDeleteTarget(income)}>
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  )
                })}
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

      <Drawer opened={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingId ? 'Redigera inkomst' : 'Ny inkomst'} position="right">
        <Stack gap="sm">
          <TextInput label="Namn" placeholder="t.ex. Lön Fredrik" value={form.name} onChange={(e) => setForm({ ...form, name: e.currentTarget.value })} required />
          <Select
            label="Kategori"
            placeholder="Välj kategori (valfritt)"
            data={incomeCategories.map((c) => ({ value: String(c.id), label: c.name }))}
            value={form.categoryId ? String(form.categoryId) : null}
            onChange={(value) => setForm({ ...form, categoryId: value ? Number(value) : null })}
            clearable
            searchable
            nothingFoundMessage="Ingen kategori matchar"
          />
          <Button
            variant="subtle"
            size="compact-sm"
            leftSection={<IconPlus size={14} />}
            onClick={() => setCategoryModalOpen(true)}
            style={{ alignSelf: 'flex-start' }}
            mt={-6}
          >
            Ny kategori
          </Button>
          <TextInput label="Person" placeholder="t.ex. Fredrik" value={form.person} onChange={(e) => setForm({ ...form, person: e.currentTarget.value })} required />
          <NumberInput label="Belopp (SEK)" value={form.amount} onChange={(v) => setForm({ ...form, amount: Number(v) || 0 })} min={0} thousandSeparator=" " />
          <Switch label="Återkommande varje månad" checked={form.isRecurring} onChange={(e) => setForm({ ...form, isRecurring: e.currentTarget.checked })} />
          <Textarea label="Anteckningar" value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.currentTarget.value })} autosize minRows={2} />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setDrawerOpen(false)}>Avbryt</Button>
            <Button onClick={handleSave} loading={createIncome.isPending || updateIncome.isPending}>Spara</Button>
          </Group>
        </Stack>
      </Drawer>

      <CategoryModal
        opened={categoryModalOpen}
        category={null}
        type="Income"
        onClose={() => setCategoryModalOpen(false)}
        onSaved={(created) => setForm((f) => ({ ...f, categoryId: created.id }))}
      />

      <ConfirmDeleteModal
        opened={!!deleteTarget}
        itemName={deleteTarget?.name ?? ''}
        loading={deleteIncome.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Stack>
  )
}
