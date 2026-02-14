'use client';

import Link from 'next/link';

const STEPS = [
  { num: '1', title: 'Sign Up', desc: 'Create your free affiliate account in 30 seconds. No approval wait.' },
  { num: '2', title: 'Share Your Link', desc: 'Get a unique referral link. Share it in your content, emails, or conversations.' },
  { num: '3', title: 'Get Paid Monthly', desc: 'Earn 30% of every payment — recurring, for as long as they stay subscribed.' },
];

const FAQS = [
  { q: 'How much can I earn?', a: 'You earn 30% recurring commission on every referral. That\'s $5.70/mo per Pro subscriber, $29.70/mo per Inner Circle subscriber, and $89.70/mo per Team subscriber. Commissions continue for as long as your referral stays subscribed.' },
  { q: 'When do I get paid?', a: 'Payouts are processed monthly via Stripe. You\'ll receive your commission after the referred customer\'s payment clears.' },
  { q: 'Is there a minimum payout?', a: 'Yes, the minimum payout threshold is $50. Once you hit that, your earnings are automatically sent to your connected bank account.' },
  { q: 'Do I need to be a customer to be an affiliate?', a: 'No! Anyone can join the affiliate program. But our best affiliates are usually customers who genuinely love the tools.' },
  { q: 'How long does the cookie last?', a: '90 days. If someone clicks your link and subscribes within 90 days, you get credit.' },
  { q: 'Is there a cap on earnings?', a: 'No cap. Refer 100 Inner Circle members and you\'re earning $2,970/mo passively. The sky\'s the limit.' },
];

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-[#e8e6e1] text-[#2a2a2a]">
      {/* Nav */}
      <header className="border-b border-[#e0dcd4]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Agent<span className="text-[#e85d26]">AI</span>Brief
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-[#666] hover:text-[#2a2a2a] transition-colors">Pricing</Link>
            <Link href="/" className="text-sm text-[#666] hover:text-[#2a2a2a] transition-colors">Home</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block bg-[#e85d26]/10 border border-[#e85d26]/30 text-[#e85d26] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            💰 Affiliate Program
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Earn 30% Recurring Commission{' '}
            <span className="text-[#e85d26]">— For Life</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#666] max-w-2xl mx-auto mb-10">
            Recommend AgentAIBrief to fellow agents. Get paid every month they stay subscribed.
          </p>
          <a
            href="https://agentaibrief.rewardful.com"
            className="inline-block px-8 py-4 bg-[#e85d26] text-[#2a2a2a] font-bold rounded-xl text-lg hover:bg-[#c44a1a] transition-colors shadow-lg shadow-[#e85d26]/20"
          >
            Join the Affiliate Program →
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 border-t border-[#e0dcd4]">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-14 h-14 bg-[#e85d26] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Details */}
      <section className="py-16 border-t border-[#e0dcd4] bg-[#f0ece4]/30">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Your Commission Breakdown</h2>
          <p className="text-[#666] text-center mb-10">30% recurring lifetime commission on every plan</p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { plan: 'Pro', price: '$19/mo', commission: '$5.70/mo', per: 'per referral' },
              { plan: 'Inner Circle', price: '$99/mo', commission: '$29.70/mo', per: 'per referral' },
              { plan: 'Team', price: '$299/mo', commission: '$89.70/mo', per: 'per referral' },
            ].map((p) => (
              <div key={p.plan} className="bg-[#f0ece4] border border-[#e0dcd4] rounded-2xl p-6 text-center">
                <h3 className="text-lg font-bold text-[#2a2a2a] mb-1">{p.plan}</h3>
                <p className="text-[#888] text-sm mb-4">{p.price}</p>
                <p className="text-3xl font-extrabold text-[#e85d26]">{p.commission}</p>
                <p className="text-[#888] text-xs mt-1">{p.per}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 bg-[#f0ece4] border border-[#e0dcd4] rounded-2xl p-6 max-w-lg mx-auto">
            <p className="text-[#666] text-sm mb-2">Example: Refer just 10 Inner Circle members</p>
            <p className="text-4xl font-extrabold text-[#2a2a2a]">$297<span className="text-lg text-[#666]">/mo</span></p>
            <p className="text-[#e85d26] text-sm font-medium mt-1">Passive recurring income</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-[#e0dcd4]">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.q} className="border border-[#e0dcd4] rounded-xl p-6">
                <h3 className="font-bold text-[#2a2a2a] mb-2">{faq.q}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 border-t border-[#e0dcd4] bg-gradient-to-b from-transparent to-[#e85d26]/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-[#666] mb-8">Join hundreds of agents already earning passive income with AgentAIBrief.</p>
          <a
            href="https://agentaibrief.rewardful.com"
            className="inline-block px-8 py-4 bg-[#e85d26] text-[#2a2a2a] font-bold rounded-xl text-lg hover:bg-[#c44a1a] transition-colors shadow-lg shadow-[#e85d26]/20"
          >
            Join the Affiliate Program →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e0dcd4] py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-[#888]">
          © 2026 AgentAIBrief.com •{' '}
          <Link href="/privacy" className="hover:text-[#555]">Privacy</Link> •{' '}
          <Link href="/terms" className="hover:text-[#555]">Terms</Link> •{' '}
          <Link href="/" className="hover:text-[#555]">Home</Link>
        </div>
      </footer>
    </div>
  );
}
