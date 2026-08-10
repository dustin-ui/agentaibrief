import Link from 'next/link';
import { MobileNav } from '@/components/MobileNav';
import { HOME_NAV_ITEMS, SUPPORT_MAILTO } from '@/lib/nav-items';

interface SiteHeaderProps {
  activeHref?: string;
}

export function SiteHeader({ activeHref }: SiteHeaderProps) {
  return (
    <header
      className="sticky top-0 z-[70] border-b-[3px]"
      style={{ background: '#d4d0c8', borderColor: '#c4c0b8' }}
    >
      <div className="mx-auto flex h-[64px] max-w-[1200px] items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e85d26]"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: '#2a2a2a' }}
          >
            Agent<span style={{ color: '#e85d26' }}>AI</span>Brief
          </Link>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary navigation">
            {HOME_NAV_ITEMS.map((item) => {
              const isActive = item.href === activeHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`text-sm font-medium transition-colors hover:text-[#e85d26] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e85d26] ${
                    isActive ? 'text-[#e85d26]' : 'text-[#555]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href={SUPPORT_MAILTO}
              className="text-sm font-medium text-[#555] transition-colors hover:text-[#e85d26] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e85d26]"
            >
              Support
            </a>
          </nav>
        </div>
        <MobileNav />
      </div>
    </header>
  );
}
