/**
 * Custom hooks cho API Hóa đơn mua hàng bên ngoài
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import httpClient from "@/lib/http"
import { useApiQuery, useApiMutation } from "./use-api"
import type { 
  ExternalPurchase, 
  CreateExternalPurchaseDto,
  MergedPurchase
} from "@/models/rice-farming"

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3003"

/**
 * Lấy danh sách hóa đơn external theo rice_crop_id
 */
export const useExternalPurchases = (riceCropId: number) => {
  return useApiQuery<ExternalPurchase[]>(`${API_URL}/external-purchases/rice-crop/${riceCropId}`, {
    queryKey: ["external-purchases", "crop", riceCropId?.toString() || ""],
    enabled: !!riceCropId,
  })
}

/**
 * Lấy tất cả hóa đơn (system + external) đã merge
 */
export const useMergedPurchases = (riceCropId: number) => {
  return useApiQuery<MergedPurchase[]>(`${API_URL}/rice-crops/${riceCropId}/all-purchases`, {
    queryKey: ["merged-purchases", riceCropId?.toString() || ""],
    enabled: !!riceCropId,
  })
}

/**
 * Tạo hóa đơn mua ngoài
 */
export const useCreateExternalPurchase = () => {
  const queryClient = useQueryClient()

  return useApiMutation<ExternalPurchase, CreateExternalPurchaseDto>(
    `${API_URL}/external-purchases`,
    {
      onSuccessCallback: (data) => {
        const cropId = data.rice_crop_id
        queryClient.invalidateQueries({ queryKey: ["external-purchases", "crop", cropId.toString()] })
        queryClient.invalidateQueries({ queryKey: ["merged-purchases", cropId.toString()] })
      },
    }
  )
}

/**
 * Cập nhật hóa đơn
 */
export const useUpdateExternalPurchase = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, dto }: { id: number; dto: Partial<CreateExternalPurchaseDto> }) => {
      return httpClient.patch<ExternalPurchase>(`/external-purchases/${id}`, dto)
    },
    onSuccess: (data) => {
      const cropId = data.rice_crop_id
      queryClient.invalidateQueries({ queryKey: ["external-purchases", "crop", cropId.toString()] })
      queryClient.invalidateQueries({ queryKey: ["merged-purchases", cropId.toString()] })
    }
  })
}

/**
 * Xóa hóa đơn
 */
export const useDeleteExternalPurchase = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, riceCropId }: { id: number; riceCropId: number }) => {
      return httpClient.delete(`/external-purchases/${id}`)
    },
    onSuccess: (_, variables) => {
      const cropId = variables.riceCropId
      queryClient.invalidateQueries({ queryKey: ["external-purchases", "crop", cropId.toString()] })
      queryClient.invalidateQueries({ queryKey: ["merged-purchases", cropId.toString()] })
    }
  })
}
