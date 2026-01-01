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
  const page = params?.page || 1
  const limit = params?.limit || 100 // Thường lấy danh sách dài để chọn

  return useApiQuery<SeasonsResponse>(`${API_URL}/season/search`, {
    queryKey: ["seasons", "list", JSON.stringify(params)],
    customQueryFn: async () => {
      const searchBody = {
        page,
        limit,
        ...params,
      }

      const accessToken = 
        localStorage.getItem("accessToken") || 
        sessionStorage.getItem("accessToken")

      const response = await fetch(`${API_URL}/season/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        credentials: "include",
        body: JSON.stringify(searchBody),
      })

      if (!response.ok) {
        const error = await response.json()
        throw { response: { data: error, message: error.message } }
      }

      const result = await response.json()
      return {
        data: result.data || [],
        total: result.total || 0,
        page: result.page || page,
        limit: result.limit || limit,
      }
    },
  })
}
