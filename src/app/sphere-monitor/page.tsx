'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { PaywallGate } from '@/components/PaywallGate';
import { SiteNav } from '@/components/SiteNav';

// ─── Types ───────────────────────────────────────────────────────────
interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  birthday: string | null;
  anniversary: string | null;
  relationship_type: 'past_client' | 'sphere' | 'lead';
  home_purchase_date: string | null;
  home_purchase_price: number | null;
  mortgage_rate: number | null;
  notes: string;
  last_contacted: string | null;
  created_at: string;
}

interface SphereEvent {
  id: string;
  contact_id: string;
  contact_name: string;
  event_type: string;
  description: string;
  detected_at: string;
  action_taken: boolean;
}

type ViewMode = 'grid' | 'list';
type RelFilter = 'all' | 'past_client' | 'sphere' | 'lead';
type ScoreFilter = 'all' | 'A' | 'B' | 'C';

// ─── Gift Data ───────────────────────────────────────────────────────
const GIFT_SUGGESTIONS = [
  { name: 'Amazon Gift Card', price: 25, url: 'https://www.amazon.com/dp/B004LLIKVU', category: 'gift_card' },
  { name: 'Amazon Gift Card', price: 50, url: 'https://www.amazon.com/dp/B004LLIKVU', category: 'gift_card' },
  { name: 'Amazon Gift Card', price: 100, url: 'https://www.amazon.com/dp/B004LLIKVU', category: 'gift_card' },
  { name: 'YETI Rambler 20oz Tumbler', price: 35, url: 'https://www.amazon.com/dp/B0BXDR6MBP', category: 'drinkware' },
  { name: 'YETI Rambler 30oz Tumbler', price: 42, url: 'https://www.amazon.com/dp/B0B1KHSD2C', category: 'drinkware' },
  { name: 'Yankee Candle Gift Set', price: 30, url: 'https://www.amazon.com/dp/B09MDS3XJQ', category: 'home' },
  { name: 'Personalized Cutting Board', price: 28, url: 'https://www.amazon.com/dp/B07NQFM9BX', category: 'home' },
  { name: 'Godiva Chocolate Gift Box', price: 45, url: 'https://www.amazon.com/dp/B07XBCPG56', category: 'food' },
  { name: 'Wine Gift Basket', price: 65, url: 'https://www.amazon.com/dp/B07XQMR51V', category: 'food' },
  { name: 'Ember Smart Mug', price: 100, url: 'https://www.amazon.com/dp/B09GDJ9G5C', category: 'tech' },
  { name: 'Succulent Garden Set', price: 32, url: 'https://www.amazon.com/dp/B07TKWBMWV', category: 'home' },
  { name: 'Door Dash Gift Card', price: 50, url: 'https://www.amazon.com/dp/B083KGK1FF', category: 'gift_card' },
  { name: 'Local Flowers Delivery', price: 55, url: '#', category: 'local', note: 'Use a local florist for a personal touch' },
  { name: 'Restaurant Gift Card (Local)', price: 75, url: '#', category: 'local', note: 'Pick their favorite local spot' },
  { name: 'Custom Photo Book', price: 40, url: 'https://www.amazon.com/dp/B0BQM8FQ9K', category: 'personal' },
];

// ─── Helpers ─────────────────────────────────────────────────────────
const EVENT_ICONS: Record<string, string> = {
  birthday: '🎂', anniversary: '💍', job_change: '💼', new_baby: '👶',
  school_transition: '🎓', home_value_milestone: '🏠', time_since_purchase: '⏰',
  mortgage_rate_gap: '📊', neighborhood_appreciation: '🏡',
};

function daysUntilDate(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const today = new Date();
  const d = new Date(dateStr);
  const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
  if (next < today) next.setFullYear(next.getFullYear() + 1);
  return Math.ceil((next.getTime() - today.getTime()) / 86400000);
}

