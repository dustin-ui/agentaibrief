import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber, isConfigured } from '@/lib/constant-contact';
import { getBlogPost } from '@/lib/blog-data';
import { getOrCreateReferral } from '@/lib/referral';
import { saveSubscriber } from '@/lib/subscribers';
import { supabaseAdmin } from '@/lib/supabase';

type UnlockBody = {
  email: string;
  firstName?: string;
  slug: string;
  source?: string;
  campaign?: string;
  ref?: string;
};

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

async function parseBody(request: NextRequest): Promise<UnlockBody> {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await request.json();
  }

  const formData = await request.formData();
  return {
    email: String(formData.get('email') || ''),
    firstName: String(formData.get('firstName') || '') || undefined,
    slug: String(formData.get('slug') || ''),
    source: String(formData.get('source') || '') || undefined,
    campaign: String(formData.get('campaign') || '') || undefined,
    ref: String(formData.get('ref') || '') || undefined,
  };
}

async function trackUnlock(
  email: string,
  slug: string,
  request: NextRequest,
  source?: string,
  campaign?: string,
) {
  try {
    const sb = supabaseAdmin();
    await sb.from('blog_unlock_events').insert({
      email,
      slug,
      source: source || 'manychat',
      campaign: campaign || slug,
      user_agent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer'),
    });
  } catch (error) {
    console.warn('[unlock-blog] Could not record unlock event:', error);
  }
}

function blogUrl(request: NextRequest, slug: string, source?: string, campaign?: string) {
  const url = new URL(`/blog/${slug}`, request.url);
  url.searchParams.set('utm_source', source || 'instagram');
  url.searchParams.set('utm_medium', 'manychat');
  url.searchParams.set('utm_campaign', campaign || slug);
  url.searchParams.set('unlocked', '1');
  return url;
}

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, slug, source, campaign, ref } = await parseBody(request);
    const post = getBlogPost(slug);
    const isFormSubmit = !(request.headers.get('content-type') || '').includes('application/json');

    if (!post) {
      if (isFormSubmit) {
        return NextResponse.redirect(new URL('/blog', request.url), { status: 303 });
      }
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    if (!email || !email.includes('@')) {
      const errorUrl = new URL(`/unlock/${slug}`, request.url);
      errorUrl.searchParams.set('error', 'email');
      if (source) errorUrl.searchParams.set('source', source);
      if (campaign) errorUrl.searchParams.set('campaign', campaign);

      if (isFormSubmit) {
        return NextResponse.redirect(errorUrl, { status: 303 });
      }
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    await saveSubscriber(email, 'free', firstName);
    await getOrCreateReferral(email, ref || undefined);
    await trackUnlock(email, slug, request, source, campaign);

    const listId = process.env.CC_LIST_ID;
    if (listId && await isConfigured()) {
      try {
        await addSubscriber(email, [listId], [`blog-unlock-${slug}`], firstName);
      } catch (error) {
        console.warn('[unlock-blog] Constant Contact sync failed after local save:', error);
      }
    }

    const redirectUrl = blogUrl(request, slug, source, campaign);
    const response = isFormSubmit
      ? NextResponse.redirect(redirectUrl, { status: 303 })
      : NextResponse.json({ success: true, redirectUrl: redirectUrl.pathname + redirectUrl.search });

    response.cookies.set('aab_blog_unlocked', 'true', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: ONE_YEAR_SECONDS,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Unlock blog error:', error);
    const isFormSubmit = !(request.headers.get('content-type') || '').includes('application/json');
    if (isFormSubmit) {
      return NextResponse.redirect(new URL('/blog?unlock=error', request.url), { status: 303 });
    }
    return NextResponse.json({ error: 'Failed to unlock article. Please try again.' }, { status: 500 });
  }
}

