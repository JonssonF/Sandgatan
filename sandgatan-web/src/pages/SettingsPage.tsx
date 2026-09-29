import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconEdit, IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { useCopyRecurring } from '../api/budget'
import { useCategories, useDeleteCategory } from '../api/categories'
import type { CategoryDto, CategoryType } from '../api/types'
import { CategoryDot } from '../components/CategoryDot'
import { CategoryModal } from '../components/CategoryModal'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { useBudgetPeriod } from '../context/BudgetPeriodContext'
import { MONTH_NAMES_SV } from '../lib/month'

export function SettingsPage() {
  const { year, month } = useBudgetPeriod()
  const { data: categories, isLoading } = useCategories()
  const deleteCategory = useDeleteCategory()
  const copyRecurring = useCopyRecurring(year, month)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<CategoryType>('Expense')
  const [editing, setEditing] = useState<CategoryDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryDto | null>(null)

  function openCreate(type: CategoryType) {
    setEditing(null)
    setModalType(type)
    setModalOpen(true)
  }

  function openEdit(category: CategoryDto) {
    setEditing(category)
    setModalType(category.type)
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const deleted = await deleteCategory.mutateAsync(deleteTarget.id)
    if (deleted) {
      notifications.show({ message: 'Kategorin togs bort', color: 'teal' })
    } else {
      notifications.show({
        message: 'Kategorin används av en eller flera poster och kan inte tas bort.',
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

  const listProps = { isLoading, onCreate: openCreate, onEdit: openEdit, onDelete: setDeleteTarget }

  return (
    <Stack gap="xl">
      <Title order={2}>Inställningar</Title>

      <Card withBorder padding="lg" radius="md">
        <Title order={4} mb="xs">Månadshantering</Title>
        <Text size="sm" c="dimmed" mb="md">
          Återkommande poster förs över automatiskt när en ny månad öppnas första gången. Vill du fylla på i efterhand
          kan du kopiera alla återkommande inkomster, utgifter och sparanden från föregående månad till{' '}
          {MONTH_NAMES_SV[month - 1]} {year}. Poster med samma namn som redan finns i månaden hoppas över.
        </Text>
        <Button leftSection={<IconRefresh size={18} />} onClick={handleCopyRecurring} loading={copyRecurring.isPending} variant="light">
          Kopiera återkommande poster hit
        </Button>
      </Card>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <CategoryListCard
          title="Utgiftskategorier"
          type="Expense"
          categories={categories?.filter((c) => c.type === 'Expense')}
          {...listProps}
        />
        <CategoryListCard
          title="Inkomstkategorier"
          type="Income"
          categories={categories?.filter((c) => c.type === 'Income')}
          {...listProps}
        />
      </SimpleGrid>

      <CategoryModal opened={modalOpen} category={editing} type={modalType} onClose={() => setModalOpen(false)} />

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

interface CategoryListCardProps {
  title: string
  type: CategoryType
  categories: CategoryDto[] | undefined
  isLoading: boolean
  onCreate: (type: CategoryType) => void
  onEdit: (category: CategoryDto) => void
  onDelete: (category: CategoryDto) => void
}

function CategoryListCard({ title, type, categories, isLoading, onCreate, onEdit, onDelete }: CategoryListCardProps) {
  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between" mb="md">
        <Title order={4}>{title}</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={() => onCreate(type)} size="sm">Ny kategori</Button>
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
                  <Group gap="xs" wrap="nowrap">
                    <CategoryDot color={category.color} />
                    {category.name}
                    {category.isLoan && <Badge variant="light">Lån</Badge>}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <ActionIcon variant="subtle" aria-label="Redigera" onClick={() => onEdit(category)}>
                      <IconEdit size={18} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" aria-label="Ta bort" onClick={() => onDelete(category)}>
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
  )
}
