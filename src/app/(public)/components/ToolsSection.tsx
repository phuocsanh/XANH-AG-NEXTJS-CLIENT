'use client'

import { Cloud, Calendar as CalendarIcon, ArrowRight, Sun, Moon, MapPin, Sprout } from 'lucide-react'
import Link from 'next/link'
import { useAppStore } from '@/stores'

/**
 * ToolsSection Component
 * Hiển thị thẻ truy cập Dự báo thời tiết và Lịch vạn niên trên trang chủ
 */
export default function ToolsSection() {
  const { isLogin } = useAppStore()
  
  return (
    <section className="py-24 bg-white overflow-hidden">
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

        {/* Widgets Grid - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop when logged in */}
        <div className={`grid gap-8 max-w-7xl mx-auto ${isLogin ? 'md:grid-cols-2 lg:grid-cols-3' : 'lg:grid-cols-2 gap-12'}`}>
          {/* Weather Entry Card */}
          <Link 
            href="/weather-forecast"
            className="group relative bg-gradient-to-br from-agri-600 to-agri-800 rounded-[3rem] p-10 overflow-hidden shadow-2xl hover:scale-[1.02] transition-all duration-500"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-20 translate-x-20 group-hover:bg-white/20 transition-all" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-8 border border-white/20 group-hover:rotate-12 transition-transform">
                <Cloud className="w-10 h-10 text-white" />
              </div>
              <p className="text-agri-100 font-black uppercase tracking-widest text-sm mb-4">Theo dõi nông vụ</p>
              <h3 className="text-4xl md:text-5xl font-black text-white mb-6">Dự báo <br/> Thời tiết</h3>
              <div className="flex items-center gap-3 text-white/60 mb-8">
                <MapPin className="w-5 h-5" />
                <span className="font-bold">An Giang & Toàn quốc</span>
              </div>
              
              <div className="flex items-center gap-2 text-white font-black text-lg group-hover:gap-4 transition-all">
                Xem chi tiết 7 ngày 
                <ArrowRight className="w-6 h-6 text-accent-gold" />
              </div>
            </div>

            {/* Decorative Weather Icons */}
            <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sun className="w-64 h-64 text-white" />
            </div>
          </Link>

          {/* Calendar Entry Card */}
          <Link 
            href="/lunar-calendar"
            className="group relative bg-gradient-to-br from-orange-600 to-red-700 rounded-[3rem] p-10 overflow-hidden shadow-2xl hover:scale-[1.02] transition-all duration-500"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-20 translate-x-20 group-hover:bg-white/20 transition-all" />

            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-8 border border-white/20 group-hover:-rotate-12 transition-transform">
                <CalendarIcon className="w-10 h-10 text-white" />
              </div>
              <p className="text-orange-100 font-black uppercase tracking-widest text-sm mb-4">Văn hóa & Đời sống</p>
              <h3 className="text-4xl md:text-5xl font-black text-white mb-6">Lịch <br/> Vạn Niên</h3>
              <div className="flex items-center gap-3 text-white/60 mb-8">
                <Moon className="w-5 h-5" />
                <span className="font-bold">Âm - Dương lịch</span>
              </div>

              <div className="flex items-center gap-2 text-white font-black text-lg group-hover:gap-4 transition-all">
                Xem chi tiết lịch âm 
                <ArrowRight className="w-6 h-6 text-accent-gold" />
              </div>
            </div>

            {/* Decorative Calendar Icons */}
            <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <CalendarIcon className="w-64 h-64 text-white" />
            </div>
          </Link>

          {/* Farm Management Card - Only show when logged in */}
          {isLogin && (
            <Link 
              href="/rice-crops"
              className="group relative bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[3rem] p-10 overflow-hidden shadow-2xl hover:scale-[1.02] transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-20 translate-x-20 group-hover:bg-white/20 transition-all" />

              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-8 border border-white/20 group-hover:rotate-12 transition-transform">
                  <Sprout className="w-10 h-10 text-white" />
                </div>
                <p className="text-emerald-100 font-black uppercase tracking-widest text-sm mb-4">Quản lý nông nghiệp</p>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-6">Quản lý <br/> Canh tác</h3>
                <div className="flex items-center gap-3 text-white/60 mb-8">
                  <Sprout className="w-5 h-5" />
                  <span className="font-bold">Theo dõi vụ lúa</span>
                </div>

                <div className="flex items-center gap-2 text-white font-black text-lg group-hover:gap-4 transition-all">
                  Xem danh sách vụ lúa 
                  <ArrowRight className="w-6 h-6 text-accent-gold" />
                </div>
              </div>

              {/* Decorative Icons */}
              <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sprout className="w-64 h-64 text-white" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
