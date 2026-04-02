import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import envConfig from "@/config"
import { createApiResponse, serverHandleApiError } from "@/lib/api-response"

type LoginRequestBody = {
  account?: string
  password?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginRequestBody
    const account = body?.account?.trim()
    const password = body?.password

    if (!account || !password) {
      return Response.json(
        {
          message: "Tài khoản hoặc mật khẩu không hợp lệ",
          code: 400,
          data: null,
        },
        { status: 400 },
      )
    }

    const backendResponse = await fetch(
      `${envConfig.NEXT_PUBLIC_API_ENDPOINT}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ account, password }),
        cache: "no-store",
      },
    )

    const responseData = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok) {
      return Response.json(
        {
          message:
            responseData?.message || "Tài khoản hoặc mật khẩu không chính xác",
          code: backendResponse.status,
          data: responseData,
        },
        { status: backendResponse.status },
      )
    }

    const payload = responseData?.data || responseData
    const accessToken = payload?.access_token || payload?.accessToken
    const refreshToken = payload?.refresh_token || payload?.refreshToken
    const user = payload?.user || null

    if (!accessToken || !refreshToken) {
      return Response.json(
        {
          message: "Đăng nhập thất bại: thiếu token trả về",
          code: 500,
          data: responseData,
        },
        { status: 500 },
      )
    }

    const cookieStore = await cookies()
    const decodeAccessToken = jwt.decode(accessToken) as { exp?: number } | null
    const decodeRefreshToken = jwt.decode(refreshToken) as {
      exp?: number
    } | null

    cookieStore.set("accessToken", accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      ...(decodeAccessToken?.exp
        ? { expires: decodeAccessToken.exp * 1000 }
        : {}),
    })

    cookieStore.set("refreshToken", refreshToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      ...(decodeRefreshToken?.exp
        ? { expires: decodeRefreshToken.exp * 1000 }
        : {}),
    })

    return createApiResponse({
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    })
  } catch (error) {
    return serverHandleApiError(error)
  }
}
