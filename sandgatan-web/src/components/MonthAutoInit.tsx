import { notifications } from '@mantine/notifications'
import { useEffect } from 'react'
import { useEnsureMonthInitialized } from '../api/budget'
import { useBudgetPeriod } from '../context/BudgetPeriodContext'
import { MONTH_NAMES_SV, previousMonth } from '../lib/month'

/** Renders nothing — triggers the automatic carry-over of recurring entries when the selected month changes. */
export function MonthAutoInit() {
  const { year, month } = useBudgetPeriod()
  const { mutate } = useEnsureMonthInitialized()

  useEffect(() => {
    mutate({ year, month }, {
      onSuccess: (result) => {
        const copied = result.incomesCopied + result.expensesCopied + result.savingsCopied
        if (copied === 0) return
        const prev = previousMonth(year, month)
        notifications.show({
          title: `${MONTH_NAMES_SV[month - 1]} är förberedd`,
          message: `${copied} återkommande poster fördes över från ${MONTH_NAMES_SV[prev.month - 1].toLowerCase()}. Tryck på en inkomst för att uppdatera beloppet.`,
          color: 'teal',
          autoClose: 8000,
        })
      },
    })
  }, [year, month, mutate])

  return null
}
