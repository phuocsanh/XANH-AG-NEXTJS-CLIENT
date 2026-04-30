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
  author?: string
  created_at: string
  updated_at?: string
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
  
  const cleanDescription = news?.content 
        ? news.content.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().substring(0, 160) + '...'
        : 'Chia sẻ kiến thức kỹ thuật nông nghiệp, kinh nghiệm canh tác và giải pháp nông nghiệp bền vững từ chuyên gia Xanh AGRI.'

  const title = news?.title 
    ? `${news.title} | Xanh AGRI` 
    : 'Chi tiết tin tức nông nghiệp | Xanh AGRI'
    
  return {
    title,
    description: cleanDescription,
    openGraph: {
      title,
      description: cleanDescription,
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
export default async function NewsDetailPage({ params }: Props) {
  const { id: slug } = await params
  
  let news: NewsItem | null = null
  try {
     const response = await httpClient.get<any>(`/news/slug/${slug}`)
     news = response.data || response;
   } catch {}

  // JSON-LD for Article
  const jsonLd = news ? {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    image: [news.thumbnail_url],
    datePublished: news.created_at,
    dateModified: news.updated_at || news.created_at,
    author: [{
      '@type': 'Person',
      name: news.author || 'Ban biên tập Xanh AGRI',
      url: 'https://xanhag.com',
    }],
    publisher: {
      '@type': 'Organization',
      name: 'Xanh AGRI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://xanhag.com/logo.png', // Assuming logo path
      }
    },
    description: news.content ? news.content.replace(/<[^>]*>?/gm, ' ').substring(0, 200).trim() : '',
  } : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <NewsDetailClient />
    </>
  )
}
