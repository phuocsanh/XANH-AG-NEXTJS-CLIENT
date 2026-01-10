'use client'

import { Gift, Calendar, ArrowRight, Tag } from 'lucide-react'
import Link from 'next/link'

interface Promotion {
  id: number
  title: string
  description: string
  image: string
  validUntil: string
  discountCode?: string
  color: string
}

const promotions: Promotion[] = [
  {
    id: 1,
    title: 'Ưu đãi mùa vụ mới - Giảm 15% tất cả phân bón',
    description: 'Đồng hành cùng bà con khởi đầu vụ mùa thuận lợi. Áp dụng cho đơn hàng từ 2 triệu đồng.',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop',
    validUntil: '31/01/2025',
    discountCode: 'VUAMUA15',
    color: 'bg-green-600'
  },
  {
    id: 2,
    title: 'Mua 5 tặng 1 - Thuốc trừ sâu sinh học',
    description: 'Chương trình tri ân khách hàng thân thiết. Bảo vệ cây trồng bằng giải pháp an toàn.',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=400&fit=crop',
    validUntil: '15/01/2025',
    color: 'bg-orange-500'
  },
  {
    id: 3,
    title: 'Miễn phí vận chuyển toàn quốc',
    description: 'Áp dụng cho mọi đơn hàng vật tư nông nghiệp online trong tháng này.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=400&fit=crop',
    validUntil: '31/01/2025',
    discountCode: 'FREESHIP',
    color: 'bg-blue-600'
  }
]

/**
 * Promotions Page
 * Trang hiển thị các chương trình khuyến mãi đang diễn ra
 */
export default function PromotionsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-agri-600 to-agri-800 text-white py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Chương Trình Khuyến Mãi</h1>
            <p className="text-xl text-agri-100 mb-0 leading-relaxed">
              Khám phá những ưu đãi hấp dẫn dành riêng cho bà con nông dân. Đồng hành cùng Xanh AG cho mùa màng bội thu.
            </p>
          </div>
        </div>
        {/* Abstract leaf shape decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-10 transform translate-x-32 -translate-y-32">
          <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
            <path d="M50,10 Q80,30 90,60 Q85,80 60,90 Q40,85 30,60 Q20,30 50,10 Z" />
          </svg>
        </div>
      </section>

      {/* Promotions List */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            {promotions.map((promo, index) => (
              <div 
                key={promo.id}
                className={`flex flex-col lg:flex-row bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform ${
                  index % 2 !== 0 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Image */}
                <div className="lg:w-1/2 relative h-64 lg:h-auto overflow-hidden">
                  <img 
                    src={promo.image} 
                    alt={promo.title}
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                  />
                  <div className={`absolute top-6 left-6 ${promo.color} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2`}>
                    <Tag className="w-4 h-4" />
                    ĐANG DIỄN RA
                  </div>
                </div>

                {/* Content */}
                <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-agri-600 font-bold mb-4">
                    <Gift className="w-5 h-5" />
                    <span>KHUYẾN MÃI ĐẶC BIỆT</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-tight">
                    {promo.title}
                  </h2>
                  <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                    {promo.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-6 mb-8">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-5 h-5" />
                      <span className="text-sm">Hạn dùng: <span className="font-semibold">{promo.validUntil}</span></span>
                    </div>
                    {promo.discountCode && (
                      <div className="px-4 py-2 bg-agri-50 border-2 border-dashed border-agri-200 rounded-lg">
                        <span className="text-xs text-agri-600 block mb-1">Mã giảm giá:</span>
                        <span className="font-mono font-bold text-agri-700 uppercase tracking-widest">{promo.discountCode}</span>
                      </div>
                    )}
                  </div>

                  <Link 
                    href="/products"
                    className="inline-flex items-center gap-2 text-white bg-agri-600 hover:bg-agri-700 px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg w-fit"
                  >
                    Mua sắm ngay
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / Contact CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-agri-50 rounded-3xl p-8 md:p-12 border border-agri-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Đừng bỏ lỡ ưu đãi nào!</h2>
              <p className="text-gray-600 text-lg">
                Đăng ký nhận tin để trở thành người đầu tiên nhận thông tin khuyến mãi và tư vấn kỹ thuật từ Xanh AG.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input 
                type="email" 
                placeholder="Email của bạn"
                className="flex-grow md:w-64 px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
              <button className="bg-agri-600 hover:bg-agri-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-md">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
