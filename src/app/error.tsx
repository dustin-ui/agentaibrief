'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#e8e6e1] flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <Link href="/" className="inline-block mb-6">
          <span className="text-2xl font-bold text-[#2a2a2a]">
            Agent<span className="text-[#e85d26]">AI</span>Brief
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-[#2a2a2a] mb-3">
          Something went wrong
        </h1>
        <p className="text-[#666] mb-8">
          We hit an unexpected error. You can try again, or head back to the
          homepage.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-[#e85d26] text-white text-sm font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 border border-[#d8d4cc] text-[#2a2a2a] text-sm font-medium rounded-lg hover:bg-[#f0ece4] transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
