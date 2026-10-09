import { useMutation, useQuery } from "@tanstack/react-query"
import http from "@/lib/http"

export interface PromotionFeaturedReward {
  rewardName: string
  rewardImageUrl?: string | null
  rewardValue: number
  totalQuantity: number
}

export interface PromotionProgressItem {
  promotionId: number
  promotionName: string
  startAt: string
  endAt: string
  thresholdAmount: number
  qualifiedAmount: number
  remainingAmount: number
  earnedSpinCount: number
  usedSpinCount: number
  remainingSpinCount: number
  winCount: number
  featuredRewards: PromotionFeaturedReward[]
  statusLabel: string
}

export interface PromotionProgressResponse {
  items: PromotionProgressItem[]
}

export interface PromotionSpinLogItem {
  id: number
  promotionId?: number
  promotionName?: string
  resultType: "win" | "lose"
  rewardName?: string | null
  rewardValue: number
  spunAt: string
  note?: string | null
}

export interface PromotionSpinLogResponse {
  items: PromotionSpinLogItem[]
  total: number
  page: number
  limit: number
}

export interface CustomerRewardTracking {
  id?: number
  customer_id?: number
  pending_amount: number
  total_accumulated: number
  reward_count: number
  reward_threshold: number
  effective_reward_threshold: number
  shortage_to_next: number
  last_reward_date?: string | null
  status?: string
}

export interface CustomerRewardHistoryItem {
  id: number
  customer_id: number
  customer_name?: string | null
  reward_threshold: number
  accumulated_amount: number
  reward_sequence: number
  season_names?: string[] | null
  reward_date: string
  gift_description?: string | null
  gift_product_name?: string | null
  gift_quantity?: number | null
  gift_status: string
  reward_type?: string | null
  delivered_date?: string | null
  notes?: string | null
}

export interface CustomerRewardHistoryResponse {
  items: CustomerRewardHistoryItem[]
  total: number
  page: number
  limit: number
}

export interface SpinResultResponse {
  success: boolean
  appliedRate: number
  resultType: "win" | "lose"
  remainingSpinCount: number
  winCount: number
  reward: {
    rewardName: string
    rewardValue: number
  } | null
  message: string
}

export function useMyPromotionProgress() {
  return useQuery({
    queryKey: ["my-promotion-progress"],
    queryFn: async () => {
      const response = await http.get<{ data: PromotionProgressResponse }>("/promotion-campaigns/my-progress")
      return response.data
    },
    staleTime: 60 * 1000,
  })
}

export function useMyPromotionSpinLogs(promotionId?: number | null) {
  return useQuery({
    queryKey: ["my-promotion-spin-logs", promotionId],
    queryFn: async () => {
      const response = await http.get<{ data: PromotionSpinLogResponse }>(
        `/promotion-campaigns/${promotionId}/my-spins`,
      )
      return response.data
    },
    enabled: !!promotionId,
  })
}

export function useMyPromotionSpinHistory(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["my-promotion-spin-history", page, limit],
    queryFn: async () => {
      const response = await http.get<{ data: PromotionSpinLogResponse }>(
        `/promotion-campaigns/my-spin-history?page=${page}&limit=${limit}`,
      )
      return response.data
    },
  })
}

export function useMyCustomerRewardTracking() {
  return useQuery({
    queryKey: ["my-customer-reward-tracking"],
    queryFn: async () => {
      const response = await http.get<{ data: CustomerRewardTracking }>(
        "/customer-rewards/my-tracking",
      )
      return response.data
    },
    staleTime: 60 * 1000,
  })
}

export function useMyCustomerRewardHistory(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["my-customer-reward-history", page, limit],
    queryFn: async () => {
      const response = await http.get<{ data: CustomerRewardHistoryResponse }>(
        `/customer-rewards/my-history?page=${page}&limit=${limit}`,
      )
      return response.data
    },
    staleTime: 60 * 1000,
  })
}

export function useSpinPromotionMutation() {
  return useMutation({
    mutationFn: async (promotionId: number) => {
      const response = await http.post<any>(
        `/promotion-campaigns/${promotionId}/spin`,
        {},
      )
      // Nếu backend bọc trong .data thì lấy .data, nếu không lấy cả response
      return response.data || response
    },
  })
}
