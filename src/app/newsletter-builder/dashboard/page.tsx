'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { PaywallGate } from '@/components/PaywallGate';
import Link from 'next/link';

interface SavedStory {
  id: string;
  headline: string;
  summary: string;
  category: string;
  viral_score: number;
  added_at: string;
}

interface Edition {
  id: string;
  status: string;
  scheduled_for: string;
  sent_at: string | null;
  created_at: string;
  stories: unknown[];
}

interface Profile {
  id: string;
  agent_name: string;
  brokerage: string;
  brand_color: string;
  send_day: string;
  send_time: string;
  areas: { city: string; state: string }[];
  email: string;
}

export default function NewsletterDashboard() {
  const { session } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stories, setStories] = useState<SavedStory[]>([]);
  const [editions, setEditions] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token}`,
  }), [session?.access_token]);

  useEffect(() => {
    if (!session?.access_token) return;
    (async () => {
      const res = await fetch('/api/newsletter/profile', { headers: headers() });
      const data = await res.json();
      if (!data.profile) { router.push('/newsletter-builder'); return; }
      setProfile(data.profile);

      // Fetch saved stories
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: `Bearer ${session.access_token}` } }
      });
      const { data: s } = await sb.from('newsletter_saved_stories').select('*').eq('profile_id', data.profile.id).is('used_in_edition', null).order('viral_score', { ascending: false });
      setStories(s || []);

      const { data: e } = await sb.from('newsletter_editions').select('*').eq('profile_id', data.profile.id).order('created_at', { ascending: false }).limit(10);
      setEditions(e || []);

      setLoading(false);
    })();
  }, [session?.access_token, headers, router]);

  const removeStory = async (id: string) => {
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${session?.access_token}` } }
    });
    await sb.from('newsletter_saved_stories').delete().eq('id', id);
    setStories(stories.filter(s => s.id !== id));
  };

  const generatePreview = async () => {
    const res = await fetch('/api/newsletter/preview', { method: 'POST', headers: headers() });
    const data = await res.json();
    setPreviewHtml(data.html);
  };

  if (loading) {
    return (
      <PaywallGate requiredTier="inner_circle" featureName="Newsletter Dashboard">
        <div className="min-h-screen bg-[#e8e6e1] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e85d26]"></div>
        </div>
      </PaywallGate>
    );
  }

  const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-700 text-[#555]',
    preview_sent: 'bg-yellow-900/50 text-yellow-400',
    approved: 'bg-[#e85d26]/20 text-[#e85d26]',
    sent: 'bg-green-900/50 text-green-400',
    failed: 'bg-red-900/50 text-red-400',
  };

  return (
    <PaywallGate requiredTier="inner_circle" featureName="Newsletter Dashboard">
      <div className="min-h-screen bg-[#e8e6e1] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#2a2a2a]">📧 Newsletter Dashboard</h1>
              <p className="text-[#666] mt-1">{profile?.agent_name} · {profile?.brokerage}</p>
            </div>
            <Link href="/newsletter-builder" className="px-4 py-2 bg-[#f0ece4] text-[#2a2a2a] rounded-lg text-sm hover:bg-[#d8d4cc]">
              ✏️ Edit Profile
            </Link>
          </div>

          {/* Schedule info */}
          <div className="bg-[#f0ece4]/80 border border-[#d8d4cc] rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[#666]">📅 Every <span className="text-[#2a2a2a] font-medium">{profile?.send_day}</span> at <span className="text-[#2a2a2a] font-medium">{profile?.send_time}</span></span>
              <span className="text-[#666]">|</span>
              <span className="text-[#666]">📍 {profile?.areas.map(a => `${a.city}, ${a.state}`).join(' · ')}</span>
            </div>
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: profile?.brand_color }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Saved Stories */}
            <div className="lg:col-span-2">
              <div className="bg-[#f0ece4]/80 border border-[#d8d4cc] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#2a2a2a]">📰 Queued Stories ({stories.length})</h2>
                  <button onClick={generatePreview}
                    className="px-4 py-2 bg-[#e85d26]/10 text-[#e85d26] border border-[#e85d26]/30 rounded-lg text-sm hover:bg-[#e85d26]/20">
                    👁️ Preview Next Email
                  </button>
                </div>
                {stories.length === 0 ? (
                  <div className="text-center py-12 text-[#888]">
                    <p className="text-4xl mb-3">📭</p>
                    <p>No stories queued yet.</p>
                    <p className="text-sm mt-1">Use the &quot;Add to Newsletter&quot; button on story cards to queue stories.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stories.map(s => (
                      <div key={s.id} className="flex items-start justify-between bg-[#f0ece4] rounded-lg p-4">
                        <div className="flex-1 min-w-0">
                          {s.category && (
                            <span className="text-[10px] font-semibold text-[#e85d26] bg-[#e85d26]/10 px-2 py-0.5 rounded uppercase">{s.category}</span>
                          )}
                          <p className="text-[#2a2a2a] text-sm font-medium mt-1 truncate">{s.headline}</p>
                          {s.summary && <p className="text-[#666] text-xs mt-1 line-clamp-2">{s.summary}</p>}
                          <div className="flex items-center gap-3 mt-2 text-xs text-[#888]">
                            {s.viral_score && <span>🔥 {s.viral_score}</span>}
                            <span>{new Date(s.added_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button onClick={() => removeStory(s.id)} className="ml-3 text-[#888] hover:text-red-400 text-sm flex-shrink-0">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Past Editions */}
            <div>
              <div className="bg-[#f0ece4]/80 border border-[#d8d4cc] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-[#2a2a2a] mb-4">📬 Past Editions</h2>
                {editions.length === 0 ? (
                  <p className="text-[#888] text-sm text-center py-8">No editions yet. Your first newsletter will be generated before your next scheduled send.</p>
                ) : (
                  <div className="space-y-3">
                    {editions.map(e => (
                      <div key={e.id} className="bg-[#f0ece4] rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${STATUS_COLORS[e.status] || 'bg-gray-700 text-[#555]'}`}>{e.status}</span>
                          <span className="text-[#888] text-xs">{new Date(e.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[#666] text-xs mt-1">{(e.stories as unknown[]).length} stories</p>
                        {e.sent_at && <p className="text-[#888] text-[10px] mt-1">Sent {new Date(e.sent_at).toLocaleString()}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Modal */}
          {previewHtml && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewHtml(null)}>
              <div className="bg-[#f0ece4] rounded-2xl border border-[#d8d4cc] max-w-[650px] w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-[#d8d4cc]">
                  <h3 className="text-[#2a2a2a] font-semibold">Email Preview</h3>
                  <button onClick={() => setPreviewHtml(null)} className="text-[#666] hover:text-[#2a2a2a]">✕</button>
                </div>
                <div className="p-4">
                  <iframe srcDoc={previewHtml} className="w-full h-[70vh] rounded-lg border-0" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PaywallGate>
  );
}
