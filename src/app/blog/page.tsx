import { BlogPostCard } from '@/components/BlogPostCard';
import { SiteHeader } from '@/components/SiteHeader';
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
      <SiteHeader activeHref="/blog" />

      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-extrabold text-[#2a2a2a]">Blog</h1>
          <p className="max-w-2xl text-lg text-[#666]">
            Expert guides, tool reviews, and AI strategies built for real estate professionals.
          </p>
        </div>

        <div className="grid gap-7 md:grid-cols-2">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </main>

      <footer className="mt-12 border-t border-[#e0dcd4]">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <p className="text-center text-sm text-[#888]">© 2026 AgentAIBrief.com • Built for real estate professionals</p>
        </div>
      </footer>
    </div>
  );
}
