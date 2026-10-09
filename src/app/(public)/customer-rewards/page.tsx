"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useState } from "react"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  PackageCheck,
  WalletCards,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-user-profile"
import {
  useMyCustomerRewardHistory,
  useMyCustomerRewardTracking,
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
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)

const REWARD_HISTORY_PAGE_LIMIT = 10

export default function CustomerRewardsPage() {
  const router = useRouter()
  const [rewardHistoryPage, setRewardHistoryPage] = useState(1)
  const { data: user } = useCurrentUser()
  const { data: rewardTracking, isLoading: isRewardTrackingLoading } =
    useMyCustomerRewardTracking()
  const { data: rewardHistoryData, isLoading: isRewardHistoryLoading } =
    useMyCustomerRewardHistory(rewardHistoryPage, REWARD_HISTORY_PAGE_LIMIT)

  if (!user) {
    return (
      <div className='container mx-auto px-4 py-8 text-center'>
        <AlertCircle className='mx-auto h-12 w-12 text-yellow-500 mb-4' />
        <h2 className='text-xl font-bold'>Vui lòng đăng nhập</h2>
        <p className='text-muted-foreground mt-2'>
          Bạn cần đăng nhập để xem tích lũy mua hàng.
        </p>
      </div>
    )
  }

  const pendingAmount = Number(rewardTracking?.pending_amount || 0)
  const threshold = Number(rewardTracking?.effective_reward_threshold || 0)
  const progressPercent =
    threshold > 0 ? Math.min(100, (pendingAmount / threshold) * 100) : 0
  const rewardHistoryTotal = Number(rewardHistoryData?.total || 0)
  const rewardHistoryTotalPages = Math.max(
    1,
    Math.ceil(rewardHistoryTotal / REWARD_HISTORY_PAGE_LIMIT),
  )

  return (
    <div className='min-h-screen bg-slate-50/50 pb-20'>
      <div className='bg-gradient-to-r from-emerald-600 to-teal-500 pt-10 pb-24 px-4 text-white'>
        <div className='container mx-auto max-w-5xl'>
          <div className='mb-4 flex justify-start'>
            <Button
              variant='ghost'
              className='flex items-center gap-2 rounded-full bg-white/20 border border-white/30 text-white hover:bg-white/30 px-4 py-2 h-auto'
              onClick={() => router.push("/")}
            >
              <ArrowLeft className='h-4 w-4 shrink-0' />
              <span className='text-sm font-medium'>Quay lại</span>
            </Button>
          </div>

          <div className='flex flex-col md:flex-row items-center gap-6'>
            <div className='h-20 w-20 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center text-3xl font-bold shadow-xl backdrop-blur-sm'>
              {user.user_profile?.nickname?.charAt(0).toUpperCase() ||
                user.account.charAt(0).toUpperCase()}
            </div>
            <div className='text-center md:text-left'>
              <h1 className='text-2xl md:text-3xl font-bold'>
                Tích lũy mua hàng
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto max-w-5xl px-4 -mt-16 space-y-6'>
        <Card className='border-none shadow-xl bg-white rounded-2xl'>
          <CardHeader className='bg-emerald-50/50 border-b border-emerald-100'>
            <CardTitle className='text-emerald-800 flex items-center gap-2'>
              <WalletCards className='text-emerald-500' />
              Tiền mua hàng của tôi
            </CardTitle>
          </CardHeader>
          <CardContent className='p-6 space-y-6'>
            {isRewardTrackingLoading ? (
              <>
                <div className='grid gap-4 md:grid-cols-3'>
                  <Skeleton className='h-28 w-full rounded-2xl' />
                  <Skeleton className='h-28 w-full rounded-2xl' />
                  <Skeleton className='h-28 w-full rounded-2xl' />
                </div>
                <Skeleton className='h-4 w-full' />
              </>
            ) : (
              <>
                <div className='grid gap-4 md:grid-cols-3'>
                  <div className='rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4'>
                    <p className='text-xs font-bold uppercase tracking-wider text-emerald-700/70'>
                      Tích lũy hiện tại
                    </p>
                    <p className='mt-1 text-2xl font-black text-slate-800'>
                      {formatCurrency(pendingAmount)}
                    </p>
                  </div>
                  {/* <div className='rounded-2xl border border-sky-100 bg-sky-50/50 p-4'>
                    <p className='text-xs font-bold uppercase tracking-wider text-sky-700/70'>
                      Tổng từ trước đến nay
                    </p>
                    <p className='mt-1 text-2xl font-black text-slate-800'>
                      {formatCurrency(
                        Number(rewardTracking?.total_accumulated || 0),
                      )}
                    </p>
                  </div> */}
                  <div className='rounded-2xl border border-orange-100 bg-orange-50/50 p-4'>
                    <p className='text-xs font-bold uppercase tracking-wider text-orange-700/70'>
                      Mốc nhận quà
                    </p>
                    <p className='mt-1 text-2xl font-black text-slate-800'>
                      {formatCurrency(threshold)}
                    </p>
                  </div>
                  <div className='rounded-2xl border border-violet-100 bg-violet-50/50 p-4'>
                    <p className='text-xs font-bold uppercase tracking-wider text-violet-700/70'>
                      Còn thiếu
                    </p>
                    <p className='mt-1 text-2xl font-black text-slate-800'>
                      {formatCurrency(
                        Number(rewardTracking?.shortage_to_next || 0),
                      )}
                    </p>
                  </div>
                </div>

                <div className='rounded-2xl border border-slate-100 p-4'>
                  <div className='mb-2 flex items-center justify-between text-sm font-semibold text-slate-700'>
                    <span>Tiến độ đến mốc quà tiếp theo</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <Progress value={progressPercent} className='h-3' />
                  <p className='mt-2 text-xs text-slate-500'>
                    Đã nhận quà {Number(rewardTracking?.reward_count || 0)} lần.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className='border-none shadow-xl bg-white rounded-2xl'>
          <CardHeader className='bg-slate-50 border-b border-slate-100'>
            <CardTitle className='text-slate-800 flex items-center gap-2'>
              <PackageCheck className='text-orange-500' />
              Lịch sử nhận quà của tôi
            </CardTitle>
            <CardDescription>
              Các phần quà tích lũy đã ghi nhận cho chính khách hàng đang đăng
              nhập.
            </CardDescription>
          </CardHeader>
          <CardContent className='p-6 space-y-3'>
            {isRewardHistoryLoading ? (
              <div className='space-y-3'>
                <Skeleton className='h-20 w-full' />
                <Skeleton className='h-20 w-full' />
                <Skeleton className='h-20 w-full' />
              </div>
            ) : (rewardHistoryData?.items || []).length === 0 ? (
              <p className='text-sm text-slate-500'>
                Bạn chưa có lịch sử nhận quà.
              </p>
            ) : (
              <>
                {rewardHistoryData?.items.map((item) => (
                  <div
                    key={`customer-reward-${item.id}`}
                    className='rounded-xl border border-slate-100 p-4'
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <p className='font-semibold text-slate-800'>
                          {item.gift_description ||
                            item.gift_product_name ||
                            "Quà tích lũy"}
                        </p>
                        <p className='text-sm text-slate-500 flex items-center gap-2'>
                          <Calendar className='h-4 w-4' />
                          {format(
                            new Date(item.reward_date),
                            "dd/MM/yyyy HH:mm",
                            {
                              locale: vi,
                            },
                          )}
                        </p>
                        <p className='mt-1 text-sm text-emerald-700'>
                          Số tiền ghi nhận:{" "}
                          {formatCurrency(Number(item.accumulated_amount || 0))}
                        </p>
                        {item.season_names && item.season_names.length > 0 && (
                          <p className='mt-1 text-xs text-slate-500'>
                            Mùa vụ: {item.season_names.join(", ")}
                          </p>
                        )}
                      </div>
                      <Badge variant='outline'>
                        {item.gift_status === "delivered"
                          ? "Đã trao"
                          : item.gift_status === "cancelled"
                            ? "Đã hủy"
                            : "Chờ trao"}
                      </Badge>
                    </div>
                  </div>
                ))}
                {rewardHistoryTotalPages > 1 && (
                  <div className='flex items-center justify-between gap-3 border-t border-slate-100 pt-4'>
                    <Button
                      variant='outline'
                      disabled={rewardHistoryPage <= 1 || isRewardHistoryLoading}
                      onClick={() =>
                        setRewardHistoryPage((currentPage) =>
                          Math.max(1, currentPage - 1),
                        )
                      }
                    >
                      Trước
                    </Button>
                    <span className='text-sm font-semibold text-slate-600'>
                      Trang {rewardHistoryPage}/{rewardHistoryTotalPages}
                    </span>
                    <Button
                      variant='outline'
                      disabled={
                        rewardHistoryPage >= rewardHistoryTotalPages ||
                        isRewardHistoryLoading
                      }
                      onClick={() =>
                        setRewardHistoryPage((currentPage) =>
                          Math.min(rewardHistoryTotalPages, currentPage + 1),
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
      </div>
    </div>
  )
}
