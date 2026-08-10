import Image from 'next/image';
import Link from 'next/link';
import type { BlogPost } from '@/lib/blog-data';

interface BlogPostCardProps {
  post: BlogPost;
  featured?: boolean;
}

function formatBlogDate(date: string): string {
  const [year, month, day] = date.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function BlogPostCard({ post, featured = false }: BlogPostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      aria-label={`Read ${post.title}`}
      className="group block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e85d26]"
    >
      <article
        className={`h-full overflow-hidden rounded-2xl border-2 border-[#d4d0c8] bg-[#f5f0ea] transition duration-200 group-hover:-translate-y-0.5 group-hover:border-[#e85d26] group-hover:shadow-lg ${
          featured ? 'md:grid md:grid-cols-[1.2fr_0.8fr]' : ''
        }`}
      >
        {post.coverImage ? (
          <div className={`overflow-hidden bg-[#202020] ${featured ? 'min-h-[260px]' : ''}`}>
            <Image
              src={post.coverImage}
              alt={post.coverAlt || post.title}
              width={1200}
              height={800}
              priority={featured}
              sizes={featured ? '(min-width: 768px) 60vw, 100vw' : '(min-width: 768px) 50vw, 100vw'}
              className="h-full min-h-[220px] w-full object-cover transition duration-300 group-hover:scale-[1.015]"
            />
          </div>
        ) : (
          <div
            className={`flex min-h-[180px] items-end p-6 ${featured ? 'md:min-h-full' : ''}`}
            style={{ background: 'linear-gradient(135deg, #202020 0%, #34302c 70%, #e85d26 150%)' }}
          >
            <span
              className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#ff9a70]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              AgentAIBrief Original
            </span>
          </div>
        )}

        <div className={`flex flex-col ${featured ? 'justify-center p-7 sm:p-9' : 'p-6'}`}>
          <div className="mb-3 flex flex-wrap gap-2">
            {post.tags.slice(0, featured ? 4 : 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#e8e2da] px-2.5 py-1 text-[0.7rem] font-semibold text-[#c44a1a]"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3
            className={`font-extrabold leading-tight text-[#2a2a2a] transition-colors group-hover:text-[#e85d26] ${
              featured ? 'text-2xl sm:text-3xl' : 'text-xl'
            }`}
          >
            {post.title}
          </h3>
          <p className={`mt-3 leading-relaxed text-[#666] ${featured ? '' : 'line-clamp-3 text-sm'}`}>
            {post.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#777]">
            <span>{post.author}</span>
            <span aria-hidden="true">•</span>
            <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
            <span aria-hidden="true">•</span>
            <span>{post.readTime}</span>
          </div>
          <span className="mt-5 text-sm font-bold text-[#e85d26]">Read the article →</span>
        </div>
      </article>
    </Link>
  );
}
