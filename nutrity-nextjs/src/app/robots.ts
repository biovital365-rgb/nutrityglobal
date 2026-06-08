import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nutrity.global'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/admin/', '/auth/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'Claude-Web', 'anthropic-ai', 'PerplexityBot'],
        allow: ['/blog/', '/'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/auth/'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
