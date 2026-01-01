/**
 * Custom hooks cho API Ruộng lúa
 */

import { useApiQuery } from "./use-api"
import type { RiceCrop, RiceCropsResponse, RiceCropFilters } from "@/models/rice-farming"

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3003"

/**
 * Hook lấy danh sách ruộng lúa với pagination và filters
 */
export const useRiceCrops = (params?: RiceCropFilters) => {
  const page = params?.page || 1
  const limit = params?.limit || 10

  return useApiQuery<RiceCropsResponse>(`${API_URL}/rice-crops/search`, {
    queryKey: ["rice-crops", "list", JSON.stringify(params)],
    customQueryFn: async () => {
      const searchBody = {
        page,
        limit,
        ...params,
      }

      // Lấy access token từ storage
      const accessToken = 
        localStorage.getItem("accessToken") || 
        sessionStorage.getItem("accessToken")

      console.log("🔑 Sending request with token:", accessToken ? accessToken.substring(0, 20) + "..." : "NO TOKEN")

      const response = await fetch(`${API_URL}/rice-crops/search`, {
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

/**
 * Hook lấy chi tiết một ruộng lúa
 */
export const useRiceCrop = (id: number | null) => {
  return useApiQuery<RiceCrop>(`${API_URL}/rice-crops/${id || ""}`, {
    queryKey: ["rice-crops", "detail", id?.toString() || ""],
    enabled: !!id,
    customQueryFn: async () => {
      // Lấy access token từ storage
      const accessToken = 
        localStorage.getItem("accessToken") || 
        sessionStorage.getItem("accessToken")

      const response = await fetch(`${API_URL}/rice-crops/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        credentials: "include",
      })

      if (!response.ok) {
        const error = await response.json()
        throw { response: { data: error, message: error.message } }
      }

      return await response.json()
    },
  })
}
