'use server'

import { cookies } from 'next/headers'
import envConfig from '@/config'

/**
 * Server-side auth helper
 * Xử lý token refresh cho Next.js API routes và Server Components
 */

// Singleton để tránh race conditions khi nhiều requests cùng refresh
let refreshPromise: Promise<{ access_token: string; refresh_token: string } | null> | null = null

/**
 * Kiểm tra token có hết hạn không
 * @param token - JWT token
 * @returns true nếu token hết hạn hoặc sắp hết hạn (trong 1 phút)
 */
function isTokenExpired(token: string): boolean {
  try {
    // Decode JWT (phần payload)
    const parts = token.split('.')
    if (parts.length !== 3) return true // Invalid JWT format
    
    // TypeScript now knows parts[1] exists because we checked length
    const base64Url = parts[1]!
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString())
    
    // Kiểm tra exp (expiration time)
    if (!payload.exp) return true
    
    // Token hết hạn nếu exp < now + 60s (buffer 1 phút)
    const now = Math.floor(Date.now() / 1000)
    return payload.exp < (now + 60)
  } catch (error) {
    console.error('Error decoding token:', error)
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
    console.log('🔄 Refreshing token from backend...')
    
    const response = await fetch(`${envConfig.NEXT_PUBLIC_API_ENDPOINT}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
      console.warn(`❌ Token refresh failed: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()
    
    // Backend trả về { success, data: { access_token, refresh_token } }
    if (data.success && data.data) {
      console.log('✅ Token refreshed successfully')
      return {
        access_token: data.data.access_token,
        refresh_token: data.data.refresh_token,
      }
    }

    return null
  } catch (error) {
    console.error('❌ Error refreshing token:', error)
    return null
  }
}

/**
 * Lấy access token hợp lệ cho server-side
 * Tự động refresh nếu token hết hạn
 * 
 * @returns Access token hợp lệ hoặc null nếu không thể lấy/refresh
 */
export async function getValidAccessToken(): Promise<string | null> {
  const cookieStore = await cookies()
  let accessToken = cookieStore.get('accessToken')?.value

  // Nếu có token và còn hạn, dùng luôn
  if (accessToken && !isTokenExpired(accessToken)) {
    return accessToken
  }

  console.log('⚠️ Access token expired or missing, attempting refresh...')

  // Token hết hạn hoặc không có, thử refresh
  const refreshToken = cookieStore.get('refreshToken')?.value
  
  if (!refreshToken) {
    console.warn('❌ No refresh token available')
    return null
  }

  // Sử dụng singleton pattern để tránh race conditions
  if (!refreshPromise) {
    refreshPromise = refreshTokenFromBackend(refreshToken).finally(() => {
      refreshPromise = null
    })
  }

  const newTokens = await refreshPromise

  if (!newTokens) {
    return null
  }

  // Update cookies với tokens mới
  cookieStore.set('accessToken', newTokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  cookieStore.set('refreshToken', newTokens.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return newTokens.access_token
}

/**
 * Xóa tokens (logout)
 */
export async function clearTokens(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')
}
