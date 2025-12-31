import { createApiResponse, serverHandleApiError } from "@/lib/api-response"

export async function POST(request) {
  try {
    const body = await request.json()
    // TODO: Implement direct API call to backend
    // const res = await authApiRequest.registerEmail(body)
    throw new Error("Register email API not implemented - authApiRequest removed")
    // return createApiResponse(res)
  } catch (error) {
    return serverHandleApiError(error)
  }
}
