'use client';

import { useEffect, useState, useRef } from 'react';

interface TrendingTopic {
  label: string;
  description: string;
}

interface TrendingResponse {
  success: boolean;
  realestate: TrendingTopic[];
  ai: TrendingTopic[];
  updatedAt: string;
}

const FALLBACK_TOPICS = [
  'AI Valuations',
  'Smart Staging',
  'GPT Agents',
  'Predictive Analytics',
  'Virtual Tours',
  'AI Lead Scoring',
  'PropTech Boom',
  'MLS Automation',
  'ChatGPT for Agents',
  'Computer Vision',
];

const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export function TrendingBar() {
  const [topics, setTopics] = useState<string[]>(FALLBACK_TOPICS);
  const [isLoaded, setIsLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTrending() {
      try {
        const res = await fetch('/api/trending');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: TrendingResponse = await res.json();

        if (!cancelled && data.success) {
          const combined = [
            ...data.realestate.map((t) => t.label),
            ...data.ai.map((t) => t.label),
          ];
          if (combined.length > 0) {
            setTopics(combined);
          }
        }
      } catch {
        // Keep fallback topics on error
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    }

    fetchTrending();
    const interval = setInterval(fetchTrending, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Duplicate topics for seamless infinite scroll
  const doubled = [...topics, ...topics];

  return (
    <div className="w-full overflow-hidden border-b py-2" style={{ background: '#d4d0c8', borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="flex items-center">
        <span className="flex-shrink-0 px-3 font-semibold text-sm tracking-wide z-10" style={{ color: '#e85d26' }}>
          TRENDING:
        </span>
        <div className="overflow-hidden flex-1" ref={scrollRef}>
          <div
            className={`flex gap-4 whitespace-nowrap ${isLoaded ? 'animate-scroll' : ''}`}
            style={{
              animation: 'scroll 30s linear infinite',
            }}
          >
            {doubled.map((topic, i) => (
              <span
                key={`${topic}-${i}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm cursor-default transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888' }}
              >
                <span style={{ color: '#e85d26' }} className="text-xs">●</span>
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
