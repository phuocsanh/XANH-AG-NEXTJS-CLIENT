import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://xanhag.com'
  
  try {
    // Fetch dynamic routes - với error handling
    let productUrls: MetadataRoute.Sitemap = []
    let newsUrls: MetadataRoute.Sitemap = []
    
    try {
      const products = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/products`, {
        next: { revalidate: 3600 } // Cache 1 hour
      }).then(r => r.json())
      
      if (products?.data) {
        productUrls = products.data.map((product: any) => ({
          url: `${baseUrl}/products/${product.id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }))
      }
    } catch (error) {
      console.error('Error fetching products for sitemap:', error)
    }
    
    try {
      const news = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/news`, {
        next: { revalidate: 3600 }
      }).then(r => r.json())
      
      if (news?.data) {
        newsUrls = news.data.map((item: any) => ({
          url: `${baseUrl}/news/${item.id}`,
          lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.7,
        }))
      }
    } catch (error) {
      console.error('Error fetching news for sitemap:', error)
    }
    
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/products`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/news`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/weather-forecast`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/lunar-calendar`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/promotions`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      ...productUrls,
      ...newsUrls,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return basic sitemap if error
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}
