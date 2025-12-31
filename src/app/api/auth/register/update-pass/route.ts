import { UpdatePassBodyType } from "@/models/auth"
import { createApiResponse, serverHandleApiError } from "@/lib/api-response"

export async function POST(request: Request) {
  console.log("🚀 ~ POST ~ request:", request)
  try {
    const body = (await request.json()) as UpdatePassBodyType
    // TODO: Implement direct API call to backend
    // const res = await authApiRequest.updatePassRegister(body)
    throw new Error("Update password API not implemented - authApiRequest removed")
    // return createApiResponse(res)
  } catch (error) {
    return serverHandleApiError(error)
  }
}
