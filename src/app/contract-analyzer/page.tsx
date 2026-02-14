'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { generateICS, extractCalendarEvents } from '@/lib/calendar-export';

// ─── Types ───────────────────────────────────────────────────────────
type ContractData = {
  closingDate?: string | null;
  settlementCompany?: string | null;
  purchasePrice?: string | null;
  financingType?: string | null;
  loanAmount?: string | null;
  downPayment?: string | null;
  interestRate?: string | null;
  earnestMoney?: { amount?: string | null; dueDate?: string | null; heldBy?: string | null } | null;
  contingencies?: Array<{ type: string; deadline: string; details: string }> | null;
  sellerConcessions?: string | null;
  personalProperty?: string[] | null;
  escalationClause?: { present?: boolean; maxPrice?: string | null; increment?: string | null; details?: string | null } | null;
  addenda?: string[] | null;
  parties?: Record<string, string | null> | null;
  possessionDate?: string | null;
  homeWarranty?: { included?: boolean; provider?: string | null; cost?: string | null; paidBy?: string | null } | null;
  otherTerms?: string[] | null;
};

type CompareOfferData = {
  purchasePrice?: number | null;
  purchasePriceFormatted?: string | null;
  earnestMoney?: number | null;
  earnestMoneyFormatted?: string | null;
  escalationClause?: { present?: boolean; cap?: string | null; increment?: string | null; details?: string | null };
  financingType?: string | null;
  downPaymentPercent?: string | null;
  closingDate?: string | null;
  closingDaysFromNow?: number | null;
  settlementCompany?: string | null;
  inspectionContingencyDays?: number | null;
  financingContingencyDays?: number | null;
  appraisalContingency?: { present?: boolean; gapCoverage?: string | null };
  homeSaleContingency?: boolean;
  sellerConcessions?: string | null;
  sellerConcessionsAmount?: number | null;
  personalProperty?: string[] | null;
  postSettlementOccupancy?: string | null;
  unusualClauses?: string[] | null;
  buyerName?: string | null;
  allDatesAndDeadlines?: Array<{ event: string; date: string; daysFromNow?: number | null }>;
  riskFlags?: string[] | null;
};

type CompareOffer = { label: string; fileName: string; data: CompareOfferData | null; error?: string };
type CompareResult = {
  address: string;
  offers: CompareOffer[];
  comparison: {
    summary: string[];
    bestOffer: { label: string; reasoning: string };
    riskAnalysis: Array<{ offer: string; risks: string[] }>;
  } | null;
};

// ─── Sample Data ─────────────────────────────────────────────────────
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
          buyer: 'Michael & Sarah Johnson', seller: 'Robert & Linda Chen',
          buyerAgent: 'Devon Fox — Fox Homes', sellerAgent: 'Amanda Williams — Compass',
          buyerBrokerage: 'Fox Homes — eXp Realty', sellerBrokerage: 'Compass',
          lender: 'First National Bank — John Davis', titleCompany: 'Cardinal Title Group',
        },
        possessionDate: 'At settlement',
        homeWarranty: { included: true, provider: 'American Home Shield', cost: '$550', paidBy: 'Seller' },
        otherTerms: ['Seller to provide termite inspection', 'Buyer to receive $500 credit for carpet cleaning'],
      } as ContractData,
    },
  ],
};

