import { serverHandleApiError } from "@/lib/api-response"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: Request) {
  try {
    // TODO: Implement direct API call to backend
    // const res = await authApiRequest.sLogin(body)
    
    // Temporary mock response for development
    throw new Error("Login API not implemented - authApiRequest removed")
    
    /* Original code - restore when implementing:
    const cookieStore = await cookies()

    if (res.data?.tokens.accessToken && res.data?.tokens.refreshToken) {
      const { accessToken, refreshToken } = res.data.tokens
      const decodeAccessToken = jwt.decode(accessToken) as { exp: number }
      const decodeRefreshToken = jwt.decode(refreshToken) as { exp: number }

      cookieStore.set("accessToken", accessToken, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        expires: decodeAccessToken.exp * 1000,
      })

      cookieStore.set("refreshToken", refreshToken, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        expires: decodeRefreshToken.exp * 1000,
      })
    }

    return createApiResponse(res)
    */
  } catch (error) {
    return serverHandleApiError(error)
  }
}
