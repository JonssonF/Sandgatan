import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import { nextMonth } from '../lib/month'
import type { IncomeDto, UpsertIncomeDto } from './types'

const key = (year: number, month: number) => ['incomes', year, month] as const

export function useIncomes(year: number, month: number) {
  return useQuery({
    queryKey: key(year, month),
    queryFn: () => api.get<IncomeDto[]>(`/incomes?year=${year}&month=${month}`),
  })
}

function useInvalidateIncomeRelated(year: number, month: number) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: key(year, month) })
    queryClient.invalidateQueries({ queryKey: ['budget-summary', year, month] })
  }
}

export function useCreateIncome(year: number, month: number) {
  const invalidate = useInvalidateIncomeRelated(year, month)
  return useMutation({
    mutationFn: (dto: UpsertIncomeDto) => api.post<IncomeDto>('/incomes', dto),
    onSuccess: invalidate,
  })
}

export function useUpdateIncome(year: number, month: number) {
  const invalidate = useInvalidateIncomeRelated(year, month)
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpsertIncomeDto }) => api.put<void>(`/incomes/${id}`, dto),
    onSuccess: invalidate,
  })
}

export function useDeleteIncome(year: number, month: number) {
  const invalidate = useInvalidateIncomeRelated(year, month)
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/incomes/${id}`),
    onSuccess: invalidate,
  })
}

export function useCopyIncomeToNextMonth(year: number, month: number) {
  const queryClient = useQueryClient()
  const { year: nYear, month: nMonth } = nextMonth(year, month)
  return useMutation({
    mutationFn: (id: number) => api.post<IncomeDto>(`/incomes/${id}/copy-to-next-month`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(nYear, nMonth) })
      queryClient.invalidateQueries({ queryKey: ['budget-summary', nYear, nMonth] })
    },
  })
}
