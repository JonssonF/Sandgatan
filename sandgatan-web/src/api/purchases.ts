import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { PurchaseDto, SpendingBudgetDto, UpsertPurchaseDto } from './types'

export function usePurchases(year: number, month: number) {
  return useQuery({
    queryKey: ['purchases', year, month],
    queryFn: () => api.get<PurchaseDto[]>(`/purchases?year=${year}&month=${month}`),
  })
}

/** A purchase's date decides its month, which may differ from the month on screen — so refresh broadly. */
function useInvalidatePurchaseRelated() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['purchases'] })
    queryClient.invalidateQueries({ queryKey: ['budget-summary'] })
  }
}

export function useCreatePurchase() {
  const invalidate = useInvalidatePurchaseRelated()
  return useMutation({
    mutationFn: (dto: UpsertPurchaseDto) => api.post<PurchaseDto>('/purchases', dto),
    onSuccess: invalidate,
  })
}

export function useUpdatePurchase() {
  const invalidate = useInvalidatePurchaseRelated()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpsertPurchaseDto }) => api.put<void>(`/purchases/${id}`, dto),
    onSuccess: invalidate,
  })
}

export function useDeletePurchase() {
  const invalidate = useInvalidatePurchaseRelated()
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/purchases/${id}`),
    onSuccess: invalidate,
  })
}

export function useSpendingBudget(year: number, month: number) {
  return useQuery({
    queryKey: ['spending-budget', year, month],
    queryFn: () => api.get<SpendingBudgetDto>(`/purchases/budget/${year}/${month}`),
  })
}

/** Setting the budget affects this month and every later month that inherits it. */
export function useSetSpendingBudget(year: number, month: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (amount: number) => api.put<SpendingBudgetDto>(`/purchases/budget/${year}/${month}`, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spending-budget'] })
      queryClient.invalidateQueries({ queryKey: ['budget-summary'] })
    },
  })
}
