import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import { nextMonth } from '../lib/month'
import type { SavingDto, UpsertSavingDto } from './types'

const key = (year: number, month: number) => ['savings', year, month] as const

export function useSavings(year: number, month: number) {
  return useQuery({
    queryKey: key(year, month),
    queryFn: () => api.get<SavingDto[]>(`/savings?year=${year}&month=${month}`),
  })
}

function useInvalidateSavingRelated(year: number, month: number) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: key(year, month) })
    queryClient.invalidateQueries({ queryKey: ['budget-summary', year, month] })
  }
}

export function useCreateSaving(year: number, month: number) {
  const invalidate = useInvalidateSavingRelated(year, month)
  return useMutation({
    mutationFn: (dto: UpsertSavingDto) => api.post<SavingDto>('/savings', dto),
    onSuccess: invalidate,
  })
}

export function useUpdateSaving(year: number, month: number) {
  const invalidate = useInvalidateSavingRelated(year, month)
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpsertSavingDto }) => api.put<void>(`/savings/${id}`, dto),
    onSuccess: invalidate,
  })
}

export function useDeleteSaving(year: number, month: number) {
  const invalidate = useInvalidateSavingRelated(year, month)
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/savings/${id}`),
    onSuccess: invalidate,
  })
}

export function useCopySavingToNextMonth(year: number, month: number) {
  const queryClient = useQueryClient()
  const { year: nYear, month: nMonth } = nextMonth(year, month)
  return useMutation({
    mutationFn: (id: number) => api.post<SavingDto>(`/savings/${id}/copy-to-next-month`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(nYear, nMonth) })
      queryClient.invalidateQueries({ queryKey: ['budget-summary', nYear, nMonth] })
    },
  })
}
