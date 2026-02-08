import { useMutation } from "@tanstack/react-query"
import http from "@/lib/http"

/**
 * Hook để gọi API AI phân tích giọng nói thành dữ liệu chi phí
 */
export const useParseVoiceToExpense = () => {
  return useMutation({
    mutationFn: (body: { text: string; categories: { id: number; name: string }[] }) =>
      http.post<any>("/ai-reasoning/parse-voice-to-expense", body).then(res => res.payload),
  })
}
