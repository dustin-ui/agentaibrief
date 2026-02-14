'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

interface ConfettiPieceData {
  id: number;
  delay: number;
  left: number;
  color: string;
  size: number;
  duration: number;
  rotation: number;
  isCircle: boolean;
}

function ConfettiPiece({ piece }: { piece: ConfettiPieceData }) {
  return (
    <div
      className="absolute animate-confetti pointer-events-none"
      style={{
        left: `${piece.left}%`,
        top: '-10px',
        width: `${piece.size}px`,
        height: `${piece.size}px`,
        backgroundColor: piece.color,
        borderRadius: piece.isCircle ? '50%' : '2px',
        animationDelay: `${piece.delay}s`,
        animationDuration: `${piece.duration}s`,
        transform: `rotate(${piece.rotation}deg)`,
      }}
    />
  );
}

function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPieceData[]>([]);

  useEffect(() => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    setPieces(
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        delay: Math.random() * 2,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        duration: 2 + Math.random() * 2,
        rotation: Math.random() * 360,
        isCircle: Math.random() > 0.5,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} piece={p} />
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
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1]/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/">
            <h1 className="text-2xl font-bold text-[#2a2a2a]">
              Agent<span className="text-[#e85d26]">AI</span>Brief
            </h1>
          </Link>
        </div>
      </header>

      {/* Success Content */}
      <main className="max-w-2xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-4xl font-bold text-[#2a2a2a] mb-3">
            You&apos;re in!
          </h2>
          <p className="text-xl text-[#666]">
            Your first briefing arrives{' '}
            <span className="font-semibold text-[#2a2a2a]">tomorrow at 10:15 AM EST</span>
          </p>
        </div>

        {/* Plan Confirmation */}
        <div className="bg-[#e8e6e1] rounded-2xl shadow-sm border border-[#e0dcd4] p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[#2a2a2a] font-bold ${isPro ? 'bg-[#e85d26]' : 'bg-[#f0ece4]0'}`}>
              {isPro ? '⚡' : '✓'}
            </div>
            <div>
              <p className="font-semibold text-[#2a2a2a]">
                {isPro ? 'Pro Plan Confirmed' : 'Free Plan Activated'}
              </p>
              <p className="text-sm text-[#888]">
                {isPro
                  ? 'Full access including Agent Angles on every story'
                  : 'Daily AI headlines + 1 featured story'}
              </p>
            </div>
          </div>
        </div>

        {/* What to Expect */}
        <div className="bg-[#e8e6e1] rounded-2xl shadow-sm border border-[#e0dcd4] p-6 mb-8">
          <h3 className="text-lg font-bold text-[#2a2a2a] mb-4">📬 What to Expect</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="text-2xl">📰</div>
              <div>
                <p className="font-medium text-[#2a2a2a]">Daily email at 10:15 AM EST</p>
                <p className="text-sm text-[#888]">The top AI stories that matter for real estate, delivered before your first showing</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">🏠</div>
              <div>
                <p className="font-medium text-[#2a2a2a]">Agent Angles{isPro ? '' : ' (Pro)'}</p>
                <p className="text-sm text-[#888]">Exactly how to use each AI development to win more listings and close more deals</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">🛠️</div>
              <div>
                <p className="font-medium text-[#2a2a2a]">Tool Reviews & Tutorials</p>
                <p className="text-sm text-[#888]">Hands-on breakdowns of AI tools tested specifically for agents</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <p className="font-medium text-[#2a2a2a]">Get the most from it</p>
                <p className="text-sm text-[#888]">Read it with your morning coffee. Try one new tip each week. You&apos;ll be ahead of 95% of agents.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upsell for free users */}
        {!isPro && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-8 text-[#2a2a2a]">
            <h3 className="text-lg font-bold mb-2">⚡ Want the full edge?</h3>
            <p className="text-blue-100 mb-4">
              Upgrade to Pro for <span className="font-semibold text-[#2a2a2a]">Agent Angles on every story</span> — 
              specific scripts, strategies, and action items you can use today.
            </p>
            <Link
              href="/subscribe?plan=pro"
              className="inline-block bg-[#e8e6e1] text-[#e85d26] px-6 py-2.5 rounded-lg font-semibold hover:bg-[#f5f0ea] transition-colors"
            >
              Upgrade to Pro — $9.99/mo
            </Link>
          </div>
        )}

        {/* Share */}
        <div className="bg-[#e8e6e1] rounded-2xl shadow-sm border border-[#e0dcd4] p-6 mb-8 text-center">
          <h3 className="text-lg font-bold text-[#2a2a2a] mb-2">🤝 Know another agent who&apos;d love this?</h3>
          <p className="text-sm text-[#888] mb-4">Share AgentAIBrief and help them stay ahead of the curve</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black text-[#2a2a2a] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#f0ece4] transition-colors"
            >
              𝕏 Post
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1877F2] text-[#2a2a2a] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1565C0] transition-colors"
            >
              Facebook
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0A66C2] text-[#2a2a2a] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#084E96] transition-colors"
            >
              LinkedIn
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText('https://agentaibrief.com');
                alert('Link copied!');
              }}
              className="inline-flex items-center gap-2 bg-[#f5f0ea] text-[#555] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              📋 Copy Link
            </button>
          </div>
        </div>

        {/* Back home */}
        <div className="text-center">
          <Link
            href="/"
            className="text-[#e85d26] font-medium hover:text-[#c44a1a] transition-colors"
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
