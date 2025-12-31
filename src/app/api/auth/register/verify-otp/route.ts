import { RegisterVerifyOTPType } from "@/schemaValidations/auth.schema"
import { createApiResponse, serverHandleApiError } from "@/lib/api-response"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterVerifyOTPType
    // TODO: Implement direct API call to backend
    // const res = await authApiRequest.verifyOTP(body)
    throw new Error("Verify OTP API not implemented - authApiRequest removed")
    // return createApiResponse(res)
  } catch (error) {
    return serverHandleApiError(error)
  }
}
