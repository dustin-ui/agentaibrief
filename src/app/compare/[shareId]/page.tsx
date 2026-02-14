import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type CompareOfferData = {
  purchasePrice?: number | null;
  purchasePriceFormatted?: string | null;
  earnestMoneyDepositFormatted?: string | null;
  financingType?: string | null;
  amountFinanced?: string | null;
  downPayment?: string | null;
  sellerPaidBuyerAgency?: string | null;
  sellerPaidBuyerAgencyAmount?: number | null;
  sellerConcessions?: string | null;
  sellerConcessionsAmount?: number | null;
  closingDate?: string | null;
  financingContingency?: string | null;
  appraisalContingency?: string | null;
  homeInspection?: string | null;
  hoaContingency?: string | null;
  escalationClause?: { present?: boolean; increment?: string | null; maxEscalation?: string | null; maxEscalationAmount?: number | null };
  wdiInspection?: string | null;
  appraisalGap?: string | null;
  septicWell?: string | null;
  septicPaidBy?: string | null;
  radon?: string | null;
  lender?: string | null;
  titleCompany?: string | null;
  buyerName?: string | null;
  buyerAgentName?: string | null;
  rentBack?: string | null;
  notes?: string | null;
};
type CompareOffer = { label: string; fileName: string; data: CompareOfferData | null };

function calcSellerNet(d: CompareOfferData): string {
  const price = d.escalationClause?.present && d.escalationClause.maxEscalationAmount
    ? d.escalationClause.maxEscalationAmount : d.purchasePrice;
  if (!price) return '—';
  const net = price - (d.sellerConcessionsAmount || 0) - (d.sellerPaidBuyerAgencyAmount || 0);
  return `$${net.toLocaleString()} (estimated)`;
}

const FIELDS: [string, (d: CompareOfferData) => string][] = [
  ['Purchase Price', d => d.purchasePriceFormatted || '—'],
  ['Earnest Money Deposit', d => d.earnestMoneyDepositFormatted || '—'],
  ['Financing Type', d => d.financingType || '—'],
  ['Amount Financed', d => d.amountFinanced || '—'],
  ['Down Payment', d => d.downPayment || '—'],
  ['Seller Paid Buyer Agency', d => d.sellerPaidBuyerAgency || 'None'],
  ['Seller Concessions', d => d.sellerConcessions || 'None'],
  ['Closing Date', d => d.closingDate || '—'],
  ['Financing Contingency', d => d.financingContingency || 'None'],
  ['Appraisal Contingency', d => d.appraisalContingency || 'None'],
  ['Home Inspection', d => d.homeInspection || 'None'],
  ['HOA', d => d.hoaContingency || 'None'],
  ['Escalation', d => d.escalationClause?.present ? 'Yes' : 'No'],
  ['Escalation Increments', d => d.escalationClause?.increment || '—'],
  ['Max Escalation', d => d.escalationClause?.maxEscalation || '—'],
  ['WDI', d => d.wdiInspection || 'None'],
  ['Appraisal Gap', d => d.appraisalGap || 'None'],
  ['Septic/Well', d => d.septicWell || 'None'],
  ['Septic Paid By', d => d.septicPaidBy || '—'],
  ['Radon', d => d.radon || 'None'],
  ['Lender', d => d.lender || '—'],
  ['Title Company', d => d.titleCompany || '—'],
  ['Buyer Name', d => d.buyerName || '—'],
  ['Buyer Agent Name', d => d.buyerAgentName || '—'],
  ['Rent Back', d => d.rentBack || 'None'],
  ['Notes', d => d.notes || 'None'],
  ['Seller Net Estimate', d => calcSellerNet(d)],
];

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }): Promise<Metadata> {
  const { shareId } = await params;
  const db = supabaseAdmin();
  const { data } = await db.from('comparisons').select('address').eq('share_id', shareId).single();
  const addr = data?.address || 'Contract Comparison';
  return {
    title: `${addr} — Contract Comparison | AgentAIBrief`,
    description: `Side-by-side offer comparison for ${addr}`,
  };
}

export default async function SharePage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const db = supabaseAdmin();
  const { data, error } = await db.from('comparisons').select('*').eq('share_id', shareId).single();
  if (error || !data) notFound();

  const offers: CompareOffer[] = data.offers as CompareOffer[];
  const comparison = data.comparison as { summary?: string } | null;

  return (
    <div className="min-h-screen bg-[#e8e6e1] text-[#2a2a2a]">
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">Agent<span className="text-[#e85d26]">AI</span>Brief</Link>
          <span className="text-xs text-[#888]">Shared Comparison</span>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">📋 Contract Comparison</h1>
          <p className="text-[#666] text-sm">{data.address} • {offers.length} offers • {new Date(data.created_at).toLocaleDateString()}</p>
        </div>

        {comparison?.summary && (
          <div className="bg-[#f0ece4]/50 border border-[#e0dcd4] rounded-lg px-5 py-3 mb-6 text-sm text-[#555]">
            {comparison.summary}
          </div>
        )}

        <div className="bg-[#f0ece4] border border-[#e0dcd4] rounded-xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e0dcd4]">
                  <th className="px-4 py-3 text-left text-[#666] font-medium bg-[#f0ece4] sticky left-0 z-10 min-w-[160px]">Field</th>
                  {offers.map((o) => (
                    <th key={o.label} className="px-4 py-3 text-left font-semibold text-[#e85d26] min-w-[180px]">
                      <div>{o.label}</div>
                      <span className="text-xs text-[#888] font-normal block">{o.fileName}</span>
                      {o.data?.buyerName && <span className="text-xs text-[#666] font-normal block">{o.data.buyerName}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {FIELDS.map(([label, fn]) => (
                  <tr key={label}>
                    <td className="px-4 py-2.5 text-[#666] font-medium bg-[#f0ece4] sticky left-0 z-10">{label}</td>
                    {offers.map((o) => (
                      <td key={o.label} className="px-4 py-2.5 text-[#2a2a2a] border-l border-[#e0dcd4]/30">
                        {o.data ? fn(o.data) : 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {data.agent_notes && (
          <div className="bg-[#f0ece4] border border-[#e0dcd4] rounded-xl p-6 mb-6">
            <h3 className="text-sm font-semibold text-[#666] uppercase tracking-wider mb-3">📝 Agent Notes</h3>
            <p className="text-sm text-[#555] whitespace-pre-wrap">{data.agent_notes}</p>
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-xs text-[#888] mb-2">⚖️ AI-generated analysis for informational purposes only. Not legal advice.</p>
          <Link href="/contract-analyzer" className="text-[#e85d26] text-sm hover:underline">
            Try the Contract Analyzer →
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#e0dcd4] mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-[#888]">
          © 2026 AgentAIBrief.com • <Link href="/privacy" className="hover:text-[#555]">Privacy</Link> • <Link href="/terms" className="hover:text-[#555]">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
