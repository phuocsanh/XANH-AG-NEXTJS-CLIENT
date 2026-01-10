import { Metadata } from 'next'
import LunarClient from './lunar-client'

export const metadata: Metadata = {
  title: 'Lịch vạn niên - Tra cứu âm dương | Xanh AG',
  description: 'Tra cứu lịch vạn niên, chuyển đổi âm dương, xem ngày tốt xấu, tiết khí và lời khuyên nông vụ theo lịch âm. Hỗ trợ nông dân lựa chọn ngày gieo trồng phù hợp',
  keywords: ['lịch vạn niên', 'lịch âm', 'chuyển đổi âm dương', 'tiết khí', 'lịch nông nghiệp', 'ngày gieo trồng'],
  openGraph: {
    title: 'Lịch vạn niên - Tra cứu âm dương | Xanh AG',
    description: 'Tra cứu lịch vạn niên và lời khuyên nông vụ',
    url: 'https://xanhag.com/lunar-calendar',
    siteName: 'Xanh AG',
    locale: 'vi_VN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://xanhag.com/lunar-calendar',
  },
}

/**
 * Lunar Calendar Page - Server Component
 * Trang lịch vạn niên chi tiết
 */
export default function LunarCalendarPage() {
  return <LunarClient />
}
