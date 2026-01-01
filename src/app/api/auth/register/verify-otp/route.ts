import { serverHandleApiError } from "@/lib/api-response"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: Request) {
  try {
    // TODO: Implement direct API call to backend
    // const res = await authApiRequest.verifyOTP(body)
    throw new Error("Verify OTP API not implemented - authApiRequest removed")
    // return createApiResponse(res)
  } catch (error) {
    return serverHandleApiError(error)
  }
}
