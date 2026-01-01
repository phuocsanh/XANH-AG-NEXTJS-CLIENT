/**
 * Custom hooks cho API Lịch canh tác
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useApiQuery, useApiMutation } from "./use-api"
import type { 
  FarmingSchedule, 
  FarmingScheduleFilters, 
  CreateFarmingScheduleDto 
} from "@/models/rice-farming"

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3003"

/**
 * Hook lấy danh sách lịch canh tác theo ruộng lúa
 */
export const useFarmingSchedules = (filters: FarmingScheduleFilters) => {
  return useApiQuery<FarmingSchedule[]>(`${API_URL}/farming-schedules/crop/${filters.rice_crop_id}`, {
    queryKey: ["farming-schedules", "crop", filters.rice_crop_id?.toString() || ""],
    enabled: !!filters.rice_crop_id,
  })
}

/**
 * Hook tạo lịch canh tác mới
 */
export const useCreateFarmingSchedule = () => {
  const queryClient = useQueryClient()

  return useApiMutation<FarmingSchedule, CreateFarmingScheduleDto>(
    `${API_URL}/farming-schedules`,
    {
      onSuccessCallback: () => {
        queryClient.invalidateQueries({ queryKey: ["farming-schedules"] })
      },
    }
  )
}

/**
 * Hook cập nhật lịch canh tác
 */
export const useUpdateFarmingSchedule = () => {
  const queryClient = useQueryClient()
  const accessToken = typeof window !== 'undefined' ? (localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")) : null

  return useMutation({
    mutationFn: async ({ id, dto }: { id: number; dto: Partial<CreateFarmingScheduleDto> }) => {
      const response = await fetch(`${API_URL}/farming-schedules/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(dto),
      })
      if (!response.ok) throw await response.json()
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farming-schedules"] })
    }
  })
}

/**
 * Hook xóa lịch canh tác
 */
export const useDeleteFarmingSchedule = () => {
  const queryClient = useQueryClient()
  const accessToken = typeof window !== 'undefined' ? (localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")) : null

  return useMutation({
    mutationFn: async ({ id }: { id: number; cropId: number }) => {
      const response = await fetch(`${API_URL}/farming-schedules/${id}`, {
        method: "DELETE",
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      })
      if (!response.ok) throw await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farming-schedules"] })
    }
  })
}

/**
 * Hook hoàn thành lịch canh tác
 */
export const useMarkScheduleComplete = () => {
  const queryClient = useQueryClient()
  const accessToken = typeof window !== 'undefined' ? (localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")) : null

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_URL}/farming-schedules/${id}/complete`, {
        method: "PATCH",
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      })
      if (!response.ok) throw await response.json()
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farming-schedules"] })
    }
  })
}

// Alias
export { useMarkScheduleComplete as useCompleteFarmingSchedule }
