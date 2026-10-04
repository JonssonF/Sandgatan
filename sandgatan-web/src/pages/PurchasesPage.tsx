import { ActionIcon, Card, Group, Loader, Stack, Table, Text, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { useDeletePurchase, usePurchases } from '../api/purchases'
import type { PurchaseDto } from '../api/types'
import { CategoryDot } from '../components/CategoryDot'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { PurchaseModal } from '../components/PurchaseModal'
import { SpendingCard } from '../components/SpendingCard'
import { useBudgetPeriod } from '../context/BudgetPeriodContext'
import { formatSek, formatShortDate } from '../lib/format'

export function PurchasesPage() {
  const { year, month } = useBudgetPeriod()
  const { data: purchases, isLoading } = usePurchases(year, month)
  const deletePurchase = useDeletePurchase()
  const [editing, setEditing] = useState<PurchaseDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PurchaseDto | null>(null)

  async function handleDelete() {
    if (!deleteTarget) return
    await deletePurchase.mutateAsync(deleteTarget.id)
    notifications.show({ message: `${deleteTarget.name} togs bort`, color: 'teal' })
    setDeleteTarget(null)
  }

  return (
    <Stack gap="lg">
      <Title order={2}>Vardagsköp</Title>
      <Text c="dimmed" size="sm" mt={-12}>
        Det oförutsägbara: mat, kläder, punka och annat som inte är en fast räkning. Logga köpen när de händer och
        håll koll på hur mycket som är kvar av månadens pott.
      </Text>

      <SpendingCard year={year} month={month} />

      <Card withBorder padding="lg" radius="md">
        {isLoading ? (
          <Group justify="center" py="xl"><Loader /></Group>
        ) : !purchases || purchases.length === 0 ? (
          <Text c="dimmed">Inga köp den här månaden.</Text>
        ) : (
          <Table.ScrollContainer minWidth={420}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Datum</Table.Th>
                  <Table.Th>Vad</Table.Th>
                  <Table.Th>Kategori</Table.Th>
                  <Table.Th ta="right">Belopp</Table.Th>
                  <Table.Th ta="right">Åtgärder</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {purchases.map((p) => (
                  <Table.Tr key={p.id}>
                    <Table.Td c="dimmed">{formatShortDate(p.date)}</Table.Td>
                    <Table.Td>{p.name}</Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <CategoryDot color={p.categoryColor} />
                        {p.categoryName}
                      </Group>
                    </Table.Td>
                    <Table.Td ta="right">{formatSek(p.amount)}</Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end" wrap="nowrap">
                        <ActionIcon variant="subtle" aria-label="Redigera" onClick={() => setEditing(p)}>
                          <IconEdit size={18} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red" aria-label="Ta bort" onClick={() => setDeleteTarget(p)}>
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr>
                  <Table.Th colSpan={3}>Totalt</Table.Th>
                  <Table.Th ta="right">{formatSek(purchases.reduce((sum, p) => sum + p.amount, 0))}</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Tfoot>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      <PurchaseModal opened={editing !== null} onClose={() => setEditing(null)} purchase={editing} />
      <ConfirmDeleteModal
        opened={deleteTarget !== null}
        itemName={deleteTarget?.name ?? ''}
        loading={deletePurchase.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Stack>
  )
}
