'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function ConfettiPiece({ delay, left }: { delay: number; left: number }) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 6 + Math.random() * 8;
  const duration = 2 + Math.random() * 2;

  return (
    <div
      className="absolute animate-confetti pointer-events-none"
      style={{
        left: `${left}%`,
        top: '-10px',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  );
}

function Confetti() {
  const [pieces, setPieces] = useState<{ id: number; delay: number; left: number }[]>([]);

  useEffect(() => {
    setPieces(
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        delay: Math.random() * 2,
        left: Math.random() * 100,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} delay={p.delay} left={p.left} />
      ))}
    </div>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'free';
  const isPro = plan === 'pro';

  const shareText = encodeURIComponent(
    "Just signed up for AgentAIBrief — daily AI news designed for real estate agents. Check it out!"
  );
  const shareUrl = encodeURIComponent('https://agentaibrief.com');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Confetti />

      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/">
            <h1 className="text-2xl font-bold text-gray-900">
              Agent<span className="text-blue-600">AI</span>Brief
            </h1>
          </Link>
        </div>
      </header>

      {/* Success Content */}
      <main className="max-w-2xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            You&apos;re in!
          </h2>
          <p className="text-xl text-gray-600">
            Your first briefing arrives{' '}
            <span className="font-semibold text-gray-900">tomorrow at 10:15 AM EST</span>
          </p>
        </div>

        {/* Plan Confirmation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isPro ? 'bg-blue-600' : 'bg-gray-500'}`}>
              {isPro ? '⚡' : '✓'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {isPro ? 'Pro Plan Confirmed' : 'Free Plan Activated'}
              </p>
              <p className="text-sm text-gray-500">
                {isPro
                  ? 'Full access including Agent Angles on every story'
                  : 'Daily AI headlines + 1 featured story'}
              </p>
            </div>
          </div>
        </div>

        {/* What to Expect */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📬 What to Expect</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="text-2xl">📰</div>
              <div>
                <p className="font-medium text-gray-900">Daily email at 10:15 AM EST</p>
                <p className="text-sm text-gray-500">The top AI stories that matter for real estate, delivered before your first showing</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">🏠</div>
              <div>
                <p className="font-medium text-gray-900">Agent Angles{isPro ? '' : ' (Pro)'}</p>
                <p className="text-sm text-gray-500">Exactly how to use each AI development to win more listings and close more deals</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">🛠️</div>
              <div>
                <p className="font-medium text-gray-900">Tool Reviews & Tutorials</p>
                <p className="text-sm text-gray-500">Hands-on breakdowns of AI tools tested specifically for agents</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <p className="font-medium text-gray-900">Get the most from it</p>
                <p className="text-sm text-gray-500">Read it with your morning coffee. Try one new tip each week. You&apos;ll be ahead of 95% of agents.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upsell for free users */}
        {!isPro && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-8 text-white">
            <h3 className="text-lg font-bold mb-2">⚡ Want the full edge?</h3>
            <p className="text-blue-100 mb-4">
              Upgrade to Pro for <span className="font-semibold text-white">Agent Angles on every story</span> — 
              specific scripts, strategies, and action items you can use today.
            </p>
            <Link
              href="/subscribe?plan=pro"
              className="inline-block bg-white text-blue-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Upgrade to Pro — $9.99/mo
            </Link>
          </div>
        )}

        {/* Share */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">🤝 Know another agent who&apos;d love this?</h3>
          <p className="text-sm text-gray-500 mb-4">Share AgentAIBrief and help them stay ahead of the curve</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              𝕏 Post
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1565C0] transition-colors"
            >
              Facebook
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0A66C2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#084E96] transition-colors"
            >
              LinkedIn
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText('https://agentaibrief.com');
                alert('Link copied!');
              }}
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              📋 Copy Link
            </button>
          </div>
        </div>

        {/* Back home */}
        <div className="text-center">
          <Link
            href="/"
            className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            ← Back to homepage
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
