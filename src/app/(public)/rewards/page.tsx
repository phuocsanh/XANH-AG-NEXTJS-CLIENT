"use client"

import { useMyRewardTracking, useMyRewardHistory } from "@/hooks/use-rewards"
import { useCurrentUser } from "@/hooks/use-user-profile"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Gift, History, Award, CheckCircle2, AlertCircle, Calendar, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function RewardsPage() {
  const [page, setPage] = useState(1)
  const { data: user } = useCurrentUser()
  const { data: tracking, isLoading: isTrackingLoading } = useMyRewardTracking()
  const { data: history, isLoading: isHistoryLoading } = useMyRewardHistory(page)

  const threshold = tracking?.reward_threshold || 60000000 // Fallback 60 Triệu nếu chưa load kịp

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  // Nếu chưa login hoặc đang load user
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold">Vui lòng đăng nhập</h2>
        <p className="text-muted-foreground mt-2">Bạn cần đăng nhập để xem thông tin tích lũy và quà tặng.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Profile Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 pt-10 pb-24 px-4 text-white">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="h-20 w-20 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center text-3xl font-bold shadow-xl backdrop-blur-sm">
              {user.user_profile?.nickname?.charAt(0).toUpperCase() || user.account.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">Xin chào, {user.user_profile?.nickname || user.account}!</h1>
              <p className="opacity-90 flex items-center justify-center md:justify-start gap-2 mt-1 font-medium">
                <CheckCircle2 size={16} /> Thành viên thân thiết Xanh AG
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 -mt-16">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur shadow-sm border border-slate-200 p-1 h-12 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all font-bold">
              <Star size={16} className="mr-2" /> Tích lũy hiện tại
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all font-bold">
              <History size={16} className="mr-2" /> Lịch sử quà tặng
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 outline-none">
            {/* Main Progress Card */}
            <Card className="border-none shadow-xl border-slate-100 overflow-hidden bg-white rounded-2xl">
              <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 p-4 md:p-6">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-emerald-800 text-base md:text-xl">
                    <Gift className="text-emerald-500 w-5 h-5 md:w-6 md:h-6" />
                    Tiến trình nhận quà
                  </CardTitle>
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-white px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs">
                    Mốc {Math.round(threshold / 1000000)} triệu
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 md:pt-8 p-4 md:p-6">
                {isTrackingLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : (
                  <div className="space-y-8 md:space-y-10">
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 md:gap-0">
                        <div className="space-y-1">
                          <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-tight md:tracking-tighter">Tích lũy đến hiện tại</p>
                          <p className="text-2xl md:text-4xl font-black text-emerald-600 tabular-nums">
                            {formatCurrency(Number(tracking?.pending_amount || 0))}
                          </p>
                        </div>
                        <div className="md:text-right space-y-1 p-3 rounded-xl bg-orange-50 border border-orange-100 md:bg-transparent md:border-none">
                          <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-tight md:tracking-tighter">Còn thiếu đến quà tặng kế</p>
                          <p className="text-lg md:text-xl font-bold text-orange-500 tabular-nums">
                            {formatCurrency(tracking?.shortage_to_next || 0)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="relative pt-2">
                        <Progress 
                          value={Math.min(
                            Math.round((Number(tracking?.pending_amount || 0) / threshold) * 100),
                            100
                          )} 
                          className="h-4 md:h-5 bg-slate-100 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-emerald-600"
                        />
                        <div className="flex justify-between mt-3 text-[10px] md:text-xs font-bold text-slate-400 uppercase">
                          <span>0 đ</span>
                          <span className="text-emerald-600">Mục tiêu: {Math.round(threshold / 1000000)} Triệu đ</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-4 pt-6 border-t border-slate-100">
                      <div className="text-left md:text-center p-3 md:p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 transition-colors hover:bg-emerald-50">
                        <p className="text-[10px] text-emerald-700/60 mb-1 uppercase tracking-wider font-bold">Tổng tích lũy</p>
                        <p className="text-sm md:text-xl font-black text-slate-700">{formatCurrency(Number(tracking?.total_accumulated || 0))}</p>
                      </div>
                      <div className="text-left md:text-center p-3 md:p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50 transition-colors hover:bg-amber-50">
                        <p className="text-[10px] text-amber-700/60 mb-1 uppercase tracking-wider font-bold">Quà đã nhận</p>
                        <p className="text-sm md:text-xl font-black text-amber-900">{tracking?.reward_count || 0} lần</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-emerald-600 rounded-2xl p-6 border border-emerald-700 shadow-xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-white/10 h-24 w-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex gap-5 relative z-10">
                <div className="bg-white/20 h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center text-white backdrop-blur-md border border-white/20">
                  <Award size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xl">Chương trình tri ân nhà nông</h3>
                  <p className="text-emerald-50 mt-2 leading-relaxed font-light">
                    Cám ơn chú đã tin tưởng đồng hành cùng Xanh AG. Khi chú đạt mốc tích lũy <span className="font-bold text-yellow-300">60 Triệu đồng</span>, 
                    hệ thống sẽ gửi tặng chú một phần quà tri ân thay lời cảm ơn chân thành.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="outline-none">
            <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <Gift className="text-orange-500" />
                  Lịch sử tri ân
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">
                  Danh sách những món quà chú đã nhận từ cửa hàng
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isHistoryLoading ? (
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                  </div>
                ) : history?.items?.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                       <AlertCircle className="h-10 w-10 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">Chú chưa nhận món quà nào. Hãy tiếp tục ủng hộ cửa hàng chú nhé!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {history?.items?.map((item) => (
                      <div 
                        key={item.id} 
                        className="p-4 md:p-8 hover:bg-slate-50/80 transition-all group border-l-4 border-transparent hover:border-emerald-500"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex gap-4 md:gap-5 w-full sm:w-auto">
                            <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-110 transition-transform duration-300">
                              <Gift className="w-6 h-6 md:w-7 md:h-7" />
                            </div>
                            <div className="space-y-2 flex-grow">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-black text-slate-800 text-lg md:text-xl leading-tight">
                                  {item.gift_description}
                                </h4>
                                <Badge className="sm:hidden bg-emerald-600 shadow-sm uppercase tracking-widest text-[8px] px-2 py-0.5">Thành công</Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm">
                                <span className="flex items-center gap-1.5 font-bold text-slate-400">
                                  <Calendar size={14} className="md:w-4 md:h-4" />
                                  Ngày {format(new Date(item.reward_date), 'dd/MM/yyyy', { locale: vi })}
                                </span>
                                {item.season_names?.length > 0 && (
                                  <div className="flex items-center gap-2">
                                     <span className="text-slate-400 font-bold tracking-tighter uppercase text-[9px] md:text-[10px]">Từ vụ:</span>
                                     <div className="flex flex-wrap gap-1">
                                       {item.season_names.map((name, i) => (
                                         <Badge key={i} className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 shadow-none font-bold text-[10px]">
                                           {name}
                                         </Badge>
                                       ))}
                                     </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge className="hidden sm:flex bg-emerald-600 shadow-lg shadow-emerald-200 uppercase tracking-widest px-3 py-1">Thành công</Badge>
                        </div>
                      </div>
                    ))}
                    
                    {/* Phân trang - Sử dụng setPage để fix lỗi lint */}
                    {history && history.total > 10 && (
                      <div className="p-4 flex justify-between items-center border-t border-slate-100 bg-slate-50/30">
                        <button 
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-30 transition-opacity"
                        >
                          Trang trước
                        </button>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Trang {page} / {Math.ceil(history.total / 10)}
                        </span>
                        <button 
                          onClick={() => setPage(p => p + 1)}
                          disabled={page * 10 >= history.total}
                          className="px-4 py-2 text-sm font-bold text-emerald-600 disabled:opacity-30 transition-opacity"
                        >
                          Trang sau
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Support Button for farmers */}
      <div className="fixed bottom-6 right-6 z-40 sm:hidden">
        <div className="h-14 w-14 rounded-full bg-orange-500 shadow-xl flex items-center justify-center text-white animate-pulse">
           <Star fill="currentColor" size={28} />
        </div>
      </div>
    </div>
  )
}
