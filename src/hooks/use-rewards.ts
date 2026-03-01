import { useQuery } from "@tanstack/react-query"
import http from "@/lib/http"

export interface RewardTracking {
  pending_amount: number
  total_accumulated: number
  reward_count: number
  reward_threshold: number
  shortage_to_next: number
  last_reward_date?: string
}

export interface RewardHistoryItem {
  id: number
  reward_date: string
  gift_description: string
  accumulated_amount: number
  season_names: string[]
}

export interface RewardHistoryResponse {
  items: RewardHistoryItem[]
  total: number
  page: number
  limit: number
}

/**
 * Hook lấy thông tin tích lũy của tôi
 */
export function useMyRewardTracking() {
  return useQuery({
    queryKey: ["my-reward-tracking"],
    queryFn: async () => {
      const response = await http.get<{ data: RewardTracking }>("/customer-rewards/my-tracking")
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook lấy lịch sử nhận quà của tôi
 */
export function useMyRewardHistory(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ["my-reward-history", page, limit],
    queryFn: async () => {
      const response = await http.get<{ data: RewardHistoryResponse }>(`/customer-rewards/my-history?page=${page}&limit=${limit}`)
      return response.data
    },
  })
}
