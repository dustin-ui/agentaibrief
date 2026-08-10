import Link from 'next/link';

const INTAKE_URL = 'https://forms.gle/Bh1x86bX7tgKzAE99';

const packages = [
  { label: '1 day', price: '$12,995' },
  { label: '2 days', price: '$19,995' },
  { label: '3 days', price: '$28,995' },
];

export function TransformationSpotlight() {
  return (
    <section
      aria-labelledby="transformation-spotlight-title"
      className="px-4 py-6 sm:px-8 sm:py-9"
      style={{ background: '#e8e6e1' }}
    >
      <div
        className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[24px] border-2 p-6 sm:p-9 lg:p-11"
        style={{
          background: '#202020',
          borderColor: '#e85d26',
          boxShadow: '0 10px 0 #c44a1a, 0 24px 60px rgba(42,42,42,0.18)',
        }}
      >
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-28 h-72 w-72 rounded-full"
          style={{ background: 'rgba(232,93,38,0.16)', filter: 'blur(2px)' }}
        />
        <div className="relative grid items-end gap-9 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.7rem] font-extrabold uppercase tracking-[0.18em]"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#ff9a70' }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: '#e85d26' }} />
              New · Private onsite engagement
            </div>
            <h2
              id="transformation-spotlight-title"
              className="max-w-[760px] text-3xl font-extrabold leading-[1.04] tracking-[-0.04em] text-white sm:text-4xl lg:text-[3.25rem]"
            >
              Stop collecting AI tools.
              <span className="block" style={{ color: '#ff7b45' }}>Install an AI operating system.</span>
            </h2>
            <p className="mt-5 max-w-[720px] text-base leading-7 text-[#d4d0c8] sm:text-lg">
              Dustin Fox comes to your business, maps the way your team works, connects the systems,
              installs the equipment, and trains you to run it — in person.
            </p>
            <p className="mt-3 max-w-[720px] text-sm leading-6 text-[#aaa]">
              Built from the operating playbook behind a team grown to approximately $300 million in five years.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ai-transformation"
                className="inline-flex items-center justify-center rounded-[10px] px-6 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                style={{ background: '#e85d26', boxShadow: '0 4px 0 #9f3b16' }}
              >
                Explore the transformation →
              </Link>
              <a
                href={INTAKE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-[10px] border-2 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:border-[#ff7b45] hover:text-[#ff9a70]"
                style={{ borderColor: '#575757' }}
              >
                Start the private intake
              </a>
            </div>
          </div>

          <div className="grid gap-3" aria-label="Available onsite packages">
            {packages.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl border px-5 py-4"
                style={{ background: 'rgba(255,255,255,0.055)', borderColor: '#444' }}
              >
                <span className="text-sm font-bold uppercase tracking-[0.12em] text-[#d4d0c8]">{item.label}</span>
                <span className="font-mono text-lg font-extrabold text-white">{item.price}</span>
              </div>
            ))}
            <p className="px-1 pt-2 text-xs leading-5 text-[#999]">
              Six onsite hours per day · complete desk kit included · owner plus two participants
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
