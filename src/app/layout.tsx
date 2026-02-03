import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgentAIBrief - AI News for Real Estate Professionals',
  description: 'We read all the AI news so you don\'t have to — and tell you exactly how to use it to sell more homes.',
  keywords: 'AI, artificial intelligence, real estate, realtor, agent, technology, proptech',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
