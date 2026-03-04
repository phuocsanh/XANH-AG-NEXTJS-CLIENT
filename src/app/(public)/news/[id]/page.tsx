import { Metadata } from 'next'
import NewsDetailClient from './news-detail-client'
import httpClient from '@/lib/http'

type Props = {
  params: Promise<{ id: string }>
}

interface NewsItem {
  title: string
  content: string
  thumbnail_url: string
  category: string
}

/**
 * Metadata cho trang chi tiết tin tức
 */
export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const slug = (await params).id
  
  let news: NewsItem | null = null
  try {
     const response = await httpClient.get<any>(`/news/slug/${slug}`)
     // Handle backend response structures {success, data} vs direct data
     news = response.data || response;
  } catch (error) {
     console.error('Error fetching news metadata:', error)
  }
  
  const title = news?.title 
    ? `${news.title} | Xanh AG` 
    : 'Chi tiết tin tức nông nghiệp | Xanh AG'
    
  return {
    title,
    description: news?.content 
       ? news.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'
       : 'Chia sẻ kiến thức kỹ thuật nông nghiệp, kinh nghiệm canh tác và giải pháp nông nghiệp bền vững từ chuyên gia Xanh AG.',
    openGraph: {
      title,
      description: news?.title || 'Chia sẻ kiến thức kỹ thuật nông nghiệp từ Xanh AG',
      type: 'article',
      url: `https://xanhag.com/news/${slug}`,
      images: news?.thumbnail_url ? [news.thumbnail_url] : [],
    },
    alternates: {
      canonical: `https://xanhag.com/news/${slug}`,
    },
  }
}

/**
 * News Detail Page - Server Component
 */
export default function NewsDetailPage() {
  return <NewsDetailClient />
}
