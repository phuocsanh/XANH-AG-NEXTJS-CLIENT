/**
 * Custom hooks cho API Thu hoạch
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useApiQuery, useApiMutation } from "./use-api"
import type { 
  HarvestRecord, 
  CreateHarvestRecordDto 
} from "@/models/rice-farming"

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3003"

/**
 * Lấy danh sách thu hoạch theo ruộng lúa
 */
export const useHarvestRecords = (riceCropId: number) => {
  return useApiQuery<HarvestRecord[]>(`${API_URL}/harvest-records/crop/${riceCropId}`, {
    queryKey: ["harvest-records", "crop", riceCropId?.toString() || ""],
    enabled: !!riceCropId,
  })
}

/**
 * Tạo bản ghi thu hoạch mới
 */
export const useCreateHarvestRecord = () => {
  const queryClient = useQueryClient()

  return useApiMutation<HarvestRecord, CreateHarvestRecordDto>(
    `${API_URL}/harvest-records`,
    {
      onSuccessCallback: (data) => {
        queryClient.invalidateQueries({ queryKey: ["harvest-records", "crop", data.rice_crop_id.toString()] })
        queryClient.invalidateQueries({ queryKey: ["rice-crops", "detail", data.rice_crop_id.toString()] })
      },
    }
  )
}

/**
 * Cập nhật bản ghi thu hoạch
 */
export const useUpdateHarvestRecord = () => {
  const queryClient = useQueryClient()
  const accessToken = typeof window !== 'undefined' ? (localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")) : null

  return useMutation({
    mutationFn: async ({ id, dto }: { id: number; dto: Partial<CreateHarvestRecordDto> }) => {
      const response = await fetch(`${API_URL}/harvest-records/${id}`, {
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["harvest-records", "crop", data.rice_crop_id.toString()] })
      queryClient.invalidateQueries({ queryKey: ["rice-crops", "detail", data.rice_crop_id.toString()] })
    }
  })
}

/**
 * Xóa bản ghi thu hoạch
 */
export const useDeleteHarvestRecord = () => {
  const queryClient = useQueryClient()
  const accessToken = typeof window !== 'undefined' ? (localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")) : null

  return useMutation({
    mutationFn: async ({ id }: { id: number; cropId: number }) => {
      const response = await fetch(`${API_URL}/harvest-records/${id}`, {
        method: "DELETE",
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      })
      if (!response.ok) throw await response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["harvest-records", "crop", variables.cropId.toString()] })
      queryClient.invalidateQueries({ queryKey: ["rice-crops", "detail", variables.cropId.toString()] })
    }
  })
}
