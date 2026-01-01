/**
 * Custom hooks cho API Loại chi phí canh tác
 */

import { useApiQuery } from "./use-api"
import type { CostItemCategory } from "@/models/rice-farming"

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3003"

/**
 * Hook lấy danh sách loại chi phí từ database
 */
export const useCostItemCategories = (params?: { keyword?: string; page?: number; limit?: number }) => {
  return useApiQuery<{ data: CostItemCategory[]; total: number }>(`${API_URL}/cost-item-categories/search`, {
    queryKey: ["cost-item-categories", "search", JSON.stringify(params)],
    method: "POST",
    body: params || { page: 1, limit: 100 },
  })
}