const SAMPLE_COMPARE: CompareResult = {
  address: '1234 Oak Street, Arlington, VA 22201',
  offers: [
    {
      label: 'Offer A', fileName: 'Johnson_Offer.pdf',
      data: {
        purchasePrice: 725000, purchasePriceFormatted: '$725,000', earnestMoney: 15000, earnestMoneyFormatted: '$15,000',
        escalationClause: { present: true, cap: '$750,000', increment: '$2,500', details: 'Requires competing offer proof' },
        financingType: 'Conventional', downPaymentPercent: '20%', closingDate: 'March 15, 2026', closingDaysFromNow: 33,
        settlementCompany: 'Cardinal Title Group', inspectionContingencyDays: 10, financingContingencyDays: 21,
        appraisalContingency: { present: false, gapCoverage: null }, homeSaleContingency: false,
        sellerConcessions: '$8,000 closing costs', sellerConcessionsAmount: 8000,
        personalProperty: ['Refrigerator', 'Washer/Dryer', 'Ring Doorbell', 'TV'],
        postSettlementOccupancy: 'None', unusualClauses: [], buyerName: 'Michael & Sarah Johnson',
        riskFlags: ['Requesting $8K in seller concessions', '21-day financing contingency'],
      },
    },
    {
      label: 'Offer B', fileName: 'Martinez_Offer.pdf',
      data: {
        purchasePrice: 740000, purchasePriceFormatted: '$740,000', earnestMoney: 20000, earnestMoneyFormatted: '$20,000',
        escalationClause: { present: false }, financingType: 'Conventional', downPaymentPercent: '25%',
        closingDate: 'March 1, 2026', closingDaysFromNow: 19, settlementCompany: 'Ekko Title',
        inspectionContingencyDays: 7, financingContingencyDays: 14,
        appraisalContingency: { present: true, gapCoverage: '$15,000' }, homeSaleContingency: false,
        sellerConcessions: 'None', sellerConcessionsAmount: 0, personalProperty: ['Refrigerator'],
        postSettlementOccupancy: 'None', unusualClauses: [], buyerName: 'Carlos & Maria Martinez',
        riskFlags: [],
      },
    },
    {
      label: 'Offer C', fileName: 'Williams_Offer.pdf',
      data: {
        purchasePrice: 760000, purchasePriceFormatted: '$760,000', earnestMoney: 10000, earnestMoneyFormatted: '$10,000',
        escalationClause: { present: false }, financingType: 'FHA', downPaymentPercent: '3.5%',
        closingDate: 'April 10, 2026', closingDaysFromNow: 59, settlementCompany: 'National Settlement',
        inspectionContingencyDays: 15, financingContingencyDays: 30,
        appraisalContingency: { present: true, gapCoverage: null }, homeSaleContingency: true,
        sellerConcessions: '$12,000 closing costs', sellerConcessionsAmount: 12000,
        personalProperty: ['Refrigerator', 'Washer/Dryer', 'Patio furniture', 'Shed contents'],
        postSettlementOccupancy: 'Seller requests 14 days post-settlement', unusualClauses: ['Home sale contingency — buyer must sell 456 Elm St'],
        buyerName: 'James Williams',
        riskFlags: ['Home sale contingency', 'FHA financing — stricter appraisal', 'Low EMD ($10K)', '$12K concessions', '15-day inspection', '30-day financing contingency', '14-day post-settlement occupancy request'],
      },
    },
  ],
  comparison: {
    summary: [
      'Offer B ($740K) is the strongest overall — clean terms, fast 19-day close, $20K EMD, no concessions, and $15K appraisal gap coverage.',
      'Offer C is highest at $760K but carries significant risk: home sale contingency, FHA financing, low EMD, and 59-day close.',
      'Offer A ($725K) has an escalation clause up to $750K with $8K concessions — net to seller is lower than Offer B.',
      'Offer B\'s 25% down payment and 7-day inspection window signal a serious, well-qualified buyer.',
      'Offer C requests $12K in concessions and 14-day post-settlement occupancy — highest seller burden of all three.',
    ],
    bestOffer: {
      label: 'Offer B',
      reasoning: 'Despite not being the highest price, Offer B provides the best combination of price, certainty, and speed. Strong financing (25% down), highest EMD ($20K), fastest close (19 days), no concessions, and $15K appraisal gap coverage make this the most reliable path to closing.',
    },
    riskAnalysis: [
      { offer: 'Offer A', risks: ['$8,000 seller concessions reduce net proceeds', '21-day financing contingency is longer than typical', 'Escalation clause requires competing offer documentation'] },
      { offer: 'Offer B', risks: ['Appraisal contingency present (mitigated by $15K gap coverage)', 'Slightly lower price than Offer C'] },
      { offer: 'Offer C', risks: ['HOME SALE CONTINGENCY — deal depends on buyer selling their property', 'FHA financing has stricter appraisal requirements', 'Only $10,000 EMD — low commitment signal', '$12,000 in concessions requested', '59-day close is very long', '14-day post-settlement occupancy adds complexity', '15-day inspection and 30-day financing contingencies'] },
    ],
  },
};

// ─── Color coding helpers ────────────────────────────────────────────
function getBestWorst(offers: CompareOffer[], field: string, mode: 'highest' | 'lowest'): { best: number; worst: number } {
  const vals = offers.map((o, i) => {
    const d = o.data as Record<string, unknown>;
    const v = d?.[field];
    return { i, v: typeof v === 'number' ? v : null };
  }).filter((x) => x.v !== null);
  if (vals.length < 2) return { best: -1, worst: -1 };
  vals.sort((a, b) => (a.v as number) - (b.v as number));
  if (mode === 'highest') return { best: vals[vals.length - 1].i, worst: vals[0].i };
  return { best: vals[0].i, worst: vals[vals.length - 1].i };
}

