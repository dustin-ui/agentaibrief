'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  getVideoBySlug,
  getRelatedVideos,
  formatDuration,
  formatDate,
} from '@/lib/videos';
import type { Video } from '@/lib/videos';

export default function VideoPlayerPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, isLoggedIn, isInnerCircle, logout } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [related, setRelated] = useState<Video[]>([]);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessEmail, setAccessEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [accessError, setAccessError] = useState('');

  useEffect(() => {
    const v = getVideoBySlug(slug);
    if (v) {
      setVideo(v);
      setRelated(getRelatedVideos(slug, 3));
    }
  }, [slug]);

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Video Not Found
          </h2>
          <p className="text-gray-400 mb-6">
            This video doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/videos"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Video Library
          </Link>
        </div>
      </div>
    );
  }

  const hasAccess = isInnerCircle || video.tier !== 'inner-circle';

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
        const stored = {
          email: accessEmail,
          tier: 'inner-circle' as const,
          name: accessEmail.split('@')[0],
        };
        localStorage.setItem('aab_user', JSON.stringify(stored));
        window.location.reload();
      } else if (data.tier === 'pro') {
        setAccessError(
          'Your Pro subscription does not include video access. Upgrade to Inner Circle to unlock.'
        );
      } else {
        setAccessError(
          'No active subscription found for this email.'
        );
      }
    } catch {
      setAccessError('Something went wrong. Please try again.');
    } finally {
      setVerifying(false);
    }
  }

  // Derive embed URL
  function getEmbedUrl(url: string): string {
    // YouTube
    if (url.includes('youtube.com/embed/')) return url;
    if (url.includes('youtube.com/watch')) {
      const id = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const id = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/">
                <h1 className="text-2xl font-bold text-white">
                  Agent<span className="text-blue-500">AI</span>Brief
                </h1>
              </Link>
              <nav className="hidden md:flex items-center gap-4">
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  News
                </Link>
                <Link
                  href="/videos"
                  className="text-sm text-white font-medium"
                >
                  Video Library
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <span className="text-sm text-gray-400 hidden sm:inline">
                    {user?.email}
                  </span>
                  {isInnerCircle && (
                    <span className="text-xs bg-blue-600/20 text-blue-400 px-2.5 py-1 rounded-full font-medium border border-blue-500/30">
                      Inner Circle
                    </span>
                  )}
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-gray-300"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowAccessModal(true)}
                    className="text-sm text-gray-300 hover:text-white font-medium"
                  >
                    Sign In
                  </button>
                  <a
                    href="/subscribe"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Subscribe
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Back link */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Link
          href="/videos"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Back to Video Library
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            {hasAccess ? (
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-6 shadow-2xl">
                <iframe
                  src={getEmbedUrl(video.videoUrl)}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              /* Locked Preview */
              <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-6">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover blur-lg opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center max-w-sm px-4">
                    <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                      <svg
                        className="w-10 h-10 text-blue-400"
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
                    <h3 className="text-xl font-bold text-white mb-2">
                      Inner Circle Exclusive
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">
                      This content is available exclusively for Inner Circle
                      members. Subscribe to unlock all video replays and
                      workshops.
                    </p>
                    <div className="flex flex-col gap-3">
                      <a
                        href="/subscribe"
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Join Inner Circle — $99/mo
                      </a>
                      <button
                        onClick={() => setShowAccessModal(true)}
                        className="px-6 py-3 border border-gray-600 text-gray-300 font-medium rounded-lg hover:bg-gray-800 transition-colors text-sm"
                      >
                        Already a member? Verify access
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Video Info */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-600/20 text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-500/30">
                  INNER CIRCLE
                </span>
                <span className="text-gray-500 text-sm">
                  {formatDate(video.date)}
                </span>
                <span className="text-gray-700">•</span>
                <span className="text-gray-500 text-sm">
                  {formatDuration(video.duration)}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {video.title}
              </h2>
              <p className="text-gray-400 leading-relaxed">
                {video.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {video.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-gray-400 bg-gray-800 px-3 py-1.5 rounded-full capitalize border border-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* About the Host */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold text-white shrink-0">
                  DF
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">
                    Dustin Fox
                  </h4>
                  <p className="text-gray-500 text-sm mb-2">
                    Team Lead, Fox Homes • DC Metro Market
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Leading a 36-agent team doing $277M in volume, Dustin uses
                    AI daily to generate leads, create content, and coach his
                    team. These sessions share the exact strategies and tools
                    behind his success.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar — Related Videos */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Up Next
            </h3>
            <div className="space-y-4">
              {related.map((rv) => {
                const rvLocked =
                  rv.tier === 'inner-circle' && !isInnerCircle;
                return (
                  <Link
                    key={rv.slug}
                    href={rvLocked ? '#' : `/videos/${rv.slug}`}
                    onClick={(e) => {
                      if (rvLocked) {
                        e.preventDefault();
                        setShowAccessModal(true);
                      }
                    }}
                    className="flex gap-3 group"
                  >
                    <div className="relative w-40 shrink-0 aspect-video rounded-lg overflow-hidden bg-gray-800">
                      <img
                        src={rv.thumbnail}
                        alt={rv.title}
                        className={`w-full h-full object-cover ${
                          rvLocked ? 'blur-sm' : ''
                        }`}
                      />
                      {rvLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <svg
                            className="w-5 h-5 text-white/80"
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
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                        {formatDuration(rv.duration)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {rv.title}
                      </h4>
                      <p className="text-gray-500 text-xs mt-1">
                        {formatDate(rv.date)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* CTA in sidebar */}
            {!hasAccess && (
              <div className="mt-8 bg-gradient-to-b from-blue-900/30 to-gray-900 border border-blue-800/30 rounded-xl p-6">
                <h4 className="text-white font-semibold mb-2">
                  🔥 Inner Circle
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Get full access to all videos, live Q&A sessions, and direct
                  coaching with Dustin Fox.
                </p>
                <a
                  href="/subscribe"
                  className="block w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg text-center hover:bg-blue-700 transition-colors"
                >
                  Join — $99/mo
                </a>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-sm text-gray-600 text-center">
            © 2026 AgentAIBrief.com • Built for real estate professionals
          </p>
        </div>
      </footer>

      {/* Access Modal */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowAccessModal(false);
                setAccessError('');
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 text-lg"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-400"
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
              <h2 className="text-xl font-bold text-white mb-2">
                Access Video Library
              </h2>
              <p className="text-sm text-gray-400">
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
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
              <button
                type="submit"
                disabled={verifying}
                className="w-full mt-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : 'Verify Access'}
              </button>
            </form>

            {accessError && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-300">
                {accessError}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-700 text-center">
              <p className="text-sm text-gray-500">
                Not a member?{' '}
                <a
                  href="/subscribe"
                  className="text-blue-400 font-medium hover:underline"
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
