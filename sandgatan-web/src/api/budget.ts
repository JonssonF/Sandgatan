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
