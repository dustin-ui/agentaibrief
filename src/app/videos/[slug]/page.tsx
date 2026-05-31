import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getVideoBySlug,
  getRelatedVideos,
  getAllVideos,
} from '@/lib/videos';
import { VideoPlayerClient } from './VideoPlayerClient';

interface Props {
  params: Promise<{ slug: string }>;
}

const BASE_URL = 'https://agentaibrief.com';

export function generateStaticParams() {
  return getAllVideos().map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = getVideoBySlug(slug);
  if (!video) {
    return { title: 'Video Not Found' };
  }
  const thumb = video.thumbnail.startsWith('http')
    ? video.thumbnail
    : `${BASE_URL}${video.thumbnail}`;
  return {
    title: video.title,
    description: video.description,
    alternates: { canonical: `${BASE_URL}/videos/${video.slug}` },
    openGraph: {
      title: video.title,
      description: video.description,
      type: 'video.other',
      url: `${BASE_URL}/videos/${video.slug}`,
      images: [thumb],
    },
    twitter: {
      card: 'summary_large_image',
      title: video.title,
      description: video.description,
      images: [thumb],
    },
  };
}

export default async function VideoPlayerPage({ params }: Props) {
  const { slug } = await params;
  const video = getVideoBySlug(slug);

  if (!video) {
    return (
      <div className="min-h-screen bg-[#e8e6e1] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2a2a2a] mb-2">
            Video Not Found
          </h1>
          <p className="text-[#666] mb-6">
            This video doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/videos"
            className="px-6 py-3 bg-[#e85d26] text-white font-medium rounded-lg hover:bg-[#c44a1a] transition-colors"
          >
            ← Back to Video Library
          </Link>
        </div>
      </div>
    );
  }

  const related = getRelatedVideos(slug, 3);
  const thumb = video.thumbnail.startsWith('http')
    ? video.thumbnail
    : `${BASE_URL}${video.thumbnail}`;

  const videoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: [thumb],
    uploadDate: video.date,
    contentUrl: video.videoUrl,
    embedUrl: video.videoUrl,
    publisher: {
      '@type': 'Organization',
      name: 'AgentAIBrief',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.jpg`,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#e8e6e1]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
      />
      <VideoPlayerClient video={video} related={related} />
    </div>
  );
}
