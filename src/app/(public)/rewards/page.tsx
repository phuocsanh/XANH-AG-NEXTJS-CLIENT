"use client"

/**
 * Trang quay thưởng.
 * Hiển thị danh sách chương trình và lịch sử quay.
 * Khi nhấn "Quay ngay" → chuyển hướng đến trang /rewards/spin/[promotionId]
 * (tách riêng để animation vòng quay không bị block bởi modal).
 */

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useState } from "react"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Gift,
  History,
  Sparkles,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-user-profile"
import {
  useMyPromotionProgress,
  useMyPromotionSpinHistory,
} from "@/hooks/use-rewards"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/** Định dạng tiền tệ VND */
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)

const HISTORY_PAGE_LIMIT = 10

export default function RewardsPage() {
  const router = useRouter()
  const [spinHistoryPage, setSpinHistoryPage] = useState(1)
  const { data: user } = useCurrentUser()
  const { data: progressData, isLoading } = useMyPromotionProgress()
  const { data: spinHistoryData, isLoading: isSpinHistoryLoading } =
    useMyPromotionSpinHistory(spinHistoryPage, HISTORY_PAGE_LIMIT)

  /* ─── Chưa đăng nhập ─── */
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold">Vui lòng đăng nhập</h2>
        <p className="text-muted-foreground mt-2">
          Bạn cần đăng nhập để xem quay thưởng.
        </p>
      </div>
    )
  }

  const campaigns = progressData?.items || []
  const spinHistoryTotal = Number(spinHistoryData?.total || 0)
  const spinHistoryTotalPages = Math.max(
    1,
    Math.ceil(spinHistoryTotal / HISTORY_PAGE_LIMIT),
  )

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 pt-10 pb-24 px-4 text-white">
        <div className="container mx-auto max-w-5xl">
          {/* Nút quay lại luôn nằm ở góc trái trên, tách khỏi phần avatar */}
          <div className="mb-4 flex justify-start">
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-full bg-white/20 border border-white/30 text-white hover:bg-white/30 px-4 py-2 h-auto"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">Quay lại</span>
            </Button>
          </div>

          {/* Avatar và tên người dùng */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-20 w-20 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center text-3xl font-bold shadow-xl backdrop-blur-sm">
              {user.user_profile?.nickname?.charAt(0).toUpperCase() ||
                user.account.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">
                Xin chào, {user.user_profile?.nickname || user.account}!
              </h1>
              <p className="opacity-90 flex items-center justify-center md:justify-start gap-2 mt-1 font-medium">
                <Sparkles size={16} /> Quay thưởng mua hàng, nhận lượt quay và săn quà
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 -mt-16">
        <div className="space-y-6">
          <section className="space-y-6">
            {isLoading ? (
              <Card className="border-none shadow-xl bg-white rounded-2xl">
                <CardContent className="pt-6 p-6 space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ) : campaigns.length === 0 ? (
              <Card className="border-none shadow-xl bg-white rounded-2xl">
                <CardContent className="p-10 text-center">
                  <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Gift className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Chưa có chương trình nào
                  </h3>
                  
                </CardContent>
              </Card>
            ) : (
              campaigns.map((campaign) => (
                <Card
                  key={campaign.promotionId}
                  className="border-none shadow-xl bg-white rounded-2xl"
                >
                  <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 p-4 md:p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-emerald-800 text-base md:text-xl">
                          <Gift className="text-emerald-500 w-5 h-5 md:w-6 md:h-6" />
                          {campaign.promotionName}
                        </CardTitle>
                        <CardDescription className="mt-2 text-slate-600">
                          {format(new Date(campaign.startAt), "dd/MM/yyyy", { locale: vi })} -{" "}
                          {format(new Date(campaign.endAt), "dd/MM/yyyy", { locale: vi })}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-emerald-200 text-emerald-700 bg-white"
                      >
                        {campaign.statusLabel}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6 p-4 md:p-6 space-y-6">
                    {/* Thống kê */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700/70">
                          Đã mua hợp lệ
                        </p>
                        <p className="mt-1 text-2xl font-black text-slate-800">
                          {formatCurrency(campaign.qualifiedAmount)}
                        </p>
                        <p className="text-sm text-slate-500">
                          Mốc 1 lượt: {formatCurrency(campaign.thresholdAmount)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-orange-700/70">
                          Lượt quay
                        </p>
                        <p className="mt-1 text-2xl font-black text-slate-800">
                          {campaign.remainingSpinCount}
                        </p>
                        <p className="text-sm text-slate-500">
                          Đã có {campaign.earnedSpinCount} · Đã dùng {campaign.usedSpinCount}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-sky-700/70">
                          Đã trúng
                        </p>
                        <p className="mt-1 text-2xl font-black text-slate-800">
                          {campaign.winCount} lần
                        </p>
                      </div>
                    </div>

                    {/* Quà nổi bật */}
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Quà nổi bật
                      </p>
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        {campaign.featuredRewards.map((reward) => (
                          <div
                            key={`${campaign.promotionId}-${reward.rewardName}`}
                            className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                          >
                            {reward.rewardImageUrl ? (
                              <img
                                src={reward.rewardImageUrl}
                                alt={reward.rewardName}
                                className="h-28 w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-28 items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 text-3xl">
                                🎁
                              </div>
                            )}
                            <div className="space-y-1 p-3">
                              <p className="font-semibold text-slate-800">{reward.rewardName}</p>
                              <p className="text-xs text-slate-500">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                  maximumFractionDigits: 0,
                                }).format(reward.rewardValue)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Nút Quay ngay → chuyển trang */}
                    <div className="flex justify-end">
                      <Button
                        onClick={() =>
                          router.push(`/rewards/spin/${campaign.promotionId}`)
                        }
                        disabled={campaign.remainingSpinCount <= 0}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Quay ngay
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </section>

          {/* Lịch sử quay */}
          <section>
            <Card className="border-none shadow-xl bg-white rounded-2xl">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <History className="text-orange-500" />
                  Lịch sử quay thưởng
                </CardTitle>
                <CardDescription>
                  Xem toàn bộ lượt quay của bạn, kèm tên chương trình ở từng dòng.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {isSpinHistoryLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : (spinHistoryData?.items || []).length === 0 ? (
                  <p className="text-sm text-slate-500">Bạn chưa có lượt quay nào.</p>
                ) : (
                  <>
                    {spinHistoryData?.items.map((log) => (
                      <div
                        key={`history-all-${log.id}`}
                        className="rounded-xl border border-slate-100 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {log.resultType === "win" ? "Trúng thưởng" : "Chúc may mắn lần sau"}
                            </p>
                            <p className="text-sm text-slate-500 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(log.spunAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                            </p>
                            <p className="mt-1 text-sm text-emerald-700">
                              Chương trình: {log.promotionName}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {log.resultType === "win" ? "Trúng" : "Chưa trúng"}
                          </Badge>
                        </div>
                        {log.rewardName && (
                          <p className="mt-2 text-sm text-orange-600">{log.rewardName}</p>
                        )}
                      </div>
                    ))}
                    {spinHistoryTotalPages > 1 && (
                      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <Button
                          variant="outline"
                          disabled={spinHistoryPage <= 1 || isSpinHistoryLoading}
                          onClick={() =>
                            setSpinHistoryPage((currentPage) =>
                              Math.max(1, currentPage - 1),
                            )
                          }
                        >
                          Trước
                        </Button>
                        <span className="text-sm font-semibold text-slate-600">
                          Trang {spinHistoryPage}/{spinHistoryTotalPages}
                        </span>
                        <Button
                          variant="outline"
                          disabled={
                            spinHistoryPage >= spinHistoryTotalPages ||
                            isSpinHistoryLoading
                          }
                          onClick={() =>
                            setSpinHistoryPage((currentPage) =>
                              Math.min(spinHistoryTotalPages, currentPage + 1),
                            )
                          }
                        >
                          Sau
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
