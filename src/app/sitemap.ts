import type { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/lib/blog-data';
import { getAllVideos } from '@/lib/videos';

const BASE_URL = 'https://agentaibrief.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/blog',
    '/tools',
    '/prompts',
    '/gpt-templates',
    '/videos',
    '/about',
    '/subscribe',
    '/pricing',
    '/contact',
    '/demo',
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  const posts: MetadataRoute.Sitemap = getAllBlogPosts().map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const videos: MetadataRoute.Sitemap = getAllVideos().map((v) => ({
    url: `${BASE_URL}/videos/${v.slug}`,
    lastModified: new Date(v.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...posts, ...videos];
}
