/**
 * Custom hooks cho API Ruộng lúa
 */

import { useApiQuery, useApiMutation } from "./use-api"
import type { RiceCrop, RiceCropsResponse, RiceCropFilters, UpdateRiceCropDto } from "@/models/rice-farming"
import { useQueryClient } from "@tanstack/react-query"
import httpClient from "@/lib/http"

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3003"

/**
 * Hook cập nhật thông tin ruộng lúa
 */
export const useUpdateRiceCrop = () => {
  const queryClient = useQueryClient()
  
  return useApiMutation<RiceCrop, { id: number; dto: UpdateRiceCropDto }>("", {
    customMutationFn: async ({ id, dto }) => {
      const result = await httpClient.patch<any>(`rice-crops/${id}`, dto)
      return result.data || result
    },
    onSuccessCallback: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rice-crops", "detail", data.id.toString()] })
      queryClient.invalidateQueries({ queryKey: ["rice-crops", "list"] })
    }
  })
}

/**
 * Hook lấy danh sách ruộng lúa với pagination và filters
 */
export const useRiceCrops = (params?: RiceCropFilters) => {
  return useApiQuery<RiceCropsResponse>(`${API_URL}/rice-crops/search`, {
    queryKey: ["rice-crops", "list", JSON.stringify(params)],
    method: "POST",
    body: {
      page: params?.page || 1,
      limit: params?.limit || 10,
      ...params,
    },
  })
}

/**
 * Hook lấy chi tiết một ruộng lúa
 */
export const useRiceCrop = (id: number | null) => {
  return useApiQuery<RiceCrop>(`${API_URL}/rice-crops/${id || ""}`, {
    queryKey: ["rice-crops", "detail", id?.toString() || ""],
    enabled: !!id,
  })
}
