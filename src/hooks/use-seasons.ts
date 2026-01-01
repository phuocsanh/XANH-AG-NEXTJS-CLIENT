/**
 * Custom hooks cho API Mùa vụ
 */

import { useApiQuery } from "./use-api"
import type { Season } from "@/models/rice-farming"

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3003"

export interface SeasonsResponse {
  data: Season[]
  total: number
  page: number
  limit: number
}

/**
 * Hook lấy danh sách mùa vụ
 */
export const useSeasons = (params?: { page?: number; limit?: number; keyword?: string }) => {
  return useApiQuery<SeasonsResponse>(`${API_URL}/season/search`, {
    queryKey: ["seasons", "list", JSON.stringify(params)],
    method: "POST",
    body: {
      page: params?.page || 1,
      limit: params?.limit || 100,
      ...params,
    },
  })
}
