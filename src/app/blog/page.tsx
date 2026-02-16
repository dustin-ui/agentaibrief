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
    <div className="min-h-screen bg-[#e8e6e1]">
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-[#2a2a2a]">
              Agent<span className="text-[#e85d26]">AI</span>Brief
            </h1>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm text-[#666] hover:text-[#2a2a2a]">News</Link>
            <Link href="/blog" className="text-sm text-[#2a2a2a] font-medium border-b-2 border-[#e85d26] pb-0.5">Blog</Link>
            <Link href="/tools" className="text-sm text-[#666] hover:text-[#2a2a2a]">AI Tools</Link>
            <Link href="/prompts" className="text-sm text-[#666] hover:text-[#2a2a2a]">Prompts</Link>
            <Link href="/videos" className="text-sm text-[#666] hover:text-[#2a2a2a]">Video Library</Link>
            <Link href="/subscribe" className="text-sm text-[#666] hover:text-[#2a2a2a]">Subscribe</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-[#2a2a2a] mb-4">Blog</h2>
          <p className="text-lg text-[#666] max-w-2xl">
            Expert guides, tool reviews, and AI strategies built for real estate professionals.
          </p>
        </div>

        <div className="space-y-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
              <article className="border border-[#e0dcd4] rounded-xl p-6 hover:border-[#e85d26] hover:shadow-md transition-all">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-[#f5f0ea] text-[#c44a1a] px-2.5 py-1 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-bold text-[#2a2a2a] group-hover:text-[#e85d26] transition-colors mb-2">
                  {post.title}
                </h3>
                <p className="text-[#666] mb-3 line-clamp-2">{post.description}</p>
                <div className="flex items-center gap-3 text-sm text-[#888]">
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

        <div className="mt-16 bg-[#f5f0ea] border border-[#e0dcd4] rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-[#2a2a2a] mb-3">Never Miss an Update</h3>
          <p className="text-[#666] mb-6">Get AI strategies for real estate delivered to your inbox every morning.</p>
          <a href="/subscribe" className="inline-flex px-6 py-3 bg-[#e85d26] text-white font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors">
            Subscribe Free →
          </a>
        </div>
      </main>

      <footer className="border-t border-[#e0dcd4] mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <p className="text-sm text-[#888] text-center">© 2026 AgentAIBrief.com • Built for real estate professionals</p>
        </div>
      </footer>
    </div>
  );
}
