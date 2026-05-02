"use client"

/**
 * Trang vòng quay may mắn riêng biệt.
 * Tách ra khỏi Modal để tránh lỗi animation CSS bị block bởi overflow/stacking context của Dialog.
 */

import { useEffect, useMemo, useRef, useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { ArrowLeft, Calendar, Sparkles, X } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import Script from "next/script"
import {
  type PromotionFeaturedReward,
  useMyPromotionProgress,
  useMyPromotionSpinLogs,
  useSpinPromotionMutation,
} from "@/hooks/use-rewards"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

/* ─────────────────────────────────────────────
   Hằng số
───────────────────────────────────────────── */
const MAX_LOSE_SLOTS = 2
const SLOT_SCALE_RANGE = 2
const WHEEL_SPIN_DURATION_MS = 3000
const WHEEL_LIGHT_COUNT = 24
const WHEEL_POINTER_ANGLE = 270
const WHEEL_COLORS = [
  "#fff8d9",
  "#ffd55a",
  "#fff0c1",
  "#ffc93c",
  "#fff5d8",
  "#f7be31",
]

/* ─────────────────────────────────────────────
   Kiểu dữ liệu
───────────────────────────────────────────── */
type SpinWheelSlot = {
  key: string
  type: "reward" | "lose"
  label: string
  value?: number
  quantity?: number
}

const LottiePlayer = ({
  src,
  className,
}: {
  src: string
  className?: string
}) => (
  <div
    className={className}
    dangerouslySetInnerHTML={{
      __html: `<lottie-player src="${src}" background="transparent" speed="1" style="width:100%;height:100%" loop autoplay></lottie-player>`,
    }}
  />
)

/* ─────────────────────────────────────────────
   Hàm xây dựng danh sách ô vòng quay
───────────────────────────────────────────── */
const buildSpinWheelSlots = (featuredRewards: PromotionFeaturedReward[]): SpinWheelSlot[] => {
  if (featuredRewards.length === 0) {
    return Array.from({ length: MAX_LOSE_SLOTS }, (_, i) => ({
      key: `lose-${i}`,
      type: "lose" as const,
      label: "Chúc may mắn lần sau",
    }))
  }

  const quantities = featuredRewards.map((r) => Math.max(1, r.totalQuantity || 1))
  const minQ = Math.min(...quantities)
  const maxQ = Math.max(...quantities)

  const rewardSlots = featuredRewards.flatMap((reward, ri) => {
    const q = Math.max(1, reward.totalQuantity || 1)
    const slotCount =
      maxQ === minQ ? 1 : 1 + Math.round(((q - minQ) / (maxQ - minQ)) * SLOT_SCALE_RANGE)

    return Array.from({ length: slotCount }, (_, si) => ({
      key: `reward-${reward.rewardName}-${ri}-${si}`,
      type: "reward" as const,
      label: reward.rewardName,
      value: reward.rewardValue,
      quantity: q,
    }))
  })

  const loseCount = rewardSlots.length >= 4 ? MAX_LOSE_SLOTS : 1
  const loseSlots = Array.from({ length: loseCount }, (_, i) => ({
    key: `lose-${i}`,
    type: "lose" as const,
    label: "Chúc may mắn lần sau",
  }))

  const total = rewardSlots.length + loseSlots.length
  const losePositions =
    loseSlots.length === 1
      ? [Math.floor(total / 2)]
      : [Math.floor(total / 4), Math.floor((total * 3) / 4)]

  const ordered: SpinWheelSlot[] = []
  let ri = 0
  let li = 0

  for (let pos = 0; pos < total; pos++) {
    if (losePositions.includes(pos) && li < loseSlots.length) {
      ordered.push(loseSlots[li]!)
      li++
      continue
    }
    if (ri < rewardSlots.length) {
      ordered.push(rewardSlots[ri]!)
      ri++
    }
  }
  while (ri < rewardSlots.length) {
    ordered.push(rewardSlots[ri]!)
    ri++
  }

  return ordered
}

/* ─────────────────────────────────────────────
   Hàm tính toán SVG
───────────────────────────────────────────── */
const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

const describeArcSlice = (cx: number, cy: number, r: number, start: number, end: number) => {
  const s = polarToCartesian(cx, cy, r, end)
  const e = polarToCartesian(cx, cy, r, start)
  const large = end - start <= 180 ? "0" : "1"
  return [`M ${cx} ${cy}`, `L ${s.x} ${s.y}`, `A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`, "Z"].join(" ")
}

const splitLabel = (label: string) => {
  const words = label.trim().split(/\s+/)
  if (words.length <= 2) return [label]
  if (words.length <= 4) {
    const mid = Math.ceil(words.length / 2)
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")]
  }
  const f = Math.ceil(words.length / 3)
  const s = Math.ceil((words.length - f) / 2)
  return [
    words.slice(0, f).join(" "),
    words.slice(f, f + s).join(" "),
    words.slice(f + s).join(" "),
  ]
}

/* ─────────────────────────────────────────────
   CSS Animations
───────────────────────────────────────────── */
const WHEEL_ANIMATIONS = `
  @keyframes pulse-green-border {
    0% { stroke: #10b981; stroke-width: 6; filter: drop-shadow(0 0 2px #10b981); }
    50% { stroke: #34d399; stroke-width: 3; filter: drop-shadow(0 0 8px #34d399); }
    100% { stroke: #10b981; stroke-width: 6; filter: drop-shadow(0 0 2px #10b981); }
  }
`


/* ─────────────────────────────────────────────
   Component trang vòng quay
───────────────────────────────────────────── */
export default function SpinWheelPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()

  // Lấy promotionId từ URL params
  const promotionId = Number(params.promotionId)

  const { data: progressData, isLoading } = useMyPromotionProgress()
  const { data: spinLogsData, isLoading: isSpinLogsLoading } = useMyPromotionSpinLogs(promotionId)
  const spinMutation = useSpinPromotionMutation()

  // State vòng quay
  const [rotation, setRotation] = useState(0)          // góc xoay hiện tại (deg)
  const [activeIndex, setActiveIndex] = useState(-1)    // ô đang được chọn sau khi dừng
  const [isSpinning, setIsSpinning] = useState(false)  // đang quay hay không
  const [displayResult, setDisplayResult] = useState<null | {
    message: string
    appliedRate: number
    resultType: "win" | "lose"
    reward?: { rewardName: string; rewardValue: number } | null
  }>(null)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  // Ref timer tự động đóng popup sau 10 giây (chạy ngầm, không hiển thị)
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ref cho requestAnimationFrame
  const rafRef = useRef<number | null>(null)
  const idleSpinRef = useRef<number | null>(null)
  const rotationRef = useRef(0) // lưu rotation hiện tại để tránh stale closure trong rAF

  // Dữ liệu campaign đang chọn
  const campaign = progressData?.items.find((c) => c.promotionId === promotionId) ?? null

  // Danh sách ô vòng quay
  const wheelSlots = useMemo(
    () => buildSpinWheelSlots(campaign?.featuredRewards || []),
    [campaign?.featuredRewards],
  )

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (idleSpinRef.current) cancelAnimationFrame(idleSpinRef.current)
      if (autoCloseTimerRef.current) clearInterval(autoCloseTimerRef.current)
    }
  }, [])

  // Tự đóng popup sau 10 giây (chạy ngầm)
  useEffect(() => {
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current)
    if (isResultModalOpen) {
      autoCloseTimerRef.current = setTimeout(() => {
        setIsResultModalOpen(false)
      }, 10000)
    }
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current)
    }
  }, [isResultModalOpen])

  const startIdleSpin = () => {
    if (idleSpinRef.current) cancelAnimationFrame(idleSpinRef.current)

    let lastTime = performance.now()
    const tick = (now: number) => {
      const deltaSeconds = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      const nextRotation = rotationRef.current - 720 * deltaSeconds
      rotationRef.current = nextRotation
      setRotation(nextRotation)
      idleSpinRef.current = requestAnimationFrame(tick)
    }

    idleSpinRef.current = requestAnimationFrame(tick)
  }

  const stopIdleSpin = () => {
    if (idleSpinRef.current) {
      cancelAnimationFrame(idleSpinRef.current)
      idleSpinRef.current = null
    }
  }

  /**
   * Giảm tốc và dừng vào đúng ô kết quả.
   */
  const animateWheel = (targetIndex: number): Promise<void> =>
    new Promise((resolve) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      stopIdleSpin()

      const sliceAngle = 360 / Math.max(wheelSlots.length, 1)

      const targetCenter = targetIndex * sliceAngle + sliceAngle / 2

      const currentNorm = ((rotationRef.current % 360) + 360) % 360
      const targetRotationNorm = (WHEEL_POINTER_ANGLE - targetCenter + 360) % 360
      const delta = (currentNorm - targetRotationNorm + 360) % 360

      const startRot = rotationRef.current
      const endRot = startRot - (360 * 7 + delta)
      const distance = endRot - startRot
      const startTime = performance.now()

      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

      const tick = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / WHEEL_SPIN_DURATION_MS, 1)
        const eased = easeOut(progress)
        const current = startRot + distance * eased

        rotationRef.current = current
        setRotation(current)

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick)
          return
        }

        rafRef.current = null
        rotationRef.current = endRot
        setRotation(endRot)
        setActiveIndex(targetIndex)
        setIsSpinning(false)
        resolve()
      }

      setActiveIndex(-1)
      rafRef.current = requestAnimationFrame(tick)
    })

  /**
   * Tìm index ô cần dừng dựa trên kết quả từ server.
   */
  const getTargetIndex = (
    slots: SpinWheelSlot[],
    result: any,
  ): number => {
    if (!result) return 0

    if (result.resultType === "win" && result.reward) {
      const idx = slots.findIndex(
        (s) => s.type === "reward" && s.label === result.reward?.rewardName,
      )
      if (idx >= 0) return idx
    }
    const loseIndexes = slots
      .map((s, i) => (s.type === "lose" ? i : -1))
      .filter((i) => i >= 0)
    if (loseIndexes.length === 0) return 0
    return loseIndexes[Math.floor(Math.random() * loseIndexes.length)] ?? 0
  }

  /** Xử lý nhấn nút QUAY */
  /** Xử lý nhấn nút QUAY */
  const handleSpin = async () => {
    if (!promotionId || isSpinning || spinMutation.isPending) return
    setDisplayResult(null)

    setIsSpinning(true)
    setActiveIndex(-1)
    startIdleSpin()

    try {
      const result = await spinMutation.mutateAsync(promotionId)

      if (!result) {
        stopIdleSpin()
        setIsSpinning(false)
        return
      }

      const targetIndex = getTargetIndex(wheelSlots, result)

      await animateWheel(targetIndex)
      
      // Đợi 1.5 giây để người dùng thấy hiệu ứng nhấp nháy xanh trước khi hiện popup
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setDisplayResult({
        message: result.message || "Chúc mừng!",
        appliedRate: result.appliedRate || 0,
        resultType: result.resultType,
        reward: result.reward,
      })
      setIsResultModalOpen(true)

      // Invalidate cache
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-promotion-progress"] }),
        queryClient.invalidateQueries({ queryKey: ["my-promotion-spin-logs", promotionId] }),
        queryClient.invalidateQueries({ queryKey: ["my-promotion-spin-history"] }),
      ])
    } catch (error) {
      console.error("Spin failed:", error)
      stopIdleSpin()
      setIsSpinning(false)
    }
  }

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-sm px-6">
          <Skeleton className="h-80 w-80 rounded-full mx-auto" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  /* ─── Campaign không tồn tại ─── */
  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <p className="text-slate-500">Không tìm thấy chương trình quay thưởng.</p>
        <Button onClick={() => router.push("/")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
      </div>
    )
  }

  const canSpin = campaign.remainingSpinCount > 0 && !isSpinning && !spinMutation.isPending

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 pb-20">
      <Script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js" strategy="afterInteractive" />
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-4 pb-6 pt-10 text-white">
        <div className="mx-auto flex max-w-lg items-center gap-4">
          <Button
            variant="ghost"
            className="flex items-center gap-2 shrink-0 rounded-full border border-white/30 bg-white/20 text-white hover:bg-white/30 px-4 py-2 h-auto"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">Quay lại</span>
          </Button>
          <div>
            <h1 className="text-xl font-bold leading-tight">{campaign.promotionName}</h1>
            <p className="mt-0.5 text-sm text-white/80">
              Còn{" "}
              <span className="font-bold text-yellow-300">{campaign.remainingSpinCount}</span>{" "}
              lượt quay
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 pt-6 space-y-6">
        {/* Vòng quay */}
        <div className="rounded-[28px] border border-emerald-100 bg-white/80 p-4 shadow-xl backdrop-blur">
          <div className="mb-4 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700">
            <Sparkles className="h-4 w-4" />
            Vòng quay may mắn
          </div>

          {/* Wrapper vòng quay */}
          <div className="relative mx-auto w-full max-w-[390px]">
            {/* Mũi tên chỉ */}
            <div className="absolute left-[-18px] top-1/2 z-30 h-0 w-0 -translate-y-1/2 border-b-[18px] border-l-[42px] border-t-[18px] border-b-transparent border-l-red-600 border-t-transparent drop-shadow-[0_8px_18px_rgba(220,38,38,0.45)]" />
            <div className="absolute left-[12px] top-1/2 z-20 h-7 w-7 -translate-y-1/2 rounded-full border-4 border-yellow-200 bg-gradient-to-br from-red-500 to-rose-600 shadow-lg" />

            {/* Viền ngoài vàng */}
            <div className="relative aspect-square rounded-full border-[7px] border-yellow-500 bg-gradient-to-br from-[#f9c72f] via-[#d89d10] to-[#f0c23a] shadow-[0_22px_55px_rgba(180,83,9,0.3)]">
              {/* Đèn trang trí */}
              {Array.from({ length: WHEEL_LIGHT_COUNT }).map((_, i) => {
                const angle = (360 / WHEEL_LIGHT_COUNT) * i - 90
                const rad = (angle * Math.PI) / 180
                const left = 50 + Math.cos(rad) * 47.5
                const top = 50 + Math.sin(rad) * 47.5
                const bright = i % 2 === 0

                return (
                  <div
                    key={`light-${i}`}
                    className={`absolute z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-200 ${
                      bright
                        ? "bg-gradient-to-br from-white via-yellow-50 to-amber-300 shadow-[0_0_14px_rgba(253,224,71,0.95)]"
                        : "bg-gradient-to-br from-yellow-100 to-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.55)]"
                    }`}
                    style={{ left: `${left}%`, top: `${top}%` }}
                  />
                )
              })}

              {/* Viền trong */}
              <div className="absolute inset-1 rounded-full border-[4px] border-yellow-100/70 shadow-inner" />

              {/* Đĩa quay — dùng CSS transform trực tiếp qua state, KHÔNG dùng WAAPI */}
              <div
                className="absolute inset-[6px] rounded-full"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <style>{WHEEL_ANIMATIONS}</style>
                <svg viewBox="0 0 400 400" className="h-full w-full">
                  {(() => {
                    const sliceAngle = 360 / Math.max(wheelSlots.length, 1)

                    return wheelSlots.map((slot, idx) => {
                      const startAngle = idx * sliceAngle
                      const endAngle = startAngle + sliceAngle
                      const midAngle = startAngle + sliceAngle / 2
                      const isActive = activeIndex === idx
                    const fill =
                      slot.type === "lose"
                        ? idx % 2 === 0
                          ? "#f8fafc"
                          : "#eef2ff"
                        : WHEEL_COLORS[idx % WHEEL_COLORS.length]
                    const textPt = polarToCartesian(200, 200, 122, midAngle)
                    const textRot = midAngle + 90
                    const lines = splitLabel(slot.label)

                    return (
                      <g key={slot.key}>
                        <path
                          d={describeArcSlice(200, 200, 184, startAngle, endAngle)}
                          fill={fill}
                          stroke={isActive ? "#10b981" : "#ffffff"}
                          strokeWidth={isActive ? 5 : 1.25}
                          style={
                            isActive
                              ? { animation: "pulse-green-border 0.4s infinite ease-in-out" }
                              : {}
                          }
                          className="transition-all duration-200"
                        />
                        <g transform={`translate(${textPt.x} ${textPt.y}) rotate(${textRot})`}>
                          <text
                            x="0"
                            y={lines.length > 2 ? "-6" : lines.length > 1 ? "4" : "12"}
                            textAnchor="middle"
                            className="fill-slate-900 text-[19px] font-extrabold"
                          >
                            {lines.map((line, li) => (
                              <tspan key={`${slot.key}-${li}`} x="0" dy={li === 0 ? 0 : 16}>
                                {line}
                              </tspan>
                            ))}
                          </text>
                        </g>
                      </g>
                    )
                  })
                })()}
                </svg>
              </div>

              {/* Nút QUAY ở giữa */}
              <button
                type="button"
                onClick={handleSpin}
                disabled={!canSpin}
                className="absolute left-1/2 top-1/2 z-30 flex h-[26%] w-[26%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[4px] border-red-700 bg-gradient-to-br from-red-500 to-red-600 shadow-[0_12px_30px_rgba(220,38,38,0.35)] transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <div className="flex h-[90%] w-[90%] flex-col items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-inner">
                  <p className="text-[15px] font-black uppercase tracking-wide leading-none">
                    {isSpinning || spinMutation.isPending ? "Đang" : "Quay"}
                  </p>
                  {(isSpinning || spinMutation.isPending) && (
                    <p className="mt-1 text-[9px] font-medium text-emerald-100">Chờ chút…</p>
                  )}
                  {!canSpin && !isSpinning && !spinMutation.isPending && (
                    <p className="mt-1 text-[9px] font-medium text-emerald-100">Hết lượt</p>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Modal kết quả */}
        <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
          <DialogContent className="max-w-[90vw] sm:max-w-[400px] rounded-[32px] border-none p-0 overflow-hidden bg-white shadow-2xl">
            <DialogTitle className="sr-only">Kết quả quay thưởng</DialogTitle>
            <DialogDescription className="sr-only">Thông báo kết quả trúng thưởng hoặc chia buồn</DialogDescription>
            <div className="relative p-6 pt-10 text-center">
              {/* Nút đóng */}
              <div className="absolute right-4 top-4 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full bg-slate-100 p-0 text-slate-500 hover:bg-slate-200"
                  onClick={() => setIsResultModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {displayResult?.resultType === "win" ? (
                <div className="animate-in fade-in zoom-in duration-500">
                  <LottiePlayer
                    src="/assets/Gifts.json"
                    className="relative mx-auto mb-2 h-64 w-64"
                  />
                  <h2 className="mb-2 text-2xl font-black text-orange-600 uppercase tracking-tight">
                    Trúng thưởng rồi!
                  </h2>
                  <p className="mb-5 text-2xl font-black text-slate-900 sm:text-3xl">
                    {displayResult.reward?.rewardName}
                  </p>
                  <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
                    <p className="text-sm font-medium text-emerald-700">
                      🎁 Chúc mừng bạn đã nhận được phần quà này. 
                      <br /> Hãy đến cửa hàng <span className="font-bold text-emerald-800">XANH</span> nhận thưởng nhé!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in duration-500">
                  <LottiePlayer
                    src="/assets/Bad.json"
                    className="mx-auto mb-2 h-48 w-48"
                  />
                  <h2 className="mb-2 text-xl font-bold text-slate-700">
                    Tiếc quá...
                  </h2>
                  <p className="text-lg font-semibold text-slate-600 px-4">
                    Chúc bạn may mắn hơn ở lượt quay sau nhé! Cố gắng thử lại nào.
                  </p>
                </div>
              )}

              <Button
                className="mt-8 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 py-6 text-lg font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => setIsResultModalOpen(false)}
              >
                Tiếp tục
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Danh sách quà có thể trúng */}
        {campaign.featuredRewards.length > 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Có thể trúng
            </p>
            <div className="flex flex-wrap gap-2">
              {campaign.featuredRewards.map((r) => (
                <Badge
                  key={r.rewardName}
                  variant="outline"
                  className="border-orange-200 bg-orange-50 text-orange-700"
                >
                  {r.rewardName}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Lịch sử quay gần nhất */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-slate-800">Lịch sử quay gần nhất</h2>
          {isSpinLogsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (spinLogsData?.items || []).length === 0 ? (
            <p className="text-sm text-slate-500">Bạn chưa có lượt quay nào trong chương trình này.</p>
          ) : (
            <div className="space-y-3">
              {spinLogsData?.items.map((log) => (
                <div key={log.id} className="rounded-xl border border-slate-100 bg-white/80 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {log.resultType === "win" ? "Trúng thưởng" : "Không trúng"}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(log.spunAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </p>
                      {log.rewardName && (
                        <p className="mt-1 text-sm text-orange-600">{log.rewardName}</p>
                      )}
                    </div>
                    <Badge variant="outline">
                      {log.resultType === "win" ? "Trúng" : "Chưa trúng"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
