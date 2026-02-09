import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blog-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — AI Strategies for Real Estate Agents',
  description: 'Expert articles on AI tools, marketing strategies, and technology tips for real estate professionals. Stay ahead with AgentAIBrief.',
  alternates: { canonical: 'https://agentaibrief.com/blog' },
};

export default function BlogIndex() {
  const posts = getAllBlogPosts();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-gray-900">
              Agent<span className="text-blue-600">AI</span>Brief
            </h1>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">News</Link>
            <Link href="/blog" className="text-sm text-gray-900 font-medium border-b-2 border-blue-600 pb-0.5">Blog</Link>
            <Link href="/tools" className="text-sm text-gray-600 hover:text-gray-900">AI Tools</Link>
            <Link href="/prompts" className="text-sm text-gray-600 hover:text-gray-900">Prompts</Link>
            <Link href="/videos" className="text-sm text-gray-600 hover:text-gray-900">Video Library</Link>
            <Link href="/subscribe" className="text-sm text-gray-600 hover:text-gray-900">Subscribe</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Blog</h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Expert guides, tool reviews, and AI strategies built for real estate professionals.
          </p>
        </div>

        <div className="space-y-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
              <article className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-3 line-clamp-2">{post.description}</p>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{post.author}</span>
                  <span>•</span>
                  <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="mt-16 bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Never Miss an Update</h3>
          <p className="text-gray-600 mb-6">Get AI strategies for real estate delivered to your inbox every morning.</p>
          <a href="/subscribe" className="inline-flex px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Subscribe Free →
          </a>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <p className="text-sm text-gray-500 text-center">© 2026 AgentAIBrief.com • Built for real estate professionals</p>
        </div>
      </footer>
    </div>
  );
}
