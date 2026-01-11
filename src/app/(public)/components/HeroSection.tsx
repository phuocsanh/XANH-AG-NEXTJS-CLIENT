'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Phone, MapPin } from 'lucide-react'
import Img from '@/app/components/Img'

const StarField = () => {
  const [mounted, setMounted] = useState(false)
  const [starProps, setStarProps] = useState<{
    twinkle: boolean;
    delay: number;
    duration: number;
    opacity: number;
    size: number;
  }[]>([])
  
  useEffect(() => {
    // Tổng số ngôi sao trong mạng lưới
    const totalStars = 2000
    // Khởi tạo tất cả là sao tĩnh
    const props = Array.from({ length: totalStars }).map(() => ({
      twinkle: false,
      delay: 0,
      duration: 60000, // Chu kỳ 1 phút
      opacity: 0.1 + Math.random() * 0.15,
      size: 10 + Math.random() * 4
    }))

    // Chọn ngẫu nhiên 150 vị trí để làm sao nhấp nháy
    const indices: number[] = Array.from({ length: totalStars }, (_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = indices[i]
      if (temp !== undefined) {
        indices[i] = indices[j] as number
        indices[j] = temp
      }
    }

    const numTwinklingStars = 300
    for (let i = 0; i < numTwinklingStars; i++) {
        const idx = indices[i]
        if (idx !== undefined && props[idx]) {
          const star = props[idx]
          if (star) {
            star.twinkle = true
            star.delay = Math.random() * 20000 
            star.duration = 5000 + Math.random() * 5000 // Chu kỳ 5s - 10s
            star.size = 12 + Math.random() * 6
          }
        }
    }

    setStarProps(props)
    setMounted(true)
  }, [])

  if (!mounted || starProps.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none select-none" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, 30px)',
      gridAutoRows: '30px',
      padding: '4px 0 0 6px',
      opacity: 0.4
    }}>
      {starProps.map((prop, i) => (
        <div
          key={i}
          className={`flex items-center justify-center text-white ${prop.twinkle ? 'animate-twinkle' : ''}`}
          style={{
            animationDelay: prop.twinkle ? `${prop.delay}ms` : undefined,
            animationDuration: prop.twinkle ? `${prop.duration}ms` : undefined,
            fontSize: `${prop.size}px`,
            opacity: prop.twinkle ? undefined : prop.opacity
          }}
        >
          +
        </div>
      ))}
      <style jsx global>{`
        @keyframes twinkle {
          0%, 35%, 65%, 100% { 
            opacity: 0.2; 
            transform: scale(0.9);
            text-shadow: none;
          }
          45%, 55% { 
            opacity: 1; 
            transform: scale(1.6);
            text-shadow: 0 0 15px rgba(255, 255, 255, 1), 0 0 30px rgba(255, 255, 255, 0.6);
          }
        }
        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

/**
 * Hero Section Component
 * Banner chính với gradient xanh và product showcase
 */
export default function HeroSection() {
  return (
    <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-agri overflow-hidden" aria-label="Hero Banner">
      {/* Background pattern overlay with Twinkling Stars */}
      <StarField />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
        {/* Main heading */}
        <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 drop-shadow-lg">
          CỬA HÀNG VẬT TƯ NÔNG NGHIỆP XANH
        </h1>

        {/* Subheading */}
        <p className="text-green-100 italic text-sm sm:text-base md:text-lg lg:text-xl mb-6 max-w-4xl px-4">
          CHUYÊN CUNG CẤP: THUỐC BẢO VỆ THỰC VẬT - PHÂN BÓN - HẠT GIỐNG - DUNG CỤ LÀM VƯỜN
        </p>

        {/* Contact info - Dùng address tag */}
        <address className="flex flex-col sm:flex-row gap-4 mb-8 text-white not-italic">
          <a 
            href="tel:0987383606" 
            className="flex items-center gap-2 hover:text-green-200 transition-colors"
            aria-label="Số điện thoại"
          >
            <Phone className="w-5 h-5" aria-hidden="true" />
            <span className="font-semibold">0987.383.606</span>
          </a>
          <div className="hidden sm:block text-green-300" aria-hidden="true">|</div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm">Số nhà 257, Tân Hòa A, Tân Hiệp - An Giang</span>
          </div>
        </address>

        {/* CTA Buttons - Dùng nav tag */}
        <nav className="flex flex-row gap-4 pb-40 lg:pb-20" aria-label="Primary actions">
          <Link
            href="/products"
            className="text-sm lg:text-base bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-xl max-w-[150px] lg:min-w-[180px] flex items-center justify-center"
          >
            Xem sản phẩm
          </Link>
          <Link
            href="/promotions"
            className="text-sm lg:text-base bg-white hover:bg-agri-50 text-agri-700 px-5 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-xl max-w-[150px] lg:min-w-[180px]"
          >
            Khuyến mãi
          </Link>
        </nav>
      </div>

      {/* Product images overlay - positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 md:h-56 pointer-events-none overflow-hidden">
        <div className="container mx-auto px-4 h-full flex justify-center items-end gap-3 md:gap-6">
          {[
            'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=300&h=400&fit=crop',
            'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&h=400&fit=crop',
            'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&h=400&fit=crop',
            'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=300&h=400&fit=crop'
          ].map((url, i) => (
            <div 
              key={i}
              className="w-24 md:w-36 h-32 md:h-48 bg-white/20 backdrop-blur-md rounded-t-2xl border-x border-t border-white/30 shadow-2xl transform translate-y-4 hover:translate-y-0 transition-transform duration-500 relative overflow-hidden"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <Img 
                src={url} 
                alt={`Sản phẩm nông nghiệp ${i + 1}`} 
                className="object-cover opacity-80"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
