import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact AgentAIBrief',
  description:
    'Get in touch with the AgentAIBrief team. Questions about AI tools for real estate, the daily briefing, Inner Circle membership, or partnerships — reach out here.',
  alternates: { canonical: 'https://agentaibrief.com/contact' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
