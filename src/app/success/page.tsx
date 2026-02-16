'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';

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
    const colors = ['#e85d26', '#2a2a2a', '#d4d0c8', '#f0ece4', '#c44a1a', '#555'];
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
  const planParam = searchParams.get('plan') || 'free';
  const { profile } = useAuth();
  
  // Determine actual tier: check profile from Supabase first, fall back to URL param
  const actualTier = profile?.subscription_tier || planParam;
  const isInnerCircle = actualTier === 'inner_circle';
  const isPro = actualTier === 'pro' || isInnerCircle;
  
  const planLabel = isInnerCircle ? 'Inner Circle' : isPro ? 'Pro' : 'Free';
  const planDesc = isInnerCircle 
    ? 'Full suite + priority features + direct team access'
    : isPro 
    ? 'Full access including Agent Angles on every story' 
    : 'Daily AI headlines + 1 featured story';

  const shareText = encodeURIComponent(
    "Just signed up for AgentAIBrief — daily AI news designed for real estate agents. Check it out!"
  );
  const shareUrl = encodeURIComponent('https://agentaibrief.com');

  return (
    <div className="min-h-screen bg-[#e8e6e1]">
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
        <div className="bg-[#f5f0ea] rounded-2xl shadow-sm border border-[#e0dcd4] p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isPro ? 'bg-[#e85d26] text-white' : 'bg-[#f0ece4] text-[#2a2a2a]'}`}>
              {isPro ? '⚡' : '✓'}
            </div>
            <div>
              <p className="font-semibold text-[#2a2a2a]">
                {planLabel} Plan {isPro ? 'Confirmed' : 'Activated'}
              </p>
              <p className="text-sm text-[#888]">{planDesc}</p>
            </div>
          </div>
        </div>

        {/* What to Expect */}
        <div className="bg-[#f5f0ea] rounded-2xl shadow-sm border border-[#e0dcd4] p-6 mb-8">
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
            {isInnerCircle && (
              <div className="flex gap-3">
                <div className="text-2xl">🎯</div>
                <div>
                  <p className="font-medium text-[#2a2a2a]">Inner Circle Access</p>
                  <p className="text-sm text-[#888]">Priority features, direct team support, and early access to new tools</p>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <p className="font-medium text-[#2a2a2a]">Get the most from it</p>
                <p className="text-sm text-[#888]">Read it with your morning coffee. Try one new tip each week. You&apos;ll be ahead of 95% of agents.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upsell for free users only */}
        {!isPro && (
          <div className="bg-[#2a2a2a] rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-2">⚡ Want the full edge?</h3>
            <p className="text-[#999] mb-4">
              Upgrade to Pro for <span className="font-semibold text-white">Agent Angles on every story</span> — 
              specific scripts, strategies, and action items you can use today.
            </p>
            <Link
              href="/pricing"
              className="inline-block bg-[#e85d26] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#c44a1a] transition-colors"
            >
              Upgrade to Pro — $9.99/mo
            </Link>
          </div>
        )}

        {/* Share */}
        <div className="bg-[#f5f0ea] rounded-2xl shadow-sm border border-[#e0dcd4] p-6 mb-8 text-center">
          <h3 className="text-lg font-bold text-[#2a2a2a] mb-2">🤝 Know another agent who&apos;d love this?</h3>
          <p className="text-sm text-[#888] mb-4">Share AgentAIBrief and help them stay ahead of the curve</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#2a2a2a] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#444] transition-colors"
            >
              𝕏 Post
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#2a2a2a] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#444] transition-colors"
            >
              Facebook
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#2a2a2a] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#444] transition-colors"
            >
              LinkedIn
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText('https://agentaibrief.com');
                alert('Link copied!');
              }}
              className="inline-flex items-center gap-2 bg-[#f0ece4] text-[#555] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d8d4cc] transition-colors"
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
      <div className="min-h-screen flex items-center justify-center bg-[#e8e6e1]">
        <div className="text-2xl text-[#666]">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
