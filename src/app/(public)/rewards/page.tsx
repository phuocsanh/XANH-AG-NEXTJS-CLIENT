"use client"

import { useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Gift,
  History,
  Sparkles,
  Trophy,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-user-profile"
import {
  useMyPromotionProgress,
  useMyPromotionSpinLogs,
  useSpinPromotionMutation,
} from "@/hooks/use-rewards"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)

export default function RewardsPage() {
  const router = useRouter()
  const { data: user } = useCurrentUser()
  const { data: progressData, isLoading } = useMyPromotionProgress()
  const spinMutation = useSpinPromotionMutation()

  const [selectedPromotionId, setSelectedPromotionId] = useState<number | null>(null)
  const [isSpinDialogOpen, setIsSpinDialogOpen] = useState(false)

  const { data: spinLogsData, isLoading: isSpinLogsLoading } =
    useMyPromotionSpinLogs(selectedPromotionId)

  const selectedCampaign =
    progressData?.items.find((item) => item.promotionId === selectedPromotionId) || null

  const handleOpenSpinDialog = (promotionId: number) => {
    setSelectedPromotionId(promotionId)
    setIsSpinDialogOpen(true)
  }

  const handleSpin = async () => {
    if (!selectedPromotionId) return
    await spinMutation.mutateAsync(selectedPromotionId)
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold">Vui lòng đăng nhập</h2>
        <p className="text-muted-foreground mt-2">
          Bạn cần đăng nhập để xem tích lũy và quay thưởng.
        </p>
      </div>
    )
  }

  const campaigns = progressData?.items || []

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 pt-10 pb-24 px-4 text-white">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-white/20 border-white/30 text-white hover:bg-white/30 shrink-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-20 w-20 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center text-3xl font-bold shadow-xl backdrop-blur-sm">
              {user.user_profile?.nickname?.charAt(0).toUpperCase() || user.account.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">
                Xin chào, {user.user_profile?.nickname || user.account}!
              </h1>
              <p className="opacity-90 flex items-center justify-center md:justify-start gap-2 mt-1 font-medium">
                <Sparkles size={16} /> Tích lũy mua hàng, nhận lượt quay và săn quà
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 -mt-16">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur shadow-sm border border-slate-200 p-1 h-12 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-bold">
              <Sparkles size={16} className="mr-2" /> Campaign của tôi
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-bold">
              <History size={16} className="mr-2" /> Lịch sử quay
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
                    Bạn chưa tham gia campaign nào
                  </h3>
                  <p className="text-slate-500 mt-2">
                    Khi có mua hàng thuộc campaign, tiến độ và lượt quay sẽ hiển thị tại đây.
                  </p>
                </CardContent>
              </Card>
            ) : (
              campaigns.map((campaign) => {
                const progress =
                  campaign.thresholdAmount > 0
                    ? Math.min(
                        Math.round((campaign.qualifiedAmount / campaign.thresholdAmount) * 100),
                        100,
                      )
                    : 0

                return (
                  <Card key={campaign.promotionId} className="border-none shadow-xl bg-white rounded-2xl">
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
                        <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-white">
                          {campaign.statusLabel}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 p-4 md:p-6 space-y-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700/70">
                            Đã tích lũy
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
                          <p className="text-sm text-slate-500">
                            Tỉ lệ trúng thực tế tự tăng hoặc giảm theo quota tháng còn lại
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400">
                          <span>{formatCurrency(campaign.qualifiedAmount)}</span>
                          <span>Mục tiêu: {formatCurrency(campaign.thresholdAmount)}</span>
                        </div>
                        <Progress
                          value={progress}
                          className="h-4 bg-slate-100 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-emerald-600"
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-100 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Quà nổi bật
                        </p>
                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                          {campaign.featuredRewards.map((reward) => (
                            <div key={`${campaign.promotionId}-${reward.rewardName}`} className="rounded-xl bg-slate-50 p-3">
                              <p className="font-semibold text-slate-800">{reward.rewardName}</p>
                              <p className="text-sm text-orange-500">{formatCurrency(reward.rewardValue)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleOpenSpinDialog(campaign.promotionId)}
                          disabled={campaign.remainingSpinCount <= 0}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          Quay ngay
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-none shadow-xl bg-white rounded-2xl">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <History className="text-orange-500" />
                  Lịch sử quay gần nhất
                </CardTitle>
                <CardDescription>Chọn một campaign để xem chi tiết các lượt quay của bạn.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {campaigns.map((campaign) => (
                  <Button
                    key={`history-${campaign.promotionId}`}
                    variant="outline"
                    className="mr-2 mb-2"
                    onClick={() => handleOpenSpinDialog(campaign.promotionId)}
                  >
                    {campaign.promotionName}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isSpinDialogOpen} onOpenChange={setIsSpinDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCampaign?.promotionName || "Quay thưởng"}</DialogTitle>
            <DialogDescription>
              {selectedCampaign
                ? `Bạn còn ${selectedCampaign.remainingSpinCount} lượt quay.`
                : "Theo dõi kết quả quay và lịch sử của bạn."}
            </DialogDescription>
          </DialogHeader>

          {selectedCampaign && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">Lượt còn lại</p>
                  <p className="mt-1 text-2xl font-black text-slate-800">{selectedCampaign.remainingSpinCount}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">Đã trúng</p>
                  <p className="mt-1 text-2xl font-black text-slate-800">{selectedCampaign.winCount}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">Mốc tích lũy</p>
                  <p className="mt-1 text-lg font-black text-slate-800">{formatCurrency(selectedCampaign.thresholdAmount)}</p>
                </div>
              </div>

              <p className="text-sm text-slate-500">
                Hệ thống chỉ quay trong quota đang mở của tháng hiện tại. Nếu quota tháng còn nhiều ở gần cuối tháng,
                tỉ lệ trúng thực tế sẽ được tăng lên tự động.
              </p>

              <div className="flex justify-center">
                <Button
                  onClick={handleSpin}
                  disabled={selectedCampaign.remainingSpinCount <= 0 || spinMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {spinMutation.isPending ? "Đang quay..." : "Quay ngay"}
                </Button>
              </div>

              {spinMutation.data && selectedCampaign.promotionId === selectedPromotionId && (
                <Card className="border border-emerald-100 bg-emerald-50/50">
                  <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                      <Trophy className="mt-0.5 h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="font-semibold text-slate-800">{spinMutation.data.message}</p>
                          <p className="text-sm text-slate-500 mt-1">
                            Tỉ lệ áp dụng cho lượt này: {spinMutation.data.appliedRate}%
                          </p>
                          {spinMutation.data.reward && (
                          <p className="text-sm text-orange-600">
                            {spinMutation.data.reward.rewardName} · {formatCurrency(spinMutation.data.reward.rewardValue)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">Lịch sử quay gần nhất</h3>
                {isSpinLogsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : (spinLogsData?.items || []).length === 0 ? (
                  <p className="text-sm text-slate-500">Bạn chưa có lượt quay nào trong campaign này.</p>
                ) : (
                  <div className="space-y-3">
                    {spinLogsData?.items.map((log) => (
                      <div key={log.id} className="rounded-xl border border-slate-100 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {log.resultType === "win" ? "Trúng thưởng" : "Không trúng"}
                            </p>
                            <p className="text-sm text-slate-500 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(log.spunAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {log.resultType === "win" ? "Win" : "Lose"}
                          </Badge>
                        </div>
                        {log.rewardName && (
                          <p className="mt-2 text-sm text-orange-600">
                            {log.rewardName} · {formatCurrency(log.rewardValue)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
