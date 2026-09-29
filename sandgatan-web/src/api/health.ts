import { useQuery } from '@tanstack/react-query'
import { api } from './client'

export function useBackendHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.get<{ status: string }>('/health'),
    retry: false,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  })
}
