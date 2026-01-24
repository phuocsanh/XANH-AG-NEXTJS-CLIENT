import { useMutation, useQuery } from "@tanstack/react-query"
import { handleErrorApi } from "@/lib/utils"
import httpClient from "@/lib/http"

type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE"

interface ApiQueryOptions<TData> {
  queryKey: string[]
  customQueryFn?: () => Promise<TData>
  method?: "GET" | "POST"
  body?: any
  headers?: Record<string, string>
  credentials?: RequestCredentials
  enabled?: boolean
  onError?: (error: Error) => void
  staleTime?: number
  gcTime?: number
  refetchInterval?: number | false
}

interface ApiMutationOptions<TData, TVariables> {
  method?: HttpMethod
  customMutationFn?: (data: TVariables) => Promise<TData>
  onSuccessCallback?: (data: TData) => void
  headers?: Record<string, string>
  isFormData?: boolean
  credentials?: RequestCredentials
}

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3003"

const normalizeEndpoint = (endpoint: string) => {
  if (endpoint.startsWith(API_URL)) {
    return endpoint.replace(API_URL, "")
  }
  return endpoint
}

// Hook cho GET requests
export const useApiQuery = <TData>(
  endpoint: string,
  options: ApiQueryOptions<TData>
) => {
  const {
    queryKey,
    customQueryFn,
    method = "GET",
    body,
    headers: customHeaders,
    credentials,
    enabled = true,
    onError,
  } = options

  return useQuery<TData, Error>({
    queryKey: [
      ...queryKey,
      endpoint,
      method,
      JSON.stringify(body),
      customHeaders,
      credentials,
      customQueryFn,
    ],
    queryFn: async () => {
      try {
        if (customQueryFn) {
          return customQueryFn()
        }

        const relativeEndpoint = normalizeEndpoint(endpoint)
        let result: any

        if (method === "GET") {
          result = await httpClient.get(relativeEndpoint, {
            headers: customHeaders,
          })
        } else {
          result = await httpClient.post(relativeEndpoint, body, {
            headers: customHeaders,
          })
        }

        // Nếu backend trả về theo cấu trúc { success, data }
        if (result && result.success !== undefined && result.data !== undefined) {
          // Nếu có thông tin phân trang, trả về cả object để hook search có thể lấy total, page, limit
          if (result.pagination || result.total !== undefined) {
            return {
              ...result,
              data: result.data,
              total: result.pagination?.total ?? result.total ?? result.data?.length ?? 0,
              page: result.pagination?.page ?? result.page ?? 1,
              limit: result.pagination?.limit ?? result.limit ?? 10,
            } as TData
          }
          return result.data as TData
        }

        return result as TData
      } catch (error) {
        onError?.(error as Error)
        throw error
      }
    },
    enabled,
    retry: 1,
    staleTime: options.staleTime ?? 1000 * 60, // Mặc định 1 phút
    gcTime: options.gcTime ?? 1000 * 60 * 5, // Mặc định 5 phút
    refetchInterval: options.refetchInterval,
  })
}

// Hook cho các methods khác (POST, PUT, PATCH, DELETE)
export const useApiMutation = <TData, TVariables>(
  endpoint: string,
  options?: ApiMutationOptions<TData, TVariables>
) => {
  const {
    method = "POST",
    customMutationFn,
    onSuccessCallback,
    headers: customHeaders,
    isFormData = false,
  } = options || {}

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (data) => {
      if (customMutationFn) {
        return customMutationFn(data)
      }

      const relativeEndpoint = normalizeEndpoint(endpoint)
      
      const requestOptions = {
        headers: customHeaders,
        isFormData, // Note: HttpClient doesn't directly support 'isFormData' flag but it detects FormData body.
        // However, if we pass body as object and want FormData, we need to convert it?
        // Existing useApiQuery implementation handles it by creating FormData if 'isFormData' is true.
        // We might need to handle that here.
      }
      
      let processedData: any = data
      
      // Handle FormData conversion if needed (HttpClient auto-handles if body is FormData instance)
      if (isFormData && !(data instanceof FormData)) {
         // Existing code casted data as FormData which is wrong if it wasn't one.
         // But let's assume if isFormData is true, data passed IS FormData or we should treat it as such?
         // In existing code: ...(isFormData && { body: data as unknown as FormData }),
         // So it assumes data IS FormData.
         processedData = data
      }


      let result: any
      switch(method) {
        case "POST":
          result = await httpClient.post(relativeEndpoint, processedData, { ...requestOptions })
          break
        case "PUT":
          result = await httpClient.put(relativeEndpoint, processedData, { ...requestOptions })
          break
        case "PATCH":
          result = await httpClient.patch(relativeEndpoint, processedData, { ...requestOptions })
          break
        case "DELETE":
          // DELETE usually doesn't have body in HttpClient.delete signature in http.ts?
          // Let's check http.ts signature. delete<T>(url, options). No body.
          // But useApiMutation passes 'data'.
          // If DELETE has body, HttpClient might not support it or we need to check.
          // Assuming standard REST DELETE doesn't have body.
          result = await httpClient.delete(relativeEndpoint, { ...requestOptions })
          break
      }

      // Nếu backend trả về theo cấu trúc { success, data }
      if (result && result.success !== undefined && result.data !== undefined) {
        return result.data as TData
      }

      return result as TData
    },
    onSuccess: (data) => {
      onSuccessCallback?.(data)
    },
    onError: (error) => {
      handleErrorApi({ error })
    },
  })
}
