"use server"

import { cookies } from "next/headers"
import envConfig from "@/config"
import jwt from "jsonwebtoken"

/**
 * Server-side auth helper
 * Xử lý token refresh cho Next.js API routes và Server Components
 */

// Singleton để tránh race conditions khi nhiều requests cùng refresh
const refreshPromises = new Map<
  string,
  Promise<{ access_token: string; refresh_token: string } | null>
>()

/**
 * Kiểm tra token có hết hạn không
 * @param token - JWT token
 * @returns true nếu token hết hạn hoặc sắp hết hạn (trong 1 phút)
 */
function isTokenExpired(token: string): boolean {
  try {
    // Decode JWT (phần payload)
    const parts = token.split(".")
    if (parts.length !== 3) return true // Invalid JWT format

    // TypeScript now knows parts[1] exists because we checked length
    const base64Url = parts[1]!
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const payload = JSON.parse(Buffer.from(base64, "base64").toString())

    // Kiểm tra exp (expiration time)
    if (!payload.exp) return true

    // Token hết hạn nếu exp < now + 60s (buffer 1 phút)
    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now + 60
  } catch (error) {
    console.error("Error decoding token:", error)
    return true // Coi như hết hạn nếu không decode được
  }
}

/**
 * Gọi backend để refresh token
 * @param refreshToken - Refresh token hiện tại
 * @returns Tokens mới hoặc null nếu refresh thất bại
 */
async function refreshTokenFromBackend(refreshToken: string): Promise<{
  access_token: string
  refresh_token: string
} | null> {
  try {
    console.log("🔄 Refreshing token from backend...")

    const response = await fetch(
      `${envConfig.NEXT_PUBLIC_API_ENDPOINT}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: "no-store",
      },
    )

    if (!response.ok) {
      console.warn(
        `❌ Token refresh failed: ${response.status} ${response.statusText}`,
      )
      if (response.status === 400 || response.status === 401) return null
      throw new Error(`Token refresh unavailable: ${response.status}`)
    }

    const data = await response.json()

    // Chuẩn hóa nhiều format phản hồi có thể có từ backend
    const payload = data?.data || data
    const accessToken = payload?.access_token || payload?.accessToken
    const newRefreshToken = payload?.refresh_token || payload?.refreshToken

    if (accessToken && newRefreshToken) {
      console.log("✅ Token refreshed successfully")
      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      }
    }

    throw new Error("Phản hồi refresh không có đủ token")
  } catch (error) {
    console.error("❌ Error refreshing token:", error)
    throw error
  }
}

/**
 * Lấy access token hợp lệ cho server-side
 * Tự động refresh nếu token hết hạn
 *
 * @returns Access token hợp lệ hoặc null nếu không thể lấy/refresh
 */
export async function getValidAccessToken(forceRefresh = false): Promise<string | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")?.value

  // Nếu có token và còn hạn, dùng luôn
  if (!forceRefresh && accessToken && !isTokenExpired(accessToken)) {
    return accessToken
  }

  console.log("⚠️ Access token expired or missing, attempting refresh...")

  // Token hết hạn hoặc không có, thử refresh
  const refreshToken = cookieStore.get("refreshToken")?.value

  if (!refreshToken) {
    console.warn("❌ No refresh token available")
    return null
  }

  // Tránh race condition theo từng phiên refreshToken
  const lockKey = refreshToken
  if (!refreshPromises.has(lockKey)) {
    const promise = refreshTokenFromBackend(refreshToken).finally(() => {
      refreshPromises.delete(lockKey)
    })
    refreshPromises.set(lockKey, promise)
  }

  const newTokens = await refreshPromises.get(lockKey)!

  if (!newTokens) {
    return null
  }

  // Giữ thời hạn cookie theo token để phiên vẫn tồn tại sau khi đóng ứng dụng.
  const accessExpiry = jwt.decode(newTokens.access_token) as { exp?: number } | null
  const refreshExpiry = jwt.decode(newTokens.refresh_token) as { exp?: number } | null
  if (!accessExpiry?.exp || !refreshExpiry?.exp) {
    throw new Error("Token mới thiếu thời hạn hợp lệ")
  }

  // Update cookies với tokens mới
  cookieStore.set("accessToken", newTokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(accessExpiry.exp * 1000),
  })

  cookieStore.set("refreshToken", newTokens.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(refreshExpiry.exp * 1000),
  })

  return newTokens.access_token
}

/**
 * Xóa tokens (logout)
 */
export async function clearTokens(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("accessToken")
  cookieStore.delete("refreshToken")
}
