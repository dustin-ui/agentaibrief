import type { Metadata } from 'next';
import { getAllVideos } from '@/lib/videos';
import { VideoLibraryClient } from './VideoLibraryClient';

export const metadata: Metadata = {
  title: 'Video Library — Livestream Replays & AI Workshops for Agents',
  description:
    'Inner Circle video library: deep-dive livestream replays and workshops with Dustin Fox on AI tools, market analysis, and the strategies behind a $277M real estate operation.',
  alternates: { canonical: 'https://agentaibrief.com/videos' },
  openGraph: {
    title: 'Video Library — AI Workshops for Real Estate Agents | AgentAIBrief',
    description:
      'Livestream replays and exclusive AI workshops with Dustin Fox for real estate agents.',
    url: 'https://agentaibrief.com/videos',
    type: 'website',
  },
};

export default function VideoLibraryPage() {
  const videos = getAllVideos();

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AgentAIBrief Video Library',
    itemListElement: videos.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://agentaibrief.com/videos/${v.slug}`,
      name: v.title,
    })),
  };

  return (
    <div className="min-h-screen bg-[#e8e6e1]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <VideoLibraryClient videos={videos} />
    </div>
  );
}
