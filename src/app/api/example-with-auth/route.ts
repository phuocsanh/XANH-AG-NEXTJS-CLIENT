import { getValidAccessToken } from '@/lib/server-auth'
import http from '@/lib/http'

/**
 * Example API Route: Get user profile
 * Demonstrates server-side token refresh
 * 
 * Usage: GET /api/users/profile
 */
export async function GET() {
  try {
    // 1. Lấy access token hợp lệ (tự động refresh nếu hết hạn)
    const accessToken = await getValidAccessToken()
    
    if (!accessToken) {
      return Response.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      )
    }

    // 2. Gọi backend API với token
    // Token sẽ được gửi qua Authorization header
    const data = await http.get('/users/profile', {
      accessToken, // Inject token cho server-side
    })

    // 3. Trả về data
    return Response.json(data)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    
    // Nếu là HttpError với code 401, có thể là refresh failed
    if (error instanceof Error && 'response' in error) {
      const httpError = error as any
      if (httpError.response?.code === 401) {
        return Response.json(
          { error: 'Session expired - Please login again' },
          { status: 401 }
        )
      }
    }
    
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
