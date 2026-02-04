import videosData from '../data/videos.json';

export interface Video {
  slug: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  tier: 'inner-circle' | 'pro' | 'free';
  tags: string[];
}

export function getAllVideos(): Video[] {
  return (videosData as Video[]).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getVideoBySlug(slug: string): Video | undefined {
  return (videosData as Video[]).find((v) => v.slug === slug);
}

export function getRelatedVideos(currentSlug: string, limit = 3): Video[] {
  const current = getVideoBySlug(currentSlug);
  if (!current) return getAllVideos().slice(0, limit);

  const currentTags = new Set(current.tags);
  const others = (videosData as Video[]).filter((v) => v.slug !== currentSlug);

  // Sort by number of shared tags
  return others
    .map((v) => ({
      video: v,
      score: v.tags.filter((t) => currentTags.has(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((v) => v.video);
}

export function formatDuration(duration: string): string {
  const parts = duration.split(':');
  if (parts.length === 3) {
    const h = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    return `${h}h ${m}m`;
  }
  const m = parseInt(parts[0]);
  const s = parseInt(parts[1]);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m ${s}s`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