function connectionScore(contact: Contact): 'A' | 'B' | 'C' {
  let score = 0;
  if (contact.relationship_type === 'past_client') score += 3;
  else if (contact.relationship_type === 'sphere') score += 2;
  else score += 1;

  if (contact.last_contacted) {
    const days = (Date.now() - new Date(contact.last_contacted).getTime()) / 86400000;
    if (days < 30) score += 3;
    else if (days < 90) score += 2;
    else if (days < 180) score += 1;
  }
  if (contact.birthday) score += 1;
  if (contact.address) score += 1;
  return score >= 6 ? 'A' : score >= 4 ? 'B' : 'C';
}

function timeSinceContact(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

const REL_LABELS: Record<string, string> = {
  past_client: 'Past Client', sphere: 'Sphere', lead: 'Lead',
};
const SCORE_COLORS: Record<string, string> = {
  A: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  B: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  C: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// ─── CSV Parser ──────────────────────────────────────────────────────
function parseCSV(text: string): Partial<Contact>[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const rawHeaders = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));

  const map: Record<string, string> = {};
  for (const h of rawHeaders) {
    if (/^(full_?)?name$/.test(h)) map[h] = 'name';
    else if (/^(first_?name|first)$/.test(h)) map[h] = 'first_name';
    else if (/^(last_?name|last)$/.test(h)) map[h] = 'last_name';
    else if (/email/.test(h)) map[h] = 'email';
    else if (/phone|mobile|cell/.test(h)) map[h] = 'phone';
    else if (/address|street/.test(h)) map[h] = 'address';
    else if (/birth/.test(h)) map[h] = 'birthday';
    else if (/anniv/.test(h)) map[h] = 'anniversary';
    else if (/relation|type|category/.test(h)) map[h] = 'relationship_type';
    else if (/notes|comment/.test(h)) map[h] = 'notes';
    else if (/purchase.*date|close.*date|bought/.test(h)) map[h] = 'home_purchase_date';
    else if (/purchase.*price|close.*price|sale.*price/.test(h)) map[h] = 'home_purchase_price';
    else if (/mortgage.*rate|interest.*rate|rate/.test(h)) map[h] = 'mortgage_rate';
    else if (/last.*contact/.test(h)) map[h] = 'last_contacted';
  }

  return lines.slice(1).map(line => {
    const vals = line.match(/(".*?"|[^,]*)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || [];
    const row: Record<string, string> = {};
    rawHeaders.forEach((h, i) => {
      const mapped = map[h];
      if (mapped && vals[i]) row[mapped] = vals[i];
    });
    if (!row.name && (row.first_name || row.last_name)) {
      row.name = `${row.first_name || ''} ${row.last_name || ''}`.trim();
    }
    // Normalize relationship type
    let rel: Contact['relationship_type'] = 'sphere';
    const rt = (row.relationship_type || '').toLowerCase();
    if (/past|client|sold|closed/.test(rt)) rel = 'past_client';
    else if (/lead|prospect/.test(rt)) rel = 'lead';

    return {
      name: row.name || 'Unknown',
      email: row.email || '',
      phone: row.phone || '',
      address: row.address || '',
      birthday: row.birthday || null,
      anniversary: row.anniversary || null,
      relationship_type: rel,
      home_purchase_date: row.home_purchase_date || null,
      home_purchase_price: row.home_purchase_price ? parseFloat(row.home_purchase_price.replace(/[^0-9.]/g, '')) : null,
      mortgage_rate: row.mortgage_rate ? parseFloat(row.mortgage_rate) : null,
      notes: row.notes || '',
      last_contacted: row.last_contacted || null,
    } as Partial<Contact>;
  }).filter(c => c.name && c.name !== 'Unknown');
}

// ─── Demo Data ───────────────────────────────────────────────────────
function generateDemoData(): { contacts: Contact[]; events: SphereEvent[] } {
  const contacts: Contact[] = [
    { id: '1', name: 'John Smith', email: 'john@email.com', phone: '703-555-0101', address: '1234 Oak St, Arlington, VA 22201', birthday: '1985-02-16', anniversary: '2015-06-20', relationship_type: 'past_client', home_purchase_date: '2019-03-15', home_purchase_price: 520000, mortgage_rate: 3.25, notes: 'Sold them their home in 2019', last_contacted: '2026-01-28', created_at: '2025-01-01' },
    { id: '2', name: 'Sarah Jones', email: 'sarah.j@email.com', phone: '571-555-0202', address: '567 Maple Ave, Fairfax, VA 22030', birthday: '1990-08-12', anniversary: null, relationship_type: 'sphere', home_purchase_date: '2018-07-01', home_purchase_price: 450000, mortgage_rate: 4.5, notes: 'Met at open house, active on LinkedIn', last_contacted: '2025-12-15', created_at: '2025-01-01' },
    { id: '3', name: 'Mike Chen', email: 'mike.chen@email.com', phone: '202-555-0303', address: '890 Pine Dr, Tysons, VA 22182', birthday: '1978-11-03', anniversary: '2005-09-10', relationship_type: 'past_client', home_purchase_date: '2016-05-20', home_purchase_price: 480000, mortgage_rate: 3.75, notes: 'Home value has appreciated significantly', last_contacted: '2026-02-01', created_at: '2025-01-01' },
    { id: '4', name: 'Amy Wilson', email: 'amy.w@email.com', phone: '703-555-0404', address: '321 Elm Ct, Reston, VA 20190', birthday: '1992-04-25', anniversary: '2020-12-12', relationship_type: 'sphere', home_purchase_date: '2021-01-15', home_purchase_price: 550000, mortgage_rate: 2.875, notes: 'Just had a baby!', last_contacted: '2026-01-10', created_at: '2025-02-01' },
    { id: '5', name: 'The Johnsons', email: 'johnson.family@email.com', phone: '571-555-0505', address: '654 Birch Ln, Ashburn, VA 20147', birthday: null, anniversary: '2008-05-15', relationship_type: 'past_client', home_purchase_date: '2015-08-01', home_purchase_price: 425000, mortgage_rate: 3.5, notes: 'Oldest kid starts high school next year', last_contacted: '2025-10-20', created_at: '2025-01-01' },
    { id: '6', name: 'David Park', email: 'dpark@email.com', phone: '703-555-0606', address: '111 Cedar Way, McLean, VA 22101', birthday: '1982-07-19', anniversary: null, relationship_type: 'lead', home_purchase_date: null, home_purchase_price: null, mortgage_rate: null, notes: 'Inquired about McLean listings', last_contacted: '2026-02-05', created_at: '2025-06-01' },
    { id: '7', name: 'Lisa Martinez', email: 'lisa.m@email.com', phone: '202-555-0707', address: '222 Walnut St, Alexandria, VA 22314', birthday: '1988-12-30', anniversary: '2016-03-05', relationship_type: 'past_client', home_purchase_date: '2019-11-01', home_purchase_price: 610000, mortgage_rate: 3.0, notes: 'Referred 2 clients last year', last_contacted: '2026-02-08', created_at: '2024-11-01' },
    { id: '8', name: 'Tom & Rachel Green', email: 'greens@email.com', phone: '571-555-0808', address: '333 Spruce Ct, Herndon, VA 20170', birthday: null, anniversary: '2012-10-22', relationship_type: 'sphere', home_purchase_date: '2017-04-15', home_purchase_price: 390000, mortgage_rate: 4.125, notes: 'Kids are growing, might need bigger home', last_contacted: '2025-08-15', created_at: '2025-01-01' },
  ];

  const events: SphereEvent[] = [
    { id: 'e1', contact_id: '1', contact_name: 'John Smith', event_type: 'birthday', description: "John Smith's birthday is in 5 days — Send a $25 gift card?", detected_at: '2026-02-11T10:00:00Z', action_taken: false },
    { id: 'e2', contact_id: '2', contact_name: 'Sarah Jones', event_type: 'job_change', description: 'Sarah Jones changed jobs on LinkedIn — Potential relocation?', detected_at: '2026-02-10T14:00:00Z', action_taken: false },
    { id: 'e3', contact_id: '3', contact_name: 'Mike Chen', event_type: 'home_value_milestone', description: "Mike Chen's home value crossed $600K — Equity play?", detected_at: '2026-02-09T09:00:00Z', action_taken: false },
    { id: 'e4', contact_id: '4', contact_name: 'Amy Wilson', event_type: 'new_baby', description: 'Amy Wilson announced a new baby — Will they need more space?', detected_at: '2026-02-08T16:00:00Z', action_taken: false },
    { id: 'e5', contact_id: '5', contact_name: 'The Johnsons', event_type: 'school_transition', description: "The Johnsons' oldest starts high school next year — School district move?", detected_at: '2026-02-07T11:00:00Z', action_taken: false },
    { id: 'e6', contact_id: '3', contact_name: 'Mike Chen', event_type: 'time_since_purchase', description: "Mike Chen bought 10 years ago — Common time for a move", detected_at: '2026-02-06T08:00:00Z', action_taken: false },
    { id: 'e7', contact_id: '8', contact_name: 'Tom & Rachel Green', event_type: 'mortgage_rate_gap', description: 'Tom & Rachel Green locked at 4.125% — Current rates may offer savings', detected_at: '2026-02-05T13:00:00Z', action_taken: false },
    { id: 'e8', contact_id: '5', contact_name: 'The Johnsons', event_type: 'neighborhood_appreciation', description: "Ashburn appreciation is up 12% YoY — The Johnsons' equity is surging", detected_at: '2026-02-04T10:00:00Z', action_taken: false },
    { id: 'e9', contact_id: '7', contact_name: 'Lisa Martinez', event_type: 'anniversary', description: "Lisa Martinez's 10th wedding anniversary is in 3 weeks", detected_at: '2026-02-03T09:00:00Z', action_taken: true },
  ];

  return { contacts, events };
}

// ─── Main Component ──────────────────────────────────────────────────
function SphereMonitorContent() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [events, setEvents] = useState<SphereEvent[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [relFilter, setRelFilter] = useState<RelFilter>('all');
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState<'all' | 25 | 50 | 100>('all');
  const [cardMessage, setCardMessage] = useState('');
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // New contact form
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '', email: '', phone: '', address: '', birthday: null, anniversary: null,
    relationship_type: 'sphere', home_purchase_date: null, home_purchase_price: null,
    mortgage_rate: null, notes: '', last_contacted: null,
  });

  useEffect(() => {
    const { contacts: c, events: e } = generateDemoData();
    setContacts(c);
    setEvents(e);
  }, []);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      if (relFilter !== 'all' && c.relationship_type !== relFilter) return false;
      if (scoreFilter !== 'all' && connectionScore(c) !== scoreFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => {
      const sa = connectionScore(a), sb = connectionScore(b);
      return sa < sb ? -1 : sa > sb ? 1 : 0;
    });
  }, [contacts, relFilter, scoreFilter, searchQuery]);

  function addContact(c: Partial<Contact>) {
    const contact: Contact = {
      id: crypto.randomUUID(),
      name: c.name || 'Unknown',
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      birthday: c.birthday || null,
      anniversary: c.anniversary || null,
      relationship_type: c.relationship_type || 'sphere',
      home_purchase_date: c.home_purchase_date || null,
      home_purchase_price: c.home_purchase_price ?? null,
      mortgage_rate: c.mortgage_rate ?? null,
      notes: c.notes || '',
      last_contacted: c.last_contacted || null,
      created_at: new Date().toISOString(),
    };
    setContacts(prev => [...prev, contact]);
  }

  function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      parsed.forEach(addContact);
      setShowImportModal(false);
    };
    reader.readAsText(file);
  }

  function handleAddSubmit() {
    addContact(newContact);
    setNewContact({ name: '', email: '', phone: '', address: '', birthday: null, anniversary: null, relationship_type: 'sphere', home_purchase_date: null, home_purchase_price: null, mortgage_rate: null, notes: '', last_contacted: null });
    setShowAddModal(false);
  }

  async function generateCardMessage(contact: Contact, occasion: string) {
    setGeneratingMessage(true);
    // Simulated Claude-generated message
    await new Promise(r => setTimeout(r, 800));
    const messages: Record<string, string> = {
      birthday: `Happy Birthday, ${contact.name.split(' ')[0]}! 🎂 Wishing you an amazing year ahead. If there's ever anything I can help with — real estate or otherwise — I'm always just a call away. Enjoy your special day!`,
      anniversary: `Happy Anniversary, ${contact.name.split(' ')[0]}! 💍 Celebrating another wonderful year. So happy for you! If your home needs ever change as life evolves, I'd love to help. Cheers to many more!`,
      default: `Hi ${contact.name.split(' ')[0]}! Just thinking of you and wanted to reach out. Hope you're doing great! If you ever need anything real estate related, I'm always here. Let's catch up soon!`,
    };
    setCardMessage(messages[occasion] || messages.default);
    setGeneratingMessage(false);
  }

  const contactEvents = (contactId: string) => events.filter(e => e.contact_id === contactId);

  const filteredGifts = GIFT_SUGGESTIONS.filter(g =>
    selectedPriceRange === 'all' ? true : g.price <= selectedPriceRange
  );

  // ── Render ──
  return (
    <div className="min-h-screen bg-[#e8e6e1] text-[#2a2a2a]">
      {/* Header */}
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[#666] hover:text-[#2a2a2a] transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                <span className="text-[#e85d26]">🔮</span> Sphere Seismograph
              </h1>
              <p className="text-xs sm:text-sm text-[#666]">Track life events. Time your outreach. Never miss a move.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowImportModal(true)} className="px-3 py-2 bg-[#f0ece4] hover:bg-gray-700 rounded-lg text-sm font-medium transition flex items-center gap-1.5">
              📥 Import CSV
            </button>
            <button onClick={() => setShowAddModal(true)} className="px-3 py-2 bg-[#e85d26] hover:bg-[#2d98af] rounded-lg text-sm font-medium transition flex items-center gap-1.5">
              ➕ Add Contact
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Contacts', value: contacts.length, icon: '👥' },
              { label: 'Active Alerts', value: events.filter(e => !e.action_taken).length, icon: '🔔' },
              { label: 'A-Score Contacts', value: contacts.filter(c => connectionScore(c) === 'A').length, icon: '⭐' },
              { label: 'Birthdays (30d)', value: contacts.filter(c => { const d = daysUntilDate(c.birthday); return d !== null && d <= 30; }).length, icon: '🎂' },
            ].map(s => (
              <div key={s.label} className="bg-[#f0ece4]/60 border border-[#e0dcd4] rounded-xl p-4">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-bold text-[#2a2a2a]">{s.value}</div>
                <div className="text-xs text-[#666]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <input
              type="text" placeholder="Search contacts..."
              className="flex-1 min-w-[200px] px-4 py-2 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-sm focus:outline-none focus:border-[#e85d26] transition"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            />
            <select value={relFilter} onChange={e => setRelFilter(e.target.value as RelFilter)}
              className="px-3 py-2 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-sm focus:outline-none focus:border-[#e85d26]">
              <option value="all">All Types</option>
              <option value="past_client">Past Clients</option>
              <option value="sphere">Sphere</option>
              <option value="lead">Leads</option>
            </select>
            <select value={scoreFilter} onChange={e => setScoreFilter(e.target.value as ScoreFilter)}
              className="px-3 py-2 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-sm focus:outline-none focus:border-[#e85d26]">
              <option value="all">All Scores</option>
              <option value="A">A Score</option>
              <option value="B">B Score</option>
              <option value="C">C Score</option>
            </select>
            <div className="flex bg-[#f0ece4] border border-[#d8d4cc] rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-[#e85d26] text-[#2a2a2a]' : 'text-[#666] hover:text-[#2a2a2a]'}`}>▦</button>
              <button onClick={() => setViewMode('list')} className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-[#e85d26] text-[#2a2a2a]' : 'text-[#666] hover:text-[#2a2a2a]'}`}>☰</button>
            </div>
          </div>

          {/* Contact Cards */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'flex flex-col gap-3'}>
            {filteredContacts.map(contact => {
              const score = connectionScore(contact);
              const bdayDays = daysUntilDate(contact.birthday);
              const cEvents = contactEvents(contact.id);
              const homeValue = contact.home_purchase_price ? Math.round(contact.home_purchase_price * 1.35) : null; // simulated appreciation
              const equity = homeValue && contact.home_purchase_price ? homeValue - Math.round(contact.home_purchase_price * 0.7) : null;

              return (
                <div key={contact.id} className={`bg-[#f0ece4]/60 border border-[#e0dcd4] rounded-xl p-4 hover:border-[#e85d26]/30 transition ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}>
                  <div className={viewMode === 'list' ? 'flex items-center gap-4 flex-1 min-w-0' : ''}>
                    {/* Top Row */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#e85d26]/20 flex items-center justify-center text-[#e85d26] font-bold text-sm flex-shrink-0">
                        {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[#2a2a2a] truncate">{contact.name}</h3>
                          <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${SCORE_COLORS[score]}`}>{score}</span>
                        </div>
                        <p className="text-xs text-[#666]">{REL_LABELS[contact.relationship_type]} · {timeSinceContact(contact.last_contacted)}</p>
                      </div>
                    </div>

                    {/* Details */}
                    {viewMode === 'grid' && (
                      <>
                        {contact.address && (
                          <p className="text-xs text-[#888] mb-2 truncate">📍 {contact.address}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {homeValue && (
                            <span className="text-xs bg-[#f0ece4] rounded px-2 py-1">🏠 ${(homeValue / 1000).toFixed(0)}K</span>
                          )}
                          {equity && (
                            <span className="text-xs bg-emerald-900/30 text-emerald-400 rounded px-2 py-1">💰 ${(equity / 1000).toFixed(0)}K equity</span>
                          )}
                          {bdayDays !== null && bdayDays <= 30 && (
                            <span className="text-xs bg-purple-900/30 text-purple-400 rounded px-2 py-1">🎂 {bdayDays}d</span>
                          )}
                        </div>

                        {/* Event badges */}
                        {cEvents.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {cEvents.map(ev => (
                              <span key={ev.id} className={`text-[10px] px-2 py-0.5 rounded-full ${ev.action_taken ? 'bg-[#f0ece4] text-[#888]' : 'bg-[#e85d26]/10 text-[#e85d26] border border-[#e85d26]/20'}`}>
                                {EVENT_ICONS[ev.event_type] || '📌'} {ev.event_type.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setShowGiftPanel(contact.id); generateCardMessage(contact, cEvents[0]?.event_type || 'default'); }}
                            className="flex-1 px-3 py-1.5 bg-[#e85d26]/10 text-[#e85d26] rounded-lg text-xs font-medium hover:bg-[#e85d26]/20 transition"
                          >
                            🎁 Gift / Reach Out
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {viewMode === 'list' && (
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {homeValue && <span className="text-xs text-[#666] hidden sm:inline">🏠 ${(homeValue / 1000).toFixed(0)}K</span>}
                      {cEvents.filter(e => !e.action_taken).length > 0 && (
                        <span className="text-xs bg-[#e85d26]/10 text-[#e85d26] rounded-full px-2 py-0.5">{cEvents.filter(e => !e.action_taken).length} alerts</span>
                      )}
                      <button
                        onClick={() => { setShowGiftPanel(contact.id); generateCardMessage(contact, cEvents[0]?.event_type || 'default'); }}
                        className="px-3 py-1.5 bg-[#e85d26]/10 text-[#e85d26] rounded-lg text-xs font-medium hover:bg-[#e85d26]/20 transition"
                      >
                        Reach Out
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {filteredContacts.length === 0 && (
            <div className="text-center py-16 text-[#888]">
              <p className="text-4xl mb-3">👥</p>
              <p className="text-lg font-medium">No contacts found</p>
              <p className="text-sm">Import a CSV or add contacts manually to get started</p>
            </div>
          )}
        </div>

        {/* Alert Feed Sidebar */}
        <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <div className="bg-[#f0ece4]/60 border border-[#e0dcd4] rounded-xl p-4 sticky top-24">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-[#e85d26]">📡</span> Seismograph Feed
            </h2>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {events.map(ev => (
                <div key={ev.id} className={`p-3 rounded-lg border transition ${ev.action_taken ? 'bg-[#f0ece4]/30 border-[#e0dcd4] opacity-60' : 'bg-[#f0ece4]/60 border-[#d8d4cc] hover:border-[#e85d26]/30'}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">{EVENT_ICONS[ev.event_type] || '📌'}</span>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-200 leading-snug">{ev.description}</p>
                      <p className="text-[10px] text-[#888] mt-1">{new Date(ev.detected_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {!ev.action_taken && (
                    <button
                      onClick={() => setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, action_taken: true } : e))}
                      className="mt-2 w-full text-xs text-center py-1 bg-[#e85d26]/10 text-[#e85d26] rounded hover:bg-[#e85d26]/20 transition"
                    >
                      ✓ Mark Handled
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Gift Panel Modal */}
      {showGiftPanel && (() => {
        const contact = contacts.find(c => c.id === showGiftPanel);
        if (!contact) return null;
        return (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowGiftPanel(null)}>
            <div className="bg-[#f0ece4] border border-[#d8d4cc] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">🎁 Gift & Reach Out — {contact.name}</h2>
                <button onClick={() => setShowGiftPanel(null)} className="text-[#666] hover:text-[#2a2a2a] text-xl">✕</button>
              </div>

              {/* Personalized Message */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#555] mb-2">✉️ Personalized Message</h3>
                {generatingMessage ? (
                  <div className="bg-[#f0ece4] rounded-lg p-4 animate-pulse h-20" />
                ) : (
                  <div className="bg-[#f0ece4] rounded-lg p-4">
                    <p className="text-sm text-gray-200 leading-relaxed">{cardMessage}</p>
                    <button onClick={() => navigator.clipboard.writeText(cardMessage)} className="mt-2 text-xs text-[#e85d26] hover:underline">Copy Message</button>
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  {['birthday', 'anniversary', 'default'].map(occ => (
                    <button key={occ} onClick={() => generateCardMessage(contact, occ)}
                      className="text-xs px-2 py-1 bg-[#f0ece4] hover:bg-gray-700 rounded transition capitalize">{occ}</button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-[#666]">Budget:</span>
                {(['all', 25, 50, 100] as const).map(p => (
                  <button key={p} onClick={() => setSelectedPriceRange(p)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${selectedPriceRange === p ? 'bg-[#e85d26] text-[#2a2a2a]' : 'bg-[#f0ece4] text-[#666] hover:text-[#2a2a2a]'}`}>
                    {p === 'all' ? 'All' : `≤$${p}`}
                  </button>
                ))}
              </div>

              {/* Gift Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredGifts.map((gift, i) => (
                  <div key={i} className="bg-[#f0ece4]/60 border border-[#d8d4cc] rounded-xl p-3 hover:border-[#e85d26]/30 transition">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-[#2a2a2a]">{gift.name}</h4>
                      <span className="text-sm font-bold text-[#e85d26]">${gift.price}</span>
                    </div>
                    {'note' in gift && gift.note && <p className="text-[10px] text-[#888] mb-2">{gift.note}</p>}
                    <a href={gift.url} target="_blank" rel="noopener noreferrer"
                      className="block text-center text-xs py-1.5 bg-[#e85d26]/10 text-[#e85d26] rounded-lg hover:bg-[#e85d26]/20 transition font-medium">
                      {gift.url === '#' ? '🔍 Find Local' : '🛒 Send Gift'}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#f0ece4] border border-[#d8d4cc] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">➕ Add Contact</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#666] hover:text-[#2a2a2a] text-xl">✕</button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'name', label: 'Name *', type: 'text', placeholder: 'John Smith' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'john@email.com' },
                { key: 'phone', label: 'Phone', type: 'tel', placeholder: '703-555-0100' },
                { key: 'address', label: 'Address', type: 'text', placeholder: '1234 Oak St, Arlington, VA 22201' },
                { key: 'birthday', label: 'Birthday', type: 'date', placeholder: '' },
                { key: 'anniversary', label: 'Anniversary', type: 'date', placeholder: '' },
                { key: 'home_purchase_date', label: 'Home Purchase Date', type: 'date', placeholder: '' },
                { key: 'home_purchase_price', label: 'Home Purchase Price', type: 'number', placeholder: '500000' },
                { key: 'mortgage_rate', label: 'Mortgage Rate (%)', type: 'number', placeholder: '3.25' },
                { key: 'notes', label: 'Notes', type: 'text', placeholder: 'Met at open house...' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-[#666] mb-1">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    className="w-full px-3 py-2 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-sm focus:outline-none focus:border-[#e85d26] transition"
                    value={(newContact as Record<string, unknown>)[f.key] as string || ''}
                    onChange={e => setNewContact(prev => ({ ...prev, [f.key]: f.type === 'number' ? (e.target.value ? parseFloat(e.target.value) : null) : (e.target.value || null) }))}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-[#666] mb-1">Relationship</label>
                <select value={newContact.relationship_type || 'sphere'}
                  onChange={e => setNewContact(prev => ({ ...prev, relationship_type: e.target.value as Contact['relationship_type'] }))}
                  className="w-full px-3 py-2 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-sm focus:outline-none focus:border-[#e85d26]">
                  <option value="past_client">Past Client</option>
                  <option value="sphere">Sphere</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
              <button onClick={handleAddSubmit} disabled={!newContact.name}
                className="w-full py-2.5 bg-[#e85d26] hover:bg-[#2d98af] disabled:opacity-40 rounded-lg font-medium transition">
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowImportModal(false)}>
          <div className="bg-[#f0ece4] border border-[#d8d4cc] rounded-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">📥 Import Contacts</h2>
              <button onClick={() => setShowImportModal(false)} className="text-[#666] hover:text-[#2a2a2a] text-xl">✕</button>
            </div>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#d8d4cc] rounded-xl p-8 text-center hover:border-[#e85d26]/50 transition cursor-pointer"
                onClick={() => fileRef.current?.click()}>
                <p className="text-3xl mb-2">📄</p>
                <p className="text-sm text-[#555] font-medium">Click to upload CSV</p>
                <p className="text-xs text-[#888] mt-1">Supports most CRM export formats</p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
              </div>
              <div className="bg-[#f0ece4]/50 rounded-lg p-4">
                <p className="text-xs text-[#666] font-semibold mb-2">Supported columns:</p>
                <p className="text-xs text-[#888]">name, first_name, last_name, email, phone, address, birthday, anniversary, relationship_type, notes, purchase_date, purchase_price, mortgage_rate, last_contacted</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SphereMonitorPage() {
  return (
    <PaywallGate requiredTier="pro" featureName="Sphere Seismograph">
      <SphereMonitorContent />
    </PaywallGate>
  );
}
