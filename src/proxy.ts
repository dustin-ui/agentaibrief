import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith('/unlock/') && request.cookies.get('aab_blog_unlocked')?.value === 'true') {
    const slug = pathname.replace('/unlock/', '');
    if (slug) {
      const url = request.nextUrl.clone();
      url.pathname = `/blog/${slug}`;
      url.search = '';
      url.searchParams.set('utm_source', searchParams.get('source') || 'instagram');
      url.searchParams.set('utm_medium', 'manychat');
      url.searchParams.set('utm_campaign', searchParams.get('campaign') || slug);
      url.searchParams.set('unlocked', '1');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/unlock/:path*',
};
