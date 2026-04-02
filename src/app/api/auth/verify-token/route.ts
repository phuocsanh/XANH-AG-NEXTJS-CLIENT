import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { NextResponse } from "next/server"

/**
 * Verify nếu access token còn hạn
 * Dùng khi app mount để sync auth state
 * Return: { valid: true/false, expires?: number }
 */
export async function POST() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json(
        {
          valid: false,
          message: "No access token found",
        },
        { status: 401 },
      )
    }

    // Decode và check expiry
    const decoded = jwt.decode(accessToken) as { exp?: number } | null

    if (!decoded || !decoded.exp) {
      return NextResponse.json(
        {
          valid: false,
          message: "Invalid token format",
        },
        { status: 401 },
      )
    }

    const now = Math.floor(Date.now() / 1000)
    const isExpired = decoded.exp < now

    if (isExpired) {
      return NextResponse.json(
        {
          valid: false,
          message: "Token expired",
          expires: decoded.exp,
        },
        { status: 401 },
      )
    }

    // Token còn hạn
    return NextResponse.json({
      valid: true,
      expires: decoded.exp,
    })
  } catch (error) {
    console.error("Error verifying token:", error)
    return NextResponse.json(
      {
        valid: false,
        message: "Token verification failed",
      },
      { status: 500 },
    )
  }
}
