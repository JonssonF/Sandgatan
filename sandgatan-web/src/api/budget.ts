import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { BudgetSummaryDto, CopyRecurringResultDto } from './types'

export function useBudgetSummary(year: number, month: number) {
  return useQuery({
    queryKey: ['budget-summary', year, month],
    queryFn: () => api.get<BudgetSummaryDto>(`/budget/${year}/${month}/summary`),
  })
}

export function useCopyRecurring(year: number, month: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<CopyRecurringResultDto>(`/budget/${year}/${month}/copy-recurring`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes', year, month] })
      queryClient.invalidateQueries({ queryKey: ['expenses', year, month] })
      queryClient.invalidateQueries({ queryKey: ['savings', year, month] })
      queryClient.invalidateQueries({ queryKey: ['budget-summary', year, month] })
    },
  })
}

/**
 * Carries recurring entries over from the previous month the first time a month is opened.
 * The backend decides whether anything happens (once per month, never into a month with
 * entries, never further ahead than next month), so this is safe to call on every month switch.
 */
export function useEnsureMonthInitialized() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ year, month }: { year: number; month: number }) =>
      api.post<CopyRecurringResultDto>(`/budget/${year}/${month}/ensure-initialized`),
    onSuccess: (result, { year, month }) => {
      if (result.incomesCopied + result.expensesCopied + result.savingsCopied === 0) return
      queryClient.invalidateQueries({ queryKey: ['incomes', year, month] })
      queryClient.invalidateQueries({ queryKey: ['expenses', year, month] })
      queryClient.invalidateQueries({ queryKey: ['savings', year, month] })
      queryClient.invalidateQueries({ queryKey: ['budget-summary', year, month] })
    },
  })
}
