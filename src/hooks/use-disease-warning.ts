/**
 * Custom hooks cho API Cảnh báo dịch bệnh (AI)
 */

import { useApiQuery, useApiMutation } from "./use-api"
import httpClient from "@/lib/http"
import { useQueryClient } from "@tanstack/react-query"
import type { 
  DiseaseLocation, 
  DiseaseWarning, 
  UpdateDiseaseLocationDto 
} from "@/models/disease-warning"

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3003"

/**
 * Hook lấy vị trí ruộng lúa để phân tích thời tiết/dịch bệnh
 */
export const useDiseaseLocation = () => {
  return useApiQuery<DiseaseLocation>(`${API_URL}/location`, {
    queryKey: ["disease", "location"],
  })
}

/**
 * Hook cập nhật vị trí ruộng lúa
 */
export const useUpdateDiseaseLocation = () => {
  const queryClient = useQueryClient()
  
  return useApiMutation<DiseaseLocation, UpdateDiseaseLocationDto>("", {
    customMutationFn: async (dto) => {
      const result = await httpClient.post<any>(`location`, dto)
      return result.data || result
    },
    onSuccessCallback: () => {
      queryClient.invalidateQueries({ queryKey: ["disease"] })
    }
  })
}

/**
 * Hook lấy cảnh báo bệnh theo slug
 */
export const useDiseaseWarning = (slug: string) => {
  return useApiQuery<DiseaseWarning>(`${API_URL}/ai-${slug}/warning`, {
    queryKey: ["disease", "warning", slug],
    // Tự động refetch mỗi 5 phút
    refetchInterval: 5 * 60 * 1000,
  })
}

/**
 * Hook chạy phân tích bệnh ngay lập tức
 */
export const useRunDiseaseAnalysis = (slug: string) => {
  const queryClient = useQueryClient()
  
  return useApiMutation<DiseaseWarning, void>("", {
    customMutationFn: async () => {
      // Set timeout lâu hơn cho AI (2 phút)
      const result = await httpClient.post<any>(`ai-${slug}/run-now`, {}, {
        timeout: 120000
      })
      return result.data || result
    },
    onSuccessCallback: () => {
      queryClient.invalidateQueries({ queryKey: ["disease", "warning", slug] })
    }
  })
}
