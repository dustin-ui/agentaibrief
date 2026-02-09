'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';

// Sample demo data
const SAMPLE_DATA = {
  address: '1234 Oak Street, Arlington, VA 22201',
  results: [
    {
      fileName: 'Purchase_Agreement.pdf',
      data: {
        closingDate: 'March 15, 2026',
        settlementCompany: 'Cardinal Title Group',
        purchasePrice: '$725,000',
        financingType: 'Conventional',
        loanAmount: '$580,000',
        downPayment: '$145,000 (20%)',
        interestRate: '6.25%',
        earnestMoney: { amount: '$15,000', dueDate: 'Within 5 business days of ratification', heldBy: 'Cardinal Title Group' },
        contingencies: [
          { type: 'Home Inspection', deadline: '10 days from ratification', details: 'Buyer may request repairs up to $10,000' },
          { type: 'Appraisal', deadline: 'N/A — waived', details: 'Buyer waives appraisal contingency' },
          { type: 'Financing', deadline: '21 days from ratification', details: 'Pre-approval from First National Bank' },
          { type: 'Radon', deadline: '10 days from ratification', details: 'Concurrent with home inspection period' },
          { type: 'HOA Document Review', deadline: '3 days from receipt', details: 'Buyer has right to void if HOA docs unsatisfactory' },
        ],
        sellerConcessions: '$8,000 toward closing costs',
        personalProperty: ['Refrigerator', 'Washer/Dryer', 'Ring Doorbell', 'Mounted TV in family room'],
        escalationClause: { present: true, maxPrice: '$750,000', increment: '$2,500 above competing offer', details: 'Requires copy of competing offer as proof' },
        addenda: ['Lead Paint Disclosure', 'HOA Addendum', 'Escalation Clause Addendum'],
        parties: {
          buyer: 'Michael & Sarah Johnson',
          seller: 'Robert & Linda Chen',
          buyerAgent: 'Devon Fox — Fox Homes',
          sellerAgent: 'Amanda Williams — Compass',
          buyerBrokerage: 'Fox Homes — eXp Realty',
          sellerBrokerage: 'Compass',
          lender: 'First National Bank — John Davis',
          titleCompany: 'Cardinal Title Group',
        },
        possessionDate: 'At settlement',
        homeWarranty: { included: true, provider: 'American Home Shield', cost: '$550', paidBy: 'Seller' },
        otherTerms: ['Seller to provide termite inspection', 'Buyer to receive $500 credit for carpet cleaning'],
      },
    },
  ],
};

type ContractData = typeof SAMPLE_DATA.results[0]['data'];

