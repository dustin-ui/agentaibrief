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
  // Simple markdown-to-HTML: headers, bold, links, tables, images, code blocks, paragraphs
  const lines = content.split('\n');
  const html: string[] = [];
  let inCodeBlock = false;
  let inUl = false;
  let inOl = false;
  let inTable = false;

  const closeLists = () => {
    if (inUl) {
      html.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      html.push('</ol>');
      inOl = false;
    }
  };

  const closeTable = () => {
    if (inTable) {
      html.push('</tbody></table></div>');
      inTable = false;
    }
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      closeLists();
      closeTable();
      inCodeBlock = !inCodeBlock;
      html.push(inCodeBlock ? '<pre class="bg-[#f5f0ea] rounded-lg p-4 overflow-x-auto text-sm my-4"><code>' : '</code></pre>');
      continue;
    }
    if (inCodeBlock) {
      html.push(line.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '\n');
      continue;
    }
    const gpt56MotionMatch = line.match(/^\{\{motion:gpt56-ai-operator\}\}$/);
    const youtubeMatch = line.match(/^\{\{youtube:([a-zA-Z0-9_-]{6,})\}\}$/);
    const imageMatch = line.match(/^\{\{image:([^|}]+)\|(.+)\}\}$/);
    if (gpt56MotionMatch) {
      closeLists();
      closeTable();
      html.push('<div class="my-8 overflow-hidden rounded-2xl border border-[#e0dcd4] bg-[#071014] shadow-sm"><iframe title="GPT-5.6 AI operator workflow" src="/embeds/gpt56-ai-operator/" style="width:100%;aspect-ratio:16/9;border:0;display:block;background:#071014" loading="lazy"></iframe></div>');
    } else if (youtubeMatch) {
      closeLists();
      closeTable();
      const videoId = youtubeMatch[1];
      html.push(`<div class="my-8 overflow-hidden rounded-2xl border border-[#e0dcd4] bg-black shadow-sm"><div class="relative w-full" style="padding-top:56.25%"><iframe class="absolute inset-0 h-full w-full" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div></div>`);
    } else if (imageMatch) {
      closeLists();
      closeTable();
      const src = imageMatch[1];
      const caption = processInline(imageMatch[2]);
      html.push(`<figure class="my-8 overflow-hidden rounded-2xl border border-[#e0dcd4] bg-white shadow-sm"><img src="${src}" alt="${caption.replace(/<[^>]*>/g, '')}" class="w-full h-auto"/><figcaption class="border-t border-[#e0dcd4] bg-white px-4 py-3 text-sm leading-relaxed text-[#555]">${caption}</figcaption></figure>`);
    } else if (line.startsWith('## ')) {
      closeLists();
      closeTable();
      html.push(`<h2 class="text-2xl font-bold text-[#2a2a2a] mt-10 mb-4">${processInline(line.slice(3))}</h2>`);
    } else if (line.startsWith('### ')) {
      closeLists();
      closeTable();
      html.push(`<h3 class="text-xl font-semibold text-[#2a2a2a] mt-8 mb-3">${processInline(line.slice(4))}</h3>`);
    } else if (line.startsWith('> ')) {
      closeLists();
      closeTable();
      html.push(`<blockquote class="border-l-4 border-[#e85d26] bg-white rounded-r-lg px-5 py-4 my-6 text-[#2a2a2a] font-semibold leading-relaxed">${processInline(line.slice(2))}</blockquote>`);
    } else if (line.trim().startsWith('|') && line.includes('|')) {
      closeLists();
      const cells = line.trim().slice(1, -1).split('|').map((c) => c.trim());
      const isDivider = cells.every((c) => /^:?-{3,}:?$/.test(c));
      if (isDivider) continue;
      if (!inTable) {
        html.push('<div class="my-6 overflow-x-auto rounded-xl border border-[#e0dcd4] bg-white"><table class="min-w-full text-left text-sm"><tbody>');
        inTable = true;
      }
      html.push(`<tr>${cells.map((cell) => `<td class="border-b border-[#e0dcd4] px-3 py-3 align-top text-[#555]">${processInline(cell)}</td>`).join('')}</tr>`);
    } else if (line.startsWith('- ')) {
      closeTable();
      if (!inUl) {
        closeLists();
        html.push('<ul class="list-disc pl-6 mb-6 space-y-2">');
        inUl = true;
      }
      html.push(`<li class="text-[#555] leading-relaxed">${processInline(line.slice(2))}</li>`);
    } else if (/^\d+\.\s/.test(line)) {
      closeTable();
      if (!inOl) {
        closeLists();
        html.push('<ol class="list-decimal pl-6 mb-6 space-y-2">');
        inOl = true;
      }
      html.push(`<li class="text-[#555] leading-relaxed">${processInline(line.replace(/^\d+\.\s/, ''))}</li>`);
    } else if (line.trim() === '') {
      closeLists();
      closeTable();
    } else {
      closeLists();
      closeTable();
      html.push(`<p class="text-[#555] leading-relaxed mb-4">${processInline(line)}</p>`);
    }
  }
  closeLists();
  closeTable();
  return html.join('\n');
}

function processInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-[#f5f0ea] px-1.5 py-0.5 rounded text-sm">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[#e85d26] hover:underline">$1</a>');
}

function formatPostDate(date: string): string {
  const [year, month, day] = date.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const allPosts = getAllBlogPosts().filter((p) => p.slug !== slug).slice(0, 2);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'AgentAIBrief',
      logo: {
        '@type': 'ImageObject',
        url: 'https://agentaibrief.com/logo.jpg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://agentaibrief.com/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
  };
  const faqJsonLd = post.faq
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: post.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
    : null;

  return (
    <div className="min-h-screen bg-[#e8e6e1]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-2xl font-bold text-[#2a2a2a]">Agent<span className="text-[#e85d26]">AI</span>Brief</span>
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

        <article className="bg-white border border-[#e0dcd4] rounded-2xl p-6 md:p-10 shadow-sm">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs bg-[#f5f0ea] text-[#c44a1a] px-2.5 py-1 rounded-full font-medium">{tag}</span>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#2a2a2a] mb-4 leading-tight">{post.title}</h1>

          <div className="flex items-center gap-3 text-sm text-[#888] mb-10 pb-6 border-b border-[#e0dcd4]">
            <span>By {post.author}</span>
            <span>•</span>
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
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
          <a href="/subscribe" className="inline-flex px-6 py-3 bg-[#e85d26] text-white font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors">
            Subscribe Free →
          </a>
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
