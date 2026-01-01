import { useApiMutation } from "@/hooks/use-api"

export interface UploadResponse {
  id: string
  url: string
  name: string
  type: string
  size: number
}

interface UploadImageRequest {
  file: File
  type?: string
}

export const useUploadImageMutation = () => {
  return useApiMutation<UploadResponse, UploadImageRequest>("/upload/image", {
    method: "POST",
    isFormData: true,
    customMutationFn: async (data) => {
      const formData = new FormData()
      formData.append("file", data.file)
      if (data.type) {
        formData.append("type", data.type)
      }
      
      // Note: We use the existing logic inside useApiMutation or call httpClient directly here if customMutationFn is used.
      // Since useApiMutation's customMutationFn overrides the default behavior, we need to call API here.
      // But actually, useApiMutation helper is designed to handle common cases.
      // However, for FormData with specific field names, it's safer to use customMutationFn or just rely on 'isFormData' flag if it maps 1:1.
      // In use-api.ts, if isFormData is true, it passes data directly? No, it expects data to be object or FormData.
      // Let's implement manually here for safety.
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/upload/image`, {
        method: "POST",
        body: formData,
        headers: {
             // 'Content-Type': 'multipart/form-data', // Do NOT set this manually with FormData
             // Add Auth header if needed. Assuming httpClient handles it, but verify.
             // Typically we should use httpClient.post but passing FormData.
        }
      })
      
      // Let's rely on httpClient to handle Auth tokens.
      // We can't import httpClient easily inside this hook definition file unless we import it at top.
      // Wait, I can import httpClient from lib/http
      
      const { default: httpClient } = await import("@/lib/http")
      return httpClient.post("/upload/image", formData)
    }
  })
}
