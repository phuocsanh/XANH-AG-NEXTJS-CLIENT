"use client"

import { useAuthSync } from "@/hooks/use-auth-sync"

/**
 * Provider wrapper để gọi useAuthSync hook
 * Cần wrapper vì useAuthSync là hook và phải gọi từ component
 */
export function AuthSyncProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useAuthSync()

  return <>{children}</>
}
