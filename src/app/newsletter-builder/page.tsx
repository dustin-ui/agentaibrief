'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { PaywallGate } from '@/components/PaywallGate';
import { Suspense } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIMES = Array.from({ length: 24 }, (_, h) => {
  const hh = h.toString().padStart(2, '0');
  return [`${hh}:00`, `${hh}:30`];
}).flat();

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

interface Area { city: string; state: string; county: string; }

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            i < current ? 'bg-[#e85d26] text-white' : i === current ? 'bg-[#e85d26]/20 text-[#e85d26] border-2 border-[#e85d26]' : 'bg-[#f0ece4] text-[#888]'
          }`}>{i + 1}</div>
          {i < total - 1 && <div className={`w-8 h-0.5 ${i < current ? 'bg-[#e85d26]' : 'bg-gray-700'}`} />}
        </div>
      ))}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-[#f0ece4]/80 border border-[#d8d4cc] rounded-2xl p-6 md:p-8">{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-[#555] mb-1.5">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full px-4 py-2.5 bg-[#f0ece4] border border-gray-600 rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26] focus:ring-1 focus:ring-[#e85d26] ${props.className || ''}`} />;
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return <select {...props} className="w-full px-4 py-2.5 bg-[#f0ece4] border border-gray-600 rounded-lg text-[#2a2a2a] focus:outline-none focus:border-[#e85d26] focus:ring-1 focus:ring-[#e85d26]">{props.children}</select>;
}

