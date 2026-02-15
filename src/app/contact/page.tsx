'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open mailto with pre-filled fields
    const subject = encodeURIComponent(`AgentAIBrief Contact: ${name}`);
    const body = encodeURIComponent(`From: ${name} (${email})\n\n${message}`);
    window.location.href = `mailto:dustin@foxhomesteam.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#e8e6e1]">
      <header className="border-b border-[#e0dcd4]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#2a2a2a]">
            Agent<span className="text-[#e85d26]">AI</span>Brief
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/pricing" className="text-[#666] hover:text-[#2a2a2a]">Pricing</Link>
            <Link href="/login" className="text-[#666] hover:text-[#2a2a2a]">Login</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#2a2a2a] mb-3">Get in Touch</h1>
          <p className="text-[#666]">
            Have a question, feedback, or just want to say hey? We&apos;d love to hear from you.
          </p>
        </div>

        {sent ? (
          <div className="bg-[#f0ece4]/60 border border-[#e0dcd4] rounded-2xl p-10 text-center">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-xl font-semibold text-[#2a2a2a] mb-2">Opening your email client...</h2>
            <p className="text-[#666] text-sm mb-4">
              If it didn&apos;t open automatically, you can email us directly at{' '}
              <a href="mailto:dustin@foxhomesteam.com" className="text-[#e85d26] hover:underline font-medium">
                dustin@foxhomesteam.com
              </a>
            </p>
            <button onClick={() => setSent(false)} className="text-[#e85d26] hover:underline text-sm font-medium">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#f0ece4]/60 border border-[#e0dcd4] rounded-2xl p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:ring-2 focus:ring-[#e85d26] focus:border-[#e85d26] outline-none"
                placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:ring-2 focus:ring-[#e85d26] focus:border-[#e85d26] outline-none"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={5}
                className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:ring-2 focus:ring-[#e85d26] focus:border-[#e85d26] outline-none resize-none"
                placeholder="What's on your mind?" />
            </div>
            <button type="submit"
              className="w-full py-3 bg-[#e85d26] text-white font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors">
              Send Message
            </button>
          </form>
        )}

        <div className="text-center mt-10 space-y-3">
          <p className="text-[#666] text-sm">
            Or email us directly at{' '}
            <a href="mailto:dustin@foxhomesteam.com" className="text-[#e85d26] hover:underline font-medium">
              dustin@foxhomesteam.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
