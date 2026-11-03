import { NextResponse } from "next/server"
import { clearTokens, getValidAccessToken } from "@/lib/server-auth"

/** Làm mới token qua cùng luồng server-side để tránh nhiều request refresh song song. */
export async function POST() {
  try {
    const accessToken = await getValidAccessToken(true)
    if (!accessToken) {
      await clearTokens()
      return NextResponse.json({ message: "Phiên đăng nhập đã hết hạn" }, { status: 401 })
    }

    return NextResponse.json(
      { data: { accessToken } },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    console.error("Không thể làm mới phiên đăng nhập:", error)
    return NextResponse.json({ message: "Không thể làm mới phiên đăng nhập" }, { status: 503 })
  }
}
