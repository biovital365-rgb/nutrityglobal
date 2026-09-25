import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://nutrityglobal-tau.vercel.app'
  
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
