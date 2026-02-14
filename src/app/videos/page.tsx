'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { PaywallGate } from '@/components/PaywallGate';
import { getAllVideos, formatDuration, formatDate } from '@/lib/videos';
import type { Video } from '@/lib/videos';

export default function VideoLibraryPage() {
  const { user, isLoggedIn, isInnerCircle, signOut, profile } = useAuth();
  const [videos] = useState<Video[]>(getAllVideos());
  const [filter, setFilter] = useState<string>('all');
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessEmail, setAccessEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [accessError, setAccessError] = useState('');

  // Get unique tags
  const allTags = Array.from(new Set(videos.flatMap((v) => v.tags)));

  const filteredVideos =
    filter === 'all'
      ? videos
      : videos.filter((v) => v.tags.includes(filter));

  const hasAccess = isInnerCircle;

  async function handleVerifyAccess(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setAccessError('');

    try {
      const res = await fetch('/api/verify-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: accessEmail }),
      });
      const data = await res.json();

      if (data.tier === 'inner-circle') {
        // Update auth context
        const stored = {
          email: accessEmail,
          tier: 'inner-circle' as const,
          name: accessEmail.split('@')[0],
        };
        localStorage.setItem('aab_user', JSON.stringify(stored));
        window.location.reload();
      } else if (data.tier === 'pro') {
        setAccessError(
          'Your Pro subscription does not include video access. Upgrade to Inner Circle to unlock the full library.'
        );
      } else {
        setAccessError(
          'No active subscription found for this email. Subscribe to Inner Circle to access exclusive video content.'
        );
      }
    } catch {
      setAccessError('Something went wrong. Please try again.');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#e8e6e1]">
      {/* Header */}
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/">
                <h1 className="text-2xl font-bold text-[#2a2a2a]">
                  Agent<span className="text-[#e85d26]">AI</span>Brief
                </h1>
              </Link>
              <nav className="hidden md:flex items-center gap-4">
                <Link href="/" className="text-sm text-[#666] hover:text-[#2a2a2a] transition-colors">News</Link>
                <Link href="/blog" className="text-sm text-[#666] hover:text-[#2a2a2a] transition-colors">Blog</Link>
                <Link href="/tools" className="text-sm text-[#666] hover:text-[#2a2a2a] transition-colors">AI Tools</Link>
                <Link href="/prompts" className="text-sm text-[#666] hover:text-[#2a2a2a] transition-colors">Prompts</Link>
                <Link href="/videos" className="text-sm text-[#2a2a2a] font-medium border-b-2 border-[#e85d26] pb-0.5">Video Library</Link>
                <Link href="/subscribe" className="text-sm text-[#666] hover:text-[#2a2a2a] transition-colors">Subscribe</Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <span className="text-sm text-[#666] hidden sm:inline">
                    {user?.email}
                  </span>
                  {isInnerCircle && (
                    <span className="text-xs bg-[#e85d26]/20 text-[#e85d26] px-2.5 py-1 rounded-full font-medium border border-[#e85d26]/30">
                      Inner Circle
                    </span>
                  )}
                  <button
                    onClick={signOut}
                    className="text-sm text-[#888] hover:text-[#555]"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowAccessModal(true)}
                    className="text-sm text-[#555] hover:text-[#2a2a2a] font-medium"
                  >
                    Sign In
                  </button>
                  <a
                    href="/subscribe"
                    className="px-4 py-2 bg-[#e85d26] text-[#2a2a2a] text-sm font-medium rounded-lg hover:bg-[#c44a1a] transition-colors"
                  >
                    Subscribe
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 py-16 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-[#e85d26]/20 text-[#e85d26] text-xs font-semibold px-3 py-1 rounded-full border border-[#e85d26]/30">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e85d26] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#e85d26]"></span>
                </span>
                INNER CIRCLE EXCLUSIVE
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#2a2a2a] mb-4 tracking-tight">
              Livestream Replays &<br />
              <span className="text-[#e85d26]">Exclusive Workshops</span>
            </h2>
            <p className="text-lg text-[#666] max-w-2xl">
              Deep-dive sessions with Dustin Fox on AI tools, market analysis,
              and the exact strategies behind a $277M real estate operation.
              Inner Circle members get full access.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === 'all'
                ? 'bg-[#e85d26] text-[#2a2a2a]'
                : 'bg-[#f0ece4] text-[#666] hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            All Videos
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all capitalize ${
                filter === tag
                  ? 'bg-[#e85d26] text-[#2a2a2a]'
                  : 'bg-[#f0ece4] text-[#666] hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <PaywallGate requiredTier="pro" featureName="Video Library">
      <main className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.slug}
              video={video}
              hasAccess={hasAccess}
              onRequestAccess={() => setShowAccessModal(true)}
            />
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#888] text-lg">
              No videos found for this filter.
            </p>
          </div>
        )}
      </main>
      </PaywallGate>

      {/* Upgrade CTA for non-subscribers */}
      {!hasAccess && (
        <section className="border-t border-[#e0dcd4] bg-gradient-to-b from-gray-900 to-gray-950">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <h3 className="text-3xl font-bold text-[#2a2a2a] mb-4">
              Unlock the Full Video Library
            </h3>
            <p className="text-[#666] text-lg mb-8 max-w-2xl mx-auto">
              Get access to all livestream replays, workshops, and exclusive
              content with an Inner Circle membership. Plus direct access to
              Dustin Fox for coaching & strategy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/subscribe"
                className="inline-flex items-center justify-center px-8 py-3 bg-[#e85d26] text-[#2a2a2a] font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors"
              >
                Join Inner Circle — $99/mo
              </a>
              <button
                onClick={() => setShowAccessModal(true)}
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-600 text-[#555] font-medium rounded-lg hover:bg-[#f0ece4] transition-colors"
              >
                Already a member? Sign in
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-[#e0dcd4] bg-[#e8e6e1]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-sm text-[#666] text-center">
            © 2026 AgentAIBrief.com • Built for real estate professionals
          </p>
        </div>
      </footer>

      {/* Access Modal */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#f0ece4] border border-[#d8d4cc] rounded-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowAccessModal(false);
                setAccessError('');
              }}
              className="absolute top-4 right-4 text-[#888] hover:text-[#555] text-lg"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#e85d26]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#e85d26]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#2a2a2a] mb-2">
                Access Video Library
              </h2>
              <p className="text-sm text-[#666]">
                Enter your subscription email to verify your Inner Circle
                membership.
              </p>
            </div>

            <form onSubmit={handleVerifyAccess}>
              <input
                type="email"
                value={accessEmail}
                onChange={(e) => setAccessEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 bg-[#f0ece4] border border-gray-600 rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-[#e85d26] outline-none text-sm"
              />
              <button
                type="submit"
                disabled={verifying}
                className="w-full mt-4 py-3 bg-[#e85d26] text-[#2a2a2a] font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : 'Verify Access'}
              </button>
            </form>

            {accessError && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-300">
                {accessError}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-[#d8d4cc] text-center">
              <p className="text-sm text-[#888]">
                Not a member?{' '}
                <a
                  href="/subscribe"
                  className="text-[#e85d26] font-medium hover:underline"
                >
                  Join Inner Circle — $99/mo
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoCard({
  video,
  hasAccess,
  onRequestAccess,
}: {
  video: Video;
  hasAccess: boolean;
  onRequestAccess: () => void;
}) {
  const isLocked = video.tier === 'inner-circle' && !hasAccess;

  return (
    <div className="group relative">
      {isLocked ? (
        <button
          onClick={onRequestAccess}
          className="w-full text-left focus:outline-none"
        >
          <CardContent video={video} isLocked={true} />
        </button>
      ) : (
        <Link href={`/videos/${video.slug}`}>
          <CardContent video={video} isLocked={false} />
        </Link>
      )}
    </div>
  );
}

function CardContent({
  video,
  isLocked,
}: {
  video: Video;
  isLocked: boolean;
}) {
  return (
    <div
      className={`bg-[#f0ece4] rounded-xl overflow-hidden border border-[#e0dcd4] transition-all duration-300 ${
        isLocked
          ? 'opacity-75 hover:opacity-90'
          : 'hover:border-gray-600 hover:shadow-xl hover:shadow-blue-900/10 hover:scale-[1.02]'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[#f0ece4] overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className={`w-full h-full object-cover ${isLocked ? 'blur-sm' : ''}`}
        />

        {/* Play button overlay */}
        {!isLocked && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
            <div className="w-14 h-14 bg-[#e85d26] rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-[#2a2a2a] ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="text-center">
              <svg
                className="w-10 h-10 text-[#2a2a2a]/80 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              <span className="text-[#2a2a2a]/90 text-sm font-medium">
                Inner Circle Only
              </span>
            </div>
          </div>
        )}

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-[#2a2a2a] text-xs font-medium px-2 py-1 rounded">
          {formatDuration(video.duration)}
        </div>

        {/* Tier badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-[#e85d26]/90 text-[#2a2a2a] text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
            INNER CIRCLE
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-[#2a2a2a] font-semibold text-sm line-clamp-2 mb-2 group-hover:text-[#e85d26] transition-colors">
          {video.title}
        </h3>
        <p className="text-[#888] text-xs line-clamp-2 mb-3">
          {video.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[#666] text-xs">{formatDate(video.date)}</span>
          <div className="flex gap-1.5">
            {video.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs text-[#888] bg-[#f0ece4] px-2 py-0.5 rounded capitalize"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
