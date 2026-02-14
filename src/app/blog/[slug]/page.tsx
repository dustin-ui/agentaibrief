import Link from 'next/link';
import { getBlogPost, getAllBlogPosts } from '@/lib/blog-data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    alternates: { canonical: `https://agentaibrief.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

function renderMarkdown(content: string) {
  // Simple markdown-to-HTML: headers, bold, links, code blocks, paragraphs
  const lines = content.split('\n');
  const html: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      html.push(inCodeBlock ? '<pre class="bg-[#f5f0ea] rounded-lg p-4 overflow-x-auto text-sm my-4"><code>' : '</code></pre>');
      continue;
    }
    if (inCodeBlock) {
      html.push(line.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '\n');
      continue;
    }
    if (line.startsWith('## ')) {
      html.push(`<h2 class="text-2xl font-bold text-[#2a2a2a] mt-10 mb-4">${processInline(line.slice(3))}</h2>`);
    } else if (line.startsWith('### ')) {
      html.push(`<h3 class="text-xl font-semibold text-[#2a2a2a] mt-8 mb-3">${processInline(line.slice(4))}</h3>`);
    } else if (line.startsWith('- ')) {
      html.push(`<li class="ml-4 text-[#555] leading-relaxed">${processInline(line.slice(2))}</li>`);
    } else if (/^\d+\.\s/.test(line)) {
      html.push(`<li class="ml-4 text-[#555] leading-relaxed list-decimal">${processInline(line.replace(/^\d+\.\s/, ''))}</li>`);
    } else if (line.trim() === '') {
      html.push('<br/>');
    } else {
      html.push(`<p class="text-[#555] leading-relaxed mb-4">${processInline(line)}</p>`);
    }
  }
  return html.join('\n');
}

function processInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-[#f5f0ea] px-1.5 py-0.5 rounded text-sm">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[#e85d26] hover:underline">$1</Link>');
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const allPosts = getAllBlogPosts().filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-[#e8e6e1]">
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-[#2a2a2a]">Agent<span className="text-[#e85d26]">AI</span>Brief</h1>
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

      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/blog" className="text-sm text-[#e85d26] hover:underline mb-6 inline-block">← Back to Blog</Link>

        <article>
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs bg-[#f5f0ea] text-[#c44a1a] px-2.5 py-1 rounded-full font-medium">{tag}</span>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#2a2a2a] mb-4 leading-tight">{post.title}</h1>

          <div className="flex items-center gap-3 text-sm text-[#888] mb-10 pb-6 border-b border-[#e0dcd4]">
            <span>By {post.author}</span>
            <span>•</span>
            <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />
        </article>

        {/* CTA */}
        <div className="mt-12 bg-[#f5f0ea] border border-[#e0dcd4] rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-[#2a2a2a] mb-3">Get Daily AI Briefings</h3>
          <p className="text-[#666] mb-6">Join thousands of agents getting actionable AI strategies every morning.</p>
          <Link href="/subscribe" className="inline-flex px-6 py-3 bg-[#e85d26] text-[#2a2a2a] font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors">
            Subscribe Free →
          </Link>
        </div>

        {/* Related Posts */}
        {allPosts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-[#2a2a2a] mb-6">More Articles</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {allPosts.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="block border border-[#e0dcd4] rounded-lg p-5 hover:border-[#e85d26] transition-colors">
                  <h4 className="font-semibold text-[#2a2a2a] mb-2 line-clamp-2">{p.title}</h4>
                  <p className="text-sm text-[#888]">{p.readTime}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[#e0dcd4] mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <p className="text-sm text-[#888] text-center">© 2026 AgentAIBrief.com • Built for real estate professionals</p>
        </div>
      </footer>
    </div>
  );
}
