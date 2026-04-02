import { cookies } from "next/headers"
import { createApiResponse, serverHandleApiError } from "@/lib/api-response"
import envConfig from "@/config"
import jwt from "jsonwebtoken"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("refreshToken")?.value

    if (!refreshToken) {
      return NextResponse.json(
        {
          message: "No refresh token",
          code: 401,
          data: null,
        },
        { status: 401 },
      )
    }

    const response = await fetch(
      `${envConfig.NEXT_PUBLIC_API_ENDPOINT}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      },
    )

    if (!response.ok) {
      return NextResponse.json(
        {
          message: "Invalid refresh token",
          code: 401,
          data: null,
        },
        { status: 401 },
      )
    }

    const responseData = await response.json()
    const payload = responseData?.data || responseData
    const accessToken = payload?.access_token || payload?.accessToken
    const newRefreshToken = payload?.refresh_token || payload?.refreshToken

    // Update cookies with new tokens
    if (accessToken && newRefreshToken) {
      const decodeAccessToken = jwt.decode(accessToken) as { exp: number }
      const decodeRefreshToken = jwt.decode(newRefreshToken) as { exp: number }

      cookieStore.set("accessToken", accessToken, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: decodeAccessToken.exp * 1000,
      })

      cookieStore.set("refreshToken", newRefreshToken, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: decodeRefreshToken.exp * 1000,
      })

      return createApiResponse({
        accessToken,
        refreshToken: newRefreshToken,
      })
    }

    return NextResponse.json(
      {
        message: "Invalid refresh response",
        code: 500,
        data: responseData,
      },
      { status: 500 },
    )
  } catch (error) {
    return serverHandleApiError(error)
  }
}
