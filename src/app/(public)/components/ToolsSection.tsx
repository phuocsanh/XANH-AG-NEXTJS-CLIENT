'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores'
import { Cloud, Calendar as CalendarIcon, ArrowRight, Sun, Scale, Smartphone, Sprout, FlaskConical, Gift, WalletCards } from 'lucide-react'
import CurrentRiceCropPopup from './CurrentRiceCropPopup'
import { localFarmingService } from '@/lib/local-farming-service'

/**
 * ToolsSection Component
 * Hiển thị thẻ truy cập Dự báo thời tiết và Lịch vạn niên trên trang chủ
 */
export default function ToolsSection() {
  const { isLogin } = useAppStore()
  const [isRiceCropPopupOpen, setIsRiceCropPopupOpen] = useState(false)
  const [hasLocalCrops, setHasLocalCrops] = useState<boolean>(false)

  // Kiểm tra xem có dữ liệu ruộng lúa local không (dành cho khách)
  useEffect(() => {
    const checkLocalCrops = async () => {
      try {
        const crops = await localFarmingService.getAllRiceCrops()
        setHasLocalCrops(crops.length > 0)
      } catch (error) {
        console.error('Error checking local crops:', error)
        setHasLocalCrops(false)
      }
    }

    if (!isLogin) {
      checkLocalCrops()
    }
    
    // Cập nhật lại mỗi khi quay lại tab (phòng trường hợp vừa tạo ruộng lúa offline)
    window.addEventListener('focus', checkLocalCrops)
    return () => window.removeEventListener('focus', checkLocalCrops)
  }, [isLogin])

  // Điều kiện hiển thị thẻ "Ruộng lúa hiện tại"
  // Hiển thị nếu: Đã đăng nhập HOẶC (Chưa đăng nhập nhưng có dữ liệu local)
  const showCurrentRiceCrop = isLogin || hasLocalCrops
  
  return (
    <section className="py-10 md:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            TIỆN ÍCH <span className="text-agri-600">NHÀ NÔNG</span>
          </h2>
          <div className="flex justify-center mb-8">
            <div className="w-32 h-2 bg-accent-gold rounded-full" />
          </div>
          <p className="text-gray-500 max-w-2xl mx-auto text-xl leading-relaxed font-medium">
            Công cụ hỗ trợ bà con theo dõi thời tiết và lịch âm dương chính xác, giúp chủ động trong mọi mùa vụ.
          </p>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-8 pb-8 md:pb-0 mx-auto">
          {isLogin && (
            <Link
              href="/rewards"
              className="w-full h-44 sm:h-52 md:h-96 group relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 rounded-[1.25rem] md:rounded-[3rem] p-4 sm:p-5 md:p-10 overflow-hidden shadow-2xl hover:scale-[1.02] transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-white/10 rounded-full blur-3xl -translate-y-12 md:-translate-y-20 translate-x-12 md:translate-x-20 group-hover:bg-white/20 transition-all" />

              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="w-10 h-10 md:w-20 md:h-20 bg-white/10 backdrop-blur-xl rounded-xl md:rounded-3xl flex items-center justify-center mb-3 md:mb-8 border border-white/20 group-hover:rotate-12 transition-transform">
                  <Gift className="w-5 h-5 md:w-10 md:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-5xl font-black text-white leading-tight">Quay <br/> Thưởng</h3>
                <div className="flex items-center gap-2 text-white font-black text-xs sm:text-sm md:text-lg group-hover:gap-4 transition-all">
                  Quay ngay
                  <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-accent-gold" />
                </div>
              </div>

              <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Gift className="w-48 md:w-64 h-48 md:h-64 text-white" />
              </div>
            </Link>
          )}

          {/* Current Rice Crop Summary Card - NEW */}
          {showCurrentRiceCrop && (
            <div 
              onClick={() => setIsRiceCropPopupOpen(true)}
              className="w-full h-44 sm:h-52 md:h-96 group relative bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[1.25rem] md:rounded-[3rem] p-4 sm:p-5 md:p-10 overflow-hidden shadow-2xl hover:scale-[1.02] transition-all duration-500 cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-white/10 rounded-full blur-3xl -translate-y-12 md:-translate-y-20 translate-x-12 md:translate-x-20 group-hover:bg-white/20 transition-all" />

              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="w-10 h-10 md:w-20 md:h-20 bg-white/10 backdrop-blur-xl rounded-xl md:rounded-3xl flex items-center justify-center mb-3 md:mb-8 border border-white/20 group-hover:rotate-12 transition-transform">
                  <Sprout className="w-5 h-5 md:w-10 md:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-5xl font-black text-white leading-tight">Ruộng lúa <br/> Hiện tại</h3>
                <div className="flex items-center gap-2 text-white font-black text-xs sm:text-sm md:text-lg group-hover:gap-4 transition-all">
                  Xem ngay 
                  <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-accent-gold" />
                </div>
              </div>

              <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Scale className="w-48 md:w-64 h-48 md:h-64 text-white" />
              </div>
            </div>
          )}

          {isLogin && (
            <Link
              href="/customer-rewards"
              className="w-full h-44 sm:h-52 md:h-96 group relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-800 rounded-[1.25rem] md:rounded-[3rem] p-4 sm:p-5 md:p-10 overflow-hidden shadow-2xl hover:scale-[1.02] transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-white/10 rounded-full blur-3xl -translate-y-12 md:-translate-y-20 translate-x-12 md:translate-x-20 group-hover:bg-white/20 transition-all" />

              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="w-10 h-10 md:w-20 md:h-20 bg-white/10 backdrop-blur-xl rounded-xl md:rounded-3xl flex items-center justify-center mb-3 md:mb-8 border border-white/20 group-hover:rotate-12 transition-transform">
                  <WalletCards className="w-5 h-5 md:w-10 md:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-5xl font-black text-white leading-tight">Tích <br/> Lũy</h3>
                <div className="flex items-center gap-2 text-white font-black text-xs sm:text-sm md:text-lg group-hover:gap-4 transition-all">
                  Xem tích lũy
                  <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-accent-gold" />
                </div>
              </div>

              <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <WalletCards className="w-48 md:w-64 h-48 md:h-64 text-white" />
              </div>
            </Link>
          )}

          {/* Weather Entry Card */}
          <Link 
            href="/weather-forecast"
            className="w-full h-44 sm:h-52 md:h-96 group relative bg-gradient-to-br from-sky-600 via-blue-700 to-cyan-900 rounded-[1.25rem] md:rounded-[3rem] p-4 sm:p-5 md:p-10 overflow-hidden shadow-2xl hover:scale-[1.02] transition-all duration-500"
          >
            <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-white/10 rounded-full blur-3xl -translate-y-12 md:-translate-y-20 translate-x-12 md:translate-x-20 group-hover:bg-white/20 transition-all" />
            
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="w-10 h-10 md:w-20 md:h-20 bg-white/10 backdrop-blur-xl rounded-xl md:rounded-3xl flex items-center justify-center mb-3 md:mb-8 border border-white/20 group-hover:rotate-12 transition-transform">
                <Cloud className="w-5 h-5 md:w-10 md:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-5xl font-black text-white leading-tight">Dự báo <br/> Thời tiết</h3>
              <div className="flex items-center gap-2 text-white font-black text-xs sm:text-sm md:text-lg group-hover:gap-4 transition-all">
                Xem chi tiết 7 ngày 
                <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-accent-gold" />
              </div>
            </div>

            {/* Decorative Weather Icons */}
            <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sun className="w-48 md:w-64 h-48 md:h-64 text-white" />
            </div>
          </Link>

          {/* Calendar Entry Card */}
          <Link 
            href="/lunar-calendar"
            className="w-full h-44 sm:h-52 md:h-96 group relative bg-gradient-to-br from-rose-600 via-red-700 to-pink-900 rounded-[1.25rem] md:rounded-[3rem] p-4 sm:p-5 md:p-10 overflow-hidden shadow-2xl hover:scale-[1.02] transition-all duration-500"
          >
            <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-white/10 rounded-full blur-3xl -translate-y-12 md:-translate-y-20 translate-x-12 md:translate-x-20 group-hover:bg-white/20 transition-all" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="w-10 h-10 md:w-20 md:h-20 bg-white/10 backdrop-blur-xl rounded-xl md:rounded-3xl flex items-center justify-center mb-3 md:mb-8 border border-white/20 group-hover:-rotate-12 transition-transform">
                <CalendarIcon className="w-5 h-5 md:w-10 md:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-5xl font-black text-white leading-tight">Lịch <br/> Vạn Niên</h3>
              <div className="flex items-center gap-2 text-white font-black text-xs sm:text-sm md:text-lg group-hover:gap-4 transition-all">
                Xem chi tiết lịch âm 
                <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-accent-gold" />
              </div>
            </div>

            {/* Decorative Calendar Icons */}
            <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <CalendarIcon className="w-48 md:w-64 h-48 md:h-64 text-white" />
            </div>
          </Link>

          {/* Fertilizer Calculator Card */}
          <Link
            href="/fertilizer-calculator"
            className="w-full h-44 sm:h-52 md:h-96 group relative bg-gradient-to-br from-teal-500 via-cyan-700 to-slate-800 rounded-[1.25rem] md:rounded-[3rem] p-4 sm:p-5 md:p-10 overflow-hidden shadow-2xl hover:scale-[1.02] transition-all duration-500"
          >
            <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-white/10 rounded-full blur-3xl -translate-y-12 md:-translate-y-20 translate-x-12 md:translate-x-20 group-hover:bg-white/20 transition-all" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="w-10 h-10 md:w-20 md:h-20 bg-white/10 backdrop-blur-xl rounded-xl md:rounded-3xl flex items-center justify-center mb-3 md:mb-8 border border-white/20 group-hover:rotate-12 transition-transform">
                <FlaskConical className="w-5 h-5 md:w-10 md:h-10 text-white" />
              </div>
                <h3 className="text-lg sm:text-xl md:text-5xl font-black text-white leading-tight">Phối trộn <br/> Phân</h3>
              <div className="flex items-center gap-2 text-white font-black text-xs sm:text-sm md:text-lg group-hover:gap-4 transition-all">
                Tính ngay
                <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-accent-gold" />
              </div>
            </div>

            <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <FlaskConical className="w-48 md:w-64 h-48 md:h-64 text-white" />
            </div>
          </Link>

          {/* Farm Management Card - Authenticated */}
          {isLogin ? (
            <Link 
              href="/rice-crops"
              className="w-full h-44 sm:h-52 md:h-96 group relative bg-gradient-to-br from-fuchsia-600 via-pink-700 to-rose-800 rounded-[1.25rem] md:rounded-[3rem] p-4 sm:p-5 md:p-10 overflow-hidden shadow-2xl hover:scale-[1.02] transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-white/10 rounded-full blur-3xl -translate-y-12 md:-translate-y-20 translate-x-12 md:translate-x-20 group-hover:bg-white/20 transition-all" />

              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="w-10 h-10 md:w-20 md:h-20 bg-white/10 backdrop-blur-xl rounded-xl md:rounded-3xl flex items-center justify-center mb-3 md:mb-8 border border-white/20 group-hover:rotate-12 transition-transform">
                  <Sprout className="w-5 h-5 md:w-10 md:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-5xl font-black text-white leading-tight">Quản lý <br/> Canh tác</h3>
                <div className="flex items-center gap-2 text-white font-black text-xs sm:text-sm md:text-lg group-hover:gap-4 transition-all">
                  Xem danh sách vụ lúa 
                  <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-accent-gold" />
                </div>
              </div>

              <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sprout className="w-48 md:w-64 h-48 md:h-64 text-white" />
              </div>
            </Link>
          ) : (
            /* Farm Management Card - Guest / Offline mode */
            <Link 
              href="/guest-farming"
              className="w-full h-44 sm:h-52 md:h-96 group relative bg-gradient-to-br from-indigo-500 to-indigo-800 rounded-[1.25rem] md:rounded-[3rem] p-4 sm:p-5 md:p-10 overflow-hidden shadow-2xl hover:scale-[1.02] transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-white/10 rounded-full blur-3xl -translate-y-12 md:-translate-y-20 translate-x-12 md:translate-x-20 group-hover:bg-white/20 transition-all" />

              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="w-10 h-10 md:w-20 md:h-20 bg-white/10 backdrop-blur-xl rounded-xl md:rounded-3xl flex items-center justify-center mb-3 md:mb-8 border border-white/20 group-hover:rotate-12 transition-transform">
                  <Smartphone className="w-5 h-5 md:w-10 md:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-5xl font-black text-white leading-tight">Canh tác</h3>
                <div className="flex items-center gap-2 text-white font-black text-xs sm:text-sm md:text-lg group-hover:gap-4 transition-all">
                  Bắt đầu ngay 
                  <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-accent-gold" />
                </div>
              </div>

              <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sprout className="w-48 md:w-64 h-48 md:h-64 text-white" />
              </div>
            </Link>
          )}
        </div>

        <CurrentRiceCropPopup 
          isOpen={isRiceCropPopupOpen} 
          onOpenChange={setIsRiceCropPopupOpen} 
        />
      </div>
    </section>
  )
}
