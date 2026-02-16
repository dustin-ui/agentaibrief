'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { generateICS, generateGoogleCalendarLink, extractCalendarEvents } from '@/lib/calendar-export';
import { supabase } from '@/lib/supabase';
import { PaywallGate } from '@/components/PaywallGate';

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
  propertyAddress?: string | null;
  purchasePrice?: number | null;
  purchasePriceFormatted?: string | null;
  earnestMoneyDeposit?: number | null;
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
  financingContingencyDays?: number | null;
  appraisalContingency?: string | null;
  appraisalContingencyDays?: number | null;
  homeInspection?: string | null;
  homeInspectionDays?: number | null;
  hoaContingency?: string | null;
  escalationClause?: { present?: boolean; increment?: string | null; maxEscalation?: string | null; maxEscalationAmount?: number | null; details?: string | null };
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
  // legacy fields for calendar compat
  allDatesAndDeadlines?: Array<{ event: string; date: string; daysFromNow?: number | null }>;
};

type CompareOffer = { label: string; fileName: string; data: CompareOfferData | null; error?: string };
type CompareResult = {
  address: string;
  offers: CompareOffer[];
  comparison: {
    summary: string;
  } | null;
};

type OfferFiles = { files: File[] };

// ─── Color helpers ───────────────────────────────────────────────────
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
  if (idx === best) return 'bg-green-50 border-green-300';
  if (idx === worst) return 'bg-red-50 border-red-300';
  return 'bg-yellow-50 border-yellow-300';
}

function calcSellerNet(d: CompareOfferData): string {
  const price = d.escalationClause?.present && d.escalationClause.maxEscalationAmount
    ? d.escalationClause.maxEscalationAmount
    : d.purchasePrice;
  if (!price) return '—';
  const concessions = d.sellerConcessionsAmount || 0;
  const buyerAgency = d.sellerPaidBuyerAgencyAmount || 0;
  const net = price - concessions - buyerAgency;
  return `$${net.toLocaleString()} (estimated)`;
}

const DEFAULT_FIELDS = [
  'Purchase Price', 'Earnest Money Deposit', 'Financing Type', 'Amount Financed',
  'Down Payment', 'Seller Paid Buyer Agency', 'Seller Concessions', 'Closing Date',
  'Financing Contingency', 'Appraisal Contingency', 'Home Inspection', 'HOA',
  'Escalation', 'Escalation Increments', 'Max Escalation', 'WDI', 'Appraisal Gap',
  'Septic/Well', 'Septic Paid By', 'Radon', 'Lender', 'Title Company',
  'Buyer Name', 'Buyer Agent Name', 'Rent Back',
];

const LOADING_MESSAGES = [
  'Reading contract documents...',
  'Extracting key terms...',
  'Comparing offers...',
  'Calculating seller net...',
  'Almost done...',
];

