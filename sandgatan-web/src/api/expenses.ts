import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import { nextMonth } from '../lib/month'
import type { ExpenseDto, UpsertExpenseDto } from './types'

const key = (year: number, month: number) => ['expenses', year, month] as const

export function useExpenses(year: number, month: number) {
  return useQuery({
    queryKey: key(year, month),
    queryFn: () => api.get<ExpenseDto[]>(`/expenses?year=${year}&month=${month}`),
  })
}

function useInvalidateExpenseRelated(year: number, month: number) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: key(year, month) })
    queryClient.invalidateQueries({ queryKey: ['budget-summary', year, month] })
  }
}

export function useCreateExpense(year: number, month: number) {
  const invalidate = useInvalidateExpenseRelated(year, month)
  return useMutation({
    mutationFn: (dto: UpsertExpenseDto) => api.post<ExpenseDto>('/expenses', dto),
    onSuccess: invalidate,
  })
}

export function useUpdateExpense(year: number, month: number) {
  const invalidate = useInvalidateExpenseRelated(year, month)
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpsertExpenseDto }) => api.put<void>(`/expenses/${id}`, dto),
    onSuccess: invalidate,
  })
}

export function useDeleteExpense(year: number, month: number) {
  const invalidate = useInvalidateExpenseRelated(year, month)
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/expenses/${id}`),
    onSuccess: invalidate,
  })
}

export function useCopyExpenseToNextMonth(year: number, month: number) {
  const queryClient = useQueryClient()
  const { year: nYear, month: nMonth } = nextMonth(year, month)
  return useMutation({
    mutationFn: (id: number) => api.post<ExpenseDto>(`/expenses/${id}/copy-to-next-month`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(nYear, nMonth) })
      queryClient.invalidateQueries({ queryKey: ['budget-summary', nYear, nMonth] })
    },
  })
}
