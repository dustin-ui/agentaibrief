'use client';

import { useState } from 'react';

export default function PreferencesPage() {
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [topics, setTopics] = useState({
    aiTools: true,
    marketNews: true,
    tutorials: true,
    industryUpdates: true,
  });
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  function toggleTopic(key: keyof typeof topics) {
    setTopics(prev => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, frequency, topics }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  const topicOptions = [
    { key: 'aiTools' as const, label: 'AI Tools & Reviews', icon: '🛠️' },
    { key: 'marketNews' as const, label: 'Market News & Trends', icon: '📊' },
    { key: 'tutorials' as const, label: 'Tutorials & How-Tos', icon: '📖' },
    { key: 'industryUpdates' as const, label: 'Industry Updates', icon: '🏠' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Preferences</h1>
        <p className="text-gray-500 mb-8">Customize what you receive from AgentAIBrief.</p>

        {status === 'success' ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <p className="text-green-800 font-semibold text-lg">✅ Preferences saved!</p>
            <p className="text-green-600 text-sm mt-2">Your email preferences have been updated.</p>
            <a href="/" className="inline-block mt-4 text-sm text-blue-600 hover:underline">← Back to AgentAIBrief</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Delivery Frequency</label>
              <div className="grid grid-cols-2 gap-3">
                {(['daily', 'weekly'] as const).map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFrequency(opt)}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                      frequency === opt
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt === 'daily' ? '📬 Daily Digest' : '📅 Weekly Roundup'}
                  </button>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Topics of Interest</label>
              <div className="space-y-2">
                {topicOptions.map(({ key, label, icon }) => (
                  <label
                    key={key}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      topics[key]
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={topics[key]}
                      onChange={() => toggleTopic(key)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">{icon} {label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Saving...' : 'Save Preferences'}
            </button>

            {status === 'error' && (
              <p className="text-red-500 text-sm text-center">Something went wrong. Please try again.</p>
            )}
          </form>
        )}

        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
          <a href="/" className="text-sm text-blue-600 hover:underline">← Back to AgentAIBrief</a>
        </div>
      </div>
    </div>
  );
}
