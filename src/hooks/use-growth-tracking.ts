/**
 * Custom hooks cho API Theo dõi sinh trưởng
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useApiQuery, useApiMutation } from "./use-api"
import type { 
  GrowthTracking, 
  CreateGrowthTrackingDto 
} from "@/models/rice-farming"

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3003"

/**
 * Hook lấy danh sách bản ghi theo dõi theo ruộng lúa
 */
export const useGrowthTrackings = (cropId: number) => {
  return useApiQuery<GrowthTracking[]>(`${API_URL}/growth-trackings/crop/${cropId}`, {
    queryKey: ["growth-trackings", "crop", cropId?.toString() || ""],
    enabled: !!cropId,
  })
}

/**
 * Hook tạo bản ghi theo dõi mới
 */
export const useCreateGrowthTracking = () => {
  const queryClient = useQueryClient()

  return useApiMutation<GrowthTracking, CreateGrowthTrackingDto>(
    `${API_URL}/growth-trackings`,
    {
      onSuccessCallback: () => {
        queryClient.invalidateQueries({ queryKey: ["growth-trackings"] })
      },
    }
  )
}

/**
 * Hook cập nhật bản ghi theo dõi
 */
export const useUpdateGrowthTracking = () => {
  const queryClient = useQueryClient()
  const accessToken = typeof window !== 'undefined' ? (localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")) : null

  return useMutation({
    mutationFn: async ({ id, dto }: { id: number; dto: Partial<CreateGrowthTrackingDto> }) => {
      const response = await fetch(`${API_URL}/growth-trackings/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["growth-trackings"] })
    }
  })
}

/**
 * Hook xóa bản ghi theo dõi
 */
export const useDeleteGrowthTracking = () => {
  const queryClient = useQueryClient()
  const accessToken = typeof window !== 'undefined' ? (localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")) : null

  return useMutation({
    mutationFn: async ({ id }: { id: number; cropId: number }) => {
      const response = await fetch(`${API_URL}/growth-trackings/${id}`, {
        method: "DELETE",
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      })
      if (!response.ok) throw await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["growth-trackings"] })
    }
  })
}
