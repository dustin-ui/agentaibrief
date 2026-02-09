'use client';

export default function LaunchStrategy() {
  return (
    <div style={{ 
      maxWidth: 900, 
      margin: '0 auto', 
      padding: '40px 24px', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#1a1a2e',
      lineHeight: 1.7
    }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>🚀 AgentAIBrief Launch Strategy</h1>
        <p style={{ color: '#666', fontSize: 18 }}>The playbook to 500+ subscribers by end of March</p>
        <div style={{ width: 60, height: 4, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', margin: '20px auto', borderRadius: 2 }} />
      </div>

      {/* Phase 1 */}
      <Section num="1" title="Team Beta (Feb 10–16)" color="#6366f1">
        <Item icon="📧" title="Soft Launch to Fox Homes Team (~36 agents)">
          <ul>
            <li>Send personalized email from Dustin: "I built something for us — try it free"</li>
            <li>Include direct link to free signup (no paywall)</li>
            <li>Ask for honest feedback via reply or quick Google Form</li>
            <li>Goal: 20-30 signups + qualitative feedback on content value</li>
          </ul>
        </Item>
        <Item icon="📝" title="Content Seeding">
          <ul>
            <li>Publish 2-3 free issues before any public push</li>
            <li>Topics that showcase range: AI listing descriptions, ChatGPT for follow-ups, AI market analysis</li>
            <li>Each email = proof of value for later marketing</li>
          </ul>
        </Item>
        <Item icon="🔧" title="Fix & Polish">
          <ul>
            <li>Test full Stripe checkout flow end-to-end</li>
            <li>Ensure welcome emails fire correctly</li>
            <li>Get CC campaign_data scope for API email sending</li>
            <li>Verify referral tracking works</li>
          </ul>
        </Item>
      </Section>

      {/* Phase 2 */}
      <Section num="2" title="Hype Week (Feb 17–23)" color="#8b5cf6">
        <Item icon="🎬" title="Instagram Reels Blitz (7 reels in 7 days)">
          <p><strong>Use @dustinmfox (16k followers)</strong> — don't start a new account. Your audience already trusts you.</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '12px 0' }}>
            <thead>
              <tr style={{ background: '#f5f3ff' }}>
                <th style={thStyle}>Day</th>
                <th style={thStyle}>Reel Topic</th>
                <th style={thStyle}>Hook</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={tdStyle}>Mon</td><td style={tdStyle}>AI wrote my listing in 30 sec</td><td style={tdStyle}>"I used to spend 45 min on listing descriptions..."</td></tr>
              <tr><td style={tdStyle}>Tue</td><td style={tdStyle}>ChatGPT follow-up that got a reply</td><td style={tdStyle}>"This lead ghosted me for 3 months..."</td></tr>
              <tr><td style={tdStyle}>Wed</td><td style={tdStyle}>AI tools most agents don't know</td><td style={tdStyle}>"5 AI tools I use daily that you've never heard of"</td></tr>
              <tr><td style={tdStyle}>Thu</td><td style={tdStyle}>Before/after: AI-edited listing photo</td><td style={tdStyle}>"$0 spent on staging. Here's what AI did instead"</td></tr>
              <tr><td style={tdStyle}>Fri</td><td style={tdStyle}>Why I started AgentAIBrief</td><td style={tdStyle}>"I kept getting the same question from agents..."</td></tr>
              <tr><td style={tdStyle}>Sat</td><td style={tdStyle}>AI market analysis demo</td><td style={tdStyle}>"I analyzed 500 comps in 2 minutes"</td></tr>
              <tr><td style={tdStyle}>Sun</td><td style={tdStyle}>Free vs paid tier comparison</td><td style={tdStyle}>"Here's exactly what you get for free..."</td></tr>
            </tbody>
          </table>
          <p style={{ fontSize: 14, color: '#666' }}>Every reel ends with: "Link in bio → free AI newsletter for agents"</p>
        </Item>
        <Item icon="📱" title="Instagram Stories (Daily)">
          <ul>
            <li>Behind-the-scenes of writing the newsletter</li>
            <li>Polls: "Would you use AI for [task]?" — engagement bait + market research</li>
            <li>Countdown sticker to public launch day</li>
            <li>Swipe-up / link sticker to agentaibrief.com</li>
          </ul>
        </Item>
        <Item icon="💬" title="DM Strategy">
          <ul>
            <li>Anyone who engages with reels → DM: "Hey! Noticed you liked the AI post. I'm launching a free newsletter specifically for agents — want early access?"</li>
            <li>Use ManyChat or manual DMs for first 100</li>
          </ul>
        </Item>
      </Section>

      {/* Phase 3 */}
      <Section num="3" title="Public Launch (Feb 24–28)" color="#ec4899">
        <Item icon="📨" title="Blast the Book List (5-6k contacts)">
          <ul>
            <li>Subject: "I built something for you (free)"</li>
            <li>Position as: "The AI newsletter I wished existed when I started using ChatGPT for real estate"</li>
            <li>Free tier only — no hard sell on paid</li>
            <li>Expected conversion: 5-10% = 250-600 free subscribers day one</li>
          </ul>
        </Item>
        <Item icon="🎯" title="Paid Ads (Budget: $500-1k test)">
          <p><strong>Strategy: Retarget first, prospect second</strong></p>
          <ul>
            <li><strong>Week 1:</strong> Retarget @dustinmfox engagers + website visitors ($200)</li>
            <li><strong>Week 2:</strong> Lookalike audience from subscriber list ($300)</li>
            <li><strong>Week 3:</strong> Cold interest targeting: "real estate agent" + "artificial intelligence" ($200-500)</li>
            <li>Ad creative: Top-performing reel repurposed as ad</li>
            <li>Target CPA: $1-3 per free subscriber</li>
          </ul>
        </Item>
        <Item icon="🤝" title="Referral Program Goes Live">
          <ul>
            <li>3 referrals → Pro upgrade (1 month free)</li>
            <li>10 referrals → Inner Circle session</li>
            <li>25 referrals → 1-on-1 AI setup call with Dustin</li>
            <li>Include referral CTA in every email footer</li>
          </ul>
        </Item>
      </Section>

      {/* Phase 4 */}
      <Section num="4" title="Growth Engine (March)" color="#f59e0b">
        <Item icon="📊" title="Content Flywheel">
          <ul>
            <li>2x/week free emails (Tue + Fri)</li>
            <li>1x/week Pro-exclusive deep dive (Wed)</li>
            <li>2x/month Inner Circle live Q&A (1st + 3rd Thursday)</li>
            <li>Repurpose every email → 2-3 social posts</li>
          </ul>
        </Item>
        <Item icon="🎙️" title="Guest & Collab Strategy">
          <ul>
            <li>Invite 2-3 AI-forward agents for Inner Circle Q&A sessions</li>
            <li>Cross-promote with non-competing RE newsletters</li>
            <li>Pitch yourself to RE podcasts as "the AI guy" — you have 2,000+ reviews as credibility</li>
          </ul>
        </Item>
        <Item icon="💰" title="Conversion Optimization">
          <ul>
            <li>Free → Pro conversion target: 5-8% ($19 × 25-50 subs = $475-950/mo)</li>
            <li>Pro → IC conversion target: 10-15% ($99 × 3-8 subs = $297-792/mo)</li>
            <li>March revenue target: $750-1,700/mo</li>
            <li>Add annual pricing: Pro $149/yr (save 35%), IC $799/yr (save 33%)</li>
          </ul>
        </Item>
        <Item icon="🧲" title="Sticky Content: Prompt Library">
          <ul>
            <li>Build a searchable prompt vault (Pro+ exclusive)</li>
            <li>Categories: Listings, Follow-ups, Market Analysis, Social Media, Client Communication</li>
            <li>This becomes the reason people DON'T cancel — it's a growing tool, not just a newsletter</li>
          </ul>
        </Item>
      </Section>

      {/* Competitive Edge */}
      <Section num="5" title="Why This Wins" color="#10b981">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          <Card title="No Direct Competitor" desc="AiM Academy is $199/mo. Free newsletters aren't RE-specific. You own the $19-99/mo sweet spot." />
          <Card title="Built-in Audience" desc="16k IG followers + 5-6k email list + 2,000+ Google reviews = instant credibility." />
          <Card title="Practitioner Credibility" desc="You're not a guru selling courses. You're an active agent sharing what actually works." />
          <Card title="AI is Urgent Now" desc="Agents feel behind. This isn't 'nice to have' — it's 'I need this before I fall further behind.'" />
        </div>
      </Section>

      {/* Milestones */}
      <Section num="6" title="Milestone Targets" color="#ef4444">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fef2f2' }}>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Milestone</th>
              <th style={thStyle}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={tdStyle}>Feb 16</td><td style={tdStyle}>30 team beta signups</td><td style={tdStyle}>$0</td></tr>
            <tr><td style={tdStyle}>Feb 23</td><td style={tdStyle}>100 free subs from IG push</td><td style={tdStyle}>$0</td></tr>
            <tr><td style={tdStyle}>Feb 28</td><td style={tdStyle}>500 free subs (book list blast)</td><td style={tdStyle}>$0</td></tr>
            <tr><td style={tdStyle}>Mar 7</td><td style={tdStyle}>First 10 Pro subscribers</td><td style={tdStyle}>$190/mo</td></tr>
            <tr><td style={tdStyle}>Mar 15</td><td style={tdStyle}>First 3 Inner Circle members</td><td style={tdStyle}>$487/mo</td></tr>
            <tr><td style={tdStyle}>Mar 31</td><td style={tdStyle}>1,000 free / 30 Pro / 5 IC</td><td style={tdStyle}>$1,065/mo</td></tr>
          </tbody>
        </table>
      </Section>

      {/* Key Decision */}
      <div style={{ background: '#fffbeb', border: '2px solid #f59e0b', borderRadius: 12, padding: 24, margin: '32px 0' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 20 }}>⚡ Key Decision: @dustinmfox vs New Account</h3>
        <p style={{ margin: 0 }}><strong>Recommendation: Use @dustinmfox.</strong> Starting a new account means starting from zero. Your 16k followers already associate you with real estate expertise. AI content will actually <em>increase</em> engagement because it's novel + valuable. The algorithm rewards accounts that pivot to trending topics. You can always spin off a dedicated account later once you prove the content format works.</p>
      </div>

      <div style={{ textAlign: 'center', marginTop: 48, padding: 24, color: '#999', fontSize: 14 }}>
        <p>AgentAIBrief Launch Strategy — Last updated Feb 8, 2026</p>
        <p>Built by Waylon 🐾</p>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #e5e7eb', fontSize: 14, fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '10px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 14 };

function Section({ num, title, color, children }: { num: string; title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>{num}</div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Item({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '20px 24px', marginBottom: 16, border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0 0 10px', fontSize: 17 }}>{icon} {title}</h3>
      <div style={{ fontSize: 15 }}>{children}</div>
    </div>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 20, border: '1px solid #bbf7d0' }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 15, color: '#166534' }}>{title}</h4>
      <p style={{ margin: 0, fontSize: 14, color: '#444' }}>{desc}</p>
    </div>
  );
}
