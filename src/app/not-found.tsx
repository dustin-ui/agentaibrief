import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#e8e6e1] flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <Link href="/" className="inline-block mb-6">
          <span className="text-2xl font-bold text-[#2a2a2a]">
            Agent<span className="text-[#e85d26]">AI</span>Brief
          </span>
        </Link>
        <p className="text-6xl font-extrabold text-[#e85d26] mb-3">404</p>
        <h1 className="text-2xl font-bold text-[#2a2a2a] mb-3">
          We couldn&apos;t find that page
        </h1>
        <p className="text-[#666] mb-8">
          The page you&apos;re looking for moved or never existed. Try one of these instead:
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="px-5 py-2.5 bg-[#e85d26] text-white text-sm font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors">
            AI News
          </Link>
          <Link href="/blog" className="px-5 py-2.5 border border-[#d8d4cc] text-[#2a2a2a] text-sm font-medium rounded-lg hover:bg-[#f0ece4] transition-colors">
            Blog
          </Link>
          <Link href="/tools" className="px-5 py-2.5 border border-[#d8d4cc] text-[#2a2a2a] text-sm font-medium rounded-lg hover:bg-[#f0ece4] transition-colors">
            AI Tools
          </Link>
          <Link href="/prompts" className="px-5 py-2.5 border border-[#d8d4cc] text-[#2a2a2a] text-sm font-medium rounded-lg hover:bg-[#f0ece4] transition-colors">
            Prompts
          </Link>
        </div>
      </div>
    </div>
  );
}
