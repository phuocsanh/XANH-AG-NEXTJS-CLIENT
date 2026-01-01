import { HttpError } from "./http"
import { NextResponse } from "next/server"

interface ApiResponse<T = unknown> {
  message: string
  code: number
  data: T | null
}

export function serverHandleApiError(
  error: unknown
): NextResponse<ApiResponse> {
  console.error("API Error:", error)

  if (error instanceof HttpError) {
    return NextResponse.json(
      {
        message: error.response.message,
        code: error.response.code,
        data: error.response.data,
      },
      { status: error.response.code, statusText: error.response.message }
    )
  }

  return NextResponse.json(
    {
      message: "An unexpected error occurred",
      code: 500,
      data: null,
    },
    { status: 500, statusText: "An unexpected error occurred" }
  )
}

export function createApiResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  // Kiểm tra xem data có phải là một API response không
  if (data && typeof data === "object" && "code" in data && "message" in data && "data" in data) {
    // Nếu đã là API response, trả về trực tiếp
    return NextResponse.json(data as unknown as ApiResponse<T>)
  }

  // Nếu không, bọc lại trong API response
  return NextResponse.json({
    message: "Success",
    code: 200,
    data,
  })
}
