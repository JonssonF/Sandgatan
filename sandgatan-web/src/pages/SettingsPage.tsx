import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Drawer,
  Group,
  Loader,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconEdit, IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { useCopyRecurring } from '../api/budget'
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '../api/categories'
import type { CategoryDto, UpsertCategoryDto } from '../api/types'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { useBudgetPeriod } from '../context/BudgetPeriodContext'
import { MONTH_NAMES_SV } from '../lib/month'

const emptyForm: UpsertCategoryDto = { name: '', color: null, icon: null, isLoan: false }

export function SettingsPage() {
  const { year, month } = useBudgetPeriod()
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const copyRecurring = useCopyRecurring(year, month)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<UpsertCategoryDto>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<CategoryDto | null>(null)

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setDrawerOpen(true)
  }

  function openEdit(category: CategoryDto) {
    setEditingId(category.id)
    setForm({ name: category.name, color: category.color, icon: category.icon, isLoan: category.isLoan })
    setDrawerOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    if (editingId) {
      await updateCategory.mutateAsync({ id: editingId, dto: form })
      notifications.show({ message: 'Kategorin uppdaterades', color: 'teal' })
    } else {
      await createCategory.mutateAsync(form)
      notifications.show({ message: 'Kategorin lades till', color: 'teal' })
    }
    setDrawerOpen(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const deleted = await deleteCategory.mutateAsync(deleteTarget.id)
    if (deleted) {
      notifications.show({ message: 'Kategorin togs bort', color: 'teal' })
    } else {
      notifications.show({
        message: 'Kategorin används av utgifter och kan inte tas bort.',
        color: 'red',
      })
    }
    setDeleteTarget(null)
  }

  async function handleCopyRecurring() {
    const result = await copyRecurring.mutateAsync()
    notifications.show({
      message: `Kopierade ${result.incomesCopied} inkomster, ${result.expensesCopied} utgifter och ${result.savingsCopied} sparanden till ${MONTH_NAMES_SV[month - 1]} ${year}.`,
      color: 'teal',
    })
  }

  return (
    <Stack gap="xl">
      <Title order={2}>Inställningar</Title>

      <Card withBorder padding="lg" radius="md">
        <Title order={4} mb="xs">Månadshantering</Title>
        <Text size="sm" c="dimmed" mb="md">
          Kopiera alla återkommande inkomster, utgifter och sparanden från föregående månad till{' '}
          {MONTH_NAMES_SV[month - 1]} {year}. Poster med samma namn som redan finns i månaden hoppas över.
        </Text>
        <Button leftSection={<IconRefresh size={18} />} onClick={handleCopyRecurring} loading={copyRecurring.isPending} variant="light">
          Kopiera återkommande poster hit
        </Button>
      </Card>

      <Card withBorder padding="lg" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Kategorier</Title>
          <Button leftSection={<IconPlus size={18} />} onClick={openCreate} size="sm">Ny kategori</Button>
        </Group>

        {isLoading ? (
          <Group justify="center" py="xl"><Loader /></Group>
        ) : !categories || categories.length === 0 ? (
          <Text c="dimmed">Inga kategorier ännu.</Text>
        ) : (
          <Table verticalSpacing="sm">
            <Table.Tbody>
              {categories.map((category) => (
                <Table.Tr key={category.id}>
                  <Table.Td>
                    {category.name}
                    {category.isLoan && <Badge ml="sm" variant="light">Lån</Badge>}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end">
                      <ActionIcon variant="subtle" aria-label="Redigera" onClick={() => openEdit(category)}>
                        <IconEdit size={18} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" aria-label="Ta bort" onClick={() => setDeleteTarget(category)}>
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      <Drawer opened={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingId ? 'Redigera kategori' : 'Ny kategori'} position="right">
        <Stack gap="sm">
          <TextInput label="Namn" placeholder="t.ex. Boende" value={form.name} onChange={(e) => setForm({ ...form, name: e.currentTarget.value })} required />
          <Switch
            label="Lånekategori"
            description="Utgifter i kategorin får fälten ränta och amortering, och summeras som lån på översikten."
            checked={form.isLoan}
            onChange={(e) => setForm({ ...form, isLoan: e.currentTarget.checked })}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setDrawerOpen(false)}>Avbryt</Button>
            <Button onClick={handleSave} loading={createCategory.isPending || updateCategory.isPending}>Spara</Button>
          </Group>
        </Stack>
      </Drawer>

      <ConfirmDeleteModal
        opened={!!deleteTarget}
        itemName={deleteTarget?.name ?? ''}
        loading={deleteCategory.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Stack>
  )
}
