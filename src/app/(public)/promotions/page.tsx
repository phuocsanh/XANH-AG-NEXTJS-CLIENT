import { Metadata } from 'next'
import PromotionsClient from './promotions-client'

export const metadata: Metadata = {
  title: 'Khuyến mãi - Ưu đãi đặc biệt | Xanh AG',
  description: 'Khám phá các chương trình khuyến mãi, ưu đãi đặc biệt về vật tư nông nghiệp: phân bón, thuốc trừ sâu. Giảm giá lên đến 15%, miễn phí vận chuyển',
  keywords: ['khuyến mãi', 'ưu đãi', 'giảm giá', 'vật tư nông nghiệp', 'phân bón giảm giá'],
  openGraph: {
    title: 'Khuyến mãi - Ưu đãi đặc biệt | Xanh AG',
    description: 'Ưu đãi hấp dẫn dành riêng cho nông dân',
    url: 'https://xanhag.com/promotions',
    siteName: 'Xanh AG',
    locale: 'vi_VN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://xanhag.com/promotions',
  },
}

/**
 * Promotions Page - Server Component
 * Trang hiển thị các chương trình khuyến mãi
 */
export default function PromotionsPage() {
  return <PromotionsClient />
}
