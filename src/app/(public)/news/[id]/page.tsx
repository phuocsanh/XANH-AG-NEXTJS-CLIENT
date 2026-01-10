import { Metadata } from 'next'
import NewsDetailClient from './news-detail-client'

type Props = {
  params: Promise<{ id: string }>
}

/**
 * Metadata cho trang chi tiết tin tức
 */
export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const id = (await params).id
  
  // Trong thực tế sẽ fetch data từ API ở đây
  // const news = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${id}`).then(res => res.json())
  
  // Tạm thời lấy tin tức mẫu (news 1 là kỹ thuật trồng lúa)
  const title = id === '1' 
    ? 'Kỹ thuật trồng lúa bền vững cho năng suất cao | Xanh AG' 
    : 'Chi tiết tin tức nông nghiệp | Xanh AG'
    
  return {
    title,
    description: 'Chia sẻ kiến thức kỹ thuật nông nghiệp, kinh nghiệm canh tác và giải pháp nông nghiệp bền vững từ chuyên gia Xanh AG.',
    openGraph: {
      title,
      description: 'Chia sẻ kiến thức kỹ thuật nông nghiệp từ Xanh AG',
      type: 'article',
      url: `https://xanhag.com/news/${id}`,
    },
    alternates: {
      canonical: `https://xanhag.com/news/${id}`,
    },
  }
}

/**
 * News Detail Page - Server Component
 */
export default function NewsDetailPage() {
  return <NewsDetailClient />
}
