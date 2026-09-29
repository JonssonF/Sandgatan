import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from './client'
import type { CategoryDto, UpsertCategoryDto } from './types'

const key = ['categories'] as const

export function useCategories() {
  return useQuery({
    queryKey: key,
    queryFn: () => api.get<CategoryDto[]>('/categories'),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpsertCategoryDto) => api.post<CategoryDto>('/categories', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpsertCategoryDto }) => api.put<void>(`/categories/${id}`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      // Lists show the category name, so a rename must refresh them too.
      queryClient.invalidateQueries({ queryKey: ['incomes'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

/** Resolves to false (instead of throwing) when the category is still in use — the API returns 409. */
export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      try {
        await api.delete<void>(`/categories/${id}`)
        return true
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) return false
        throw error
      }
    },
    onSuccess: (deleted) => {
      if (deleted) queryClient.invalidateQueries({ queryKey: key })
    },
  })
}