const OFFER_COLORS = ['#e85d26', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#f97316', '#ec4899', '#6366f1', '#14b8a6', '#e11d48'];
const OFFER_LABELS = Array.from({ length: 20 }, (_, i) => String.fromCharCode(65 + i));

// ─── Main Page ───────────────────────────────────────────────────────
export default function ContractAnalyzerPage() {
  // Wizard state
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [offerCount, setOfferCount] = useState(2);
  const [offers, setOffers] = useState<OfferFiles[]>([{ files: [] }, { files: [] }]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState('');
  const [error, setError] = useState('');

  // Results
  const [singleResults, setSingleResults] = useState<{ address: string; results: { fileName: string; data: ContractData }[] } | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);

  // Winner / calendar
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [addToCalendar, setAddToCalendar] = useState(true);
  const [ratificationDate, setRatificationDate] = useState('');
  const [showRatDateInput, setShowRatDateInput] = useState(false);
  const [calculatingDates, setCalculatingDates] = useState(false);
  const [discoveredEvents, setDiscoveredEvents] = useState<Array<{ title: string; date: Date }>>([]);
  const [visibleEventCount, setVisibleEventCount] = useState(0);
  const [removedEventIndices, setRemovedEventIndices] = useState<Set<number>>(new Set());
  const [reminderChecked, setReminderChecked] = useState<Set<number>>(new Set());
  const [reminderEmails, setReminderEmails] = useState<string[]>(['']);
  const [selectAllReminders, setSelectAllReminders] = useState(true);

  // Share
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  // Fields selection
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set(DEFAULT_FIELDS));
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [customFieldInput, setCustomFieldInput] = useState('');

  // Loading animation
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Agent Notes
  const [agentNotes, setAgentNotes] = useState('');

  // Supabase persistence
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savedShareId, setSavedShareId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedComparisons, setSavedComparisons] = useState<Array<{ id: string; address: string; offers: CompareOffer[]; created_at: string; share_id: string }>>([]);
  const [showSaved, setShowSaved] = useState(false);
  const notesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Loading animation cycle
  useEffect(() => {
    if (!analyzing) { setLoadingMsgIdx(0); setLoadingProgress(0); return; }
    const msgInterval = setInterval(() => setLoadingMsgIdx(i => (i + 1) % LOADING_MESSAGES.length), 3000);
    const progInterval = setInterval(() => setLoadingProgress(p => Math.min(p + 0.5, 95)), 200);
    return () => { clearInterval(msgInterval); clearInterval(progInterval); };
  }, [analyzing]);

  // Auto-save when comparison completes (step 4, no savedId yet)
  useEffect(() => {
    if (step === 4 && compareResult && !savedId && saveStatus === 'idle') {
      saveToSupabase(compareResult);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, compareResult, savedId, saveStatus]);

  // Load recent comparisons on mount
  useEffect(() => {
    fetch('/api/comparisons?recent=10')
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setSavedComparisons(data); })
      .catch(() => {});
  }, []);

  // Auto-save agent notes (debounced 1s)
  useEffect(() => {
    if (!savedId || saveStatus === 'saving') return;
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
    notesTimerRef.current = setTimeout(() => {
      fetch('/api/comparisons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: savedId, agent_notes: agentNotes }),
      }).catch(() => {});
    }, 1000);
    return () => { if (notesTimerRef.current) clearTimeout(notesTimerRef.current); };
  }, [agentNotes, savedId, saveStatus]);

  // Save comparison to Supabase
  const saveToSupabase = async (result: CompareResult) => {
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: result.address,
          offers: result.offers,
          comparison: result.comparison,
          agent_notes: agentNotes,
        }),
      });
      if (!res.ok) throw new Error();
      const { id, share_id } = await res.json();
      setSavedId(id);
      setSavedShareId(share_id);
      setSaveStatus('saved');
      // Refresh saved list
      fetch('/api/comparisons?recent=10')
        .then(r => r.ok ? r.json() : [])
        .then(data => { if (Array.isArray(data)) setSavedComparisons(data); })
        .catch(() => {});
    } catch {
      setSaveStatus('error');
    }
  };

  // Load a saved comparison
  const loadComparison = async (id: string) => {
    try {
      const res = await fetch(`/api/comparisons?id=${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setAddress(data.address);
      setCompareResult({ address: data.address, offers: data.offers, comparison: data.comparison });
      setAgentNotes(data.agent_notes || '');
      setSavedId(data.id);
      setSavedShareId(data.share_id);
      setSaveStatus('saved');
      setOfferCount(data.offers.length);
      setStep(4);
      setShowSaved(false);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } catch { /* ignore */ }
  };

  // ─── Field Selection ────────────────────────────────────────
  const toggleField = (field: string) => {
    setSelectedFields(prev => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field); else next.add(field);
      return next;
    });
  };

  const toggleAllFields = () => {
    const allFields = [...DEFAULT_FIELDS, ...customFields];
    if (allFields.every(f => selectedFields.has(f))) {
      setSelectedFields(new Set());
    } else {
      setSelectedFields(new Set(allFields));
    }
  };

  const addCustomField = () => {
    const val = customFieldInput.trim();
    if (val && !customFields.includes(val) && !DEFAULT_FIELDS.includes(val)) {
      setCustomFields(prev => [...prev, val]);
      setSelectedFields(prev => new Set([...prev, val]));
      setCustomFieldInput('');
    }
  };

  const removeCustomField = (field: string) => {
    setCustomFields(prev => prev.filter(f => f !== field));
    setSelectedFields(prev => { const next = new Set(prev); next.delete(field); return next; });
  };

  const getAllSelectedFields = () => [...selectedFields];

  // ─── Wizard Navigation ────────────────────────────────────────
  const goNext = () => setStep((s) => Math.min(s + 1, 4));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleOfferCountChange = (count: number) => {
    setOfferCount(count);
    const newOffers: OfferFiles[] = [];
    for (let i = 0; i < count; i++) {
      newOffers.push(offers[i] || { files: [] });
    }
    setOffers(newOffers);
  };

  // ─── File Handlers ────────────────────────────────────────────
  const handleFileDrop = useCallback((offerIdx: number, e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf' || f.type === 'image/jpeg' || f.type === 'image/png'
    );
    setOffers((prev) => {
      const next = [...prev];
      next[offerIdx] = { files: [...next[offerIdx].files, ...dropped] };
      return next;
    });
  }, []);

  const handleFileSelect = (offerIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setOffers((prev) => {
      const next = [...prev];
      next[offerIdx] = { files: [...next[offerIdx].files, ...selected] };
      return next;
    });
    e.target.value = '';
  };

  const removeFile = (offerIdx: number, fileIdx: number) => {
    setOffers((prev) => {
      const next = [...prev];
      next[offerIdx] = { files: next[offerIdx].files.filter((_, i) => i !== fileIdx) };
      return next;
    });
  };

  const allOffersHaveFiles = offers.every((o) => o.files.length > 0);
  const totalFiles = offers.reduce((sum, o) => sum + o.files.length, 0);

  // ─── Add Offer (from results page) ───────────────────────────
  const handleAddOffer = () => {
    const newCount = offerCount + 1;
    setOfferCount(newCount);
    setOffers((prev) => [...prev, { files: [] }]);
    setStep(3);
  };

  // ─── Analyze ──────────────────────────────────────────────────
  const runAnalysis = async () => {
    setAnalyzing(true);
    setError('');
    setAnalyzeProgress(`Analyzing ${totalFiles} document${totalFiles !== 1 ? 's' : ''} across ${offerCount} offer${offerCount !== 1 ? 's' : ''}...`);

    try {
      const fieldsJson = JSON.stringify(getAllSelectedFields());

      if (offerCount === 1) {
        // Single offer analysis
        const formData = new FormData();
        formData.set('address', address);
        formData.set('fields', fieldsJson);
        offers[0].files.forEach((f) => formData.append('files', f));
        const res = await fetch('/api/contract-analyze', { method: 'POST', body: formData });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
          throw new Error(err.error || 'Analysis failed');
        }
        setSingleResults(await res.json());
        setCompareResult(null);
      } else {
        // Multi-offer comparison — only send offers that have new files
        // If we have existing results, we need to merge
        const formData = new FormData();
        formData.set('address', address);
        formData.set('fields', fieldsJson);

        // Find which offers have files (new ones to analyze)
        const offersToAnalyze: number[] = [];
        offers.forEach((offer, i) => {
          if (offer.files.length > 0) {
            // Check if this offer already has results
            const existingOffer = compareResult?.offers[i];
            if (!existingOffer?.data) {
              offersToAnalyze.push(i);
            }
          }
        });

        // If we have existing results and only new offers to add
        if (compareResult && offersToAnalyze.length > 0 && offersToAnalyze.length < offerCount) {
          // Only send new offers
          formData.set('offerCount', offersToAnalyze.length.toString());
          offersToAnalyze.forEach((origIdx, newIdx) => {
            offers[origIdx].files.forEach((f) => formData.append(`offer_${newIdx}_files`, f));
          });

          const res = await fetch('/api/contract-compare', { method: 'POST', body: formData });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Comparison failed' }));
            throw new Error(err.error || 'Comparison failed');
          }
          const newResult = await res.json() as CompareResult;

          // Merge: keep existing offers + add new ones with correct labels
          const mergedOffers = [...compareResult.offers];
          let newIdx = 0;
          for (const origIdx of offersToAnalyze) {
            const newOffer = newResult.offers[newIdx];
            if (newOffer) {
              newOffer.label = `Offer ${OFFER_LABELS[origIdx]}`;
              mergedOffers[origIdx] = newOffer;
            }
            newIdx++;
          }

          setCompareResult({
            address,
            offers: mergedOffers,
            comparison: newResult.comparison,
          });
        } else {
          // Fresh analysis — upload files to Supabase Storage first, then send URLs
          const sessionId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          const offerResults: Array<{ label: string; fileName: string; data: Record<string, unknown> | null; error?: string }> = [];

          // Upload all files to Supabase Storage in parallel
          const offersWithUrls = await Promise.all(
            offers.map(async (offer, i) => {
              if (offer.files.length === 0) {
                return { label: `Offer ${OFFER_LABELS[i]}`, fileUrls: [] as string[], fileNames: [] as string[] };
              }
              const fileUrls: string[] = [];
              const fileNames: string[] = [];
              await Promise.all(
                offer.files.map(async (file) => {
                  const path = `${sessionId}/offer_${i}/${file.name}`;
                  const { error: uploadError } = await supabase.storage.from('contracts').upload(path, file);
                  if (uploadError) throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
                  const { data: urlData } = supabase.storage.from('contracts').getPublicUrl(path);
                  fileUrls.push(urlData.publicUrl);
                  fileNames.push(file.name);
                })
              );
              return { label: `Offer ${OFFER_LABELS[i]}`, fileUrls, fileNames };
            })
          );

          // Send all offers to API as JSON with URLs (no body size limit concerns)
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 290000);
            const res = await fetch('/api/contract-compare', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                address,
                fields: getAllSelectedFields(),
                offers: offersWithUrls.map((o) => ({
                  label: o.label,
                  fileUrls: o.fileUrls,
                })),
              }),
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!res.ok) {
              const err = await res.json().catch(() => ({ error: 'Comparison failed' }));
              throw new Error(err.error || 'Comparison failed');
            }
            const result = await res.json();
            offerResults.push(...result.offers);
          } catch (err) {
            // Fallback: populate errors for all offers
            for (let i = 0; i < offers.length; i++) {
              const msg = err instanceof DOMException && err.name === 'AbortError' ? 'Request timed out' : String(err).slice(0, 200);
              offerResults.push({ label: `Offer ${OFFER_LABELS[i]}`, fileName: offers[i].files.map(f => f.name).join(', '), data: null, error: msg });
            }
          }

          // Get summary comparison if 2+ valid offers (optional — won't block results)
          let comparison = null;
          const validOffers = offerResults.filter(o => o.data);
          if (validOffers.length >= 2) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 60000);
              const summaryRes = await fetch('/api/contract-compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summarize: true, offers: validOffers, address }),
                signal: controller.signal,
              });
              clearTimeout(timeoutId);
              if (summaryRes.ok) {
                const summaryData = await summaryRes.json();
                comparison = summaryData.comparison;
              }
            } catch { /* summary is optional — show results without it */ }
          }

          setCompareResult({ address, offers: offerResults, comparison });
        }
        setSingleResults(null);
      }
      setSelectedWinner(null);
      setShareUrl(null);
      setSavedId(null);
      setSavedShareId(null);
      setSaveStatus('idle');
      setStep(4);
      // Scroll to top so user sees comparison table first
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
      setAnalyzeProgress('');
    }
  };

  // ─── Calendar Export ──────────────────────────────────────────
  const downloadCalendar = (contractData: ContractData | CompareOfferData, addr: string, ratDate?: Date) => {
    const events = extractCalendarEvents(contractData as Record<string, unknown>, addr, ratDate);
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

  const openGoogleCalendar = (contractData: CompareOfferData, addr: string, ratDate?: Date) => {
    const events = extractCalendarEvents(contractData as Record<string, unknown>, addr, ratDate);
    if (!events.length) { alert('No parseable dates found.'); return; }
    for (const event of events) {
      const link = generateGoogleCalendarLink(event);
      window.open(link, '_blank');
    }
  };

  // ─── Select Winner ───────────────────────────────────────────
  const handleSelectWinner = (label: string) => {
    setSelectedWinner(label);
    setShowRatDateInput(true);
    setRatificationDate('');
    setDiscoveredEvents([]);
    setVisibleEventCount(0);
    setCalculatingDates(false);
    setRemovedEventIndices(new Set());
    setReminderChecked(new Set());
    setReminderEmails(['']);
    setSelectAllReminders(true);
  };

  const handleRatDateSubmit = () => {
    if (!ratificationDate || !selectedWinner || !compareResult) return;
    const offer = compareResult.offers.find(o => o.label === selectedWinner);
    if (!offer?.data) return;

    const ratDate = new Date(ratificationDate + 'T12:00:00');
    const events = extractCalendarEvents(offer.data as Record<string, unknown>, compareResult.address, ratDate);
    
    if (!events.length) {
      setShowCalendarModal(true);
      return;
    }

    // Animate: show "calculating" then reveal events one by one
    setCalculatingDates(true);
    setDiscoveredEvents(events);
    setVisibleEventCount(0);
    // Default all reminders to checked
    setReminderChecked(new Set(events.map((_, i) => i)));
    setSelectAllReminders(true);

    // Reveal events one at a time with animation
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleEventCount(count);
      if (count >= events.length) {
        clearInterval(interval);
        setTimeout(() => {
          setCalculatingDates(false);
        }, 600);
      }
    }, 300);
  };

  const confirmWinner = () => {
    setShowCalendarModal(false);
    if (addToCalendar && selectedWinner && compareResult) {
      const offer = compareResult.offers.find(o => o.label === selectedWinner);
      if (offer?.data) {
        const ratDate = ratificationDate ? new Date(ratificationDate + 'T12:00:00') : undefined;
        downloadCalendar(offer.data, compareResult.address, ratDate);
      }
    }
  };

  // ─── Share (real URL) ───────────────────────────────────────────
  const shareComparison = async () => {
    if (!compareResult) return;
    setSharing(true);
    try {
      const shareId = savedShareId;
      if (!shareId) { alert('Save in progress, try again in a moment.'); return; }
      const url = `https://agentaibrief.com/compare/${shareId}`;
      await navigator.clipboard.writeText(url);
      setShareUrl(url);
      setTimeout(() => setShareUrl(null), 5000);
    } catch {
      alert('Failed to copy share link');
    } finally {
      setSharing(false);
    }
  };

  // ─── CSV Exports ──────────────────────────────────────────────
  function downloadCSVBlob(rows: string[][], filename: string) {
    const csv = rows.map((r) => r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  const exportSingleCSV = () => {
    if (!singleResults) return;
    const rows: string[][] = [['Field', 'Value']];
    for (const result of singleResults.results) {
      const d = result.data;
      if (!d) continue;
      rows.push(['--- File ---', result.fileName]);
      rows.push(['Purchase Price', d.purchasePrice || '']);
      rows.push(['Closing Date', d.closingDate || '']);
      rows.push(['Financing Type', d.financingType || '']);
      rows.push(['Earnest Money', d.earnestMoney?.amount || '']);
      rows.push(['Seller Concessions', d.sellerConcessions || '']);
      d.contingencies?.forEach((c) => rows.push([`Contingency: ${c.type}`, `${c.details} (Deadline: ${c.deadline})`]));
    }
    downloadCSVBlob(rows, `contract-analysis-${address.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
  };

  const exportCompareCSV = () => {
    if (!compareResult) return;
    const fields: [string, (d: CompareOfferData) => string][] = [
      ['Buyer Name', d => d.buyerName || ''],
      ['Buyer Agent', d => d.buyerAgentName || ''],
      ['Purchase Price', d => d.purchasePriceFormatted || ''],
      ['Earnest Money Deposit', d => d.earnestMoneyDepositFormatted || ''],
      ['Financing Type', d => d.financingType || ''],
      ['Amount Financed', d => d.amountFinanced || ''],
      ['Down Payment', d => d.downPayment || ''],
      ['Seller Paid Buyer Agency', d => d.sellerPaidBuyerAgency || 'None'],
      ['Seller Concessions', d => d.sellerConcessions || 'None'],
      ['Closing Date', d => d.closingDate || ''],
      ['Financing Contingency', d => d.financingContingency || 'None'],
      ['Appraisal Contingency', d => d.appraisalContingency || 'None'],
      ['Home Inspection', d => d.homeInspection || 'None'],
      ['HOA', d => d.hoaContingency || 'None'],
      ['Escalation', d => d.escalationClause?.present ? 'Yes' : 'No'],
      ['Escalation Increments', d => d.escalationClause?.increment || ''],
      ['Max Escalation', d => d.escalationClause?.maxEscalation || ''],
      ['WDI', d => d.wdiInspection || 'None'],
      ['Appraisal Gap', d => d.appraisalGap || 'None'],
      ['Septic/Well', d => d.septicWell || 'None'],
      ['Septic Paid By', d => d.septicPaidBy || ''],
      ['Radon', d => d.radon || 'None'],
      ['Lender', d => d.lender || ''],
      ['Title Company', d => d.titleCompany || ''],
      ['Rent Back', d => d.rentBack || 'None'],
      ['Notes', d => d.notes || ''],
      ['Seller Net Estimate', d => calcSellerNet(d)],
    ];
    const rows: string[][] = [['Field', ...compareResult.offers.map((o) => o.label)]];
    for (const [label, fn] of fields) {
      const row = [label];
      for (const offer of compareResult.offers) {
        row.push(offer.data ? fn(offer.data) : 'N/A');
      }
      rows.push(row);
    }
    downloadCSVBlob(rows, `contract-comparison-${address.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
  };

  // ─── PDF Export ───────────────────────────────────────────────
  const exportComparePDF = () => {
    if (!compareResult) return;
    const w = window.open('', '_blank');
    if (!w) return;

    const offerHeaders = compareResult.offers.map((o) =>
      `<th style="padding:10px;border:1px solid #ddd;background:#f8f9fa;min-width:160px">${o.label}<br><small style="color:#666">${o.fileName}</small>${o.data?.buyerName ? `<br><small style="color:#e85d26">${o.data.buyerName}</small>` : ''}</th>`
    ).join('');

    const fieldRows: [string, (d: CompareOfferData) => string][] = [
      ['Purchase Price', (d) => d.purchasePriceFormatted || '—'],
      ['Earnest Money Deposit', (d) => d.earnestMoneyDepositFormatted || '—'],
      ['Financing Type', (d) => d.financingType || '—'],
      ['Amount Financed', (d) => d.amountFinanced || '—'],
      ['Down Payment', (d) => d.downPayment || '—'],
      ['Seller Paid Buyer Agency', (d) => d.sellerPaidBuyerAgency || 'None'],
      ['Seller Concessions', (d) => d.sellerConcessions || 'None'],
      ['Closing Date', (d) => d.closingDate || '—'],
      ['Financing Contingency', (d) => d.financingContingency || 'None'],
      ['Appraisal Contingency', (d) => d.appraisalContingency || 'None'],
      ['Home Inspection', (d) => d.homeInspection || 'None'],
      ['Seller Net Estimate', (d) => calcSellerNet(d)],
    ];

    const tableRows = fieldRows.map(([label, fn]) => {
      const cells = compareResult.offers.map((o) => `<td style="padding:8px;border:1px solid #ddd">${o.data ? fn(o.data) : 'N/A'}</td>`).join('');
      return `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#fafafa">${label}</td>${cells}</tr>`;
    }).join('');

    w.document.write(`<!DOCTYPE html><html><head><title>Contract Comparison — ${compareResult.address}</title>
      <style>body{font-family:-apple-system,Arial,sans-serif;max-width:1100px;margin:20px auto;padding:20px;color:#333}table{border-collapse:collapse;width:100%}h1{color:#e85d26}@media print{body{max-width:100%}}</style>
    </head><body>
      <h1>📋 Contract Comparison Report</h1>
      <p><strong>Property:</strong> ${compareResult.address}</p>
      <p style="color:#999;font-size:12px">Generated ${new Date().toLocaleDateString()} by AgentAIBrief.com</p>
      <table><thead><tr><th style="padding:10px;border:1px solid #ddd;background:#f8f9fa">Field</th>${offerHeaders}</tr></thead><tbody>${tableRows}</tbody></table>
      <p style="color:#999;font-size:11px;margin-top:24px;border-top:1px solid #eee;padding-top:12px">⚖️ AI-generated analysis for informational purposes only. Not legal advice. Generated by AgentAIBrief.com</p>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  // ─── Start Over ───────────────────────────────────────────────
  const startOver = () => {
    setStep(1);
    setAddress('');
    setOfferCount(2);
    setOffers([{ files: [] }, { files: [] }]);
    setSingleResults(null);
    setCompareResult(null);
    setSelectedWinner(null);
    setShareUrl(null);
    setAgentNotes('');
    setError('');
    setSavedId(null);
    setSavedShareId(null);
    setSaveStatus('idle');
    setSelectedFields(new Set(DEFAULT_FIELDS));
    setCustomFields([]);
    setCustomFieldInput('');
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#e8e6e1] text-[#2a2a2a]">
      {/* Header */}
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">Agent<span className="text-[#e85d26]">AI</span>Brief</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-[#666] hover:text-[#2a2a2a]">Home</Link>
            <Link href="/tools" className="text-[#666] hover:text-[#2a2a2a]">AI Tools</Link>
            <span className="text-[#e85d26] font-semibold">Contract Analyzer</span>
          </nav>
        </div>
      </header>

      <PaywallGate requiredTier="pro" featureName="Contract Analyzer">
      {/* Saved Comparisons Banner */}
      {savedComparisons.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="text-sm text-[#e85d26] hover:text-[#e85d26]/80 flex items-center gap-1"
          >
            📁 Saved Comparisons ({savedComparisons.length}) {showSaved ? '▲' : '▼'}
          </button>
          {showSaved && (
            <div className="mt-2 bg-[#f0ece4] border border-[#e0dcd4] rounded-xl overflow-hidden mb-4">
              {savedComparisons.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3 border-b border-[#e0dcd4]/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#2a2a2a]">{c.address}</p>
                    <p className="text-xs text-[#888]">
                      {new Date(c.created_at).toLocaleDateString()} • {Array.isArray(c.offers) ? c.offers.length : '?'} offers
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadComparison(c.id)}
                      className="px-3 py-1.5 bg-[#e85d26]/10 border border-[#e85d26]/30 rounded-lg text-xs font-medium text-[#e85d26] hover:bg-[#e85d26]/20 transition"
                    >
                      Load
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!confirm('Delete this comparison?')) return;
                        try {
                          const res = await fetch(`/api/comparisons?id=${c.id}`, { method: 'DELETE' });
                          if (res.ok) {
                            setSavedComparisons(prev => prev.filter(x => x.id !== c.id));
                          }
                        } catch { /* ignore */ }
                      }}
                      className="p-1.5 text-[#888] hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete comparison"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {step < 4 && (
        <div className="max-w-2xl mx-auto px-4 pt-8 pb-2">
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                  s < step ? 'bg-[#e85d26] text-white' : s === step ? 'bg-[#e85d26]/20 border-2 border-[#e85d26] text-[#e85d26]' : 'bg-[#f0ece4] text-[#888]'
                }`}>
                  {s < step ? '✓' : s}
                </div>
                {s < 3 && <div className={`h-0.5 flex-1 ${s < step ? 'bg-[#e85d26]' : 'bg-[#f0ece4]'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-[#888] px-1">
            <span className={step >= 1 ? 'text-[#e85d26]' : ''}>Address</span>
            <span className={step >= 2 ? 'text-[#e85d26]' : ''}>Offers</span>
            <span className={step >= 3 ? 'text-[#e85d26]' : ''}>Upload</span>
          </div>
        </div>
      )}

      {/* ═══ STEP 1: Property Address ═══ */}
      {step === 1 && (
        <section className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="inline-block px-3 py-1 bg-[#e85d26]/10 border border-[#e85d26]/30 rounded-full text-[#e85d26] text-xs font-medium mb-4">
              AI-POWERED CONTRACT ANALYSIS
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Contract <span className="text-[#e85d26]">Analyzer</span>
            </h1>
            <p className="text-[#666] max-w-lg mx-auto">
              Upload real estate contracts and get every term, contingency, and deadline extracted. Compare multiple offers side-by-side.
            </p>
          </div>

          <div className="bg-[#f0ece4] border border-[#e0dcd4] rounded-xl p-6">
            <label className="block text-sm font-medium text-[#555] mb-2">Property Address</label>
            <input
              type="text"
              placeholder="e.g. 1234 Oak Street, Arlington, VA 22201"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && address.trim() && goNext()}
              autoFocus
              className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26] text-lg"
            />

            {/* Fields to Compare */}
            <div className="mt-6 pt-6 border-t border-[#e0dcd4]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#555]">Fields to Compare</h3>
                <button
                  onClick={toggleAllFields}
                  className="text-xs text-[#e85d26] hover:text-[#e85d26]/80 transition"
                >
                  {[...DEFAULT_FIELDS, ...customFields].every(f => selectedFields.has(f)) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
                {DEFAULT_FIELDS.map(field => (
                  <label key={field} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedFields.has(field)}
                      onChange={() => toggleField(field)}
                      className="w-3.5 h-3.5 rounded accent-[#e85d26] bg-[#f0ece4] border-gray-600"
                    />
                    <span className="text-xs text-[#666] group-hover:text-gray-200 transition select-none">{field}</span>
                  </label>
                ))}
                {customFields.map(field => (
                  <label key={field} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedFields.has(field)}
                      onChange={() => toggleField(field)}
                      className="w-3.5 h-3.5 rounded accent-[#e85d26] bg-[#f0ece4] border-gray-600"
                    />
                    <span className="text-xs text-[#e85d26] group-hover:text-[#e85d26]/80 transition select-none">{field}</span>
                    <button onClick={(e) => { e.preventDefault(); removeCustomField(field); }} className="text-[#666] hover:text-red-400 text-xs ml-auto">✕</button>
                  </label>
                ))}
              </div>

              {/* Additional Fields */}
              <div className="mt-4 pt-4 border-t border-[#e0dcd4]/50">
                <p className="text-xs text-[#888] mb-2">Additional Fields</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customFieldInput}
                    onChange={(e) => setCustomFieldInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomField()}
                    placeholder="e.g. Lead Paint, Home Warranty..."
                    className="flex-1 px-3 py-2 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-sm text-[#2a2a2a] placeholder-gray-600 focus:outline-none focus:border-[#e85d26]"
                  />
                  <button
                    onClick={addCustomField}
                    disabled={!customFieldInput.trim()}
                    className="px-4 py-2 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-sm font-medium text-[#555] hover:border-[#e85d26] hover:text-[#e85d26] transition disabled:opacity-30"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={goNext}
              disabled={!address.trim()}
              className="w-full mt-6 py-3 bg-[#e85d26] text-white font-bold rounded-lg hover:bg-[#e85d26]/80 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </section>
      )}

      {/* ═══ STEP 2: How Many Offers ═══ */}
      {step === 2 && (
        <section className="max-w-2xl mx-auto px-4 py-12">
          <button onClick={goBack} className="text-[#666] hover:text-[#2a2a2a] text-sm mb-6 flex items-center gap-1">← Back</button>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">How many offers?</h2>
            <p className="text-[#666] text-sm">{address}</p>
          </div>

          <div className="bg-[#f0ece4] border border-[#e0dcd4] rounded-xl p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleOfferCountChange(Math.max(1, offerCount - 1))}
                  className="w-12 h-12 rounded-lg border border-[#d8d4cc] text-2xl font-bold text-[#555] hover:border-[#e85d26] hover:text-[#e85d26] transition"
                >−</button>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={offerCount}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (v >= 1 && v <= 20) handleOfferCountChange(v);
                  }}
                  className="w-20 h-14 text-center text-3xl font-bold bg-transparent border-2 border-[#e85d26] rounded-lg text-[#e85d26] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => handleOfferCountChange(Math.min(20, offerCount + 1))}
                  className="w-12 h-12 rounded-lg border border-[#d8d4cc] text-2xl font-bold text-[#555] hover:border-[#e85d26] hover:text-[#e85d26] transition"
                >+</button>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={offerCount}
                onChange={(e) => handleOfferCountChange(parseInt(e.target.value))}
                className="w-full max-w-xs accent-[#e85d26]"
              />
              <p className="text-xs text-[#888] text-center">
                {offerCount === 1 ? 'Single contract analysis' : `Compare ${offerCount} offers side-by-side`}
              </p>
              <button
                onClick={goNext}
                className="mt-4 px-8 py-3 bg-[#e85d26] text-white font-bold rounded-lg hover:bg-[#e85d26]/80 transition"
              >
                Continue →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ═══ STEP 3: Upload Files Per Offer ═══ */}
      {step === 3 && (
        <section className="max-w-3xl mx-auto px-4 py-12">
          <button onClick={goBack} className="text-[#666] hover:text-[#2a2a2a] text-sm mb-6 flex items-center gap-1">← Back</button>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Upload Documents</h2>
            <p className="text-[#666] text-sm">{address} • {offerCount} offer{offerCount !== 1 ? 's' : ''}</p>
          </div>

          <div className="space-y-6">
            {offers.map((offer, offerIdx) => {
              const hasExistingResult = compareResult?.offers[offerIdx]?.data;
              return (
                <div key={offerIdx} className="bg-[#f0ece4] border border-[#e0dcd4] rounded-xl overflow-hidden">
                  {/* Offer Header */}
                  <div className="px-5 py-3 border-b border-[#e0dcd4] flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[#2a2a2a]"
                      style={{ backgroundColor: OFFER_COLORS[offerIdx % OFFER_COLORS.length] }}
                    >
                      {OFFER_LABELS[offerIdx]}
                    </span>
                    <span className="font-semibold">
                      {offerCount === 1 ? 'Contract Documents' : `Offer ${OFFER_LABELS[offerIdx]}`}
                    </span>
                    <span className="text-xs text-[#888] ml-auto">
                      {hasExistingResult ? (
                        <span className="text-green-400">✅ Already analyzed</span>
                      ) : (
                        `${offer.files.length} file${offer.files.length !== 1 ? 's' : ''}`
                      )}
                    </span>
                  </div>

                  {/* Drop Zone (hide if already analyzed) */}
                  {!hasExistingResult && (
                    <div className="p-4">
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleFileDrop(offerIdx, e)}
                        onClick={() => fileInputRefs.current[offerIdx]?.click()}
                        className="border-2 border-dashed border-[#d8d4cc] hover:border-gray-500 rounded-lg p-6 text-center cursor-pointer transition"
                      >
                        <input
                          ref={(el) => { fileInputRefs.current[offerIdx] = el; }}
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileSelect(offerIdx, e)}
                          className="hidden"
                        />
                        <p className="text-[#666] text-sm">
                          📄 Drop files here or <span className="text-[#e85d26]">browse</span>
                        </p>
                        <p className="text-[#666] text-xs mt-1">Contract + all addendums • PDF, JPG, PNG</p>
                      </div>

                      {/* File List */}
                      {offer.files.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {offer.files.map((f, fileIdx) => (
                            <div key={fileIdx} className="flex items-center justify-between bg-[#f0ece4] rounded-lg px-3 py-2">
                              <span className="text-sm text-[#555] truncate">
                                {f.name} <span className="text-[#888]">({(f.size / 1024).toFixed(0)} KB)</span>
                              </span>
                              <button onClick={() => removeFile(offerIdx, fileIdx)} className="text-[#888] hover:text-red-400 text-sm ml-2">✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-300 rounded-lg p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={runAnalysis}
            disabled={!allOffersHaveFiles || analyzing}
            className="w-full mt-6 py-4 bg-[#e85d26] text-white font-bold rounded-lg text-lg hover:bg-[#e85d26]/80 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {offerCount === 1
              ? `Analyze ${totalFiles} Document${totalFiles !== 1 ? 's' : ''}`
              : `Analyze & Compare ${offerCount} Offers (${totalFiles} files)`
            }
          </button>

          {!allOffersHaveFiles && !analyzing && (
            <p className="text-xs text-[#888] text-center mt-2">
              Upload at least 1 file per offer to continue
            </p>
          )}

          {/* Loading Overlay */}
          {analyzing && (
            <div className="fixed inset-0 bg-[#e8e6e1]/90 backdrop-blur-md z-50 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto px-6">
                {/* Spinner */}
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full border-4 border-[#e0dcd4]" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#e85d26] animate-spin" />
                  <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#e85d26]/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-[#e85d26] rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Cycling message */}
                <p className="text-lg font-semibold text-[#2a2a2a] mb-2 transition-opacity duration-500">
                  {LOADING_MESSAGES[loadingMsgIdx]}
                </p>
                <p className="text-sm text-[#888] mb-6">
                  {totalFiles} document{totalFiles !== 1 ? 's' : ''} • {offerCount} offer{offerCount !== 1 ? 's' : ''}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-[#f0ece4] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#e85d26] to-[#e85d26]/60 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <p className="text-xs text-[#666] mt-2">{Math.round(loadingProgress)}%</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ═══ STEP 4: Results ═══ */}
      {step === 4 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold">
                {compareResult ? 'Comparison Results' : 'Analysis Results'}
              </h2>
              <p className="text-[#666] text-sm">
                {address}
                {compareResult && ` • ${compareResult.offers.length} offers`}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={startOver} className="px-4 py-2 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-sm font-medium hover:bg-gray-700 transition">
                🔄 New Analysis
              </button>
              {compareResult && (
                <button onClick={handleAddOffer} className="px-4 py-2 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-sm font-medium hover:bg-gray-700 transition">
                  ➕ Add Offer
                </button>
              )}
              {compareResult ? (
                <>
                  <button onClick={exportCompareCSV} className="px-4 py-2 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-sm font-medium hover:bg-gray-700 transition">📥 CSV</button>
                  <button onClick={exportComparePDF} className="px-4 py-2 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-sm font-medium hover:bg-gray-700 transition">📄 PDF</button>
                  <button onClick={shareComparison} disabled={sharing}
                    className="px-4 py-2 bg-[#e85d26]/10 border border-[#e85d26]/30 rounded-lg text-sm font-medium text-[#e85d26] hover:bg-[#e85d26]/20 transition disabled:opacity-50">
                    {sharing ? '...' : '🔗 Share'}
                  </button>
                </>
              ) : (
                <button onClick={exportSingleCSV} className="px-4 py-2 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-sm font-medium hover:bg-gray-700 transition">📥 Export CSV</button>
              )}
            </div>
          </div>

          {/* Save status */}
          {saveStatus === 'saved' && (
            <div className="bg-green-50 border border-green-300 rounded-lg p-2 mb-4 flex items-center gap-2">
              <span className="text-green-400 text-sm">✅ Saved to database</span>
            </div>
          )}
          {saveStatus === 'saving' && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-2 mb-4 flex items-center gap-2">
              <span className="text-yellow-400 text-sm">💾 Saving...</span>
            </div>
          )}

          {/* Share toast */}
          {shareUrl && (
            <div className="bg-green-50 border border-green-300 rounded-lg p-3 mb-4 flex items-center gap-2">
              <span className="text-green-400 text-sm">🔗 Share link copied: {shareUrl}</span>
            </div>
          )}

          {/* ─── Single Analysis Results ─── */}
          {singleResults && singleResults.results.map((result, idx) => (
            <div key={idx} className="bg-[#f0ece4] border border-[#e0dcd4] rounded-xl overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-[#e0dcd4] bg-[#f0ece4]/50 flex items-center justify-between">
                <h3 className="font-semibold text-[#e85d26]">📄 {result.fileName}</h3>
                {result.data && (
                  <button onClick={() => downloadCalendar(result.data, address)}
                    className="px-3 py-1.5 bg-[#e85d26]/10 border border-[#e85d26]/30 rounded-lg text-xs font-medium text-[#e85d26] hover:bg-[#e85d26]/20 transition">
                    📅 Add to Calendar
                  </button>
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
                          <thead><tr className="text-left text-[#666]"><th className="px-6 py-2 font-medium">Type</th><th className="px-6 py-2 font-medium">Deadline</th><th className="px-6 py-2 font-medium">Details</th></tr></thead>
                          <tbody>
                            {result.data.contingencies.map((c, i) => (
                              <tr key={i} className="border-t border-[#e0dcd4]/50">
                                <td className="px-6 py-2 font-medium text-[#2a2a2a]">{c.type}</td>
                                <td className="px-6 py-2 text-[#e85d26]">{c.deadline}</td>
                                <td className="px-6 py-2 text-[#555]">{c.details}</td>
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
                <div className="px-6 py-8 text-center text-[#888]">Failed to parse this document.</div>
              )}
            </div>
          ))}

          {/* ─── Comparison Results ─── */}
          {compareResult && (
            <>
              {/* Brief Summary */}
              {compareResult.comparison && (
                <div className="bg-[#f0ece4] border border-[#e0dcd4] rounded-xl p-5 mb-6">
                  {compareResult.comparison.bestOffer && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-[#e85d26] uppercase tracking-wider mb-2">🏆 Recommended Offer</h3>
                      <p className="text-[#2a2a2a] font-medium">{compareResult.comparison.bestOffer.label}</p>
                      <p className="text-sm text-[#555] mt-1">{compareResult.comparison.bestOffer.reasoning}</p>
                    </div>
                  )}
                  {Array.isArray(compareResult.comparison.summary) && compareResult.comparison.summary.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[#666] uppercase tracking-wider mb-2">📊 Key Differences</h3>
                      <ul className="space-y-1.5">
                        {compareResult.comparison.summary.map((point: string, i: number) => (
                          <li key={i} className="text-sm text-[#555] flex gap-2">
                            <span className="text-[#e85d26]">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Side-by-Side Comparison Table */}
              <div className="bg-[#f0ece4] border border-[#e0dcd4] rounded-xl overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#e0dcd4]">
                        <th className="px-4 py-3 text-left text-[#666] font-medium bg-[#f0ece4] sticky left-0 z-10 min-w-[160px]">Field</th>
                        {compareResult.offers.map((o) => (
                          <th key={o.label} className="px-4 py-3 text-left font-semibold text-[#e85d26] min-w-[180px]">
                            <div className="flex items-center gap-2">
                              <span>{o.label}</span>
                              {selectedWinner === o.label && <span className="text-green-400 text-xs">✅ Selected</span>}
                            </div>
                            <span className="text-xs text-[#888] font-normal block truncate max-w-[200px]" title={o.fileName}>{o.fileName}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {/* Purchasers row - always at top */}
                      <tr className="bg-[#e85d26]/5">
                        <td className="px-4 py-3 font-semibold text-[#e85d26] sticky left-0 bg-[#e85d26]/5">Purchasers</td>
                        {compareResult.offers.map((o) => (
                          <td key={o.label} className="px-4 py-3 font-medium text-[#2a2a2a]">
                            {o.data?.buyerName || '—'}
                          </td>
                        ))}
                      </tr>
                      {selectedFields.has('Purchase Price') && <CompareRow label="Purchase Price" offers={compareResult.offers} render={(d) => d.purchasePriceFormatted || '—'} colorize colorField="purchasePrice" colorMode="highest" />}
                      {selectedFields.has('Earnest Money Deposit') && <CompareRow label="Earnest Money Deposit" offers={compareResult.offers} render={(d) => d.earnestMoneyDepositFormatted || '—'} colorize colorField="earnestMoneyDeposit" colorMode="highest" />}
                      {selectedFields.has('Financing Type') && <CompareRow label="Financing Type" offers={compareResult.offers} render={(d) => d.financingType || '—'} />}
                      {selectedFields.has('Amount Financed') && <CompareRow label="Amount Financed" offers={compareResult.offers} render={(d) => d.amountFinanced || '—'} />}
                      {selectedFields.has('Down Payment') && <CompareRow label="Down Payment" offers={compareResult.offers} render={(d) => d.downPayment || '—'} />}
                      {selectedFields.has('Seller Paid Buyer Agency') && <CompareRow label="Seller Paid Buyer Agency" offers={compareResult.offers} render={(d) => d.sellerPaidBuyerAgency || 'None'} />}
                      {selectedFields.has('Seller Concessions') && <CompareRow label="Seller Concessions" offers={compareResult.offers} render={(d) => d.sellerConcessions || 'None'} colorize colorField="sellerConcessionsAmount" colorMode="lowest" />}
                      {selectedFields.has('Closing Date') && <CompareRow label="Closing Date" offers={compareResult.offers} render={(d) => d.closingDate || '—'} />}
                      {selectedFields.has('Financing Contingency') && <CompareRow label="Financing Contingency" offers={compareResult.offers} render={(d) => d.financingContingency || 'None'} colorize colorField="financingContingencyDays" colorMode="lowest" />}
                      {selectedFields.has('Appraisal Contingency') && <CompareRow label="Appraisal Contingency" offers={compareResult.offers} render={(d) => d.appraisalContingency || 'None'} colorize colorField="appraisalContingencyDays" colorMode="lowest" />}
                      {selectedFields.has('Home Inspection') && <CompareRow label="Home Inspection" offers={compareResult.offers} render={(d) => d.homeInspection || 'None'} colorize colorField="homeInspectionDays" colorMode="lowest" />}
                      {selectedFields.has('HOA') && <CompareRow label="HOA" offers={compareResult.offers} render={(d) => d.hoaContingency || 'None'} />}
                      {selectedFields.has('Escalation') && <CompareRow label="Escalation" offers={compareResult.offers} render={(d) => d.escalationClause?.present ? 'Yes' : 'No'} />}
                      {selectedFields.has('Escalation Increments') && <CompareRow label="Escalation Increments" offers={compareResult.offers} render={(d) => d.escalationClause?.increment || '—'} />}
                      {selectedFields.has('Max Escalation') && <CompareRow label="Max Escalation" offers={compareResult.offers} render={(d) => d.escalationClause?.maxEscalation || '—'} />}
                      {selectedFields.has('WDI') && <CompareRow label="WDI" offers={compareResult.offers} render={(d) => d.wdiInspection || 'None'} />}
                      {selectedFields.has('Appraisal Gap') && <CompareRow label="Appraisal Gap" offers={compareResult.offers} render={(d) => d.appraisalGap || 'None'} />}
                      {selectedFields.has('Septic/Well') && <CompareRow label="Septic/Well" offers={compareResult.offers} render={(d) => d.septicWell || 'None'} />}
                      {selectedFields.has('Septic Paid By') && <CompareRow label="Septic Paid By" offers={compareResult.offers} render={(d) => d.septicPaidBy || '—'} />}
                      {selectedFields.has('Radon') && <CompareRow label="Radon" offers={compareResult.offers} render={(d) => d.radon || 'None'} />}
                      {selectedFields.has('Lender') && <CompareRow label="Lender" offers={compareResult.offers} render={(d) => d.lender || '—'} />}
                      {selectedFields.has('Title Company') && <CompareRow label="Title Company" offers={compareResult.offers} render={(d) => d.titleCompany || '—'} />}
                      {selectedFields.has('Buyer Name') && <CompareRow label="Buyer Name" offers={compareResult.offers} render={(d) => d.buyerName || '—'} />}
                      {selectedFields.has('Buyer Agent Name') && <CompareRow label="Buyer Agent Name" offers={compareResult.offers} render={(d) => d.buyerAgentName || '—'} />}
                      {selectedFields.has('Rent Back') && <CompareRow label="Rent Back" offers={compareResult.offers} render={(d) => d.rentBack || 'None'} />}
                      {/* Custom fields rendered from notes/data */}
                      {customFields.filter(f => selectedFields.has(f)).map(f => (
                        <CompareRow key={f} label={f} offers={compareResult.offers} render={(d) => {
                          const data = d as Record<string, unknown>;
                          const key = f.toLowerCase().replace(/[^a-z0-9]/g, '');
                          for (const [k, v] of Object.entries(data)) {
                            if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === key && v) return String(v);
                          }
                          return '—';
                        }} />
                      ))}
                      <CompareRow label="Notes" offers={compareResult.offers} render={(d) => d.notes || 'None'} />
                      <CompareRow label="Seller Net Estimate" offers={compareResult.offers} render={(d) => calcSellerNet(d)} colorize colorField="purchasePrice" colorMode="highest" />
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Agent Notes */}
              <div className="bg-[#f0ece4] border border-[#e0dcd4] rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold text-[#666] uppercase tracking-wider mb-3">📝 Agent Notes</h3>
                <textarea
                  value={agentNotes}
                  onChange={(e) => setAgentNotes(e.target.value)}
                  placeholder="Add your own notes about these offers..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26] text-sm resize-y"
                />
              </div>

              {/* Select Winner */}
              <div className="bg-[#f0ece4] border border-[#e0dcd4] rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">🏆 Select Winning Offer</h3>
                <p className="text-sm text-[#666] mb-4">Choose the accepted offer to calculate all contingency deadlines.</p>
                <div className={`grid grid-cols-1 ${compareResult.offers.length <= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-3 lg:grid-cols-4'} gap-3`}>
                  {compareResult.offers.map((o) => (
                    <button key={o.label}
                      onClick={() => handleSelectWinner(o.label)}
                      className={`p-4 rounded-lg border text-left transition ${selectedWinner === o.label ? 'border-green-500 bg-green-50' : 'border-[#d8d4cc] hover:border-[#e85d26] hover:bg-[#e85d26]/5'}`}>
                      <p className="font-bold text-sm">{o.label}</p>
                      <p className="text-xs text-[#666]">{o.data?.buyerName || o.fileName}</p>
                      <p className="text-sm text-[#e85d26] mt-1">{o.data?.purchasePriceFormatted || '—'}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ratification Date Input */}
              {selectedWinner && showRatDateInput && !calculatingDates && discoveredEvents.length === 0 && (
                <div className="bg-[#f0ece4] border-2 border-[#e85d26]/40 rounded-xl p-6 mb-6 animate-fade-in">
                  <h3 className="text-lg font-bold mb-2">📅 Select Ratification Date</h3>
                  <p className="text-sm text-[#666] mb-4">All contingency deadlines (EMD, inspection, financing, appraisal, etc.) are calculated from the ratification date.</p>
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-medium text-[#555] mb-1">Ratification Date</label>
                      <input
                        type="date"
                        value={ratificationDate}
                        onChange={(e) => setRatificationDate(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f5f0ea] border-2 border-[#d8d4cc] rounded-lg text-[#2a2a2a] focus:outline-none focus:border-[#e85d26] text-lg"
                      />
                    </div>
                    <button
                      onClick={handleRatDateSubmit}
                      disabled={!ratificationDate}
                      className="px-6 py-3 bg-[#e85d26] text-white font-bold rounded-lg hover:bg-[#e85d26]/80 transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      Calculate Deadlines →
                    </button>
                  </div>
                </div>
              )}

              {/* Animated Deadline Discovery */}
              {selectedWinner && (calculatingDates || discoveredEvents.length > 0) && (
                <div className="bg-[#f0ece4] border-2 border-[#e85d26]/40 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    {calculatingDates && (
                      <div className="w-5 h-5 border-2 border-[#e85d26] border-t-transparent rounded-full animate-spin" />
                    )}
                    <h3 className="text-lg font-bold">
                      {calculatingDates ? '🔍 Finding all deadlines...' : `📋 ${discoveredEvents.length - removedEventIndices.size} Deadlines Found`}
                    </h3>
                  </div>
                  <p className="text-xs text-[#666] mb-3">Ratification: {new Date(ratificationDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  
                  {/* Header row with select all */}
                  {!calculatingDates && discoveredEvents.length > 0 && (
                    <div className="flex items-center justify-between mb-2 px-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div
                          onClick={() => {
                            const newVal = !selectAllReminders;
                            setSelectAllReminders(newVal);
                            if (newVal) {
                              setReminderChecked(new Set(discoveredEvents.map((_, i) => i).filter(i => !removedEventIndices.has(i))));
                            } else {
                              setReminderChecked(new Set());
                            }
                          }}
                          className="cursor-pointer"
                          style={{
                            width: '22px', height: '22px', borderRadius: '4px',
                            border: selectAllReminders ? '2px solid #e85d26' : '2px solid #ccc',
                            background: selectAllReminders ? '#e85d26' : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '14px', fontWeight: 'bold',
                            transition: 'all 0.15s ease',
                          }}
                        >{selectAllReminders ? '✓' : ''}</div>
                        <span className="text-xs font-medium text-[#555] cursor-pointer">Select All for Calendar</span>
                      </label>
                      <span className="text-xs text-[#888]">Date</span>
                    </div>
                  )}

                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {discoveredEvents.slice(0, visibleEventCount).map((evt, i) => (
                      !removedEventIndices.has(i) && (
                        <div
                          key={i}
                          className="flex items-center bg-[#f5f0ea] rounded-lg px-4 py-3 border border-[#e0dcd4] animate-fade-in group gap-3"
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          <div
                            onClick={() => {
                              setReminderChecked(prev => {
                                const next = new Set(prev);
                                if (next.has(i)) next.delete(i); else next.add(i);
                                return next;
                              });
                            }}
                            className="shrink-0 cursor-pointer"
                            style={{
                              width: '22px', height: '22px', borderRadius: '4px',
                              border: reminderChecked.has(i) ? '2px solid #e85d26' : '2px solid #ccc',
                              background: reminderChecked.has(i) ? '#e85d26' : '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: '14px', fontWeight: 'bold',
                              transition: 'all 0.15s ease',
                            }}
                            title="Include in calendar"
                          >{reminderChecked.has(i) ? '✓' : ''}</div>
                          <span className="text-sm font-medium text-[#2a2a2a] flex-1">{evt.title.replace(` - ${compareResult.address}`, '')}</span>
                          <span className="text-sm text-[#e85d26] font-semibold whitespace-nowrap">
                            {evt.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <button
                            onClick={() => {
                              setRemovedEventIndices(prev => { const next = new Set(prev); next.add(i); return next; });
                              setReminderChecked(prev => { const next = new Set(prev); next.delete(i); return next; });
                            }}
                            className="text-[#ccc] hover:text-red-500 transition text-lg leading-none shrink-0"
                            title="Remove from calendar"
                          >✕</button>
                        </div>
                      )
                    ))}
                  </div>

                  {/* Email addresses for reminders */}
                  {!calculatingDates && discoveredEvents.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#e0dcd4]">
                      <p className="text-sm font-medium text-[#555] mb-2">📧 Email addresses for reminders</p>
                      <div className="space-y-2">
                        {reminderEmails.map((email, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => {
                                const updated = [...reminderEmails];
                                updated[idx] = e.target.value;
                                setReminderEmails(updated);
                              }}
                              placeholder="email@example.com"
                              className="flex-1 px-3 py-2 bg-[#f5f0ea] border border-[#d8d4cc] rounded-lg text-sm text-[#2a2a2a] placeholder-[#aaa] focus:outline-none focus:border-[#e85d26]"
                            />
                            {reminderEmails.length > 1 && (
                              <button
                                onClick={() => setReminderEmails(prev => prev.filter((_, i) => i !== idx))}
                                className="text-[#ccc] hover:text-red-500 px-2"
                              >✕</button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => setReminderEmails(prev => [...prev, ''])}
                          className="text-xs text-[#e85d26] hover:text-[#e85d26]/80 font-medium"
                        >+ Add another email</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Calendar Actions for Selected Winner */}
              {selectedWinner && !showCalendarModal && !calculatingDates && discoveredEvents.length > 0 && (
                <div className="bg-green-50 border border-green-300 rounded-xl p-6 mb-6 animate-fade-in">
                  <h3 className="text-lg font-bold text-green-600 mb-3">✅ {selectedWinner} Selected — {discoveredEvents.length - removedEventIndices.size} deadlines ready</h3>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => {
                      const activeIndices = discoveredEvents.map((_, i) => i).filter(i => !removedEventIndices.has(i));
                      const filtered = activeIndices.map(i => discoveredEvents[i]);
                      const reminderFlags = activeIndices.map(i => reminderChecked.has(i));
                      const emails = reminderEmails.filter(e => e && e.includes('@'));
                      if (!filtered.length) { alert('No deadlines selected.'); return; }
                      const ics = generateICS(filtered, `Contract Deadlines — ${compareResult.address}`, { emails, reminderFlags });
                      const blob = new Blob([ics], { type: 'text/calendar' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a'); a.href = url;
                      a.download = `contract-deadlines-${compareResult.address.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}.ics`;
                      a.click(); URL.revokeObjectURL(url);
                    }} className="px-4 py-2 bg-[#f5f0ea] border border-[#d8d4cc] rounded-lg text-sm font-medium hover:border-[#e85d26] transition">
                      📅 Download .ics Calendar
                    </button>
                    <button onClick={() => {
                      const filtered = discoveredEvents.filter((_, i) => !removedEventIndices.has(i));
                      if (!filtered.length) { alert('No deadlines selected.'); return; }
                      for (const event of filtered) {
                        const link = generateGoogleCalendarLink(event);
                        window.open(link, '_blank');
                      }
                    }} className="px-4 py-2 bg-[#f5f0ea] border border-[#d8d4cc] rounded-lg text-sm font-medium hover:border-[#e85d26] transition">
                      🗓️ Add to Google Calendar
                    </button>
                  </div>
                  <p className="text-xs text-[#666] mt-3">Calendar events include 24-hour and 3-hour email reminders for each deadline.</p>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCalendarModal(false)}>
          <div className="bg-[#f0ece4] border border-[#d8d4cc] rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">📅 Add to Calendar?</h3>
            <p className="text-sm text-[#666] mb-4">
              {discoveredEvents.length > 0
                ? `Add ${discoveredEvents.length} deadline${discoveredEvents.length !== 1 ? 's' : ''} to your calendar with reminders?`
                : 'No parseable dates were found in this contract. You can still download the .ics file.'}
            </p>
            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input type="checkbox" checked={addToCalendar} onChange={(e) => setAddToCalendar(e.target.checked)}
                className="w-5 h-5 rounded accent-[#e85d26]" />
              <span className="text-sm text-[#555]">📅 Download .ics calendar file</span>
            </label>
            <div className="flex gap-3">
              <button onClick={() => setShowCalendarModal(false)} className="flex-1 py-2 border border-[#d8d4cc] rounded-lg text-sm font-medium hover:bg-[#f0ece4] transition">Skip</button>
              <button onClick={confirmWinner} className="flex-1 py-2 bg-[#e85d26] text-white rounded-lg text-sm font-bold hover:bg-[#e85d26]/80 transition">
                {addToCalendar ? 'Download Calendar' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      </PaywallGate>

      {/* Footer */}
      <footer className="border-t border-[#e0dcd4] mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-[#888]">
          © 2026 AgentAIBrief.com • <Link href="/privacy" className="hover:text-[#555]">Privacy</Link> • <Link href="/terms" className="hover:text-[#555]">Terms</Link>
        </div>
      </footer>
    </div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-4">
      <h4 className="text-xs uppercase tracking-wider text-[#888] font-semibold mb-3">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-1">
      <span className="text-sm text-[#666] sm:w-48 shrink-0">{label}</span>
      <span className="text-sm text-[#2a2a2a]">{value}</span>
    </div>
  );
}

function getBestWorstLocal(offers: CompareOffer[], field: string, mode: 'highest' | 'lowest'): { best: number; worst: number } {
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
      <td className="px-4 py-2.5 text-[#666] font-medium bg-[#f0ece4] sticky left-0 z-10">{label}</td>
      {offers.map((o, idx) => {
        const d = o.data;
        const val = d ? (render ? render(d) : (d as Record<string, unknown>)[field || '']?.toString() || '—') : 'N/A';
        const color = colorize && best >= 0 ? cellColor(idx, best, worst) : '';
        return (
          <td key={o.label} className={`px-4 py-2.5 text-[#2a2a2a] border-l border-[#e0dcd4]/30 ${color}`}>
            {val}
          </td>
        );
      })}
    </tr>
  );
}
