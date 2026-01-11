import { Metadata } from 'next'
import NewsClient from './news-client'
import Block from "@/app/components/Block"

export const metadata: Metadata = {
  title: 'Tin tức nông nghiệp | Xanh AG',
  description: 'Cập nhật tin tức, kiến thức kỹ thuật canh tác, chăm sóc cây trồng, phòng trừ sâu bệnh và xu hướng nông nghiệp mới nhất',
  keywords: ['tin tức nông nghiệp', 'kỹ thuật canh tác', 'phòng trừ sâu bệnh', 'công nghệ nông nghiệp', 'thị trường nông sản'],
  openGraph: {
    title: 'Tin tức nông nghiệp | Xanh AG',
    description: 'Cập nhật tin tức và kiến thức nông nghiệp mới nhất',
    url: 'https://xanhag.com/news',
    siteName: 'Xanh AG',
    locale: 'vi_VN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://xanhag.com/news',
  },
}

/**
 * News Page - Server Component
 * Trang hiển thị danh sách tin tức nông nghiệp
 */
export default function NewsPage() {
  return (
    <Block>
      <NewsClient />
    </Block>
  )
}
