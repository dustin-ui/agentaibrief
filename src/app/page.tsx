import Link from 'next/link';
import { NewsFeed } from '@/components/NewsFeed';
import { MobileNav } from '@/components/MobileNav';
import { TransformationSpotlight } from '@/components/TransformationSpotlight';
import { HOME_NAV_ITEMS, SUPPORT_MAILTO } from '@/lib/nav-items';

export default function Home() {
  return (
    <div className="min-h-screen animate-fade-in" style={{ background: '#e8e6e1' }}>
      <header
        className="sticky top-0 z-[70] border-b-[3px]"
        style={{ background: '#d4d0c8', borderColor: '#c4c0b8' }}
      >
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#2a2a2a' }}
            >
              Agent<span style={{ color: '#e85d26' }}>AI</span>Brief
            </Link>
            <nav className="hidden md:flex items-center gap-6" aria-label="Primary navigation">
              {HOME_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium transition-colors text-[#555] hover:text-[#e85d26]"
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={SUPPORT_MAILTO}
                className="text-sm font-medium transition-colors text-[#555] hover:text-[#e85d26]"
              >
                Support
              </a>
            </nav>
          </div>
          <MobileNav />
        </div>
      </header>

      <main>
        <TransformationSpotlight />

        <section className="py-14 sm:py-20" aria-labelledby="news-heading">
          <div className="max-w-[1080px] mx-auto px-4 sm:px-6">
            <div className="mb-8 sm:mb-10">
              <p
                className="text-xs font-bold uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: '#e85d26' }}
              >
                Updated throughout the day
              </p>
              <h1
                id="news-heading"
                className="text-[2rem] sm:text-[2.5rem] font-extrabold tracking-tight"
                style={{ color: '#2a2a2a', letterSpacing: '-1px' }}
              >
                AI News for Agents
              </h1>
            </div>
            <NewsFeed />
          </div>
        </section>
      </main>

      <footer
        className="py-10 text-center text-xs border-t-2"
        style={{ color: '#5a5a5a', borderColor: '#d4d0c8' }}
      >
        <div>© 2026 AgentAIBrief.com</div>
        <div className="mt-2 flex justify-center flex-wrap gap-4 sm:gap-6">
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