function NewsletterBuilderInner() {
  const { session } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [agentName, setAgentName] = useState('');
  const [brokerage, setBrokerage] = useState('');
  const [brokerageAddress, setBrokerageAddress] = useState('');
  const [teamName, setTeamName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [headshotUrl, setHeadshotUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [brandColor, setBrandColor] = useState('#e85d26');
  const [areas, setAreas] = useState<Area[]>([]);
  const [newArea, setNewArea] = useState<Area>({ city: '', state: '', county: '' });
  const [sendDay, setSendDay] = useState('Tuesday');
  const [sendTime, setSendTime] = useState('09:00');
  const [uploadingHeadshot, setUploadingHeadshot] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const populateFromProfile = useCallback((p: Record<string, unknown>) => {
    if (p.agent_name) setAgentName(p.agent_name as string);
    if (p.brokerage) setBrokerage(p.brokerage as string);
    if (p.brokerage_address) setBrokerageAddress(p.brokerage_address as string);
    if (p.team_name) setTeamName(p.team_name as string);
    if (p.phone) setPhone(p.phone as string);
    if (p.email) setEmail(p.email as string);
    if (p.headshot_url) setHeadshotUrl(p.headshot_url as string);
    if (p.logo_url) setLogoUrl(p.logo_url as string);
    if (p.brand_color) setBrandColor(p.brand_color as string);
    if (p.areas) setAreas(p.areas as Area[]);
    if (p.send_day) setSendDay(p.send_day as string);
    if (p.send_time) setSendTime(p.send_time as string);
  }, []);

  // Load existing profile on mount
  useEffect(() => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/newsletter/profile', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const p = data.profile || data;
          if (p && p.agent_name) {
            populateFromProfile(p);
            setProfileExists(true);
            setShowSummary(true);
          }
        }
      } catch {
        // No profile yet, that's fine
      }
      // Check URL params for CC OAuth redirect
      const ccSuccess = searchParams.get('cc_success');
      const ccError = searchParams.get('cc_error');
      if (ccSuccess === 'true') {
        setToast({ type: 'success', message: 'Constant Contact connected successfully!' });
        setStep(5);
        setShowSummary(false);
      } else if (ccError) {
        setToast({ type: 'error', message: `Connection error: ${ccError}` });
        setStep(4);
        setShowSummary(false);
      }
      setLoading(false);
    })();
  }, [session?.access_token, searchParams, populateFromProfile]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const buildPayload = () => ({
    agent_name: agentName, brokerage, brokerage_address: brokerageAddress,
    team_name: teamName || null, phone: phone || null,
    email, headshot_url: headshotUrl || null, logo_url: logoUrl || null, brand_color: brandColor,
    areas, send_day: sendDay, send_time: sendTime,
  });

  const saveProfile = async (method?: 'POST' | 'PUT') => {
    const m = method || (profileExists ? 'PUT' : 'POST');
    try {
      const res = await fetch('/api/newsletter/profile', {
        method: m,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify(buildPayload()),
      });
      if (res.ok) {
        setProfileExists(true);
      }
    } catch {
      // Silent save failure on auto-save
    }
  };

  const addArea = () => {
    if (newArea.county && newArea.state) {
      setAreas([...areas, { ...newArea }]);
      setNewArea({ city: '', state: '', county: '' });
    }
  };

  const removeArea = (i: number) => setAreas(areas.filter((_, idx) => idx !== i));

  const compressImage = (file: File, maxWidth = 800, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          resolve(new File([blob!], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
        }, 'image/jpeg', quality);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadFile = async (file: File, type: 'headshot' | 'logo') => {
    const setLoading = type === 'headshot' ? setUploadingHeadshot : setUploadingLogo;
    setLoading(true);
    try {
      const compressed = await compressImage(file);
      const form = new FormData();
      form.append('file', compressed);
      form.append('type', type);
      const res = await fetch('/api/newsletter/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      const { url } = data;
      if (type === 'headshot') setHeadshotUrl(url);
      else setLogoUrl(url);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      alert(`Upload failed: ${msg}`);
      console.error(e);
    }
    setLoading(false);
  };

  const launch = async () => {
    setSaving(true);
    try {
      await saveProfile(profileExists ? 'PUT' : 'POST');
      if (!editMode) {
        router.push('/newsletter-builder/dashboard');
      } else {
        setShowSummary(true);
        setEditMode(false);
        setToast({ type: 'success', message: 'Profile saved successfully!' });
      }
    } catch {
      alert('Failed to save profile. Please try again.');
    }
    setSaving(false);
  };

  const canNext = () => {
    if (step === 0) return !!(agentName && brokerage && brokerageAddress && email);
    if (step === 2) return areas.length > 0;
    return true;
  };

  const handleNext = async () => {
    // Auto-save on step transition
    await saveProfile();
    setStep(step + 1);
  };

  const handleEditProfile = () => {
    setShowSummary(false);
    setEditMode(true);
    setStep(0);
  };

  const STEPS = ['Agent Info', 'Branding', 'Coverage Areas', 'Schedule', 'Email Service', 'Launch'];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e8e6e1] flex items-center justify-center">
        <div className="text-[#666] text-lg">Loading...</div>
      </div>
    );
  }

  // Summary view when profile exists and not editing
  if (showSummary && profileExists && !editMode) {
    return (
      <PaywallGate requiredTier="pro" featureName="Newsletter Builder">
        <div className="min-h-screen bg-[#e8e6e1] py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-[#2a2a2a] mb-2">📧 Newsletter Builder</h1>
            <p className="text-[#666] mb-8">Your newsletter profile is set up and active.</p>

            {toast && (
              <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-300' : 'bg-red-50 text-red-800 border border-red-300'}`}>
                {toast.message}
              </div>
            )}

            <Card>
              <h2 className="text-xl font-semibold text-[#2a2a2a] mb-6">Your Profile</h2>
              <div className="space-y-4 text-sm">
                <div className="bg-[#f0ece4] rounded-lg p-4 flex items-center gap-4">
                  {headshotUrl && <img src={headshotUrl} alt="Headshot" className="w-14 h-14 rounded-full object-cover border-2 border-[#e85d26]" />}
                  <div>
                    <span className="text-[#2a2a2a] font-semibold text-base">{agentName}</span><br/>
                    <span className="text-[#666]">{teamName ? `${teamName} · ` : ''}{brokerage}</span>
                  </div>
                </div>
                {brokerageAddress && (
                  <div className="bg-[#f0ece4] rounded-lg p-4">
                    <span className="text-[#666]">Address:</span> <span className="text-[#2a2a2a] ml-2">{brokerageAddress}</span>
                  </div>
                )}
                <div className="bg-[#f0ece4] rounded-lg p-4">
                  <span className="text-[#666]">Contact:</span> <span className="text-[#2a2a2a] ml-2">{email}{phone ? ` · ${phone}` : ''}</span>
                </div>
                <div className="bg-[#f0ece4] rounded-lg p-4 flex items-center gap-3">
                  <span className="text-[#666]">Brand Color:</span>
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: brandColor }} />
                  <span className="text-[#2a2a2a]">{brandColor}</span>
                  {logoUrl && <img src={logoUrl} alt="Logo" className="h-8 w-auto ml-auto rounded" />}
                </div>
                <div className="bg-[#f0ece4] rounded-lg p-4">
                  <span className="text-[#666]">Areas:</span>
                  <span className="text-[#2a2a2a] ml-2">{areas.map(a => `${a.city ? a.city + ', ' : ''}${a.state}${a.county ? ` · ${a.county}` : ''}`).join(' | ')}</span>
                </div>
                <div className="bg-[#f0ece4] rounded-lg p-4">
                  <span className="text-[#666]">Schedule:</span> <span className="text-[#2a2a2a] ml-2">Every {sendDay} at {sendTime}</span>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleEditProfile}
                  className="px-6 py-3 bg-[#2a2a2a] text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors">
                  ✏️ Edit Profile
                </button>
                <button onClick={() => router.push('/newsletter-builder/dashboard')}
                  className="flex-1 py-3 bg-[#e85d26] text-white rounded-xl font-semibold text-lg hover:bg-[#c44a1a] transition-colors">
                  Go to Dashboard →
                </button>
              </div>
            </Card>
          </div>
        </div>
      </PaywallGate>
    );
  }

  return (
    <PaywallGate requiredTier="pro" featureName="Newsletter Builder">
      <div className="min-h-screen bg-[#e8e6e1] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-[#2a2a2a] mb-2">📧 Newsletter Builder</h1>
          <p className="text-[#666] mb-8">{editMode ? 'Edit your newsletter profile.' : 'Set up your branded weekly newsletter in minutes.'}</p>

          {toast && (
            <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-300' : 'bg-red-50 text-red-800 border border-red-300'}`}>
              {toast.message}
            </div>
          )}

          <StepIndicator current={step} total={6} />
          <p className="text-sm text-[#888] mb-4">Step {step + 1}: {STEPS[step]}</p>

          {step === 0 && (
            <Card>
              <h2 className="text-xl font-semibold text-[#2a2a2a] mb-6">Agent Information</h2>
              <div className="space-y-4">
                <div><Label>Full Name *</Label><Input value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="Jane Smith" /></div>
                <div><Label>Brokerage *</Label><Input value={brokerage} onChange={e => setBrokerage(e.target.value)} placeholder="Samson Properties" /></div>
                <div><Label>Brokerage Address *</Label><Input value={brokerageAddress} onChange={e => setBrokerageAddress(e.target.value)} placeholder="14291 Park Meadow Dr Suite 500, Chantilly, VA 20151" /></div>
                <div><Label>Team Name</Label><Input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="The Smith Team (optional)" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" /></div>
                  <div><Label>Email *</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" /></div>
                </div>
              </div>
            </Card>
          )}

          {step === 1 && (
            <Card>
              <h2 className="text-xl font-semibold text-[#2a2a2a] mb-6">Branding</h2>
              <div className="space-y-6">
                <div>
                  <Label>Headshot</Label>
                  <div className="flex items-center gap-4">
                    {headshotUrl ? (
                      <img src={headshotUrl} alt="Headshot" className="w-20 h-20 rounded-full object-cover border-2 border-[#e85d26]" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-[#f0ece4] border-2 border-dashed border-gray-600 flex items-center justify-center text-[#888] text-2xl">📷</div>
                    )}
                    <div>
                      <label className={`px-4 py-2 bg-[#2a2a2a] text-white rounded-lg text-sm hover:bg-gray-600 cursor-pointer inline-block ${uploadingHeadshot ? 'opacity-50 pointer-events-none' : ''}`}>
                        {uploadingHeadshot ? 'Uploading...' : 'Upload Photo'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'headshot')} />
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-16 w-auto max-w-[160px] object-contain rounded-lg border border-[#d8d4cc] bg-[#e8e6e1] p-1" />
                    ) : (
                      <div className="h-16 w-32 rounded-lg bg-[#f0ece4] border-2 border-dashed border-gray-600 flex items-center justify-center text-[#888] text-sm">Your Logo</div>
                    )}
                    <div>
                      <label className={`px-4 py-2 bg-[#2a2a2a] text-white rounded-lg text-sm hover:bg-gray-600 cursor-pointer inline-block ${uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                        {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'logo')} />
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Brand Color</Label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer bg-transparent border-0" />
                    <Input value={brandColor} onChange={e => setBrandColor(e.target.value)} className="!w-32" />
                    <div className="h-10 flex-1 rounded-lg" style={{ backgroundColor: brandColor }} />
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-[#d8d4cc]" style={{ borderLeftColor: brandColor, borderLeftWidth: 4 }}>
                  <p className="text-[#2a2a2a] font-semibold">Preview: Story Card</p>
                  <p className="text-[#666] text-sm mt-1">This is how your newsletter stories will look with your brand color.</p>
                  <a href="#" style={{ color: brandColor }} className="text-sm mt-2 inline-block">Read more →</a>
                </div>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <h2 className="text-xl font-semibold text-[#2a2a2a] mb-6">Coverage Areas</h2>
              <p className="text-[#666] text-sm mb-4">Add the cities and counties you serve. We&apos;ll find local stories for these areas.</p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div><Label>County *</Label><Input value={newArea.county} onChange={e => setNewArea({ ...newArea, county: e.target.value })} placeholder="Arlington County" /></div>
                <div><Label>State *</Label>
                  <Select value={newArea.state} onChange={e => setNewArea({ ...newArea, state: e.target.value })}>
                    <option value="">Select</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </div>
                <div><Label>City</Label><Input value={newArea.city} onChange={e => setNewArea({ ...newArea, city: e.target.value })} placeholder="Arlington (optional)" /></div>
              </div>
              <button onClick={addArea} disabled={!newArea.county || !newArea.state}
                className="px-4 py-2 bg-[#e85d26]/10 text-[#e85d26] border border-[#e85d26]/30 rounded-lg text-sm hover:bg-[#e85d26]/20 disabled:opacity-30 mb-4">
                + Add Area
              </button>
              {areas.length > 0 && (
                <div className="space-y-2">
                  {areas.map((a, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#f0ece4] rounded-lg px-4 py-2">
                      <span className="text-[#2a2a2a] text-sm">{a.city ? `${a.city}, ` : ''}{a.state}{a.county ? ` · ${a.county}` : ''}</span>
                      <button onClick={() => removeArea(i)} className="text-[#888] hover:text-red-400 text-sm">✕</button>
                    </div>
                  ))}
                </div>
              )}
              {areas.length === 0 && <p className="text-[#888] text-sm mt-2">Add at least one coverage area to continue.</p>}
            </Card>
          )}

          {step === 3 && (
            <Card>
              <h2 className="text-xl font-semibold text-[#2a2a2a] mb-6">Delivery Schedule</h2>
              <p className="text-[#666] text-sm mb-4">Choose when your newsletter goes out each week.</p>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Day of Week</Label>
                  <Select value={sendDay} onChange={e => setSendDay(e.target.value)}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </div>
                <div><Label>Time</Label>
                  <Select value={sendTime} onChange={e => setSendTime(e.target.value)}>
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </div>
              </div>
              <p className="text-[#888] text-xs mt-3">Time zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <h2 className="text-xl font-semibold text-[#2a2a2a] mb-6">Email Delivery (Constant Contact)</h2>
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 border border-[#e85d26]/20">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#e85d26] flex items-center justify-center text-white font-bold text-sm shrink-0">1</div>
                    <div className="flex-1">
                      <p className="text-[#2a2a2a] font-semibold text-lg mb-2">Activate Your Email Platform</p>
                      <p className="text-[#555] text-sm mb-4">
                        We build your branded newsletter every week — but we need somewhere to send it from. 
                        Constant Contact is the industry standard for email marketing, trusted by 200,000+ businesses.
                      </p>
                      <div className="bg-[#f0ece4]/60 rounded-lg p-4 mb-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[#e85d26]">✓</span>
                          <span className="text-[#2a2a2a]"><strong>We write your newsletter every week</strong> — you just review and hit send</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[#e85d26]">✓</span>
                          <span className="text-[#2a2a2a]">24-hour preview before every send — edit anything you want</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[#e85d26]">✓</span>
                          <span className="text-[#2a2a2a]">Your branding, your name, your contact info — looks 100% yours</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[#e85d26]">✓</span>
                          <span className="text-[#2a2a2a]">Built-in contact management, analytics, and deliverability</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[#e85d26]">✓</span>
                          <span className="text-[#2a2a2a]">Starts at just <strong>$12/mo</strong> — cancel anytime, no contracts</span>
                        </div>
                      </div>
                      <a href="https://www.constantcontact.com/partner-offer?pn=sixweekstorealestatesuccess&cc=invite"
                        target="_blank" rel="noopener noreferrer"
                        className="inline-block px-6 py-3 bg-[#e85d26] text-white rounded-lg font-semibold hover:bg-[#c44a1a] transition-colors">
                        Start Your Free Trial →
                      </a>
                      <p className="text-[#888] text-xs mt-2">Free 14-day trial • No credit card required to start • Cancel anytime</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#f0ece4] rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#555] flex items-center justify-center text-white font-bold text-sm shrink-0">2</div>
                    <div>
                      <p className="text-[#2a2a2a] font-medium mb-1">Connect your account to AgentAIBrief</p>
                      <p className="text-[#666] text-sm mb-3">
                        After signing up, click below to authorize us to create and schedule newsletters in your account. 
                        You&apos;ll get a preview 24 hours before each send to review and edit.
                      </p>
                      <a href={`https://authz.constantcontact.com/oauth2/default/v1/authorize?client_id=4012da91-493c-4f46-9093-b01eff0b8f53&redirect_uri=https://agentaibrief.com/api/auth/callback/constantcontact&response_type=code&scope=contact_data+campaign_data+offline_access&state=${session?.user?.id || 'newsletter'}`}
                        className="inline-block px-5 py-2.5 bg-[#2a2a2a] text-white rounded-lg font-medium hover:bg-[#444] transition-colors text-sm">
                        Connect Constant Contact →
                      </a>
                    </div>
                  </div>
                </div>

                <p className="text-[#888] text-xs text-center">You can skip this step and connect later from your dashboard.</p>
              </div>
            </Card>
          )}

          {step === 5 && (
            <Card>
              <h2 className="text-xl font-semibold text-[#2a2a2a] mb-6">{editMode ? '✅ Review Changes' : '🚀 Ready to Launch!'}</h2>
              <div className="space-y-4 text-sm">
                <div className="bg-[#f0ece4] rounded-lg p-4">
                  <span className="text-[#666]">Agent:</span> <span className="text-[#2a2a2a] ml-2">{agentName}</span>
                </div>
                <div className="bg-[#f0ece4] rounded-lg p-4">
                  <span className="text-[#666]">Brokerage:</span> <span className="text-[#2a2a2a] ml-2">{brokerage}</span>
                  {brokerageAddress && <><br/><span className="text-[#666]">Address:</span> <span className="text-[#2a2a2a] ml-2">{brokerageAddress}</span></>}
                  {teamName && <><br/><span className="text-[#666]">Team:</span> <span className="text-[#2a2a2a] ml-2">{teamName}</span></>}
                </div>
                <div className="bg-[#f0ece4] rounded-lg p-4">
                  <span className="text-[#666]">Contact:</span> <span className="text-[#2a2a2a] ml-2">{email}{phone ? ` · ${phone}` : ''}</span>
                </div>
                <div className="bg-[#f0ece4] rounded-lg p-4 flex items-center gap-3">
                  <span className="text-[#666]">Brand Color:</span>
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: brandColor }} />
                  <span className="text-[#2a2a2a]">{brandColor}</span>
                </div>
                <div className="bg-[#f0ece4] rounded-lg p-4">
                  <span className="text-[#666]">Areas:</span>
                  <span className="text-[#2a2a2a] ml-2">{areas.map(a => `${a.city ? a.city + ', ' : ''}${a.state}`).join(' · ')}</span>
                </div>
                <div className="bg-[#f0ece4] rounded-lg p-4">
                  <span className="text-[#666]">Schedule:</span> <span className="text-[#2a2a2a] ml-2">Every {sendDay} at {sendTime}</span>
                </div>
              </div>
              <button onClick={launch} disabled={saving}
                className="w-full mt-6 py-3 bg-[#e85d26] text-white rounded-xl font-semibold text-lg hover:bg-[#c44a1a] transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : editMode ? '💾 Save Changes' : '🚀 Launch My Newsletter'}
              </button>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="px-6 py-2.5 bg-[#f0ece4] text-[#2a2a2a] rounded-lg hover:bg-[#d8d4cc] transition-colors">
                ← Back
              </button>
            ) : editMode ? (
              <button onClick={() => { setShowSummary(true); setEditMode(false); }} className="px-6 py-2.5 bg-[#f0ece4] text-[#2a2a2a] rounded-lg hover:bg-[#d8d4cc] transition-colors">
                ← Cancel
              </button>
            ) : <div />}
            {step < 5 && (
              <button onClick={handleNext} disabled={!canNext()}
                className="px-6 py-2.5 bg-[#e85d26] text-white rounded-lg hover:bg-[#c44a1a] transition-colors disabled:opacity-30 font-medium">
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </PaywallGate>
  );
}

export default function NewsletterBuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#e8e6e1] flex items-center justify-center"><div className="text-[#666] text-lg">Loading...</div></div>}>
      <NewsletterBuilderInner />
    </Suspense>
  );
}