export default function ContractAnalyzerPage() {
  const [address, setAddress] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<{ address: string; results: { fileName: string; data: ContractData }[] } | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf' || f.type === 'image/jpeg' || f.type === 'image/png'
    );
    setFiles((prev) => [...prev, ...dropped]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const analyze = async () => {
    if (!address || !files.length) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.set('address', address);
      files.forEach((f) => formData.append('files', f));
      const res = await fetch('/api/contract-analyze', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      alert('Analysis failed. Please try again.' + (err instanceof Error ? ' ' + err.message : ''));
    } finally {
      setAnalyzing(false);
    }
  };

  const activeData = showDemo ? SAMPLE_DATA : results;

  const exportCSV = () => {
    if (!activeData) return;
    const rows: string[][] = [];
    rows.push(['Field', 'Value']);
    for (const result of activeData.results) {
      const d = result.data;
      if (!d) continue;
      rows.push(['--- File ---', result.fileName]);
      rows.push(['Purchase Price', d.purchasePrice || '']);
      rows.push(['Closing Date', d.closingDate || '']);
      rows.push(['Settlement Company', d.settlementCompany || '']);
      rows.push(['Financing Type', d.financingType || '']);
      rows.push(['Loan Amount', d.loanAmount || '']);
      rows.push(['Down Payment', d.downPayment || '']);
      rows.push(['Interest Rate', d.interestRate || '']);
      rows.push(['Earnest Money', d.earnestMoney?.amount || '']);
      rows.push(['EMD Due Date', d.earnestMoney?.dueDate || '']);
      rows.push(['EMD Held By', d.earnestMoney?.heldBy || '']);
      rows.push(['Seller Concessions', d.sellerConcessions || '']);
      rows.push(['Possession Date', d.possessionDate || '']);
      d.contingencies?.forEach((c) => rows.push([`Contingency: ${c.type}`, `${c.details} (Deadline: ${c.deadline})`]));
      d.personalProperty?.forEach((p) => rows.push(['Personal Property', p]));
      if (d.escalationClause?.present) rows.push(['Escalation Clause', `Max: ${d.escalationClause.maxPrice}, Increment: ${d.escalationClause.increment}`]);
      d.addenda?.forEach((a) => rows.push(['Addendum', a]));
      const parties = d.parties;
      if (parties) {
        Object.entries(parties).forEach(([k, v]) => { if (v) rows.push([`Party: ${k}`, v]); });
      }
      if (d.homeWarranty?.included) rows.push(['Home Warranty', `${d.homeWarranty.provider} - ${d.homeWarranty.cost} (${d.homeWarranty.paidBy})`]);
      d.otherTerms?.forEach((t) => rows.push(['Other Term', t]));
    }
    const csv = rows.map((r) => r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-analysis-${activeData.address.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Agent<span className="text-[#37b0c9]">AI</span>Brief
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-gray-400 hover:text-white">Home</Link>
            <Link href="/tools" className="text-gray-400 hover:text-white">AI Tools</Link>
            <span className="text-[#37b0c9] font-semibold">Contract Analyzer</span>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-block px-3 py-1 bg-[#37b0c9]/10 border border-[#37b0c9]/30 rounded-full text-[#37b0c9] text-xs font-medium mb-4">
            NEW TOOL
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Contract <span className="text-[#37b0c9]">Analyzer</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Upload your real estate contracts and get every term, contingency, and deadline extracted into a clean spreadsheet — powered by AI.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => { setShowDemo(true); setResults(null); }}
              className="px-6 py-3 border border-[#37b0c9] text-[#37b0c9] rounded-lg font-medium hover:bg-[#37b0c9]/10 transition"
            >
              View Sample Output
            </button>
            <a href="#upload" className="px-6 py-3 bg-[#37b0c9] text-white rounded-lg font-medium hover:bg-[#37b0c9]/80 transition">
              Analyze a Contract
            </a>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Free', price: '$0', desc: 'Sample demo only', features: ['View sample output', 'See what you\'d get', 'No uploads'] },
            { name: 'Starter', price: '$19', desc: '/month', features: ['1 address/month', 'Unlimited contracts per address', 'CSV/Excel export', 'AI-powered extraction'], highlight: true },
            { name: 'Unlimited', price: '$99', desc: '/month', features: ['Unlimited addresses', 'Unlimited contracts', 'CSV/Excel export', 'Priority processing'] },
          ].map((tier) => (
            <div key={tier.name} className={`rounded-xl p-6 border ${tier.highlight ? 'border-[#37b0c9] bg-[#37b0c9]/5' : 'border-gray-800 bg-gray-900'}`}>
              <h3 className="font-bold text-lg">{tier.name}</h3>
              <p className="text-3xl font-bold mt-2">{tier.price}<span className="text-sm text-gray-400 font-normal">{tier.desc !== '/month' ? '' : '/mo'}</span></p>
              {tier.desc !== '/month' && <p className="text-sm text-gray-400">{tier.desc}</p>}
              <ul className="mt-4 space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="text-sm text-gray-300 flex items-center gap-2">
                    <span className="text-[#37b0c9]">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload" className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Upload & Analyze</h2>

        <div className="space-y-4">
          {/* Address Input */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Property Address</label>
            <input
              type="text"
              placeholder="e.g. 1234 Oak Street, Arlington, VA 22201"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#37b0c9]"
            />
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
              dragOver ? 'border-[#37b0c9] bg-[#37b0c9]/5' : 'border-gray-700 hover:border-gray-500'
            }`}
          >
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" />
            <div className="text-4xl mb-3">📄</div>
            <p className="text-gray-300 font-medium">Drag & drop contracts here</p>
            <p className="text-gray-500 text-sm mt-1">PDF, JPG, PNG — or click to browse</p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-2">
                  <span className="text-sm text-gray-300 truncate">{f.name} <span className="text-gray-500">({(f.size / 1024).toFixed(0)} KB)</span></span>
                  <button onClick={() => removeFile(i)} className="text-gray-500 hover:text-red-400 text-sm ml-2">✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={analyze}
            disabled={!address || !files.length || analyzing}
            className="w-full py-3 bg-[#37b0c9] text-white font-bold rounded-lg hover:bg-[#37b0c9]/80 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {analyzing ? 'Analyzing contracts...' : `Analyze ${files.length} Contract${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </section>

      {/* Results */}
      {activeData && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              <p className="text-gray-400 text-sm">{activeData.address}{showDemo ? ' (Sample Demo)' : ''}</p>
            </div>
            <button onClick={exportCSV} className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-700 transition flex items-center gap-2">
              📥 Export CSV
            </button>
          </div>

          {activeData.results.map((result, idx) => (
            <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50">
                <h3 className="font-semibold text-[#37b0c9]">📄 {result.fileName}</h3>
              </div>
              {result.data ? (
                <div className="divide-y divide-gray-800">
                  {/* Key Terms */}
                  <ResultSection title="Key Terms">
                    <ResultRow label="Purchase Price" value={result.data.purchasePrice} />
                    <ResultRow label="Closing Date" value={result.data.closingDate} />
                    <ResultRow label="Settlement Company" value={result.data.settlementCompany} />
                    <ResultRow label="Possession Date" value={result.data.possessionDate} />
                  </ResultSection>

                  {/* Financing */}
                  <ResultSection title="Financing">
                    <ResultRow label="Type" value={result.data.financingType} />
                    <ResultRow label="Loan Amount" value={result.data.loanAmount} />
                    <ResultRow label="Down Payment" value={result.data.downPayment} />
                    <ResultRow label="Interest Rate" value={result.data.interestRate} />
                  </ResultSection>

                  {/* Earnest Money */}
                  <ResultSection title="Earnest Money Deposit">
                    <ResultRow label="Amount" value={result.data.earnestMoney?.amount} />
                    <ResultRow label="Due Date" value={result.data.earnestMoney?.dueDate} />
                    <ResultRow label="Held By" value={result.data.earnestMoney?.heldBy} />
                  </ResultSection>

                  {/* Contingencies */}
                  {result.data.contingencies && result.data.contingencies.length > 0 && (
                    <ResultSection title="Contingencies">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-400">
                              <th className="px-6 py-2 font-medium">Type</th>
                              <th className="px-6 py-2 font-medium">Deadline</th>
                              <th className="px-6 py-2 font-medium">Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.data.contingencies.map((c, i) => (
                              <tr key={i} className="border-t border-gray-800/50">
                                <td className="px-6 py-2 font-medium text-white">{c.type}</td>
                                <td className="px-6 py-2 text-[#37b0c9]">{c.deadline}</td>
                                <td className="px-6 py-2 text-gray-300">{c.details}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </ResultSection>
                  )}

                  {/* Escalation Clause */}
                  {result.data.escalationClause?.present && (
                    <ResultSection title="Escalation Clause">
                      <ResultRow label="Max Price" value={result.data.escalationClause.maxPrice} />
                      <ResultRow label="Increment" value={result.data.escalationClause.increment} />
                      <ResultRow label="Details" value={result.data.escalationClause.details} />
                    </ResultSection>
                  )}

                  {/* Concessions & Property */}
                  <ResultSection title="Other Terms">
                    <ResultRow label="Seller Concessions" value={result.data.sellerConcessions} />
                    <ResultRow label="Personal Property" value={result.data.personalProperty?.join(', ')} />
                    {result.data.homeWarranty?.included && (
                      <ResultRow label="Home Warranty" value={`${result.data.homeWarranty.provider} — ${result.data.homeWarranty.cost} (${result.data.homeWarranty.paidBy})`} />
                    )}
                    {result.data.otherTerms?.map((t, i) => (
                      <ResultRow key={i} label={`Note ${i + 1}`} value={t} />
                    ))}
                  </ResultSection>

                  {/* Addenda */}
                  {result.data.addenda && result.data.addenda.length > 0 && (
                    <ResultSection title="Addenda & Riders">
                      {result.data.addenda.map((a, i) => (
                        <ResultRow key={i} label={`Addendum ${i + 1}`} value={a} />
                      ))}
                    </ResultSection>
                  )}

                  {/* Parties */}
                  {result.data.parties && (
                    <ResultSection title="Parties">
                      {Object.entries(result.data.parties).map(([k, v]) =>
                        v ? <ResultRow key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())} value={v} /> : null
                      )}
                    </ResultSection>
                  )}
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">Failed to parse this document.</div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          © 2026 AgentAIBrief.com • <Link href="/privacy" className="hover:text-gray-300">Privacy</Link> • <Link href="/terms" className="hover:text-gray-300">Terms</Link>
        </div>
      </footer>
    </div>
  );
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-4">
      <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-1">
      <span className="text-sm text-gray-400 sm:w-48 shrink-0">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}
