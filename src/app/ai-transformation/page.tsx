import type { Metadata } from 'next';
import Link from 'next/link';

const INTAKE_URL = 'https://forms.gle/Bh1x86bX7tgKzAE99';
const EMAIL = 'Dustin@FoxHomesTeam.com';
const PHONE_DISPLAY = '703-927-1461';
const PHONE_HREF = 'tel:+17039271461';

const packages = [
  {
    name: 'AI Business Foundation',
    eyebrow: 'One day · 6 onsite hours',
    price: '$12,995',
    description: 'For an owner who needs the core workstation, highest-value workflows, and a clear operating plan installed in one focused day.',
    items: ['Pre-install systems audit', 'Complete AI desk kit', 'Priority workflow installation', 'Owner + two participants trained', 'System map and handoff'],
  },
  {
    name: 'AI Business Transformation',
    eyebrow: 'Two days · 12 onsite hours',
    price: '$19,995',
    featured: true,
    description: 'For a business ready to connect multiple workflows, train the team, and leave with a more complete operating system.',
    items: ['Everything in the Foundation', 'Expanded workflow buildout', 'Team roles and operating rhythm', 'Live testing and refinement', 'Deeper hands-on coaching'],
  },
  {
    name: 'AI Business Operating System',
    eyebrow: 'Three days · 18 onsite hours',
    price: '$28,995',
    description: 'For teams that want the deepest implementation, more connected systems, and time to test, refine, and train across the business.',
    items: ['Everything in Transformation', 'Broader system integration', 'Advanced automation opportunities', 'Expanded documentation', 'Executive implementation roadmap'],
  },
];

const capabilities = [
  ['Command center', 'Organize the information, prompts, projects, and decisions your team needs in one usable system.'],
  ['Inbox and communication', 'Create faster ways to sort, draft, follow up, and keep important conversations from disappearing.'],
  ['Content and video', 'Build repeatable systems for scripts, posts, emails, research, and brand-consistent production.'],
  ['Sales and client service', 'Map the moments where better preparation, follow-up, and personalization can improve execution.'],
  ['Team operations', 'Clarify responsibilities, document repeatable work, and train the people who will use the system every day.'],
  ['Reporting and decisions', 'Turn scattered information into useful briefs, scorecards, meeting preparation, and next actions.'],
];

const process = [
  ['01', 'Complete the private intake', 'Tell Dustin about your business, current tools, installation location, and the systems creating the most friction.'],
  ['02', 'Select the right engagement', 'Choose the one-, two-, or three-day package and submit payment securely by card or ACH.'],
  ['03', 'Coordinate dates personally', 'Payment does not place anything on your calendar. Dustin contacts you within 24 hours to confirm availability, agreement, dates, and next steps.'],
  ['04', 'Prepare through the pre-audit', 'Before arrival, Dustin reviews the workflows, access, equipment, and priorities needed to make the onsite time productive.'],
  ['05', 'Install, train, and hand off', 'The systems are built with you, tested in your environment, documented, and handed over with a clear operating plan.'],
];

const faq = [
  ['Does payment book a date?', 'No. Nothing is automatically added to your calendar. Dustin contacts you within 24 hours after payment to coordinate mutually workable dates.'],
  ['What equipment is included?', 'Each package includes a complete desk kit with an allowance of up to $1,500: a Mac mini (16GB/256GB), one 27-inch 4K monitor, keyboard and mouse, webcam, USB microphone, and the necessary hub, cables, surge protection, and packaging. Reasonable substitutions may be made for availability or compatibility.'],
  ['Who can participate?', 'The business owner and two additional participants are included. Additional people or locations can be scoped separately in writing.'],
  ['What happens outside Northern Virginia?', 'Domestic installations more than 75 miles from Fairfax, Virginia add a flat $1,500 travel fee.'],
  ['Will you connect every system we use?', 'The pre-audit determines what can responsibly be completed within the purchased onsite time. Priorities are agreed in advance; access, vendor limits, security requirements, and technical constraints can affect scope.'],
  ['Is ongoing coaching included?', 'Ongoing 30-day coaching is available as a separate add-on. It is not included in the onsite package price.'],
  ['Do you guarantee revenue or specific results?', 'No. The engagement installs systems, workflows, equipment, and training. Business results depend on adoption, execution, market conditions, data quality, and other factors outside the engagement.'],
];

export const metadata: Metadata = {
  title: 'In-Person AI Business Transformation',
  description: 'A private one-, two-, or three-day onsite AI systems installation and coaching engagement with Dustin Fox.',
  alternates: { canonical: '/ai-transformation' },
  openGraph: {
    title: 'In-Person AI Business Transformation with Dustin Fox',
    description: 'Install the equipment, workflows, and AI operating system your business will actually use — in person.',
    url: '/ai-transformation',
  },
};

