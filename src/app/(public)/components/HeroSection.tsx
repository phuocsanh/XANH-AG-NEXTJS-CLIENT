import Link from 'next/link'
import { Phone, MapPin, ShoppingCart, MessageSquare, ChevronRight, ShieldCheck, Star } from 'lucide-react'
import Img from '@/app/components/Img'

/**
 * Hero Section Component - Premium Agriculture Banner
 */
export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[600px] md:min-h-[700px] lg:min-h-[750px] overflow-hidden" aria-label="Hero Banner">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Img 
          src="/assets/banner.png" 
          alt="Cửa hàng Vật tư Nông nghiệp Xanh" 
          className="w-full h-full bg-emerald-900"
          classNameImg="object-cover object-center"
        />
        {/* Overlay nhẹ nhàng để giữ độ sáng cho banner */}
        <div className="absolute inset-0 bg-emerald-900/10 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
      </div>

      {/* Content Container */}
      <div className="relative z-20 container mx-auto px-6 h-full flex flex-col justify-center items-center text-center min-h-[600px] md:min-h-[700px] lg:min-h-[750px]">
        <div className="max-w-5xl mx-auto pt-12 md:pt-0">
          {/* Badge - Phong cách hiện đại rực rỡ */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/40 px-4 py-1.5 rounded-full text-white text-xs sm:text-sm font-bold mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-lg">
            <ShieldCheck size={16} className="text-yellow-400" />
            <span>Đối tác tin cậy của nhà nông</span>
          </div>

          {/* Main Heading - Trắng & Xanh lá Header với hiệu ứng cao cấp */}
          <h1 
            className="text-white font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight animate-in fade-in slide-in-from-left-4 duration-700 delay-100 uppercase"
            style={{ textShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
          >
            <span className="block md:inline md:whitespace-nowrap">Cửa hàng Vật tư Nông nghiệp</span> <br className="hidden md:block" />
            <span 
              className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#059669] via-[#84cc16] to-[#059669] bg-[length:200%_auto] animate-shine text-5xl sm:text-6xl md:text-7xl lg:text-8xl pt-2 pb-1"
              style={{ 
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6)) drop-shadow(0 0 15px rgba(16,185,129,0.4))',
                WebkitTextStroke: '0.5px rgba(255,255,255,0.1)'
              }}
            >
              XANH
              {/* Ánh sao lấp lánh rực rỡ hơn */}
              <div className="absolute inset-0 pointer-events-none z-30">
                <Star className="absolute top-[20%] left-[10%] w-3 h-3 text-yellow-400 animate-pulse fill-yellow-400" />
                <Star className="absolute top-[60%] left-[25%] w-2 h-2 text-white animate-pulse fill-white" style={{ animationDelay: '0.2s' }} />
                <Star className="absolute top-[30%] left-[45%] w-4 h-4 text-yellow-300 animate-bounce fill-yellow-300 shadow-[0_0_8px_white]" style={{ animationDuration: '3s' }} />
                <Star className="absolute top-[70%] left-[60%] w-2 h-2 text-white animate-pulse fill-white" style={{ animationDelay: '0.5s' }} />
                <Star className="absolute top-[15%] left-[80%] w-3 h-3 text-yellow-400 animate-pulse fill-yellow-400" style={{ animationDelay: '1.2s' }} />
                <Star className="absolute top-[50%] left-[90%] w-2 h-2 text-white animate-pulse fill-white" style={{ animationDelay: '0.8s' }} />
                <Star className="absolute bottom-[10%] left-[40%] w-2 h-2 text-yellow-200 animate-pulse fill-yellow-200" style={{ animationDelay: '1.5s' }} />
                <Star className="absolute top-[40%] left-[15%] w-2 h-2 text-white animate-ping fill-white" style={{ animationDuration: '4s' }} />
              </div>
            </span>
          </h1>

          {/* Subheading - Trắng sáng có bóng đổ */}
          <p 
            className="text-white font-semibold text-sm sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
          >
            Cung cấp giải pháp canh tác thông minh với các dòng thuốc bảo vệ thực vật và phân bón chất lượng cao, giúp mùa màng bội thu.
          </p>

          {/* Contact Info Row - Dùng thẻ kính mờ để đọc rõ trên nền sáng */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <a 
              href="tel:0987383606" 
              className="group flex items-center gap-4 bg-black/20 backdrop-blur-md border border-white/20 p-3 rounded-2xl hover:bg-black/30 transition-all shadow-xl"
            >
              <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/20">
                <Phone size={20} fill="currentColor" />
              </div>
              <div className="text-left">
                <p className="text-xs text-white/70 font-medium uppercase tracking-wider">Hotline tư vấn</p>
                <p className="text-lg font-bold text-yellow-400">0987.383.606</p>
              </div>
            </a>
            
            <div className="flex items-center gap-4 bg-black/20 backdrop-blur-md border border-white/20 p-3 rounded-2xl shadow-xl">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <MapPin size={20} className="text-yellow-400" />
              </div>
              <div className="text-left">
                <p className="text-xs text-white/70 font-medium uppercase tracking-wider">Địa chỉ cửa hàng</p>
                <p className="text-sm font-bold text-white">Số nhà 257, Ấp Tân Hòa A, Xã Tân Hiêp, An Giang</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <Link
              href="/products"
              className="group bg-yellow-500 hover:bg-yellow-600 text-white px-10 py-4 rounded-full font-bold transition-all flex items-center gap-2 shadow-xl transform hover:-translate-y-1"
            >
              <ShoppingCart size={20} />
              <span>Xem sản phẩm</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/contact"
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/30 px-10 py-4 rounded-full font-semibold transition-all flex items-center gap-2 transform hover:-translate-y-1 shadow-xl"
            >
              <MessageSquare size={20} />
              <span>Tư vấn ngay</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Wave/Curve */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-30" />

    </section>
  )
}
