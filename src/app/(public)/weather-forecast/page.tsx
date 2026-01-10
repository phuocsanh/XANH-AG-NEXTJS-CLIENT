import { Metadata } from 'next'
import WeatherClient from './weather-client'

export const metadata: Metadata = {
  title: 'Dự báo thời tiết nông nghiệp | Xanh AG',
  description: 'Dự báo thời tiết chính xác 7 ngày, phân tích điều kiện thời tiết phù hợp cho phun thuốc và canh tác. Cập nhật theo giờ với khả năng mưa, nhiệt độ, độ ẩm và gió',
  keywords: ['dự báo thời tiết', 'thời tiết nông nghiệp', 'thời tiết phun thuốc', 'dự báo mưa', 'nhiệt độ'],
  openGraph: {
    title: 'Dự báo thời tiết nông nghiệp | Xanh AG',
    description: 'Dự báo thời tiết chính xác 7 ngày cho nông dân',
    url: 'https://xanhag.com/weather-forecast',
    siteName: 'Xanh AG',
    locale: 'vi_VN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://xanhag.com/weather-forecast',
  },
}

/**
 * Weather Forecast Page - Server Component
 * Trang dự báo thời tiết chi tiết 7 ngày
 */
export default function WeatherForecastPage() {
  return <WeatherClient />
}
