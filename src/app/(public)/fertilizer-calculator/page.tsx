import { Metadata } from 'next'
import Block from '@/app/components/Block'
import FertilizerCalculatorClient from './fertilizer-calculator-client'

export const metadata: Metadata = {
  title: 'Tính phối phân NPK | Xanh AGRI',
  description:
    'Công cụ tính phối phân NPK, so sánh hàm lượng thực tế và quy đổi lượng bón tương đương theo tổng kg dinh dưỡng.',
  keywords: ['phối phân', 'tính NPK', 'phân bón', 'quy đổi lượng bón', 'nông nghiệp'],
  openGraph: {
    title: 'Tính phối phân NPK | Xanh AGRI',
    description: 'Tính hàm lượng NPK sau khi trộn và quy đổi lượng bón tương đương',
    url: 'https://xanhag.com/fertilizer-calculator',
    siteName: 'Xanh AGRI',
    locale: 'vi_VN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://xanhag.com/fertilizer-calculator',
  },
}

export default function FertilizerCalculatorPage() {
  return (
    <Block>
      <FertilizerCalculatorClient />
    </Block>
  )
}
