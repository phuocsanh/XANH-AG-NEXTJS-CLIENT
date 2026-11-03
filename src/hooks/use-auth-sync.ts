"use client"

import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAppStore } from "@/stores"
import { CURRENT_USER_QUERY_KEY, type User } from "@/hooks/use-user-profile"

type SessionResponse = {
  valid: boolean
  user?: User
}

/** Khôi phục phiên và dùng cùng hồ sơ cho header lẫn các tiện ích trang chủ. */
export function useAuthSync() {
  const queryClient = useQueryClient()
  const syncInProgressRef = useRef(false)
  const setIsLogin = useAppStore((state) => state.setIsLogin)
  const setAuthReady = useAppStore((state) => state.setAuthReady)

  useEffect(() => {
    if (syncInProgressRef.current) return
    syncInProgressRef.current = true
    const startingRevision = useAppStore.getState().authRevision

    const syncAuthState = async () => {
      try {
        const response = await fetch("/api/auth/verify-token", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        })

        // Bỏ kết quả cũ nếu người dùng đã đăng nhập hoặc đăng xuất trong lúc kiểm tra.
        if (useAppStore.getState().authRevision !== startingRevision) return

        if (response.ok) {
          const session = (await response.json()) as SessionResponse
          if (useAppStore.getState().authRevision !== startingRevision) return
          if (session.valid && session.user) {
            queryClient.setQueryData<User>(CURRENT_USER_QUERY_KEY, session.user)
            setIsLogin(true)
            return
          }
        }

        if (response.status === 401) {
          queryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY })
          setIsLogin(false)
          return
        }

        // Lỗi mạng tạm thời không xóa cookie hoặc phiên đã lưu.
        setAuthReady(true)
      } catch (error) {
        console.error("Không thể khôi phục phiên đăng nhập:", error)
        if (useAppStore.getState().authRevision === startingRevision) {
          setAuthReady(true)
        }
      }
    }

    void syncAuthState()
  }, [queryClient, setAuthReady, setIsLogin])
}
