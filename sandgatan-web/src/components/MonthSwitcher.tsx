import { ActionIcon, Group, Text } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useBudgetPeriod } from '../context/BudgetPeriodContext'
import { MONTH_NAMES_SV } from '../lib/month'

export function MonthSwitcher() {
  const { year, month, goToNextMonth, goToPreviousMonth } = useBudgetPeriod()

  return (
    <Group gap="xs" wrap="nowrap">
      <ActionIcon variant="light" aria-label="Föregående månad" onClick={goToPreviousMonth}>
        <IconChevronLeft size={18} />
      </ActionIcon>
      <Text fw={600} miw={140} ta="center">
        {MONTH_NAMES_SV[month - 1]} {year}
      </Text>
      <ActionIcon variant="light" aria-label="Nästa månad" onClick={goToNextMonth}>
        <IconChevronRight size={18} />
      </ActionIcon>
    </Group>
  )
}
