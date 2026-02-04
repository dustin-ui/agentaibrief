import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AgentAIBrief — AI-Powered Daily Briefings for Real Estate Agents';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #1e40af 100%)',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '64px', fontWeight: 800, color: '#fff' }}>
            Agent
          </span>
          <span style={{ fontSize: '64px', fontWeight: 800, color: '#93c5fd' }}>
            AI
          </span>
          <span style={{ fontSize: '64px', fontWeight: 800, color: '#fff' }}>
            Brief
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontSize: '28px',
              color: '#bfdbfe',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            AI-Powered Daily Briefings for Real Estate Agents
          </span>
          <span
            style={{
              fontSize: '22px',
              color: '#93c5fd',
              textAlign: 'center',
              maxWidth: '700px',
              marginTop: '8px',
            }}
          >
            We read all the AI news so you don&apos;t have to — and tell you
            exactly how to use it to sell more homes.
          </span>
        </div>

        {/* Features bar */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            marginTop: '40px',
            padding: '16px 32px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.1)',
          }}
        >
          <span style={{ fontSize: '18px', color: '#fff' }}>🏠 Agent Angles</span>
          <span style={{ fontSize: '18px', color: '#fff' }}>💡 Implementation Tips</span>
          <span style={{ fontSize: '18px', color: '#fff' }}>🛠️ AI Tool Reviews</span>
        </div>

        {/* Built by */}
        <span
          style={{
            fontSize: '16px',
            color: '#93c5fd',
            marginTop: '30px',
          }}
        >
          Built by Dustin Fox • Fox Homes Team • $277M Volume
        </span>
      </div>
    ),
    { ...size },
  );
}
