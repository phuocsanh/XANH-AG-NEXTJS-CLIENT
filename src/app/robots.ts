import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/chat/'],
    },
    sitemap: 'https://xanhag.com/sitemap.xml',
  }
}
