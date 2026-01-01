import { serverHandleApiError } from "@/lib/api-response"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request) {
  try {
    // TODO: Implement direct API call to backend
    // const res = await authApiRequest.registerEmail(body)
    throw new Error("Register email API not implemented - authApiRequest removed")
    // return createApiResponse(res)
  } catch (error) {
    return serverHandleApiError(error)
  }
}
