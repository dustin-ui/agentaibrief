'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type CompareOfferData = {
  purchasePriceFormatted?: string | null;
  earnestMoneyFormatted?: string | null;
  escalationClause?: { present?: boolean; cap?: string | null; increment?: string | null };
  financingType?: string | null;
  loanType?: string | null;
  downPaymentPercent?: string | null;
  closingDate?: string | null;
  closingDaysFromNow?: number | null;
  settlementCompany?: string | null;
  inspectionContingencyDays?: number | null;
  financingContingencyDays?: number | null;
  appraisalContingency?: { present?: boolean; gapCoverage?: string | null };
  homeSaleContingency?: boolean;
  sellerConcessions?: string | null;
  possessionDate?: string | null;
  homeWarranty?: { included?: boolean; provider?: string | null; paidBy?: string | null };
  personalProperty?: string[] | null;
  postSettlementOccupancy?: string | null;
  unusualClauses?: string[] | null;
  buyerName?: string | null;
  riskFlags?: string[] | null;
};

type CompareOffer = { label: string; fileName: string; data: CompareOfferData | null };
type SharedData = {
  address: string;
  offers: CompareOffer[];
  comparison: {
    summary: string[];
    riskAnalysis: Array<{ offer: string; risks: string[] }>;
  } | null;
  createdAt: string;
};

export default function SharedComparisonPage() {
  const params = useParams();
  const [data, setData] = useState<SharedData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/contract-share?id=${params.id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div className="min-h-screen bg-[#e8e6e1] text-[#2a2a2a] flex items-center justify-center">
      <p className="text-[#666]">Loading comparison...</p>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-[#e8e6e1] text-[#2a2a2a] flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl mb-2">🔍</p>
        <p className="text-[#666]">Comparison not found or expired.</p>
        <Link href="/contract-analyzer" className="text-[#e85d26] text-sm mt-4 block hover:underline">Go to Contract Analyzer</Link>
      </div>
    </div>
  );

  const fields: [string, (d: CompareOfferData) => string][] = [
    ['Purchase Price', d => d.purchasePriceFormatted || '—'],
    ['Earnest Money', d => d.earnestMoneyFormatted || '—'],
    ['Escalation Clause', d => d.escalationClause?.present ? `Cap: ${d.escalationClause.cap}, +${d.escalationClause.increment}` : 'No'],
    ['Financing', d => `${d.financingType || '—'}${d.loanType ? ` (${d.loanType})` : ''}`],
    ['Down Payment', d => d.downPaymentPercent || '—'],
    ['Closing Date', d => d.closingDate ? `${d.closingDate}${d.closingDaysFromNow ? ` (${d.closingDaysFromNow}d)` : ''}` : '—'],
    ['Inspection Days', d => d.inspectionContingencyDays?.toString() || 'None'],
    ['Financing Contingency', d => d.financingContingencyDays ? `${d.financingContingencyDays}d` : 'None'],
    ['Appraisal', d => d.appraisalContingency?.present ? `Yes${d.appraisalContingency.gapCoverage ? ` (gap: ${d.appraisalContingency.gapCoverage})` : ''}` : 'Waived'],
    ['Home Sale Contingency', d => d.homeSaleContingency ? '🔴 YES' : 'No'],
    ['Seller Concessions', d => d.sellerConcessions || 'None'],
    ['Possession', d => d.possessionDate || 'At settlement'],
    ['Home Warranty', d => d.homeWarranty?.included ? `${d.homeWarranty.provider || 'Yes'}` : 'No'],
    ['Personal Property', d => d.personalProperty?.join(', ') || 'None'],
    ['Unusual Clauses', d => d.unusualClauses?.length ? d.unusualClauses.join('; ') : 'None'],
  ];

  return (
    <div className="min-h-screen bg-[#e8e6e1] text-[#2a2a2a]">
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">Agent<span className="text-[#e85d26]">AI</span>Brief</Link>
          <span className="text-xs text-[#888]">Shared Comparison (Read-Only)</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-1">📋 Contract Comparison</h1>
        <p className="text-[#666] text-sm mb-1">{data.address} • {data.offers.length} offers</p>
        <p className="text-[#888] text-xs mb-8">Generated {new Date(data.createdAt).toLocaleDateString()}</p>

        {/* Summary */}
        {data.comparison && (
          <div className="bg-[#f0ece4] border border-[#e0dcd4] rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">📊 Summary</h3>
            <ul className="space-y-2 mb-6">
              {data.comparison.summary.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-[#555]"><span className="text-[#e85d26]">•</span><span>{s}</span></li>
              ))}
            </ul>
            <h4 className="font-semibold text-sm text-[#666] uppercase tracking-wider mb-3">⚠️ Risk Flags</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.comparison.riskAnalysis.map(r => (
                <div key={r.offer} className={`rounded-lg p-3 border ${r.risks.length > 3 ? 'bg-red-900/20 border-red-700/30' : r.risks.length > 0 ? 'bg-yellow-900/15 border-yellow-700/25' : 'bg-green-900/15 border-green-700/25'}`}>
                  <h5 className="font-semibold text-sm mb-2">{r.risks.length > 3 ? '🔴' : r.risks.length > 0 ? '🟡' : '🟢'} {r.offer}</h5>
                  {r.risks.length === 0 ? <p className="text-xs text-green-400">✅ No risks</p> : (
                    <ul className="space-y-1">{r.risks.map((ri, i) => <li key={i} className="text-xs text-[#555] flex gap-1"><span className="text-red-400">⚠</span>{ri}</li>)}</ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-[#f0ece4] border border-[#e0dcd4] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e0dcd4]">
                  <th className="px-4 py-3 text-left text-[#666] font-medium bg-[#f0ece4] sticky left-0 z-10 min-w-[140px]">Field</th>
                  {data.offers.map(o => (
                    <th key={o.label} className="px-4 py-3 text-left font-semibold text-[#e85d26] min-w-[160px]">
                      {o.label}<br /><span className="text-xs text-[#888] font-normal">{o.data?.buyerName || o.fileName}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {fields.map(([label, fn]) => (
                  <tr key={label}>
                    <td className="px-4 py-2.5 text-[#666] font-medium bg-[#f0ece4] sticky left-0 z-10">{label}</td>
                    {data.offers.map(o => (
                      <td key={o.label} className="px-4 py-2.5 text-[#2a2a2a] border-l border-[#e0dcd4]/30">{o.data ? fn(o.data) : 'N/A'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-[#888] mt-6 text-center">
          ⚖️ AI-generated analysis for informational purposes only. Not legal advice. • <Link href="/contract-analyzer" className="text-[#e85d26] hover:underline">Try AgentAIBrief</Link>
        </p>
      </div>
    </div>
  );
}
