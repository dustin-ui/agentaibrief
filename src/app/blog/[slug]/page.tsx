import Link from 'next/link';
import { getBlogPost, getAllBlogPosts } from '@/lib/blog-data';
import { SiteHeader } from '@/components/SiteHeader';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface Props {
  params: Promise<{ slug: string }>;
}

const story92Srcdoc = readFileSync(
  join(process.cwd(), 'public/embeds/story92-seller-decision/index.html'),
  'utf8',
)
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;');

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

  for (const rawLine of lines) {
    const line = rawLine.trimStart();
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
    const tdmvMotionMatch = line.match(/^\{\{motion:(tdmv-row(?:53|54|55|56))\}\}$/);
    const story68MotionMatch = line.match(/^\{\{motion:story68-listing-prep\}\}$/);
    const story72MotionMatch = line.match(/^\{\{motion:story72-automation-scout\}\}$/);
    const story76MotionMatch = line.match(/^\{\{motion:story76-ai-adoption\}\}$/);
    const story92MotionMatch = line.match(/^\{\{motion:story92-seller-decision\}\}$/);
    const chatgptVoiceMotionMatch = line.match(
      /^\{\{motion:chatgpt-voice-computer-control\}\}$/,
    );
    const gpt56MotionMatch = line.match(/^\{\{motion:gpt56-ai-operator\}\}$/);
    const motionMatch = line.match(/^\{\{motion:nine-ai-operating-cycles\}\}$/);
    const youtubeMatch = line.match(/^\{\{youtube:([a-zA-Z0-9_-]{6,})\}\}$/);
    const imageMatch = line.match(/^\{\{image:([^|}]+)\|(.+)\}\}$/);
    const downloadsMatch = line.match(/^\{\{downloads:three-ai-loops\}\}$/);
    const reelFunnelDownloadsMatch = line.match(
      /^\{\{downloads:instagram-reel-ad-funnel\}\}$/,
    );
    const story92DownloadMatch = line.match(/^\{\{download:story92-seller-skill\}\}$/);
    const openHouseFeedbackDownloadMatch = line.match(
      /^\{\{download:open-house-feedback-site-skill\}\}$/,
    );
    const socialSearchConsoleDownloadMatch = line.match(
      /^\{\{download:social-search-console-skill\}\}$/,
    );
    const propertyDossierMotionMatch = line.match(
      /^\{\{motion:(property-dossier-(?:scope|evidence|package))\}\}$/,
    );
    const propertyDossierDownloadMatch = line.match(
      /^\{\{download:property-dossier-skill\}\}$/,
    );
    const singlePropertySiteMotionMatch = line.match(
      /^\{\{motion:(single-property-site-(?:photo-plan|confidence-gate|page-system))\}\}$/,
    );
    const singlePropertySiteDownloadMatch = line.match(
      /^\{\{download:single-property-site-skill\}\}$/,
    );
    if (singlePropertySiteMotionMatch) {
      closeLists();
      closeTable();
      const motionId = singlePropertySiteMotionMatch[1];
      html.push(`<div class="visual-breakdown" style="margin:28px 0;"><iframe title="Animated single property website workflow" src="/embeds/${motionId}/index.html" style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px;overflow:hidden;background:#071014;display:block;" loading="lazy"></iframe></div>`);
    } else if (propertyDossierMotionMatch) {
      closeLists();
      closeTable();
      const motionId = propertyDossierMotionMatch[1];
      html.push(`<div class="visual-breakdown" style="margin:28px 0;"><iframe title="Animated property due-diligence workflow" src="/embeds/${motionId}/index.html" style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px;overflow:hidden;background:#071217;display:block;" loading="lazy"></iframe></div>`);
    } else if (chatgptVoiceMotionMatch) {
      closeLists();
      closeTable();
      html.push(`<div class="visual-breakdown" style="margin:28px 0;"><iframe title="Animated ChatGPT Voice computer-control workflow" src="/embeds/chatgpt-voice-computer-control/index.html?autoplay=1" style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px;overflow:hidden;background:#07151b;display:block;" loading="eager"></iframe></div>`);
    } else if (story92MotionMatch) {
      closeLists();
      closeTable();
      html.push(`<div class="visual-breakdown" style="margin:28px 0;"><iframe title="Animated seller decision workflow" srcDoc="${story92Srcdoc}" style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px;overflow:hidden;background:#101114;display:block;" loading="eager"></iframe></div>`);
    } else if (story76MotionMatch) {
      closeLists();
      closeTable();
      html.push(`<div class="visual-breakdown" style="margin:28px 0;"><iframe title="Animated AI adoption workflow" src="/embeds/story76-ai-adoption/index.html?autoplay=1" style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px;overflow:hidden;background:#101114;display:block;" loading="eager"></iframe></div>`);
    } else if (story72MotionMatch) {
      closeLists();
      closeTable();
      html.push(`<div class="visual-breakdown" style="margin:28px 0;"><iframe title="Animated automation discovery workflow" src="/embeds/story72-automation-scout/index.html?autoplay=1" style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px;overflow:hidden;background:#101114;display:block;" loading="eager"></iframe></div>`);
    } else if (story68MotionMatch) {
      closeLists();
      closeTable();
      html.push(`<div class="visual-breakdown" style="margin:28px 0;"><iframe title="Animated listing preparation workflow" src="/embeds/story68-listing-prep/index.html?autoplay=1" style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px;overflow:hidden;background:#101114;display:block;" loading="eager"></iframe></div>`);
    } else if (tdmvMotionMatch) {
      closeLists();
      closeTable();
      const motionId = tdmvMotionMatch[1];
      html.push(`<div class="visual-breakdown" style="margin:28px 0;"><iframe title="Animated story breakdown" src="/embeds/${motionId}/index.html" style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px;overflow:hidden;background:#071014;display:block;" loading="lazy"></iframe></div>`);
    } else if (gpt56MotionMatch) {
      closeLists();
      closeTable();
      html.push(`<div class="visual-breakdown" style="margin:28px 0;"><iframe title="GPT-5.6 AI operator workflow" srcDoc="&lt;!doctype html&gt;&lt;html&gt;&lt;head&gt;&lt;meta charset=&quot;utf-8&quot;&gt;&lt;meta name=&quot;viewport&quot; content=&quot;width=device-width,initial-scale=1&quot;&gt;&lt;style&gt;
*{box-sizing:border-box}body{margin:0;background:#071014;color:#fff;font-family:Inter,Arial,sans-serif;overflow:hidden}.scene{position:relative;width:100vw;height:100vh;background:radial-gradient(circle at 76% 22%,#26333a 0,#0b171c 34%,#071014 70%);isolation:isolate}.grid{position:absolute;inset:-20%;background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:44px 44px;transform:perspective(500px) rotateX(56deg) translateY(25%);animation:grid 7s linear infinite}.glow{position:absolute;width:42vmin;height:42vmin;border:2px solid #e85d26;border-radius:50%;right:8%;top:5%;box-shadow:0 0 55px rgba(232,93,38,.32),inset 0 0 38px rgba(232,93,38,.2);animation:orbit 8s linear infinite}.glow:before,.glow:after{content:&quot;&quot;;position:absolute;border-radius:50%;inset:18%;border:1px dashed rgba(255,255,255,.65)}.glow:after{inset:40%;border:0;background:#e85d26;box-shadow:0 0 30px #e85d26;animation:pulse 1.7s ease-in-out infinite}.copy{position:absolute;left:6%;top:10%;width:62%;z-index:4}.eyebrow{display:inline-flex;padding:6px 10px;border:1px solid #e85d26;color:#ffb08c;background:rgba(7,16,20,.82);font-size:clamp(9px,1.4vw,14px);font-weight:900;letter-spacing:.12em;text-transform:uppercase;animation:rise 6s ease-in-out infinite}.headline{margin:14px 0 0;font-size:clamp(27px,6.2vw,68px);line-height:.92;font-weight:950;letter-spacing:-.045em;text-shadow:0 7px 24px #000;animation:headline 6s ease-in-out infinite}.headline em{display:block;color:#e85d26;font-style:normal}.cards{position:absolute;left:6%;right:6%;bottom:18%;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;z-index:5}.card{position:relative;overflow:hidden;min-height:68px;padding:13px 12px;background:rgba(238,242,241,.94);color:#071014;border-top:5px solid #e85d26;box-shadow:0 14px 35px rgba(0,0,0,.4);transform:translateY(90px);opacity:0;animation:card 6.4s cubic-bezier(.2,.8,.2,1) infinite;animation-delay:calc(var(--i)*.34s)}.card b{display:block;font-size:clamp(10px,1.65vw,18px);line-height:1}.card span{display:block;margin-top:6px;font-size:clamp(8px,1.1vw,12px);font-weight:700;color:#4c5a60}.card:after{content:&quot;&quot;;position:absolute;left:0;bottom:0;height:3px;width:0;background:#e85d26;animation:fill 6.4s ease-in-out infinite;animation-delay:calc(var(--i)*.34s)}.rail{position:absolute;left:6%;right:6%;bottom:9%;height:6px;background:rgba(255,255,255,.15);border-radius:20px;overflow:hidden;z-index:5}.progress{height:100%;width:22%;background:#e85d26;box-shadow:0 0 18px #e85d26;animation:progress 5.6s ease-in-out infinite}.sweep{position:absolute;top:-20%;bottom:-20%;left:-35%;width:28%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);transform:skewX(-18deg);animation:sweep 5.4s ease-in-out infinite;z-index:6}.stamp{position:absolute;right:7%;top:12%;padding:7px 10px;border-radius:999px;background:#fff;color:#071014;font-weight:950;font-size:clamp(8px,1.2vw,12px);z-index:7;animation:stamp 2s ease-in-out infinite}.stamp:before{content:&quot;LIMITED PREVIEW&quot;}
@keyframes grid{to{background-position:44px 44px}}@keyframes orbit{to{transform:rotate(360deg)}}@keyframes pulse{50%{transform:scale(1.28);opacity:.7}}@keyframes rise{0%,100%{transform:translateY(8px);opacity:.65}20%,78%{transform:translateY(0);opacity:1}}@keyframes headline{0%,100%{transform:translateX(-22px);opacity:.55}18%,78%{transform:translateX(0);opacity:1}}@keyframes card{0%{transform:translateY(90px);opacity:0}18%,72%{transform:translateY(0);opacity:1}100%{transform:translateY(-22px);opacity:0}}@keyframes fill{18%{width:0}68%{width:100%}100%{width:100%}}@keyframes progress{0%{transform:translateX(-110%)}75%,100%{transform:translateX(460%)}}@keyframes sweep{0%,8%{left:-35%}62%,100%{left:125%}}@keyframes stamp{50%{transform:scale(1.06);box-shadow:0 0 0 8px rgba(232,93,38,.12)}}@media(max-width:620px){.copy{top:9%;width:72%}.headline{font-size:26px}.glow{right:2%;top:7%;width:31vmin;height:31vmin}.cards{bottom:19%;grid-template-columns:repeat(2,1fr);gap:5px}.card{min-height:45px;padding:7px;border-top-width:3px}.card span{display:none}.rail{bottom:10%}.stamp{right:4%;top:8%}}
&lt;/style&gt;&lt;/head&gt;&lt;body&gt;&lt;div class=&quot;scene&quot;&gt;&lt;div class=&quot;grid&quot;&gt;&lt;/div&gt;&lt;div class=&quot;glow&quot;&gt;&lt;/div&gt;&lt;div class=&quot;copy&quot;&gt;&lt;div class=&quot;eyebrow&quot;&gt;Scoped work. Visible proof.&lt;/div&gt;&lt;div class=&quot;headline&quot;&gt;GPT-5.6&lt;em&gt;AI Operator&lt;/em&gt;&lt;/div&gt;&lt;/div&gt;&lt;div class=&quot;stamp&quot;&gt;&lt;/div&gt;&lt;div class=&quot;cards&quot;&gt;&lt;div class=&quot;card&quot; style=&quot;--i:0&quot;&gt;&lt;b&gt;PERMISSIONS&lt;/b&gt;&lt;span&gt;least access needed&lt;/span&gt;&lt;/div&gt;&lt;div class=&quot;card&quot; style=&quot;--i:1&quot;&gt;&lt;b&gt;APPROVALS&lt;/b&gt;&lt;span&gt;people control impact&lt;/span&gt;&lt;/div&gt;&lt;div class=&quot;card&quot; style=&quot;--i:2&quot;&gt;&lt;b&gt;LOGS&lt;/b&gt;&lt;span&gt;every step recorded&lt;/span&gt;&lt;/div&gt;&lt;div class=&quot;card&quot; style=&quot;--i:3&quot;&gt;&lt;b&gt;QA&lt;/b&gt;&lt;span&gt;results get tested&lt;/span&gt;&lt;/div&gt;&lt;/div&gt;&lt;div class=&quot;rail&quot;&gt;&lt;div class=&quot;progress&quot;&gt;&lt;/div&gt;&lt;/div&gt;&lt;div class=&quot;sweep&quot;&gt;&lt;/div&gt;&lt;/div&gt;&lt;/body&gt;&lt;/html&gt;" style="width:100%;aspect-ratio:16/9;border:0;border-radius:10px;overflow:hidden;background:#071014;display:block;" loading="lazy"></iframe></div>`);
    } else if (motionMatch) {
      closeLists();
      closeTable();
      html.push(`<div class="visual-breakdown" style="margin:28px 0;"><iframe title="Nine AI Systems animated breakdown" srcDoc="&lt;!doctype html&gt;&lt;html&gt;&lt;head&gt;&lt;meta charset=&quot;utf-8&quot;&gt;&lt;style&gt;
*{box-sizing:border-box}body{margin:0;background:#071317;color:#fff;font-family:Inter,Arial,sans-serif;overflow:hidden}.scene{position:relative;width:100vw;height:100vh;background:#071317}.photo{position:absolute;inset:0;background-image:linear-gradient(90deg,rgba(7,19,23,.92),rgba(7,19,23,.62),rgba(7,19,23,.28)),url(&quot;https://agentaibrief.com/blog/nine-ai-operating-cycles-real-estate-business/ai-operating-systems-dashboard.jpg&quot;);background-size:cover;background-position:center;filter:saturate(1.08);transform:scale(1.06);animation:push 8s ease-in-out infinite}.grid{position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.055) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(90deg,#000,transparent 78%);animation:grid 7s linear infinite}.orb{position:absolute;width:36vmin;height:36vmin;border:2px solid #e85d26;border-radius:50%;right:8%;top:11%;opacity:.55;animation:spin 9s linear infinite}.orb:before,.orb:after{content:&quot;&quot;;position:absolute;inset:14%;border:1px solid rgba(255,255,255,.5);border-radius:50%}.orb:after{inset:31%;background:#e85d26;box-shadow:0 0 28px #e85d26;opacity:.75}.content{position:absolute;left:6%;top:10%;width:58%;z-index:2}.kicker{display:inline-flex;border:1px solid #e85d26;background:rgba(255,255,255,.1);padding:6px 10px;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.title{font-size:clamp(28px,6vw,62px);line-height:.95;font-weight:950;margin:16px 0 14px;max-width:760px;text-shadow:0 3px 18px rgba(0,0,0,.55);animation:title 6s ease-in-out infinite}.cards{position:absolute;right:6%;bottom:13%;display:grid;gap:12px;width:min(330px,35vw);z-index:3}.card{background:rgba(255,255,255,.94);color:#071317;border-left:9px solid #e85d26;padding:14px 16px;box-shadow:0 14px 34px rgba(0,0,0,.35);transform:translateX(85px);opacity:0;animation:card 6s ease-in-out infinite;animation-delay:calc(var(--i)*.42s)}.card b{display:block;font-size:22px;line-height:1}.card span{font-size:13px;font-weight:700;color:#3f4b50}.steps{position:absolute;left:6%;bottom:11%;right:44%;height:44px;border-top:2px solid rgba(255,255,255,.45);display:flex;align-items:flex-end;gap:10px}.steps span{position:relative;display:inline-flex;align-items:center;justify-content:center;min-width:88px;padding:8px 10px;background:#e85d26;color:#071317;font-weight:900;font-size:12px;transform:translateY(24px);opacity:0;animation:step 6s ease-in-out infinite;animation-delay:calc(var(--i)*.28s)}.steps span:before{content:&quot;&quot;;position:absolute;top:-18px;width:10px;height:10px;border-radius:50%;background:#fff;box-shadow:0 0 18px #fff}.footer{position:absolute;left:6%;right:6%;bottom:4%;font-size:16px;line-height:1.3;color:#d8eef2;z-index:4}.sweep{position:absolute;left:-40%;top:0;width:38%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);transform:skewX(-18deg);animation:sweep 5.8s ease-in-out infinite}.badge{position:absolute;right:9%;top:14%;font-weight:950;font-size:14px;color:#071317;background:#fff;padding:10px 12px;border-radius:999px;box-shadow:0 10px 24px rgba(0,0,0,.3);animation:pulse 2s ease-in-out infinite}.badge:after{content:&quot;network&quot;;text-transform:uppercase}.pulse{position:absolute;right:13%;top:34%;width:12px;height:12px;border-radius:50%;background:#e85d26;box-shadow:0 0 0 0 #e85d26;animation:ring 2s infinite}
@keyframes push{0%,100%{transform:scale(1.06) translateX(0)}50%{transform:scale(1.12) translateX(-1.5%)}}@keyframes grid{to{background-position:42px 42px}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes title{0%,100%{transform:translateY(10px);opacity:.86}24%,76%{transform:translateY(0);opacity:1}}@keyframes card{0%{transform:translateX(85px);opacity:0}18%,72%{transform:translateX(0);opacity:1}100%{transform:translateX(-28px);opacity:.25}}@keyframes step{0%{transform:translateY(24px);opacity:0}20%,80%{transform:translateY(0);opacity:1}100%{transform:translateY(-8px);opacity:.2}}@keyframes sweep{0%,10%{left:-44%}55%,100%{left:110%}}@keyframes pulse{50%{transform:scale(1.06)}}@keyframes ring{70%{box-shadow:0 0 0 34px rgba(255,255,255,0)}100%{box-shadow:0 0 0 0 rgba(255,255,255,0)}}@media(max-width:620px){.content{left:6%;top:8%;width:72%}.kicker{font-size:10px;padding:4px 7px}.title{font-size:25px;line-height:1}.cards{left:6%;right:auto;top:51%;bottom:auto;width:46%;display:grid;gap:4px}.card{padding:4px 6px;border-left-width:4px}.card b{font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.card span{display:none}.card:nth-child(3){display:none}.steps{display:none}.footer{display:none}.orb{width:30vmin;height:30vmin;right:4%;top:11%}.badge{right:6%;top:10%;font-size:9px;padding:6px 8px}.pulse{right:12%;top:33%}}
&lt;/style&gt;&lt;/head&gt;&lt;body&gt;&lt;div class=&quot;scene&quot;&gt;&lt;div class=&quot;photo&quot;&gt;&lt;/div&gt;&lt;div class=&quot;grid&quot;&gt;&lt;/div&gt;&lt;div class=&quot;orb&quot;&gt;&lt;/div&gt;&lt;div class=&quot;badge&quot;&gt;&lt;/div&gt;&lt;div class=&quot;pulse&quot;&gt;&lt;/div&gt;&lt;div class=&quot;content&quot;&gt;&lt;div class=&quot;kicker&quot;&gt;Not prompts. Operating systems.&lt;/div&gt;&lt;div class=&quot;title&quot;&gt;Nine AI Systems&lt;/div&gt;&lt;/div&gt;&lt;div class=&quot;cards&quot;&gt;&lt;div class=&quot;card&quot; style=&quot;--i:0&quot;&gt;&lt;b&gt;SEO&lt;/b&gt;&lt;span&gt;find gaps&lt;/span&gt;&lt;/div&gt;&lt;div class=&quot;card&quot; style=&quot;--i:1&quot;&gt;&lt;b&gt;CONTENT&lt;/b&gt;&lt;span&gt;mine signals&lt;/span&gt;&lt;/div&gt;&lt;div class=&quot;card&quot; style=&quot;--i:2&quot;&gt;&lt;b&gt;QA&lt;/b&gt;&lt;span&gt;verify output&lt;/span&gt;&lt;/div&gt;&lt;/div&gt;&lt;div class=&quot;steps&quot;&gt;&lt;span style=&quot;--i:0&quot;&gt;Signal&lt;/span&gt;&lt;span style=&quot;--i:1&quot;&gt;Draft&lt;/span&gt;&lt;span style=&quot;--i:2&quot;&gt;Approve&lt;/span&gt;&lt;span style=&quot;--i:3&quot;&gt;Publish&lt;/span&gt;&lt;/div&gt;&lt;div class=&quot;footer&quot;&gt;Useful AI is inspected handoffs: input, decision rule, output, verification.&lt;/div&gt;&lt;div class=&quot;sweep&quot;&gt;&lt;/div&gt;&lt;/div&gt;&lt;/body&gt;&lt;/html&gt;" style="width:100%;aspect-ratio:16/9;border:0;border-radius:10px;overflow:hidden;background:#071317;display:block;" loading="lazy"></iframe></div>`);
    } else if (youtubeMatch) {
      closeLists();
      closeTable();
      const videoId = youtubeMatch[1];
      const videoTitle =
        videoId === '8h_PcDQaYcU'
          ? 'ChatGPT Voice Is Basically Jarvis For Real Estate'
          : videoId === 'oDyAZL4sIBw'
            ? 'AI Open House Feedback Website: Build A QR Code Site And Seller Dashboard'
          : videoId === 'A5Cby3kshBg'
            ? 'AI Real Estate Ad Funnel Tutorial With ChatGPT And Meta Ads'
          : 'AgentAIBrief video';
      html.push(`<div class="my-8 overflow-hidden rounded-2xl border border-[#e0dcd4] bg-white shadow-sm"><div class="relative w-full bg-black" style="padding-top:56.25%"><iframe class="absolute inset-0 h-full w-full" src="https://www.youtube-nocookie.com/embed/${videoId}" title="${videoTitle}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div><p class="m-0 border-t border-[#e0dcd4] px-4 py-3 text-sm text-[#666]">Player not loading? <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noreferrer" class="font-semibold text-[#e85d26] hover:underline">Watch this video directly on YouTube</a>.</p></div>`);
    } else if (imageMatch) {
      closeLists();
      closeTable();
      const src = imageMatch[1];
      const caption = processInline(imageMatch[2]);
      html.push(`<figure class="my-8 overflow-hidden rounded-2xl border border-[#e0dcd4] bg-white shadow-sm"><img src="${src}" alt="${caption.replace(/<[^>]*>/g, '')}" class="w-full h-auto"/><figcaption class="border-t border-[#e0dcd4] bg-white px-4 py-3 text-sm leading-relaxed text-[#555]">${caption}</figcaption></figure>`);
    } else if (story92DownloadMatch) {
      closeLists();
      closeTable();
      html.push(`<div class="my-8"><a href="/downloads/seller-presentation-skill/agent-edition.zip" download class="group flex flex-col rounded-2xl border border-[#e0dcd4] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#e85d26] hover:shadow-md" aria-label="Download the seller presentation Agent Edition ZIP"><span class="text-xs font-bold uppercase tracking-[0.16em] text-[#e85d26]">Agent Edition ZIP</span><strong class="mt-2 text-xl leading-tight text-[#2a2a2a]">Animated Seller Presentation Skill</strong><span class="mt-2 text-sm leading-relaxed text-[#666]">The exact reusable skill package with setup, intake, design, motion, claim-ledger, calculator, compliance, and QA instructions.</span><span class="mt-4 inline-flex items-center font-bold text-[#e85d26] group-hover:underline">Download file ↓</span><span class="mt-1 text-xs text-[#777]">16,724 bytes · SHA-256 verified</span></a></div>`);
    } else if (openHouseFeedbackDownloadMatch) {
      closeLists();
      closeTable();
      html.push(`<div class="my-8"><a href="/downloads/open-house-feedback-site-ai-skill/build-open-house-feedback-site.md" download class="group flex flex-col rounded-2xl border border-[#e0dcd4] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#e85d26] hover:shadow-md" aria-label="Download the Build Open House Feedback Site skill file"><span class="text-xs font-bold uppercase tracking-[0.16em] text-[#e85d26]">AI Skill Markdown</span><strong class="mt-2 text-xl leading-tight text-[#2a2a2a]">Build Open House Feedback Site</strong><span class="mt-2 text-sm leading-relaxed text-[#666]">The exact reusable skill for building a mobile guest-feedback experience, private owner dashboard, persistent storage, and a verified QR-ready public link.</span><span class="mt-4 inline-flex items-center font-bold text-[#e85d26] group-hover:underline">Download SKILL.md ↓</span><span class="mt-1 text-xs text-[#777]">4,664 bytes · source file preserved</span></a></div>`);
    } else if (socialSearchConsoleDownloadMatch) {
      closeLists();
      closeTable();
      html.push(`<div class="my-8"><a href="/downloads/social-search-console/connect-social-to-search-console.zip" download class="group flex flex-col rounded-2xl border-2 border-[#e85d26] bg-[#fffaf5] p-6 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg" aria-label="Download the Connect Social to Search Console AI skill ZIP"><span class="text-xs font-bold uppercase tracking-[0.16em] text-[#e85d26]">Free AI Skill ZIP</span><strong class="mt-2 text-2xl leading-tight text-[#2a2a2a]">Connect Social Profiles to Search Console</strong><span class="mt-2 text-sm leading-relaxed text-[#555]">A reusable setup, verification, baseline, reporting, and content-improvement workflow for supported Instagram, TikTok, X, and YouTube accounts.</span><span class="mt-5 inline-flex w-fit items-center rounded-full bg-[#e85d26] px-5 py-3 font-bold text-white group-hover:bg-[#c94d1e]">Download skill ZIP ↓</span><span class="mt-3 text-xs text-[#777]">6,266 bytes · SHA-256 verified · source archive preserved</span></a></div>`);
    } else if (singlePropertySiteDownloadMatch) {
      closeLists();
      closeTable();
      html.push(`<div class="my-8"><a href="/downloads/single-property-site-skill/single-property-site-skill.zip" download class="group flex flex-col rounded-2xl border-2 border-[#e85d26] bg-[#fffaf5] p-6 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg" aria-label="Download the single property website AI skill ZIP"><span class="text-xs font-bold uppercase tracking-[0.16em] text-[#e85d26]">Free AI Skill ZIP</span><strong class="mt-2 text-2xl leading-tight text-[#2a2a2a]">Build a Single Property Website</strong><span class="mt-2 text-sm leading-relaxed text-[#555]">The complete reusable workflow for photo classification, human approval, image optimization, branded and unbranded pages, optional registration, deployment, and QA.</span><span class="mt-5 inline-flex w-fit items-center rounded-full bg-[#e85d26] px-5 py-3 font-bold text-white group-hover:bg-[#c94d1e]">Download skill ZIP ↓</span><span class="mt-3 text-xs text-[#777]">13,389 bytes · SHA-256 verified · supplied source preserved</span></a></div>`);
    } else if (propertyDossierDownloadMatch) {
      closeLists();
      closeTable();
      html.push(`<div class="my-8"><a href="/downloads/property-research-skill/property-dossier-agent-skill.zip" download class="group flex flex-col rounded-2xl border-2 border-[#e85d26] bg-[#fffaf5] p-6 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg" aria-label="Download the property dossier AI skill ZIP"><span class="text-xs font-bold uppercase tracking-[0.16em] text-[#e85d26]">Free AI Skill ZIP</span><strong class="mt-2 text-2xl leading-tight text-[#2a2a2a]">Build a Property Due-Diligence Dossier</strong><span class="mt-2 text-sm leading-relaxed text-[#555]">The exact reusable package for jurisdiction mapping, official-source research, document retrieval, evidence reconciliation, quality control, and delivery.</span><span class="mt-5 inline-flex w-fit items-center rounded-full bg-[#e85d26] px-5 py-3 font-bold text-white group-hover:bg-[#c94d1e]">Download skill ZIP ↓</span><span class="mt-3 text-xs text-[#777]">22,803 bytes · SHA-256 verified · source archive preserved</span></a></div>`);
    } else if (reelFunnelDownloadsMatch) {
      closeLists();
      closeTable();
      const downloads = [
        {
          title: 'Instagram Reel Ad Funnel',
          description:
            'Platform-neutral campaign skill for video views, a viewer custom audience, and a retargeting lead campaign.',
          href: '/downloads/instagram-reel-ad-funnel/run-instagram-reel-ad-funnel.zip',
          size: '3,655 bytes',
        },
        {
          title: 'Instagram Reel Ad Funnel for Sierra',
          description:
            'The complete funnel plus Sierra Interactive full-registration tracking, source, routing, and action-plan steps.',
          href: '/downloads/instagram-reel-ad-funnel/run-instagram-reel-ad-funnel-sierra.zip',
          size: '4,278 bytes',
        },
      ];
      html.push(`<div class="my-8 grid gap-4 sm:grid-cols-2">${downloads.map((item) => `<a href="${item.href}" download class="group flex h-full flex-col rounded-2xl border border-[#e0dcd4] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#e85d26] hover:shadow-md" aria-label="Download ${item.title} ZIP"><span class="text-xs font-bold uppercase tracking-[0.16em] text-[#e85d26]">AI Skill ZIP</span><strong class="mt-2 text-lg leading-tight text-[#2a2a2a]">${item.title}</strong><span class="mt-2 flex-1 text-sm leading-relaxed text-[#666]">${item.description}</span><span class="mt-4 inline-flex items-center font-bold text-[#e85d26] group-hover:underline">Download skill ↓</span><span class="mt-1 text-xs text-[#777]">${item.size} · archive verified</span></a>`).join('')}</div>`);
    } else if (downloadsMatch) {
      closeLists();
      closeTable();
      const downloads = [
        {
          title: 'Market Pulse Loop',
          description: 'Weekly market intelligence workflow with scoring, source rotation, metrics, and review guidance.',
          href: '/downloads/ai-loops/market-pulse-loop-agent-edition.zip',
          size: '17,386 bytes',
        },
        {
          title: 'Evergreen Content Loop',
          description: 'Research, topic scoring, drafting, editorial review, publishing, and retrospective workflow.',
          href: '/downloads/ai-loops/evergreen-content-loop-agent-edition.zip',
          size: '11,944 bytes',
        },
        {
          title: 'AI Visibility Loop',
          description: 'Query tracking, answer coverage scoring, citation review, and improvement planning workflow.',
          href: '/downloads/ai-loops/ai-visibility-loop-agent-edition.zip',
          size: '12,336 bytes',
        },
      ];
      html.push(`<div class="my-8 grid gap-4 sm:grid-cols-3">${downloads.map((item) => `<a href="${item.href}" download class="group flex h-full flex-col rounded-2xl border border-[#e0dcd4] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#e85d26] hover:shadow-md" aria-label="Download ${item.title} Agent Edition ZIP"><span class="text-xs font-bold uppercase tracking-[0.16em] text-[#e85d26]">Agent Edition ZIP</span><strong class="mt-2 text-lg leading-tight text-[#2a2a2a]">${item.title}</strong><span class="mt-2 flex-1 text-sm leading-relaxed text-[#666]">${item.description}</span><span class="mt-4 inline-flex items-center font-bold text-[#e85d26] group-hover:underline">Download file ↓</span><span class="mt-1 text-xs text-[#777]">${item.size}</span></a>`).join('')}</div>`);
    } else if (line.startsWith('## ')) {
      closeLists();
      closeTable();
      const heading = line.slice(3);
      html.push(`<h2 id="${headingId(heading)}" class="text-2xl font-bold text-[#2a2a2a] mt-10 mb-4">${processInline(heading)}</h2>`);
    } else if (line.startsWith('### ')) {
      closeLists();
      closeTable();
      const heading = line.slice(4);
      html.push(`<h3 id="${headingId(heading)}" class="text-xl font-semibold text-[#2a2a2a] mt-8 mb-3">${processInline(heading)}</h3>`);
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

function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function processInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-[#f5f0ea] px-1.5 py-0.5 rounded text-sm break-all whitespace-normal">$1</code>')
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
      <SiteHeader activeHref="/blog" />

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
