import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Trial',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
