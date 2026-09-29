import { Button, CheckIcon, ColorSwatch, Group, Modal, Stack, Switch, Text, TextInput, Tooltip, UnstyledButton, useComputedColorScheme } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'
import { useCreateCategory, useUpdateCategory } from '../api/categories'
import type { CategoryDto, CategoryType, UpsertCategoryDto } from '../api/types'
import { CATEGORY_COLORS } from '../lib/categoryColors'

interface CategoryModalProps {
  opened: boolean
  /** Category to edit, or null to create a new one. */
  category: CategoryDto | null
  /** Type for a new category; ignored when editing (a category never changes type). */
  type: CategoryType
  onClose: () => void
  onSaved?: (category: CategoryDto) => void
}

/** Create/edit dialog for a category — used from Settings and inline from the expense/income forms. */
export function CategoryModal({ opened, category, type, onClose, onSaved }: CategoryModalProps) {
  const noun = (category?.type ?? type) === 'Income' ? 'inkomstkategori' : 'utgiftskategori'
  return (
    <Modal opened={opened} onClose={onClose} title={category ? `Redigera ${noun}` : `Ny ${noun}`} centered>
      {/* Modal content unmounts when closed, so the form re-initializes from `category` on every open. */}
      <CategoryForm category={category} type={type} onClose={onClose} onSaved={onSaved} />
    </Modal>
  )
}

function CategoryForm({ category, type, onClose, onSaved }: Omit<CategoryModalProps, 'opened'>) {
  const scheme = useComputedColorScheme('light')
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const [form, setForm] = useState<UpsertCategoryDto>(() => category
    ? { name: category.name, color: category.color, icon: category.icon, isLoan: category.isLoan, type: category.type }
    : { name: '', color: null, icon: null, isLoan: false, type })
  const isIncome = form.type === 'Income'

  async function handleSave() {
    const dto = { ...form, name: form.name.trim() }
    if (!dto.name) return
    if (category) {
      await updateCategory.mutateAsync({ id: category.id, dto })
      notifications.show({ message: 'Kategorin uppdaterades', color: 'teal' })
      onSaved?.({ ...category, ...dto })
    } else {
      const created = await createCategory.mutateAsync(dto)
      notifications.show({ message: `Kategorin ${created.name} lades till`, color: 'teal' })
      onSaved?.(created)
    }
    onClose()
  }

  return (
    <Stack gap="md">
      <TextInput
        label="Namn"
        placeholder={isIncome ? 't.ex. Sjukpenning' : 't.ex. Nöje'}
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        required
        data-autofocus
      />
      <div>
        <Text size="sm" fw={500}>Färg</Text>
        <Text size="xs" c="dimmed" mb={6}>Automatisk väljer en ledig färg.</Text>
        <Group gap="xs">
          <Tooltip label="Automatisk">
            <UnstyledButton
              onClick={() => setForm({ ...form, color: null })}
              aria-label="Automatisk färg"
              aria-pressed={!form.color}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                border: `2px ${form.color ? 'dashed' : 'solid'} var(--mantine-color-dimmed)`,
                display: 'grid', placeItems: 'center',
              }}
            >
              {!form.color && <CheckIcon size={12} />}
            </UnstyledButton>
          </Tooltip>
          {CATEGORY_COLORS.map((c) => (
            <Tooltip key={c.key} label={c.label}>
              <ColorSwatch
                component="button"
                type="button"
                color={c[scheme]}
                size={32}
                aria-label={c.label}
                aria-pressed={form.color === c.key}
                onClick={() => setForm({ ...form, color: c.key })}
                style={{ color: '#fff', cursor: 'pointer' }}
              >
                {form.color === c.key && <CheckIcon size={12} />}
              </ColorSwatch>
            </Tooltip>
          ))}
        </Group>
      </div>
      {!isIncome && (
        <Switch
          label="Lånekategori"
          description="Utgifter i kategorin får fälten ränta och amortering, och summeras som lån på översikten."
          checked={form.isLoan}
          onChange={(e) => setForm({ ...form, isLoan: e.currentTarget.checked })}
        />
      )}
      <Group justify="flex-end" mt="sm">
        <Button variant="default" onClick={onClose}>Avbryt</Button>
        <Button onClick={handleSave} disabled={!form.name.trim()} loading={createCategory.isPending || updateCategory.isPending}>
          Spara
        </Button>
      </Group>
    </Stack>
  )
}
