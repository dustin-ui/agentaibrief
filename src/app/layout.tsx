import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

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
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
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

export const viewport: Viewport = {
  themeColor: '#e85d26',
  colorScheme: 'light',
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AgentAIBrief',
  url: siteUrl,
  logo: `${siteUrl}/logo.jpg`,
  description,
  founder: {
    '@type': 'Person',
    name: 'Dustin Fox',
    url: 'https://www.foxessellfaster.com',
  },
  sameAs: ['https://instagram.com/dustinmfox'],
};

const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AgentAIBrief',
  url: siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/blog?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        <script defer data-domain="agentaibrief.com" src="https://plausible.io/js/script.js"></script>
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${inter.className}`}>
        <Providers>{children}</Providers>
        <Script src="https://r.wdfl.co/rw.js" data-rewardful="8c937e" />
        <Script id="rewardful-queue" strategy="beforeInteractive">
          {`(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`}
        </Script>
      </body>
    </html>
  );
}
