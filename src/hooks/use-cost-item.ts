/**
 * Custom hooks cho API Chi phí canh tác
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import httpClient from "@/lib/http"
import { useApiQuery, useApiMutation } from "./use-api"
import type { 
  CostItem, 
  CostCategory,
  CreateCostItemDto
} from "@/models/rice-farming"

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3003"

/**
 * Hook lấy danh sách chi phí theo ruộng lúa
 */
export const useCostItems = (filters: { rice_crop_id?: number; category?: CostCategory }) => {
  return useApiQuery<CostItem[]>(`${API_URL}/cost-items/search`, {
    queryKey: ["cost-items", "crop", filters.rice_crop_id?.toString() || ""],
    method: "POST",
    body: { 
      rice_crop_id: filters.rice_crop_id,
      limit: 100 // Lấy danh sách đủ lớn
    },
    enabled: !!filters.rice_crop_id,
  })
}

/**
 * Hook tạo chi phí mới
 */
export const useCreateCostItem = () => {
  const queryClient = useQueryClient()

  return useApiMutation<CostItem, CreateCostItemDto>(
    `${API_URL}/cost-items`,
    {
      onSuccessCallback: () => {
        queryClient.invalidateQueries({ queryKey: ["cost-items"] })
      },
      // useApiMutation đã dùng HttpClient nên không cần sửa gì thêm
    }
  )
}

/**
 * Hook cập nhật chi phí
 */
export const useUpdateCostItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, dto }: { id: number; dto: Partial<CreateCostItemDto> }) => {
      return httpClient.patch<CostItem>(`/cost-items/${id}`, dto)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cost-items"] })
    }
  })
}

/**
 * Hook xóa chi phí
 */
export const useDeleteCostItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: number; cropId: number }) => {
      return httpClient.delete(`/cost-items/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cost-items"] })
    }
  })
}
