import type { Metadata } from 'next';
import { DemoBriefing } from './DemoBriefing';

export const metadata: Metadata = {
  title: 'Sample Daily Briefing',
  description:
    'See what an AgentAIBrief daily briefing looks like — real AI news with Agent Angles and implementation tips for real estate professionals.',
  openGraph: {
    title: 'Sample Daily Briefing | AgentAIBrief',
    description:
      'See what your daily AI briefing looks like — curated news with actionable angles for real estate pros.',
  },
};

export default function DemoPage() {
  return <DemoBriefing />;
}
