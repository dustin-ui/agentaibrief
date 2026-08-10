import { BlogPostCard } from '@/components/BlogPostCard';
import { NewsFeed } from '@/components/NewsFeed';
import { SiteHeader } from '@/components/SiteHeader';
import { TransformationSpotlight } from '@/components/TransformationSpotlight';
import { TrendingBar } from '@/components/TrendingBar';
import { getAllBlogPosts } from '@/lib/blog-data';
import { SUPPORT_MAILTO } from '@/lib/nav-items';
import featuredStory from '../../featured-story.json';

export default function Home() {
  const posts = getAllBlogPosts();
  const featuredPost = posts.find((post) => post.slug === featuredStory.slug) ?? posts[0];
  const chronologicalPosts = posts.filter((post) => post.slug !== featuredPost?.slug);

  return (
    <div className="min-h-screen animate-fade-in" style={{ background: '#e8e6e1' }}>
      <SiteHeader />

      <main>
        <TransformationSpotlight />

        <section className="py-14 sm:py-20" aria-labelledby="articles-heading">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="mb-9 max-w-3xl">
              <p
                className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e85d26]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Written by Dustin Fox
              </p>
              <h1
                id="articles-heading"
                className="text-[2.25rem] font-extrabold tracking-tight text-[#2a2a2a] sm:text-[3rem]"
                style={{ letterSpacing: '-1.5px' }}
              >
                AgentAIBrief Articles
              </h1>
              <p className="mt-3 text-base leading-7 text-[#666] sm:text-lg">
                Original AI playbooks, experiments, and systems built for working real estate agents.
              </p>
            </div>

            {featuredPost && (
              <section aria-labelledby="featured-article-heading">
                <h2
                  id="featured-article-heading"
                  className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#e85d26]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Featured Article
                </h2>
                <BlogPostCard post={featuredPost} featured />
              </section>
            )}

            <section className="mt-14" aria-labelledby="all-articles-heading">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b-2 border-[#d4d0c8] pb-4">
                <div>
                  <h2 id="all-articles-heading" className="text-2xl font-extrabold text-[#2a2a2a]">
                    All Articles
                  </h2>
                  <p className="mt-1 text-sm text-[#777]">Newest first, including every July and August article.</p>
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#777]">
                  {posts.length} articles
                </span>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {chronologicalPosts.map((post) => (
                  <BlogPostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          </div>
        </section>

        <TrendingBar />

        <section className="py-14 sm:py-20" aria-labelledby="live-news-heading">
          <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
            <div className="mb-8 sm:mb-10">
              <p
                className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e85d26]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Updated throughout the day
              </p>
              <h2
                id="live-news-heading"
                className="text-[2rem] font-extrabold tracking-tight text-[#2a2a2a] sm:text-[2.5rem]"
                style={{ letterSpacing: '-1px' }}
              >
                Live AI News
              </h2>
              <p className="mt-2 text-[#777]">The continuously updating feed, newest story first.</p>
            </div>
            <NewsFeed />
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-[#d4d0c8] py-10 text-center text-xs text-[#5a5a5a]">
        <div>© 2026 AgentAIBrief.com</div>
        <div className="mt-2 flex flex-wrap justify-center gap-4 sm:gap-6">
          <a href={SUPPORT_MAILTO} className="transition-colors hover:text-[#e85d26]">
            Support
          </a>
          <a href="/privacy" className="transition-colors hover:text-[#e85d26]">
            Privacy Policy
          </a>
          <a href="/terms" className="transition-colors hover:text-[#e85d26]">
            Terms of Service
          </a>
        </div>
      </footer>
    </div>
  );
}
