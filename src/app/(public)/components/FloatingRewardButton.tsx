"use client"

import { useState } from "react"
import { useMyPromotionProgress } from "@/hooks/use-rewards"
import { useCurrentUser } from "@/hooks/use-user-profile"
import { Gift, X } from "lucide-react"
import Link from "next/link"

export default function FloatingRewardButton() {
  const [isVisible, setIsVisible] = useState(true)
  const { data: user } = useCurrentUser()
  const { data: progressData } = useMyPromotionProgress()

  if (!isVisible || !user || !progressData) return null

  // Đếm tổng số lượt quay còn lại của tất cả các chiến dịch
  const totalRemainingSpins = progressData.items.reduce(
    (sum, item) => sum + (Number(item.remainingSpinCount) || 0),
    0
  )

  if (totalRemainingSpins <= 0) return null

  // Tìm chiến dịch đầu tiên có lượt quay để mở thẳng vòng quay
  const firstCampaignWithSpins = progressData.items.find(item => (Number(item.remainingSpinCount) || 0) > 0)
  const targetHref = firstCampaignWithSpins 
    ? `/rewards/spin/${firstCampaignWithSpins.promotionId}`
    : "/rewards"

  return (
    <div className="absolute top-24 right-6 z-[999] animate-bounce">
      <div className="relative group">
        <Link
          href={targetHref}
          className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 via-orange-500 to-red-600 rounded-full shadow-[0_8px_20px_rgba(239,68,68,0.5)] border-2 border-white transition-all hover:scale-110 active:scale-95"
        >
          <Gift size={28} className="text-white animate-pulse" />
          
          {/* Badge số lượt quay - rực rỡ */}
          <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-red-700 text-[11px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-md">
            {totalRemainingSpins}
          </div>
        </Link>
        
        {/* Nút X nhỏ xíu để tắt */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="absolute -top-1 -left-1 bg-black/80 text-white p-1 rounded-full border border-white shadow-md hover:bg-black transition-all"
          title="Tắt"
        >
          <X size={8} strokeWidth={4} />
        </button>
      </div>
    </div>
  )
}
