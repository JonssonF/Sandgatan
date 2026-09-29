import { Button, Group, Modal, Text } from '@mantine/core'

interface ConfirmDeleteModalProps {
  opened: boolean
  itemName: string
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDeleteModal({ opened, itemName, loading, onCancel, onConfirm }: ConfirmDeleteModalProps) {
  return (
    <Modal opened={opened} onClose={onCancel} title="Ta bort post" centered>
      <Text mb="lg">
        Är du säker på att du vill ta bort <b>{itemName}</b>? Det går inte att ångra.
      </Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onCancel}>Avbryt</Button>
        <Button color="red" onClick={onConfirm} loading={loading}>Ta bort</Button>
      </Group>
    </Modal>
  )
}
