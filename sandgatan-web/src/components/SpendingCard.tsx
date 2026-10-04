import { ActionIcon, Anchor, Button, Card, Group, NumberInput, Popover, Progress, Stack, Text, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconPencil, IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePurchases, useSetSpendingBudget, useSpendingBudget } from '../api/purchases'
import type { PurchaseDto } from '../api/types'
import { formatShortDate, formatSek } from '../lib/format'
import { MONTH_NAMES_SV } from '../lib/month'
import { CategoryDot } from './CategoryDot'
import { PaydayCountdown } from './PaydayCountdown'
import { PurchaseModal } from './PurchaseModal'

interface SpendingCardProps {
  year: number
  month: number
  /** Show the latest purchases and a link to the full list (dashboard). */
  showRecent?: boolean
  /** Show days until payday (off where the page already shows it). */
  showPayday?: boolean
}

/** Everyday purchases vs. the month's budget: spent, left, per category, and days until payday. */
export function SpendingCard({ year, month, showRecent, showPayday = true }: SpendingCardProps) {
  const { data: purchases = [] } = usePurchases(year, month)
  const { data: budget } = useSpendingBudget(year, month)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PurchaseDto | null>(null)

  const spent = purchases.reduce((sum, p) => sum + p.amount, 0)
  const limit = budget?.amount ?? null
  const left = limit === null ? null : limit - spent
  const percent = limit ? Math.min(100, (spent / limit) * 100) : 0
  const barColor = left !== null && left < 0 ? 'red' : percent >= 85 ? 'orange' : 'teal'

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month

  const byCategory = [...purchases.reduce((map, p) => {
    const entry = map.get(p.categoryId) ?? { name: p.categoryName, color: p.categoryColor, amount: 0 }
    entry.amount += p.amount
    return map.set(p.categoryId, entry)
  }, new Map<number, { name: string; color?: string | null; amount: number }>()).values()].sort((a, b) => b.amount - a.amount)

  function openNew() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(purchase: PurchaseDto) {
    setEditing(purchase)
    setModalOpen(true)
  }

  return (
    <Card withBorder padding="lg" radius="md">
      <Stack gap="sm">
        <Group justify="space-between" wrap="wrap">
          <Title order={4}>Vardagsköp {MONTH_NAMES_SV[month - 1].toLowerCase()}</Title>
          <Button leftSection={<IconPlus size={18} />} onClick={openNew}>Köp</Button>
        </Group>

        {limit === null ? (
          <BudgetSetup year={year} month={month} spent={spent} />
        ) : (
          <>
            <Group justify="space-between" align="flex-end" wrap="wrap" gap="xs">
              <Text>
                <Text span fw={700} size="1.5rem">{formatSek(spent)}</Text>
                <Text span c="dimmed"> av {formatSek(limit)}</Text>
                <BudgetEditor year={year} month={month} current={limit} />
              </Text>
              <Text fw={600} c={left! < 0 ? 'red' : 'teal'}>
                {left! < 0 ? `${formatSek(-left!)} över` : `${formatSek(left!)} kvar`}
              </Text>
            </Group>
            <Progress value={percent} color={barColor} size="lg" radius="xl" aria-label={`${Math.round(percent)} % av potten använd`} />
          </>
        )}

        {showPayday && isCurrentMonth && <PaydayCountdown />}

        {byCategory.length > 0 && (
          <Group gap="md" wrap="wrap">
            {byCategory.map((c) => (
              <Group key={c.name} gap={6} wrap="nowrap">
                <CategoryDot color={c.color} />
                <Text size="sm">{c.name} <b>{formatSek(c.amount)}</b></Text>
              </Group>
            ))}
          </Group>
        )}

        {showRecent && (
          purchases.length === 0 ? (
            <Text size="sm" c="dimmed">Inga köp loggade ännu. Tryck på <b>Köp</b> när ni handlar.</Text>
          ) : (
            <Stack gap={4}>
              <Text size="sm" fw={600} mt="xs">Senaste köpen</Text>
              {purchases.slice(0, 5).map((p) => (
                <Group
                  key={p.id}
                  justify="space-between"
                  wrap="nowrap"
                  onClick={() => openEdit(p)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  aria-label={`Redigera ${p.name}`}
                >
                  <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                    <Text size="sm" c="dimmed" w={52} style={{ flexShrink: 0 }}>{formatShortDate(p.date)}</Text>
                    <CategoryDot color={p.categoryColor} />
                    <Text size="sm" truncate>{p.name}</Text>
                  </Group>
                  <Text size="sm" style={{ flexShrink: 0 }}>{formatSek(p.amount)}</Text>
                </Group>
              ))}
              <Anchor component={Link} to="/vardagskop" size="sm" mt={4}>
                Visa alla {purchases.length} köp
              </Anchor>
            </Stack>
          )
        )}
      </Stack>

      <PurchaseModal opened={modalOpen} onClose={() => setModalOpen(false)} purchase={editing} />
    </Card>
  )
}

/** Shown until a budget has been set for the first time. */
function BudgetSetup({ year, month, spent }: { year: number; month: number; spent: number }) {
  const setBudget = useSetSpendingBudget(year, month)
  const [value, setValue] = useState<number | ''>('')

  async function save() {
    if (value === '') return
    await setBudget.mutateAsync(Number(value))
    notifications.show({ message: `Månadspotten är ${formatSek(Number(value))}`, color: 'teal' })
  }

  return (
    <Stack gap={6}>
      <Text size="sm" c="dimmed">
        Hur mycket får gå till vardagsköp per månad? Potten följer med till kommande månader tills ni ändrar den.
        {spent > 0 && <> Hittills: <b>{formatSek(spent)}</b>.</>}
      </Text>
      <Group gap="xs" align="flex-end">
        <NumberInput
          aria-label="Månadspott"
          placeholder="t.ex. 12 000"
          value={value}
          onChange={(v) => setValue(v === '' ? '' : Number(v))}
          min={0}
          thousandSeparator=" "
          suffix=" kr"
          allowNegative={false}
          w={160}
        />
        <Button variant="light" onClick={save} disabled={value === ''} loading={setBudget.isPending}>Sätt pott</Button>
      </Group>
    </Stack>
  )
}

function BudgetEditor({ year, month, current }: { year: number; month: number; current: number }) {
  const setBudget = useSetSpendingBudget(year, month)
  const [opened, setOpened] = useState(false)
  const [value, setValue] = useState<number | ''>(current)

  async function save() {
    if (value === '') return
    await setBudget.mutateAsync(Number(value))
    setOpened(false)
    notifications.show({ message: `Månadspotten är nu ${formatSek(Number(value))}`, color: 'teal' })
  }

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom-start" withArrow trapFocus>
      <Popover.Target>
        <ActionIcon
          variant="subtle"
          size="sm"
          ml={4}
          aria-label="Ändra månadspott"
          onClick={() => { setValue(current); setOpened((o) => !o) }}
        >
          <IconPencil size={14} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <form onSubmit={(e) => { e.preventDefault(); void save() }}>
          <Stack gap="xs">
            <NumberInput
              label="Månadspott"
              description={`Gäller från ${MONTH_NAMES_SV[month - 1].toLowerCase()} och framåt`}
              value={value}
              onChange={(v) => setValue(v === '' ? '' : Number(v))}
              min={0}
              thousandSeparator=" "
              suffix=" kr"
              allowNegative={false}
              data-autofocus
            />
            <Button type="submit" size="xs" loading={setBudget.isPending} disabled={value === ''}>Spara</Button>
          </Stack>
        </form>
      </Popover.Dropdown>
    </Popover>
  )
}