export default function AITransformationPage() {
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AI Business Transformation',
    provider: { '@type': 'Person', name: 'Dustin Fox' },
    areaServed: 'United States',
    serviceType: 'In-person AI systems installation and business coaching',
    offers: packages.map((item) => ({
      '@type': 'Offer',
      name: item.name,
      price: item.price.replace(/[$,]/g, ''),
      priceCurrency: 'USD',
      url: 'https://agentaibrief.com/ai-transformation',
    })),
  };

  return (
    <main className="min-h-screen" style={{ background: '#e8e6e1', color: '#2a2a2a' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

      <header className="border-b-[3px]" style={{ background: '#d4d0c8', borderColor: '#c4c0b8' }}>
        <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="text-xl font-bold tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Agent<span style={{ color: '#e85d26' }}>AI</span>Brief
          </Link>
          <a href={INTAKE_URL} target="_blank" rel="noreferrer" className="btn-primary px-4 py-2.5 text-xs sm:px-5 sm:text-sm">
            Start private intake
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#202020] px-5 py-20 text-white sm:px-8 sm:py-28">
        <div aria-hidden="true" className="absolute -right-28 -top-40 h-[34rem] w-[34rem] rounded-full bg-[#e85d26]/15" />
        <div className="relative mx-auto max-w-[1200px]">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#ff8b5c]">Private · onsite · built with you</p>
          <h1 className="mt-5 max-w-[940px] text-4xl font-extrabold leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-[5rem]">
            Your business does not need more AI advice.
            <span className="mt-2 block text-[#ff7b45]">It needs the system installed.</span>
          </h1>
          <p className="mt-7 max-w-[760px] text-lg leading-8 text-[#d4d0c8] sm:text-xl">
            Dustin Fox comes onsite to understand how your business actually works, connect the tools,
            install the equipment, build the workflows, and coach your team through using them.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href={INTAKE_URL} target="_blank" rel="noreferrer" className="btn-primary px-7 py-4 text-base">
              Begin the private intake →
            </a>
            <a href="#packages" className="inline-flex items-center justify-center rounded-[10px] border-2 border-[#555] px-7 py-4 text-base font-bold text-white transition-colors hover:border-[#ff7b45] hover:text-[#ff9a70]">
              Compare packages
            </a>
          </div>
          <div className="mt-11 grid max-w-[900px] gap-4 border-t border-[#444] pt-7 text-sm text-[#bbb] sm:grid-cols-3">
            <p><strong className="block text-white">Six hours per day</strong>Focused, in-person implementation</p>
            <p><strong className="block text-white">Complete desk kit</strong>Up to $1,500 included</p>
            <p><strong className="block text-white">Built by an operator</strong>Not a generic seminar or course</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#e85d26]">The difference</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">From scattered tools to one operating system.</h2>
            <p className="mt-5 leading-7 text-[#666]">
              Most businesses already have plenty of software. The problem is that the tools, information,
              people, and workflows do not work together. This engagement starts with the real work and builds from there.
            </p>
            <div className="mt-7 rounded-2xl border-2 border-[#d8d4cc] bg-[#f0ece4] p-6">
              <p className="text-sm font-bold text-[#e85d26]">Operator perspective</p>
              <p className="mt-2 leading-7 text-[#444]">
                The coaching is grounded in the systems Dustin and his team used while growing to approximately
                $300 million in five years — adapted to the client&apos;s business, people, tools, and priorities.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {capabilities.map(([title, description]) => (
              <article key={title} className="glass-card p-6">
                <h3 className="font-bold text-[#2a2a2a]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#666]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="packages" className="scroll-mt-12 bg-[#d4d0c8] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[720px]">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#e85d26]">Choose the implementation depth</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">Three ways to install the system.</h2>
            <p className="mt-4 leading-7 text-[#5a5a5a]">Every package is delivered in person and includes the owner plus two participants.</p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {packages.map((item) => (
              <article
                key={item.name}
                className="relative flex flex-col rounded-2xl border-2 p-7"
                style={{
                  background: item.featured ? '#202020' : '#f0ece4',
                  borderColor: item.featured ? '#e85d26' : '#c4c0b8',
                  color: item.featured ? '#fff' : '#2a2a2a',
                  boxShadow: item.featured ? '0 8px 0 #c44a1a' : 'none',
                }}
              >
                {item.featured && (
                  <span className="absolute -top-3 left-7 rounded-full bg-[#e85d26] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white">Recommended</span>
                )}
                <p className="font-mono text-xs font-bold uppercase tracking-[0.13em] text-[#e85d26]">{item.eyebrow}</p>
                <h3 className="mt-4 text-xl font-extrabold">{item.name}</h3>
                <p className="mt-3 font-mono text-3xl font-extrabold">{item.price}</p>
                <p className={`mt-4 text-sm leading-6 ${item.featured ? 'text-[#bbb]' : 'text-[#666]'}`}>{item.description}</p>
                <ul className={`mt-6 space-y-3 text-sm ${item.featured ? 'text-[#ddd]' : 'text-[#555]'}`}>
                  {item.items.map((entry) => <li key={entry} className="flex gap-2"><span className="text-[#e85d26]">→</span><span>{entry}</span></li>)}
                </ul>
                <a href={INTAKE_URL} target="_blank" rel="noreferrer" className={`mt-8 block rounded-lg px-5 py-3 text-center text-sm font-bold ${item.featured ? 'bg-[#e85d26] text-white' : 'border-2 border-[#2a2a2a] text-[#2a2a2a] hover:border-[#e85d26] hover:text-[#e85d26]'}`}>
                  Choose this engagement
                </a>
              </article>
            ))}
          </div>
          <div className="mt-8 grid gap-5 rounded-2xl border-2 border-[#c4c0b8] bg-[#e8e6e1] p-6 sm:grid-cols-2">
            <div>
              <h3 className="font-bold">Complete desk kit included</h3>
              <p className="mt-2 text-sm leading-6 text-[#666]">Up to $1,500 for a Mac mini (16GB/256GB), one 27-inch 4K monitor, keyboard and mouse, webcam, USB mic, and required cables, hub, surge protection, and packaging.</p>
            </div>
            <div>
              <h3 className="font-bold">Travel outside Fairfax</h3>
              <p className="mt-2 text-sm leading-6 text-[#666]">A flat $1,500 domestic travel fee applies to installations more than 75 miles from Fairfax, Virginia.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1050px]">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#e85d26]">What happens next</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">A deliberate process. No surprise calendar invite.</h2>
          <div className="mt-10 divide-y-2 divide-[#d8d4cc] border-y-2 border-[#d8d4cc]">
            {process.map(([number, title, description]) => (
              <div key={number} className="grid gap-3 py-6 sm:grid-cols-[70px_220px_1fr] sm:items-start">
                <span className="font-mono text-sm font-extrabold text-[#e85d26]">{number}</span>
                <h3 className="font-bold">{title}</h3>
                <p className="text-sm leading-6 text-[#666]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f0ece4] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[960px]">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#e85d26]">Common questions</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">Before you begin.</h2>
          <div className="mt-9 grid gap-4">
            {faq.map(([question, answer]) => (
              <details key={question} className="group rounded-xl border-2 border-[#d8d4cc] bg-white p-5 open:border-[#e85d26]">
                <summary className="cursor-pointer list-none pr-6 font-bold marker:hidden">{question}<span className="float-right text-[#e85d26] group-open:rotate-45">+</span></summary>
                <p className="mt-3 max-w-[820px] text-sm leading-6 text-[#666]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#202020] px-5 py-20 text-center text-white sm:px-8">
        <div className="mx-auto max-w-[780px]">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#ff8b5c]">Limited onsite capacity</p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] sm:text-5xl">Ready to build the system your business will actually use?</h2>
          <p className="mx-auto mt-5 max-w-[650px] leading-7 text-[#bbb]">Complete the intake first. It does not book an appointment. After payment, Dustin personally contacts you within 24 hours to coordinate scheduling.</p>
          <a href={INTAKE_URL} target="_blank" rel="noreferrer" className="btn-primary mt-8 px-8 py-4 text-base">Begin the private intake →</a>
          <p className="mt-6 text-sm text-[#aaa]">
            Questions? <a className="font-semibold text-white underline decoration-[#e85d26] underline-offset-4" href={`mailto:${EMAIL}`}>{EMAIL}</a>
            {' · '}
            <a className="font-semibold text-white underline decoration-[#e85d26] underline-offset-4" href={PHONE_HREF}>{PHONE_DISPLAY}</a>
          </p>
        </div>
      </section>

      <footer className="border-t-2 border-[#d4d0c8] px-5 py-9 text-center text-xs text-[#666]">
        <p>© 2026 AgentAIBrief.com · In-person AI Business Transformation with Dustin Fox</p>
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          <Link href="/">AgentAIBrief home</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href={`mailto:${EMAIL}`}>Contact Dustin</a>
        </div>
      </footer>
    </main>
  );
}
