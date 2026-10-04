import { Group, Text } from '@mantine/core'
import { IconCalendarDollar } from '@tabler/icons-react'
import { nextPayday } from '../lib/payday'

const dateFormatter = new Intl.DateTimeFormat('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })

/** "Lön om 19 dagar · fredag 23 oktober" — counted from today, independent of the month on screen. */
export function PaydayCountdown() {
  const { date, daysLeft } = nextPayday()
  const when = daysLeft === 0 ? 'Lönedag idag!' : daysLeft === 1 ? 'Lön imorgon' : `Lön om ${daysLeft} dagar`

  return (
    <Group gap={6} wrap="nowrap">
      <IconCalendarDollar size={16} color="var(--mantine-color-teal-6)" aria-hidden />
      <Text size="sm">
        <b>{when}</b>
        {daysLeft > 0 && <Text span c="dimmed" size="sm"> · {dateFormatter.format(date)}</Text>}
      </Text>
    </Group>
  )
}
