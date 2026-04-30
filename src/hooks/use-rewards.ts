import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import http from "@/lib/http"

export interface PromotionFeaturedReward {
  rewardName: string
  rewardValue: number
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
  resultType: "win" | "lose"
  rewardName?: string | null
  rewardValue: number
  spunAt: string
  note?: string | null
}

export interface PromotionSpinLogResponse {
  items: PromotionSpinLogItem[]
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

export function useSpinPromotionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (promotionId: number) => {
      const response = await http.post<{ data: SpinResultResponse }>(
        `/promotion-campaigns/${promotionId}/spin`,
        {},
      )
      return response.data
    },
    onSuccess: (_data, promotionId) => {
      queryClient.invalidateQueries({ queryKey: ["my-promotion-progress"] })
      queryClient.invalidateQueries({
        queryKey: ["my-promotion-spin-logs", promotionId],
      })
    },
  })
}
