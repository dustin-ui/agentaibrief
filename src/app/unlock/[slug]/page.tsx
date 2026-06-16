import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllBlogPosts, getBlogPost } from '@/lib/blog-data';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ source?: string; campaign?: string; ref?: string; error?: string }>;
}

export const metadata: Metadata = {
  title: 'Unlock Article',
  description: 'Enter your email to unlock this AgentAIBrief article.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export async function generateStaticParams() {
  return getAllBlogPosts().map((p) => ({ slug: p.slug }));
}

export default async function BlogUnlockPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const source = query.source || 'instagram';
  const campaign = query.campaign || slug;

  return (
    <div className="min-h-screen bg-[#e8e6e1]">
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#2a2a2a]">
            Agent<span className="text-[#e85d26]">AI</span>Brief
          </Link>
          <Link href="/blog" className="text-sm text-[#666] hover:text-[#2a2a2a]">
            Blog
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
          <section className="pt-2">
            <div className="flex flex-wrap gap-2 mb-5">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs bg-[#f5f0ea] text-[#c44a1a] px-2.5 py-1 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#c44a1a] mb-4">
              AgentAIBrief article
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#2a2a2a] leading-tight mb-5">
              {post.title}
            </h1>
            <p className="text-lg text-[#555] leading-relaxed max-w-2xl mb-8">
              {post.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[#777]">
              <span>By {post.author}</span>
              <span aria-hidden="true">•</span>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </time>
              <span aria-hidden="true">•</span>
              <span>{post.readTime}</span>
            </div>
          </section>

          <aside className="bg-white border border-[#e0dcd4] rounded-2xl p-6 md:p-7 shadow-sm">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c44a1a] mb-3">
                Email unlock
              </p>
              <h2 className="text-2xl font-bold text-[#2a2a2a] mb-3">
                Get instant access
              </h2>
              <p className="text-sm text-[#666] leading-relaxed">
                Enter your email and the article opens immediately. No account setup.
              </p>
            </div>

            {query.error === 'email' && (
              <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                Enter a valid email to unlock the article.
              </p>
            )}

            <form action="/api/unlock-blog" method="POST" className="space-y-3">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="source" value={source} />
              <input type="hidden" name="campaign" value={campaign} />
              {query.ref && <input type="hidden" name="ref" value={query.ref} />}

              <label className="block">
                <span className="text-sm font-semibold text-[#2a2a2a]">Email</span>
                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-lg border border-[#d8d4cc] bg-[#f8f6f1] px-4 py-3 text-[#2a2a2a] outline-none transition focus:border-[#e85d26] focus:ring-2 focus:ring-[#e85d26]/20"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[#2a2a2a]">First name <span className="text-[#888] font-normal">(optional)</span></span>
                <input
                  type="text"
                  name="firstName"
                  autoComplete="given-name"
                  placeholder="Dustin"
                  className="mt-2 w-full rounded-lg border border-[#d8d4cc] bg-[#f8f6f1] px-4 py-3 text-[#2a2a2a] outline-none transition focus:border-[#e85d26] focus:ring-2 focus:ring-[#e85d26]/20"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#e85d26] px-5 py-3 font-bold text-white shadow-[0_4px_0_#c44a1a] transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_#c44a1a]"
              >
                Unlock Article
              </button>
            </form>

            <p className="mt-4 text-xs text-[#888] leading-relaxed">
              You will also receive AgentAIBrief updates. Unsubscribe anytime.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
