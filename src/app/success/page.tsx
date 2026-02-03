import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/">
            <h1 className="text-2xl font-bold text-gray-900">
              Agent<span className="text-blue-600">AI</span>Brief
            </h1>
          </Link>
        </div>
      </header>

      {/* Success Content */}
      <main className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to AgentAIBrief!
        </h2>
        <p className="text-lg text-gray-600 mb-2">
          Your subscription is confirmed.
        </p>
        <p className="text-lg text-gray-600 mb-8">
          Check your email for login details and your first briefing.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </Link>
          <Link
            href="/subscribe"
            className="inline-block border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 transition-colors"
          >
            View Plans
          </Link>
        </div>
      </main>
    </div>
  );
}
