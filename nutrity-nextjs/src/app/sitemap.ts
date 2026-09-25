import { MetadataRoute } from 'next'
import { getPosts } from '@/actions/db-actions'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nutrityglobal-tau.vercel.app'

  // Get all published blog posts
  const posts = await getPosts().catch((error) => {
    console.error('[SITEMAP] No se pudieron cargar las publicaciones', error)
    return []
  })
  const publishedPosts = posts.filter(post => post.isPublished)

  const blogUrls = publishedPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...blogUrls,
  ]
}
