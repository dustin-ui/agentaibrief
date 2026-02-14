'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface Story {
  headline: string;
  summary?: string;
  sourceUrl?: string;
  category?: string;
  viralScore?: number;
}

export function AddToNewsletterButton({ story }: { story: Story }) {
  const { session } = useAuth();
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const save = async () => {
    if (!session?.access_token) return;
    setState('saving');
    try {
      const res = await fetch('/api/newsletter/save-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          headline: story.headline,
          summary: story.summary,
          source_url: story.sourceUrl,
          category: story.category,
          viral_score: story.viralScore,
        }),
      });
      setState(res.ok ? 'saved' : 'error');
    } catch {
      setState('error');
    }
  };

  if (state === 'saved') {
    return (
      <button disabled className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-900/30 text-green-400 border border-green-800">
        ✓ Added to Newsletter
      </button>
    );
  }

  return (
    <button
      onClick={save}
      disabled={state === 'saving'}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#e85d26]/10 text-[#e85d26] border border-[#e85d26]/30 hover:bg-[#e85d26]/20 transition-colors disabled:opacity-50"
    >
      {state === 'saving' ? (
        <><span className="animate-spin">⏳</span> Saving...</>
      ) : state === 'error' ? (
        <>❌ Try Again</>
      ) : (
        <>📧 Add to Newsletter</>
      )}
    </button>
  );
}
