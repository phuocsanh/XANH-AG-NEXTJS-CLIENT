/**
 * Custom hook cho API Báo cáo lợi nhuận
 */

import { useApiQuery } from "./use-api"
import type { ProfitReport } from "@/models/rice-farming"

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3003"

/**
 * Lấy báo cáo lợi nhuận theo ruộng lúa
 */
export const useProfitReport = (riceCropId: number) => {
  return useApiQuery<ProfitReport>(`${API_URL}/profit-reports/crop/${riceCropId}`, {
    queryKey: ["profit-report", riceCropId?.toString() || ""],
    enabled: !!riceCropId,
  })
}
