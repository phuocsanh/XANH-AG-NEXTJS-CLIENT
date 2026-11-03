import { useQuery } from "@tanstack/react-query"
import { useAppStore } from "@/stores"
import http from "@/lib/http"

interface UserProfile {
  id: number
  nickname?: string
  phone_number?: string
  email?: string
  address?: string
}

export interface User {
  id: number
  account: string
  status: string
  role: {
    id: number
    name: string
    code: string
  }
  user_profile?: UserProfile
}

export const CURRENT_USER_QUERY_KEY = ["current-user"] as const

/**
 * Hook để lấy thông tin user hiện tại từ API
 * HttpClient sẽ tự động xử lý token và refresh khi cần
 */
export function useCurrentUser() {
  const isAuthenticated = useAppStore((state) => state.isLogin)
  const authReady = useAppStore((state) => state.authReady)

  return useQuery<User>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      // HttpClient sẽ tự động lấy token từ storage và refresh nếu cần
      const response = await http.get<{ data: User }>("/users/me")
      return response.data
    },
    enabled: authReady && isAuthenticated, // Chỉ fetch sau khi đã xác nhận phiên
    staleTime: 5 * 60 * 1000, // Cache 5 phút
    retry: 1, // Retry 1 lần nếu thất bại (cho phép refresh token)
  })
}
