import envConfig from "@/config"
import { normalizePath } from "@/lib/utils"
import { redirect } from "next/navigation"

// Types
interface CustomOptions extends Omit<RequestInit, "method"> {
  baseUrl?: string
  accessToken?: string // Cho phép inject token từ server-side (Next.js API routes)
}

// Backend response format từ ResponseInterceptor
interface BackendSuccessResponse<T> {
  success: boolean
  data: T
  meta: {
    timestamp: string
    path: string
    method: string
  }
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  [key: string]: any // Cho phép các field bổ sung như summary, statistics
}

// Backend error response format từ HttpExceptionFilter (RFC 7807)
interface BackendErrorResponse {
  type: string
  title: string
  status: number
  detail: string
  field?: string
  details?: Array<{ field?: string; message: string }>
  code?: string
  resource?: string
}

interface EntityErrorPayload {
  message: string
  errors: Array<{
    field: string
    message: string
  }>
}

interface HttpErrorResponse {
  code: number
  data: unknown
  message: string
}

interface EntityErrorResponse extends HttpErrorResponse {
  code: 422
  data: EntityErrorPayload
}

interface AuthHeaders {
  Authorization?: string
}

// Constants
const AUTHENTICATION_ERROR_STATUS = 401
const isClient = typeof window !== "undefined"

// Error Classes
export class HttpError extends Error {
  constructor(public readonly response: HttpErrorResponse) {
    super("Http Error")
    this.name = "HttpError"
  }
}

export class EntityError extends HttpError {
  constructor(public readonly response: EntityErrorResponse) {
    super(response)
    this.name = "EntityError"
  }
}

// HTTP Client
class HttpClient {
  private static instance: HttpClient
  private clientLogoutRequest: Promise<unknown> | null = null

  private constructor() {}