function cellColor(idx: number, best: number, worst: number): string {
  if (idx === best) return 'bg-green-900/30 border-green-700/30';
  if (idx === worst) return 'bg-red-900/30 border-red-700/30';
  return 'bg-yellow-900/20 border-yellow-700/20';
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function ContractAnalyzerPage() {
  const [mode, setMode] = useState<'analyze' | 'compare'>('analyze');
  const [address, setAddress] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<{ address: string; results: { fileName: string; data: ContractData }[] } | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compare mode state
  const [compareFiles, setCompareFiles] = useState<(File | null)[]>([null, null]);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [showCompareDemo, setShowCompareDemo] = useState(false);
  const [compareDragOver, setCompareDragOver] = useState<number | null>(null);
  const compareInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ─── Analyze Mode Handlers ─────────────────────────────────────
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
      setResults(await res.json());
      setShowDemo(false);
    } catch (err) {
      alert('Analysis failed. ' + (err instanceof Error ? err.message : ''));
    } finally {
      setAnalyzing(false);
    }
  };

  // ─── Compare Mode Handlers ────────────────────────────────────
  const addCompareSlot = () => {
    if (compareFiles.length < 5) setCompareFiles((prev) => [...prev, null]);
  };

  const removeCompareSlot = (idx: number) => {
    if (compareFiles.length <= 2) return;
    setCompareFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCompareDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setCompareDragOver(null);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      setCompareFiles((prev) => { const n = [...prev]; n[idx] = file; return n; });
    }
  };

  const handleCompareFileSelect = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (file) setCompareFiles((prev) => { const n = [...prev]; n[idx] = file; return n; });
  };

  const runComparison = async () => {
    const validFiles = compareFiles.filter((f): f is File => f !== null);
    if (validFiles.length < 2 || !address) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.set('address', address);
      const labels = compareFiles.map((_, i) => `Offer ${String.fromCharCode(65 + i)}`);
      formData.set('labels', labels.filter((_, i) => compareFiles[i] !== null).join(','));
      validFiles.forEach((f) => formData.append('files', f));
      const res = await fetch('/api/contract-compare', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Comparison failed');
      setCompareResult(await res.json());
      setShowCompareDemo(false);
    } catch (err) {
      alert('Comparison failed. ' + (err instanceof Error ? err.message : ''));
    } finally {
      setAnalyzing(false);
    }
  };

  // ─── Calendar Export ──────────────────────────────────────────
  const downloadCalendar = (contractData: ContractData, addr: string) => {
    const events = extractCalendarEvents(contractData as Record<string, unknown>, addr);
    if (!events.length) { alert('No parseable dates found in this contract.'); return; }
    const ics = generateICS(events, `Contract Deadlines — ${addr}`);
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-deadlines-${addr.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── CSV Export (single analysis) ─────────────────────────────
  const activeData = showDemo ? SAMPLE_DATA : results;

  const exportCSV = () => {
    if (!activeData) return;
    const rows: string[][] = [['Field', 'Value']];
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
      rows.push(['Seller Concessions', d.sellerConcessions || '']);
      rows.push(['Possession Date', d.possessionDate || '']);
      d.contingencies?.forEach((c) => rows.push([`Contingency: ${c.type}`, `${c.details} (Deadline: ${c.deadline})`]));
      d.personalProperty?.forEach((p) => rows.push(['Personal Property', p]));
      if (d.escalationClause?.present) rows.push(['Escalation Clause', `Max: ${d.escalationClause.maxPrice}, Increment: ${d.escalationClause.increment}`]);
      d.addenda?.forEach((a) => rows.push(['Addendum', a]));
      if (d.parties) Object.entries(d.parties).forEach(([k, v]) => { if (v) rows.push([`Party: ${k}`, v]); });
      if (d.homeWarranty?.included) rows.push(['Home Warranty', `${d.homeWarranty.provider} - ${d.homeWarranty.cost} (${d.homeWarranty.paidBy})`]);
      d.otherTerms?.forEach((t) => rows.push(['Other Term', t]));
    }
    downloadCSVBlob(rows, `contract-analysis-${activeData.address.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
  };

  // ─── CSV Export (comparison) ──────────────────────────────────
  const exportCompareCSV = () => {
    const data = showCompareDemo ? SAMPLE_COMPARE : compareResult;
    if (!data) return;
    const fields = [
      'Purchase Price', 'Earnest Money', 'Financing Type', 'Down Payment %', 'Closing Date',
      'Days to Close', 'Settlement Company', 'Inspection Days', 'Financing Contingency Days',
      'Appraisal Contingency', 'Home Sale Contingency', 'Seller Concessions', 'Personal Property',
      'Post-Settlement Occupancy', 'Escalation Clause', 'Risk Flags',
    ];
    const rows: string[][] = [['Field', ...data.offers.map((o) => o.label)]];
    for (const field of fields) {
      const row = [field];
      for (const offer of data.offers) {
        const d = offer.data;
        if (!d) { row.push('N/A'); continue; }
        switch (field) {
          case 'Purchase Price': row.push(d.purchasePriceFormatted || ''); break;
          case 'Earnest Money': row.push(d.earnestMoneyFormatted || ''); break;
          case 'Financing Type': row.push(d.financingType || ''); break;
          case 'Down Payment %': row.push(d.downPaymentPercent || ''); break;
          case 'Closing Date': row.push(d.closingDate || ''); break;
          case 'Days to Close': row.push(d.closingDaysFromNow?.toString() || ''); break;
          case 'Settlement Company': row.push(d.settlementCompany || ''); break;
          case 'Inspection Days': row.push(d.inspectionContingencyDays?.toString() || 'None'); break;
          case 'Financing Contingency Days': row.push(d.financingContingencyDays?.toString() || 'None'); break;
          case 'Appraisal Contingency': row.push(d.appraisalContingency?.present ? `Yes${d.appraisalContingency.gapCoverage ? ` (gap: ${d.appraisalContingency.gapCoverage})` : ''}` : 'Waived'); break;
          case 'Home Sale Contingency': row.push(d.homeSaleContingency ? 'YES ⚠️' : 'No'); break;
          case 'Seller Concessions': row.push(d.sellerConcessions || 'None'); break;
          case 'Personal Property': row.push(d.personalProperty?.join('; ') || 'None'); break;
          case 'Post-Settlement Occupancy': row.push(d.postSettlementOccupancy || 'None'); break;
          case 'Escalation Clause': row.push(d.escalationClause?.present ? `Yes — cap ${d.escalationClause.cap}` : 'No'); break;
          case 'Risk Flags': row.push(d.riskFlags?.join('; ') || 'None'); break;
          default: row.push('');
        }
      }
      rows.push(row);
    }
    downloadCSVBlob(rows, `contract-comparison-${data.address.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
  };

  // ─── PDF Export (comparison) ──────────────────────────────────
  const exportComparePDF = () => {
    const data = showCompareDemo ? SAMPLE_COMPARE : compareResult;
    if (!data) return;
    // Generate a printable HTML document and trigger print
    const w = window.open('', '_blank');
    if (!w) return;
    const offerHeaders = data.offers.map((o) => `<th style="padding:8px;border:1px solid #ccc;background:#f0f0f0">${o.label}<br><small>${o.fileName}</small></th>`).join('');
    const fieldRows = [
      ['Purchase Price', (d: CompareOfferData) => d.purchasePriceFormatted || ''],
      ['Earnest Money', (d: CompareOfferData) => d.earnestMoneyFormatted || ''],
      ['Financing Type', (d: CompareOfferData) => d.financingType || ''],
      ['Down Payment', (d: CompareOfferData) => d.downPaymentPercent || ''],
      ['Closing Date', (d: CompareOfferData) => d.closingDate || ''],
      ['Days to Close', (d: CompareOfferData) => d.closingDaysFromNow?.toString() || ''],
      ['Inspection Days', (d: CompareOfferData) => d.inspectionContingencyDays?.toString() || 'None'],
      ['Financing Contingency', (d: CompareOfferData) => d.financingContingencyDays?.toString() || 'None'],
      ['Appraisal Contingency', (d: CompareOfferData) => d.appraisalContingency?.present ? `Yes${d.appraisalContingency.gapCoverage ? ` (gap: ${d.appraisalContingency.gapCoverage})` : ''}` : 'Waived'],
      ['Home Sale Contingency', (d: CompareOfferData) => d.homeSaleContingency ? 'YES ⚠️' : 'No'],
      ['Seller Concessions', (d: CompareOfferData) => d.sellerConcessions || 'None'],
      ['Personal Property', (d: CompareOfferData) => d.personalProperty?.join(', ') || 'None'],
      ['Post-Settlement Occupancy', (d: CompareOfferData) => d.postSettlementOccupancy || 'None'],
    ] as [string, (d: CompareOfferData) => string][];

    const tableRows = fieldRows.map(([label, fn]) => {
      const cells = data.offers.map((o) => `<td style="padding:8px;border:1px solid #ccc">${o.data ? fn(o.data) : 'N/A'}</td>`).join('');
      return `<tr><td style="padding:8px;border:1px solid #ccc;font-weight:bold;background:#fafafa">${label}</td>${cells}</tr>`;
    }).join('');

    const summaryHtml = data.comparison?.summary?.map((s) => `<li>${s}</li>`).join('') || '';
    const bestHtml = data.comparison?.bestOffer ? `<h3>🏆 Best Offer: ${data.comparison.bestOffer.label}</h3><p>${data.comparison.bestOffer.reasoning}</p>` : '';
    const riskHtml = data.comparison?.riskAnalysis?.map((r) => `<h4>${r.offer}</h4><ul>${r.risks.map((ri) => `<li>${ri}</li>`).join('')}</ul>`).join('') || '';

    w.document.write(`<!DOCTYPE html><html><head><title>Contract Comparison — ${data.address}</title>
      <style>body{font-family:Arial,sans-serif;max-width:1000px;margin:20px auto;padding:20px}table{border-collapse:collapse;width:100%}h1{color:#37b0c9}h3{margin-top:24px}.disclaimer{color:#999;font-size:12px;margin-top:20px;padding-top:10px;border-top:1px solid #eee}</style>
    </head><body>
      <h1>Contract Comparison Report</h1><p><strong>Property:</strong> ${data.address}</p>
      ${summaryHtml ? `<h3>Quick Summary</h3><ul>${summaryHtml}</ul>` : ''}
      <table><thead><tr><th style="padding:8px;border:1px solid #ccc;background:#f0f0f0">Field</th>${offerHeaders}</tr></thead><tbody>${tableRows}</tbody></table>
      ${bestHtml}
      ${riskHtml ? `<h3>⚠️ Risk Analysis</h3>${riskHtml}` : ''}
      <p class="disclaimer">⚖️ This is AI-generated analysis for informational purposes only. It does not constitute legal advice. Always consult with a licensed attorney or real estate professional before making decisions. Generated by AgentAIBrief.com</p>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  function downloadCSVBlob(rows: string[][], filename: string) {
    const csv = rows.map((r) => r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  const activeCompare = showCompareDemo ? SAMPLE_COMPARE : compareResult;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">Agent<span className="text-[#37b0c9]">AI</span>Brief</Link>
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
            {mode === 'compare' ? 'COMPARE OFFERS' : 'AI-POWERED'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Contract <span className="text-[#37b0c9]">{mode === 'compare' ? 'Comparison' : 'Analyzer'}</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            {mode === 'compare'
              ? 'Upload multiple offers and get a side-by-side comparison with AI-powered recommendations for your listing.'
              : 'Upload your real estate contracts and get every term, contingency, and deadline extracted into a clean spreadsheet — powered by AI.'}
          </p>

          {/* Mode Toggle */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setMode('analyze')}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition ${mode === 'analyze' ? 'bg-[#37b0c9] text-white' : 'border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'}`}
            >📄 Analyze Contract</button>
            <button
              onClick={() => setMode('compare')}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition ${mode === 'compare' ? 'bg-[#37b0c9] text-white' : 'border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'}`}
            >⚖️ Compare Offers</button>
          </div>

          <div className="flex justify-center gap-4">
            {mode === 'analyze' ? (
              <>
                <button onClick={() => { setShowDemo(true); setResults(null); }} className="px-6 py-3 border border-[#37b0c9] text-[#37b0c9] rounded-lg font-medium hover:bg-[#37b0c9]/10 transition">View Sample Output</button>
                <a href="#upload" className="px-6 py-3 bg-[#37b0c9] text-white rounded-lg font-medium hover:bg-[#37b0c9]/80 transition">Analyze a Contract</a>
              </>
            ) : (
              <>
                <button onClick={() => { setShowCompareDemo(true); setCompareResult(null); }} className="px-6 py-3 border border-[#37b0c9] text-[#37b0c9] rounded-lg font-medium hover:bg-[#37b0c9]/10 transition">View Sample Comparison</button>
                <a href="#upload" className="px-6 py-3 bg-[#37b0c9] text-white rounded-lg font-medium hover:bg-[#37b0c9]/80 transition">Compare Offers</a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Free', price: '$0', desc: '/month', features: ['Analyze 1 contract/month', 'View sample outputs', 'Basic CSV export'] },
            { name: 'Pro', price: '$19', desc: '/month', features: ['Unlimited analysis', 'Compare up to 3 offers', 'CSV export', 'AI recommendations'], highlight: true },
            { name: 'Inner Circle', price: '$99', desc: '/month', features: ['Unlimited everything', 'Compare up to 5 offers', 'PDF export', 'Calendar sync (.ics)', 'Priority processing'] },
          ].map((tier) => (
            <div key={tier.name} className={`rounded-xl p-6 border ${tier.highlight ? 'border-[#37b0c9] bg-[#37b0c9]/5' : 'border-gray-800 bg-gray-900'}`}>
              <h3 className="font-bold text-lg">{tier.name}</h3>
              <p className="text-3xl font-bold mt-2">{tier.price}<span className="text-sm text-gray-400 font-normal">/mo</span></p>
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
        <h2 className="text-2xl font-bold mb-6">{mode === 'compare' ? 'Upload Offers to Compare' : 'Upload & Analyze'}</h2>

        {/* Address Input (shared) */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Property Address</label>
          <input
            type="text" placeholder="e.g. 1234 Oak Street, Arlington, VA 22201"
            value={address} onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#37b0c9]"
          />
        </div>

        {mode === 'analyze' ? (
          <div className="space-y-4">
            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${dragOver ? 'border-[#37b0c9] bg-[#37b0c9]/5' : 'border-gray-700 hover:border-gray-500'}`}
            >
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" />
              <div className="text-4xl mb-3">📄</div>
              <p className="text-gray-300 font-medium">Drag & drop contracts here</p>
              <p className="text-gray-500 text-sm mt-1">PDF, JPG, PNG — or click to browse</p>
            </div>
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
            <button onClick={analyze} disabled={!address || !files.length || analyzing}
              className="w-full py-3 bg-[#37b0c9] text-white font-bold rounded-lg hover:bg-[#37b0c9]/80 transition disabled:opacity-40 disabled:cursor-not-allowed">
              {analyzing ? 'Analyzing contracts...' : `Analyze ${files.length} Contract${files.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        ) : (
          /* Compare Mode Upload */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {compareFiles.map((file, idx) => (
                <div key={idx} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#37b0c9]">Offer {String.fromCharCode(65 + idx)}</span>
                    {compareFiles.length > 2 && (
                      <button onClick={() => removeCompareSlot(idx)} className="text-gray-500 hover:text-red-400 text-xs">Remove</button>
                    )}
                  </div>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setCompareDragOver(idx); }}
                    onDragLeave={() => setCompareDragOver(null)}
                    onDrop={(e) => handleCompareDrop(e, idx)}
                    onClick={() => compareInputRefs.current[idx]?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition min-h-[120px] flex flex-col items-center justify-center ${
                      compareDragOver === idx ? 'border-[#37b0c9] bg-[#37b0c9]/5' : file ? 'border-green-700/50 bg-green-900/10' : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <input
                      ref={(el) => { compareInputRefs.current[idx] = el; }}
                      type="file" accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleCompareFileSelect(e, idx)}
                      className="hidden"
                    />
                    {file ? (
                      <>
                        <div className="text-2xl mb-1">✅</div>
                        <p className="text-sm text-gray-300 truncate max-w-full">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl mb-1">📄</div>
                        <p className="text-sm text-gray-400">Drop PDF here</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {compareFiles.length < 5 && (
              <button onClick={addCompareSlot} className="text-sm text-[#37b0c9] hover:text-[#37b0c9]/80 font-medium">
                + Add Another Offer (up to 5)
              </button>
            )}
            <button onClick={runComparison}
              disabled={!address || compareFiles.filter(Boolean).length < 2 || analyzing}
              className="w-full py-3 bg-[#37b0c9] text-white font-bold rounded-lg hover:bg-[#37b0c9]/80 transition disabled:opacity-40 disabled:cursor-not-allowed">
              {analyzing ? 'Comparing offers...' : `Analyze & Compare ${compareFiles.filter(Boolean).length} Offers`}
            </button>
          </div>
        )}
      </section>

      {/* ═══ SINGLE ANALYSIS RESULTS ═══ */}
      {mode === 'analyze' && activeData && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              <p className="text-gray-400 text-sm">{activeData.address}{showDemo ? ' (Sample Demo)' : ''}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={exportCSV} className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-700 transition flex items-center gap-2">📥 Export CSV</button>
            </div>
          </div>

          {activeData.results.map((result, idx) => (
            <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
                <h3 className="font-semibold text-[#37b0c9]">📄 {result.fileName}</h3>
                {result.data && (
                  <button
                    onClick={() => downloadCalendar(result.data, activeData.address)}
                    className="px-3 py-1.5 bg-[#37b0c9]/10 border border-[#37b0c9]/30 rounded-lg text-xs font-medium text-[#37b0c9] hover:bg-[#37b0c9]/20 transition"
                  >📅 Add to Calendar</button>
                )}
              </div>
              {result.data ? (
                <div className="divide-y divide-gray-800">
                  <ResultSection title="Key Terms">
                    <ResultRow label="Purchase Price" value={result.data.purchasePrice} />
                    <ResultRow label="Closing Date" value={result.data.closingDate} />
                    <ResultRow label="Settlement Company" value={result.data.settlementCompany} />
                    <ResultRow label="Possession Date" value={result.data.possessionDate} />
                  </ResultSection>
                  <ResultSection title="Financing">
                    <ResultRow label="Type" value={result.data.financingType} />
                    <ResultRow label="Loan Amount" value={result.data.loanAmount} />
                    <ResultRow label="Down Payment" value={result.data.downPayment} />
                    <ResultRow label="Interest Rate" value={result.data.interestRate} />
                  </ResultSection>
                  <ResultSection title="Earnest Money Deposit">
                    <ResultRow label="Amount" value={result.data.earnestMoney?.amount} />
                    <ResultRow label="Due Date" value={result.data.earnestMoney?.dueDate} />
                    <ResultRow label="Held By" value={result.data.earnestMoney?.heldBy} />
                  </ResultSection>
                  {result.data.contingencies && result.data.contingencies.length > 0 && (
                    <ResultSection title="Contingencies">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className="text-left text-gray-400"><th className="px-6 py-2 font-medium">Type</th><th className="px-6 py-2 font-medium">Deadline</th><th className="px-6 py-2 font-medium">Details</th></tr></thead>
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
                  {result.data.escalationClause?.present && (
                    <ResultSection title="Escalation Clause">
                      <ResultRow label="Max Price" value={result.data.escalationClause.maxPrice} />
                      <ResultRow label="Increment" value={result.data.escalationClause.increment} />
                      <ResultRow label="Details" value={result.data.escalationClause.details} />
                    </ResultSection>
                  )}
                  <ResultSection title="Other Terms">
                    <ResultRow label="Seller Concessions" value={result.data.sellerConcessions} />
                    <ResultRow label="Personal Property" value={result.data.personalProperty?.join(', ')} />
                    {result.data.homeWarranty?.included && (
                      <ResultRow label="Home Warranty" value={`${result.data.homeWarranty.provider} — ${result.data.homeWarranty.cost} (${result.data.homeWarranty.paidBy})`} />
                    )}
                    {result.data.otherTerms?.map((t, i) => <ResultRow key={i} label={`Note ${i + 1}`} value={t} />)}
                  </ResultSection>
                  {result.data.addenda && result.data.addenda.length > 0 && (
                    <ResultSection title="Addenda & Riders">
                      {result.data.addenda.map((a, i) => <ResultRow key={i} label={`Addendum ${i + 1}`} value={a} />)}
                    </ResultSection>
                  )}
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

      {/* ═══ COMPARISON RESULTS ═══ */}
      {mode === 'compare' && activeCompare && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          {/* Header + Export */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold">Comparison Results</h2>
              <p className="text-gray-400 text-sm">{activeCompare.address}{showCompareDemo ? ' (Sample Demo)' : ''}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={exportCompareCSV} className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-700 transition">📥 CSV</button>
              <button onClick={exportComparePDF} className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-700 transition">📄 PDF</button>
            </div>
          </div>

          {/* AI Summary */}
          {activeCompare.comparison && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">🤖 AI Quick Summary</h3>
              <ul className="space-y-2 mb-6">
                {activeCompare.comparison.summary.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-300">
                    <span className="text-[#37b0c9] shrink-0">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>

              {/* Best Offer */}
              <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-green-400 mb-1">🏆 Best Offer: {activeCompare.comparison.bestOffer.label}</h4>
                <p className="text-sm text-gray-300">{activeCompare.comparison.bestOffer.reasoning}</p>
              </div>

              {/* Risk Analysis */}
              <h4 className="font-semibold text-sm text-gray-400 uppercase tracking-wider mb-3">⚠️ Risk Flags</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeCompare.comparison.riskAnalysis.map((r) => (
                  <div key={r.offer} className={`rounded-lg p-3 border ${r.risks.length > 3 ? 'bg-red-900/20 border-red-700/30' : r.risks.length > 0 ? 'bg-yellow-900/15 border-yellow-700/25' : 'bg-green-900/15 border-green-700/25'}`}>
                    <h5 className="font-semibold text-sm mb-2">{r.offer}</h5>
                    {r.risks.length === 0 ? (
                      <p className="text-xs text-green-400">✅ No significant risks</p>
                    ) : (
                      <ul className="space-y-1">
                        {r.risks.map((ri, i) => (
                          <li key={i} className="text-xs text-gray-300 flex gap-1.5">
                            <span className="text-red-400 shrink-0">⚠</span>{ri}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-4 pt-3 border-t border-gray-800">
                ⚖️ This is AI-generated analysis for informational purposes only. It does not constitute legal advice. Always consult with a licensed attorney or real estate professional.
              </p>
            </div>
          )}

          {/* Side-by-Side Comparison Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-gray-400 font-medium bg-gray-900 sticky left-0 z-10 min-w-[160px]">Field</th>
                    {activeCompare.offers.map((o) => (
                      <th key={o.label} className="px-4 py-3 text-left font-semibold text-[#37b0c9] min-w-[180px]">
                        {o.label}<br /><span className="text-xs text-gray-500 font-normal">{o.fileName}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  <CompareRow label="Purchase Price" offers={activeCompare.offers} field="purchasePriceFormatted" colorize colorField="purchasePrice" colorMode="highest" />
                  <CompareRow label="Earnest Money" offers={activeCompare.offers} field="earnestMoneyFormatted" colorize colorField="earnestMoney" colorMode="highest" />
                  <CompareRow label="Financing Type" offers={activeCompare.offers} render={(d) => d.financingType || '—'} />
                  <CompareRow label="Down Payment %" offers={activeCompare.offers} render={(d) => d.downPaymentPercent || '—'} />
                  <CompareRow label="Closing Date" offers={activeCompare.offers} render={(d) => d.closingDate ? `${d.closingDate}${d.closingDaysFromNow ? ` (${d.closingDaysFromNow}d)` : ''}` : '—'} colorize colorField="closingDaysFromNow" colorMode="lowest" />
                  <CompareRow label="Settlement Co." offers={activeCompare.offers} field="settlementCompany" />
                  <CompareRow label="Inspection Days" offers={activeCompare.offers} render={(d) => d.inspectionContingencyDays?.toString() || 'None'} colorize colorField="inspectionContingencyDays" colorMode="lowest" />
                  <CompareRow label="Financing Contingency" offers={activeCompare.offers} render={(d) => d.financingContingencyDays ? `${d.financingContingencyDays} days` : 'None'} colorize colorField="financingContingencyDays" colorMode="lowest" />
                  <CompareRow label="Appraisal Contingency" offers={activeCompare.offers} render={(d) => d.appraisalContingency?.present ? `Yes${d.appraisalContingency.gapCoverage ? ` — gap: ${d.appraisalContingency.gapCoverage}` : ''}` : '✅ Waived'} />
                  <CompareRow label="Home Sale Contingency" offers={activeCompare.offers} render={(d) => d.homeSaleContingency ? '🔴 YES' : '✅ No'} />
                  <CompareRow label="Seller Concessions" offers={activeCompare.offers} render={(d) => d.sellerConcessions || 'None'} colorize colorField="sellerConcessionsAmount" colorMode="lowest" />
                  <CompareRow label="Personal Property" offers={activeCompare.offers} render={(d) => d.personalProperty?.join(', ') || 'None'} />
                  <CompareRow label="Post-Settlement Occupancy" offers={activeCompare.offers} render={(d) => d.postSettlementOccupancy || 'None'} />
                  <CompareRow label="Escalation Clause" offers={activeCompare.offers} render={(d) => d.escalationClause?.present ? `Yes — cap: ${d.escalationClause.cap || 'N/A'}` : 'No'} />
                  <CompareRow label="Unusual Clauses" offers={activeCompare.offers} render={(d) => d.unusualClauses?.length ? d.unusualClauses.join('; ') : 'None'} />
                </tbody>
              </table>
            </div>
          </div>
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

// ─── Shared Components ────────────────────────────────────────────────

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

function CompareRow({
  label, offers, field, render, colorize, colorField, colorMode,
}: {
  label: string;
  offers: CompareOffer[];
  field?: string;
  render?: (d: CompareOfferData) => string;
  colorize?: boolean;
  colorField?: string;
  colorMode?: 'highest' | 'lowest';
}) {
  const { best, worst } = colorize && colorField && colorMode
    ? getBestWorst(offers, colorField, colorMode)
    : { best: -1, worst: -1 };

  return (
    <tr>
      <td className="px-4 py-2.5 text-gray-400 font-medium bg-gray-900 sticky left-0 z-10">{label}</td>
      {offers.map((o, idx) => {
        const d = o.data;
        const val = d ? (render ? render(d) : (d as Record<string, unknown>)[field || '']?.toString() || '—') : 'N/A';
        const color = colorize && best >= 0 ? cellColor(idx, best, worst) : '';
        return (
          <td key={o.label} className={`px-4 py-2.5 text-white border-l border-gray-800/30 ${color}`}>
            {val}
          </td>
        );
      })}
    </tr>
  );
}
