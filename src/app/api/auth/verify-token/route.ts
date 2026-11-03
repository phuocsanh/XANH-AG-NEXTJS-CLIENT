import { NextResponse } from "next/server"
import envConfig from "@/config"
import { clearTokens, getValidAccessToken } from "@/lib/server-auth"

/** Xác nhận phiên bằng API hồ sơ; backend chịu trách nhiệm kiểm tra chữ ký JWT. */
export async function POST() {
  try {
    let accessToken = await getValidAccessToken()
    if (!accessToken) {
      await clearTokens()
      return NextResponse.json({ valid: false }, { status: 401 })
    }

    const getProfile = (token: string) =>
      fetch(`${envConfig.NEXT_PUBLIC_API_ENDPOINT}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })

    let response = await getProfile(accessToken)
    if (response.status === 401) {
      // Access token bị backend từ chối dù thời hạn JWT vẫn còn.
      accessToken = await getValidAccessToken(true)
      if (!accessToken) {
        await clearTokens()
        return NextResponse.json({ valid: false }, { status: 401 })
      }
      response = await getProfile(accessToken)
    }

    if (!response.ok) {
      if (response.status === 401) await clearTokens()
      return NextResponse.json(
        { valid: false },
        { status: response.status === 401 ? 401 : 503 },
      )
    }

    const result = await response.json()
    const user = result?.data
    if (!user || typeof user !== "object") {
      return NextResponse.json({ valid: false }, { status: 503 })
    }

    return NextResponse.json(
      { valid: true, user },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    console.error("Không thể xác nhận phiên đăng nhập:", error)
    return NextResponse.json({ valid: false }, { status: 503 })
  }
}