  static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient()
    }
    return HttpClient.instance
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      const response = await fetch("/api/auth/get-access-token")
      if (!response.ok) {
        console.warn(`Failed to get access token: ${response.status} ${response.statusText}`)
        return null
      }
      const { accessToken } = await response.json()
      return accessToken
    } catch (error) {
      console.error("Error getting access token:", error)
      return null
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    try {
      const response = await fetch(
        "/api/auth/get-access-token-by-refresh-token",
        {
          method: "POST",
        }
      )
      if (!response.ok) {
        console.warn(`Failed to refresh access token: ${response.status} ${response.statusText}`)
        return null
      }
      const { accessToken } = await response.json()
      return accessToken
    } catch (error) {
      console.error("Error refreshing access token:", error)
      return null
    }
  }

  private async handleLogout(): Promise<void> {
    if (!this.clientLogoutRequest) {
      this.clientLogoutRequest = fetch("/api/auth/logout", {
        method: "POST",
      }).finally(() => {
        this.clientLogoutRequest = null
      })
    }
    await this.clientLogoutRequest
  }

  private async handleAuthenticationError(
    url: string,
    options: CustomOptions,
    method: string,
    body?: string | FormData
  ): Promise<Response> {
    console.log('🔄 Handling 401 error, attempting token refresh...')
    
    // CLIENT-SIDE: Refresh qua API route
    if (isClient) {
      const accessToken = await this.refreshAccessToken()
      if (!accessToken) {
        console.warn('❌ Client-side refresh failed, redirecting to login')
        await this.handleLogout()
        location.href = "/login"
        throw new Error("Redirecting to login")
      }

      console.log('✅ Client-side token refreshed, retrying request')
      const baseHeaders = this.getBaseHeaders(body)
      baseHeaders.Authorization = `Bearer ${accessToken}`

      return fetch(url, {
        ...options,
        headers: { ...baseHeaders, ...options?.headers },
        body,
        method,
      })
    }
    
    // SERVER-SIDE: Refresh trực tiếp từ backend
    console.log('🔄 Server-side refresh attempt...')
    
    // Dynamic import để tránh lỗi khi chạy client-side
    const { getValidAccessToken } = await import('@/lib/server-auth')
    const newAccessToken = await getValidAccessToken()
    
    if (!newAccessToken) {
      console.warn('❌ Server-side refresh failed')
      // Throw error để API route có thể xử lý
      throw new HttpError({
        code: 401,
        data: null,
        message: "Unauthorized - token refresh failed"
      })
    }

    console.log('✅ Server-side token refreshed, retrying request')
    const baseHeaders = this.getBaseHeaders(body)
    baseHeaders.Authorization = `Bearer ${newAccessToken}`

    return fetch(url, {
      ...options,
      headers: { ...baseHeaders, ...options?.headers },
      body,
      method,
    })
  }

  private getBaseHeaders(body?: string | FormData): Record<string, string> {
    return body instanceof FormData
      ? {}
      : {
          "Content-Type": "application/json",
        }
  }

  private async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    url: string,
    options: CustomOptions = {}
  ): Promise<T> {
    const baseUrl = options?.baseUrl ?? envConfig.NEXT_PUBLIC_API_ENDPOINT
    const fullUrl = `${baseUrl}/${normalizePath(url)}`

    console.log("Making request to:", fullUrl)
    console.log("Request method:", method)
    console.log("Request options:", JSON.stringify(options))

    let body: string | FormData | undefined
    if (options?.body instanceof FormData) {
      body = options.body
    } else if (options?.body) {
      body = JSON.stringify(options.body)
    }

    const baseHeaders = this.getBaseHeaders(body)
    
    // Ưu tiên token từ options (server-side)
    if (options?.accessToken) {
      baseHeaders.Authorization = `Bearer ${options.accessToken}`
    } else if (isClient) {
      // Client-side: lấy từ cookies qua API route
      const accessToken = await this.getAccessToken()
      if (accessToken) {
        baseHeaders.Authorization = `Bearer ${accessToken}`
      }
    }
    // Server-side mà không có accessToken trong options: không attach token

    let response = await fetch(fullUrl, {
      ...options,
      headers: { ...baseHeaders, ...options?.headers },
      body,
      method,
    })

    console.log("Response status:", response.status)
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    )

    if (!response) {
      const errorMessage = "An error occurred while fetching data."
      if (isClient) {
        window.location.href = `/error?message=${encodeURIComponent(
          errorMessage
        )}`
      } else {
        redirect(`/error?message=${encodeURIComponent("Error")}`)
      }
      throw new Error(errorMessage)
    }

    if (!response.ok) {
      if (response.status === AUTHENTICATION_ERROR_STATUS) {
        response = await this.handleAuthenticationError(
          fullUrl,
          options,
          method,
          body
        )
      } else {
        let errorData = null
        let errorMessage = response.statusText || "An error occurred"

        try {
          const contentType = response.headers.get("content-type")
          console.log("Content-Type:", contentType)

          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json()
            errorMessage = errorData?.message || errorMessage
          } else {
            const text = await response.text()
            errorData = { text }
            errorMessage = text || errorMessage
          }
        } catch (error) {
          console.error("Error parsing response:", error)
        }

        // Log error details for debugging
        console.error("HTTP Error:", {
          url: fullUrl,
          status: response.status,
          statusText: response.statusText,
          errorData,
          errorMessage,
        })

        // Log backend error details nếu có (RFC 7807 format)
        if (errorData && typeof errorData === 'object') {
          const backendError = errorData as Partial<BackendErrorResponse>
          if (backendError.type || backendError.title) {
            console.error("Backend Error Details:", {
              type: backendError.type,
              title: backendError.title,
              detail: backendError.detail,
              field: backendError.field,
              details: backendError.details,
            })
          }
        }

        // For 422 errors, throw EntityError
        if (response.status === 422) {
          throw new EntityError({
            code: response.status,
            data: errorData as EntityErrorPayload,
            message: errorMessage,
          })
        }

        // For other errors, throw HttpError
        // Map HTTP status code thành code field
        throw new HttpError({
          code: response.status, // Sử dụng response.status thay vì errorData.code
          data: errorData,
          message: errorMessage,
        })
      }
    }

    return response.json()
  }

  get<T>(url: string, options?: Omit<CustomOptions, "body">) {
    return this.request<T>("GET", url, options)
  }

  post<T>(url: string, body: unknown, options?: Omit<CustomOptions, "body">) {
    return this.request<T>("POST", url, {
      ...options,
      body: body as BodyInit | null | undefined,
    })
  }

  put<T>(url: string, body: unknown, options?: Omit<CustomOptions, "body">) {
    return this.request<T>("PUT", url, {
      ...options,
      body: body as BodyInit | null | undefined,
    })
  }

  patch<T>(url: string, body: unknown, options?: Omit<CustomOptions, "body">) {
    return this.request<T>("PATCH", url, {
      ...options,
      body: body as BodyInit | null | undefined,
    })
  }

  delete<T>(url: string, options?: Omit<CustomOptions, "body">) {
    return this.request<T>("DELETE", url, options)
  }
}

export default HttpClient.getInstance()
