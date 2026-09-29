import {
  ActionIcon,
  Button,
  Card,
  Drawer,
  Group,
  Loader,
  NumberInput,
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
import {
  useCopySavingToNextMonth,
  useCreateSaving,
  useDeleteSaving,
  useSavings,
  useUpdateSaving,
} from '../api/savings'
import type { SavingDto, UpsertSavingDto } from '../api/types'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { useBudgetPeriod } from '../context/BudgetPeriodContext'
import { formatSek } from '../lib/format'

const emptyForm = (year: number, month: number): UpsertSavingDto => ({
  name: '',
  amount: 0,
  person: '',
  month,
  year,
  isRecurring: false,
  savingsType: '',
  notes: '',
})

export function SavingsPage() {
  const { year, month } = useBudgetPeriod()
  const { data: savings, isLoading } = useSavings(year, month)
  const createSaving = useCreateSaving(year, month)
  const updateSaving = useUpdateSaving(year, month)
  const deleteSaving = useDeleteSaving(year, month)
  const copySaving = useCopySavingToNextMonth(year, month)

  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<UpsertSavingDto>(emptyForm(year, month))
  const [deleteTarget, setDeleteTarget] = useState<SavingDto | null>(null)

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

  function openEdit(saving: SavingDto) {
    setEditingId(saving.id)
    setForm({
      name: saving.name,
      amount: saving.amount,
      person: saving.person ?? '',
      month: saving.month,
      year: saving.year,
      isRecurring: saving.isRecurring,
      savingsType: saving.savingsType,
      notes: saving.notes ?? '',
    })
    setDrawerOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.savingsType.trim()) return
    if (editingId) {
      await updateSaving.mutateAsync({ id: editingId, dto: form })
      notifications.show({ message: 'Sparandet uppdaterades', color: 'teal' })
    } else {
      await createSaving.mutateAsync(form)
      notifications.show({ message: 'Sparandet lades till', color: 'teal' })
    }
    setDrawerOpen(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteSaving.mutateAsync(deleteTarget.id)
    notifications.show({ message: 'Sparandet togs bort', color: 'teal' })
    setDeleteTarget(null)
  }

  async function handleCopy(saving: SavingDto) {
    await copySaving.mutateAsync(saving.id)
    notifications.show({ message: `${saving.name} kopierades till nästa månad`, color: 'teal' })
  }

  const total = savings?.reduce((sum, s) => sum + s.amount, 0) ?? 0

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Sparande</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={openCreate}>Lägg till sparande</Button>
      </Group>

      <Card withBorder padding={0} radius="md">
        {isLoading ? (
          <Group justify="center" py="xl"><Loader /></Group>
        ) : !savings || savings.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">Inget sparande registrerat för denna månad ännu.</Text>
        ) : (
          <Table.ScrollContainer minWidth={650}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Namn</Table.Th>
                  <Table.Th>Typ</Table.Th>
                  <Table.Th>Person</Table.Th>
                  <Table.Th>Återkommande</Table.Th>
                  <Table.Th ta="right">Belopp</Table.Th>
                  <Table.Th ta="right">Åtgärder</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {savings.map((saving) => (
                  <Table.Tr key={saving.id}>
                    <Table.Td>{saving.name}</Table.Td>
                    <Table.Td>{saving.savingsType}</Table.Td>
                    <Table.Td>{saving.person || '—'}</Table.Td>
                    <Table.Td>{saving.isRecurring ? 'Ja' : 'Nej'}</Table.Td>
                    <Table.Td ta="right">{formatSek(saving.amount)}</Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <ActionIcon variant="subtle" aria-label="Kopiera till nästa månad" onClick={() => handleCopy(saving)}>
                          <IconCopy size={18} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" aria-label="Redigera" onClick={() => openEdit(saving)}>
                          <IconEdit size={18} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red" aria-label="Ta bort" onClick={() => setDeleteTarget(saving)}>
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

      <Drawer opened={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingId ? 'Redigera sparande' : 'Nytt sparande'} position="right">
        <Stack gap="sm">
          <TextInput label="Namn" placeholder="t.ex. Pension Fredrik" value={form.name} onChange={(e) => setForm({ ...form, name: e.currentTarget.value })} required />
          <TextInput label="Typ av sparande" placeholder="t.ex. Pension, Investering" value={form.savingsType} onChange={(e) => setForm({ ...form, savingsType: e.currentTarget.value })} required />
          <TextInput label="Person (valfritt)" placeholder="t.ex. Fredrik" value={form.person ?? ''} onChange={(e) => setForm({ ...form, person: e.currentTarget.value })} />
          <NumberInput label="Belopp (SEK)" value={form.amount} onChange={(v) => setForm({ ...form, amount: Number(v) || 0 })} min={0} thousandSeparator=" " />
          <Switch label="Återkommande varje månad" checked={form.isRecurring} onChange={(e) => setForm({ ...form, isRecurring: e.currentTarget.checked })} />
          <Textarea label="Anteckningar" value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.currentTarget.value })} autosize minRows={2} />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setDrawerOpen(false)}>Avbryt</Button>
            <Button onClick={handleSave} loading={createSaving.isPending || updateSaving.isPending}>Spara</Button>
          </Group>
        </Stack>
      </Drawer>

      <ConfirmDeleteModal
        opened={!!deleteTarget}
        itemName={deleteTarget?.name ?? ''}
        loading={deleteSaving.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Stack>
  )
}
