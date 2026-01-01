import { useQuery } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { useAppStore } from "@/stores"

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT

interface UserProfile {
  id: number
  nickname?: string
  phone_number?: string
  email?: string
  address?: string
}

interface User {
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

/**
 * Hook để lấy thông tin user hiện tại từ API
 */
export function useCurrentUser() {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const isAuthenticated = useAppStore((state) => state.isLogin)

  // Đọc token khi component mount hoặc khi trạng thái login thay đổi
  useEffect(() => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
    console.log('[useCurrentUser] Auth transition - Token from storage:', token ? 'EXISTS' : 'NULL')
    setAccessToken(token)
  }, [isAuthenticated]) // Kích hoạt lại khi isAuthenticated thay đổi

  console.log('[useCurrentUser] Current accessToken state:', accessToken ? 'EXISTS' : 'NULL')

  return useQuery<User>({
    queryKey: ["current-user", accessToken], // Thêm accessToken vào queryKey để query bám theo token
    queryFn: async () => {
      console.log('[useCurrentUser] Fetching user profile...')
      if (!accessToken) throw new Error("No access token")

      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user profile")
      }

      const data = await response.json()
      console.log('[useCurrentUser] User profile:', data)
      return data.data || data // Trả về nội dung bên trong wrapper data
    },
    enabled: !!accessToken, // Chỉ fetch khi có token
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  })
}
