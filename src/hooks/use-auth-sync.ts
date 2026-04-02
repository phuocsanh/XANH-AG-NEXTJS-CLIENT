"use client"

import { useEffect, useRef } from "react"
import { useAppStore } from "@/stores"

/**
 * Hook để sync auth state khi app mount
 * Verify token validity từ cookies và update isLogin state
 * Nếu token hết hạn → logout và clear storage
 */
export function useAuthSync() {
  const { setIsLogin } = useAppStore()
  const syncInProgressRef = useRef(false)

  useEffect(() => {
    // Chỉ chạy 1 lần khi mount
    if (syncInProgressRef.current) return
    syncInProgressRef.current = true

    const syncAuthState = async () => {
      try {
        console.log("🔄 Syncing auth state on app mount...")

        // Verify token từ cookies
        const response = await fetch("/api/auth/verify-token", {
          method: "POST",
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.valid) {
            console.log("✅ Token valid, keeping login state")
            setIsLogin(true)
            return
          }
        }

        // Token invalid/expired hoặc verify fail → logout
        console.warn("❌ Token invalid/expired, logging out")
        
        // Clear storage
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("user")
          sessionStorage.removeItem("accessToken")
          sessionStorage.removeItem("refreshToken")
          sessionStorage.removeItem("user")
        }

        setIsLogin(false)
      } catch (error) {
        console.error("❌ Auth sync error:", error)
        setIsLogin(false)
      }
    }

    syncAuthState()
  }, [setIsLogin])
}
