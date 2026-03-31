import Link from 'next/link'
import { Phone, MapPin, ShoppingCart, MessageSquare, ChevronRight, ShieldCheck, Zap } from 'lucide-react'
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
          src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1920&q=80" 
          alt="Cánh đồng nông nghiệp" 
          className="w-full h-full bg-emerald-900"
          classNameImg="object-cover scale-105"
        />
        {/* Fresh and Bright Overlay */}
        <div className="absolute inset-0 bg-emerald-900/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-black/10 z-10" />
      </div>

      {/* Content Container */}
      <div className="relative z-20 container mx-auto px-6 h-full flex flex-col justify-center items-center text-center min-h-[600px] md:min-h-[700px] lg:min-h-[750px]">
        <div className="max-w-4xl pt-12 md:pt-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 px-3 py-1 rounded-full text-yellow-400 text-xs sm:text-sm font-semibold mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <ShieldCheck size={16} />
            <span>Đối tác tin cậy của nhà nông</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-white font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight drop-shadow-2xl animate-in fade-in slide-in-from-left-4 duration-700 delay-100 uppercase">
            Cửa hàng Vật tư <br />
            <span className="text-yellow-400">Nông nghiệp xanh</span>
          </h1>

          {/* Subheading */}
          <p className="text-white font-medium text-sm sm:text-lg md:text-xl mb-8 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Cung cấp giải pháp canh tác thông minh với các dòng thuốc bảo vệ thực vật và phân bón chất lượng cao, giúp mùa màng bội thu.
          </p>

          {/* Contact Info Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-10 text-white animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <a 
              href="tel:0987383606" 
              className="group flex items-center gap-4 hover:text-yellow-400 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-black group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/20">
                <Phone size={20} fill="currentColor" />
              </div>
              <div className="text-left">
                <p className="text-xs text-white/80 font-medium uppercase tracking-wider">Hotline tư vấn</p>
                <p className="text-lg font-bold text-yellow-400">0987.383.606</p>
              </div>
            </a>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <MapPin size={20} className="text-yellow-400" />
              </div>
              <div className="text-left">
                <p className="text-xs text-white/80 font-medium uppercase tracking-wider">Địa chỉ cửa hàng</p>
                <p className="text-sm font-medium text-white">Số nhà 257, Tân Hòa A, An Giang</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <Link
              href="/products"
              className="group bg-yellow-500 hover:bg-yellow-600 text-black px-10 py-4 rounded-full font-bold transition-all flex items-center gap-2 shadow-xl transform hover:-translate-y-1"
            >
              <ShoppingCart size={20} />
              <span>Xem sản phẩm</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/contact"
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/30 px-10 py-4 rounded-full font-semibold transition-all flex items-center gap-2 transform hover:-translate-y-1"
            >
              <MessageSquare size={20} />
              <span>Tư vấn ngay</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Wave/Curve */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-30" />

      {/* Bottom Floating Images Showcase */}
      <div className="absolute bottom-12 left-0 right-0 z-40 hidden md:block">
        <div className="container mx-auto px-6">
           <div className="flex justify-center gap-6">
              {[
                'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=400&q=80',
                'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80',
                'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80'
              ].map((url, i) => (
                <div 
                  key={i}
                  className="w-28 h-20 rounded-xl overflow-hidden border border-white/30 shadow-2xl hover:scale-110 transition-transform duration-300"
                >
                  <Img src={url} alt="Gallery" className="object-cover w-full h-full" />
                </div>
              ))}
           </div>
        </div>
      </div>
    </section>
  )
}
