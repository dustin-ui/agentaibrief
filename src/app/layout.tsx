import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = 'https://agentaibrief.com';
const title = 'AgentAIBrief — AI-Powered Daily Briefings for Real Estate Agents';
const description =
  'We read all the AI news so you don\'t have to — and tell you exactly how to use it to sell more homes. Daily briefings with Agent Angles, implementation tips, and tool reviews built for real estate pros.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s | AgentAIBrief',
  },
  description,
  keywords: [
    'AI for real estate agents',
    'real estate AI tools',
    'AI news briefing',
    'proptech',
    'real estate technology',
    'AI virtual staging',
    'real estate marketing AI',
    'agent AI tools',
    'daily briefing real estate',
    'Dustin Fox',
    'Fox Homes',
  ],
  authors: [{ name: 'Dustin Fox', url: 'https://www.foxessellfaster.com' }],
  creator: 'AgentAIBrief',
  publisher: 'AgentAIBrief',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'AgentAIBrief',
    title,
    description,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'AgentAIBrief — AI News for Real Estate Pros',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [`${siteUrl}/og-image.png`],
    creator: '@dustinmfox',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
