import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/login',
          '/signup',
          '/manage-subscription',
          '/reset-password',
          '/success',
          '/unsubscribe',
          '/preferences',
          '/pro-dashboard',
          '/seo-command',
          '/seo-sniper',
          '/trial',
        ],
      },
    ],
    sitemap: 'https://agentaibrief.com/sitemap.xml',
  };
}
