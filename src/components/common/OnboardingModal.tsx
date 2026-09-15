import React, { useState } from 'react';
import { 
  X, CheckCircle2, ChevronRight, ChevronLeft, Building2, 
  Sparkles, Bot, Shield, Globe, MessageSquare, Users, Check, MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, setIsOnboardingOpen, setActiveTab } = useApp();
  const [step, setStep] = useState(1);

  // Form states
  const [businessType, setBusinessType] = useState('Villa Management Company');
  const [propertyCount, setPropertyCount] = useState('5 – 10 Villas');
  const [baliArea, setBaliArea] = useState('Seminyak & Canggu');

  const [connectedChannels, setConnectedChannels] = useState({
    airbnb: true,
    booking: true,
    whatsapp: true,
    instagram: true,
  });

  const [aiGuards, setAiGuards] = useState({
    requirePriceApproval: true,
    requireDiscountApproval: true,
    autoDispatchHousekeeping: true,
    autoDraftGuestReplies: true,
  });

  if (!isOnboardingOpen) return null;

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setIsOnboardingOpen(false);
      setActiveTab('dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E8E6E1] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FAF9F6] border-b border-[#E8E6E1] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEFAE0] border border-[#F1EDD4] flex items-center justify-center text-[#606C38]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif font-bold text-lg text-[#2D2926]">VillaOS AI Setup</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEFAE0] text-[#606C38] border border-[#F1EDD4]">
                  Bali MVP
                </span>
              </div>
              <p className="text-xs text-stone-500">Step {step} of {totalSteps}: Rapid setup for villa operations</p>
            </div>
          </div>
          <button
            onClick={() => setIsOnboardingOpen(false)}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 h-1">
          <div 
            className="bg-[#606C38] h-1 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* STEP 1: Portfolio Profile */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#2D2926]">Your Bali Villa Portfolio</h3>
                <p className="text-xs text-stone-500 mt-0.5">Select how your short-term rentals are organized in Bali.</p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-stone-700">Business Model</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: 'Villa Management Company', desc: 'Multi-villa operator across Bali' },
                    { label: 'Private Villa Owner', desc: 'Managing 1 to 3 personal luxury villas' },
                    { label: 'Boutique Compound', desc: 'Villas with shared pool/reception' },
                    { label: 'Superhost Concierge', desc: 'Co-hosting and operational management' },
                  ].map(item => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setBusinessType(item.label)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        businessType === item.label
                          ? 'border-[#606C38] bg-[#FEFAE0]/60 ring-2 ring-[#606C38]/20 shadow-2xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="font-bold text-xs text-[#2D2926]">{item.label}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5 leading-snug">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Portfolio Scale</label>
                  <select
                    value={propertyCount}
                    onChange={(e) => setPropertyCount(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs font-medium text-[#2D2926]"
                  >
                    <option value="1 – 2 Villas">1 – 2 Villas</option>
                    <option value="3 – 5 Villas">3 – 5 Villas</option>
                    <option value="5 – 10 Villas">5 – 10 Villas (5 Loaded)</option>
                    <option value="10+ Villas">10+ Villas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Primary Bali Area</label>
                  <select
                    value={baliArea}
                    onChange={(e) => setBaliArea(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs font-medium text-[#2D2926]"
                  >
                    <option value="Seminyak & Canggu">Seminyak & Canggu</option>
                    <option value="Ubud & Central Bali">Ubud & Central Bali</option>
                    <option value="Uluwatu & Bukit">Uluwatu & Bukit</option>
                    <option value="Sanur & East Bali">Sanur & East Bali</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E1] flex items-center space-x-3 text-xs">
                <MapPin className="w-4 h-4 text-[#606C38] flex-shrink-0" />
                <span className="text-stone-600">
                  Pre-configured with <strong>5 active Bali villas</strong>: Villa Seminyak 04, Villa Echo Canggu, Villa Ubud Sanctuary, Villa Uluwatu Cliff, and Villa Sunset Canggu.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Channel & Team Connections */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#2D2926]">Connected Channels & Team</h3>
                <p className="text-xs text-stone-500 mt-0.5">Centralizing OTAs and operational communications.</p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    name: 'Airbnb Direct Sync',
                    sub: '2-way rate distribution & reservation webhooks',
                    type: 'Demo Connection',
                    icon: Globe,
                    active: connectedChannels.airbnb,
                  },
                  {
                    name: 'Booking.com XML',
                    sub: 'Live availability & instant booking import',
                    type: 'Demo Connection',
                    icon: Globe,
                    active: connectedChannels.booking,
                  },
                  {
                    name: 'WhatsApp Business API (+62)',
                    sub: 'Guest concierge & cleaner housekeeping dispatch',
                    type: 'Demo Connection',
                    icon: MessageSquare,
                    active: connectedChannels.whatsapp,
                  },
                  {
                    name: 'Instagram Direct (@villaos_bali)',
                    sub: 'Direct DM inquiry handling & promotional vouchers',
                    type: 'Demo Connection',
                    icon: MessageSquare,
                    active: connectedChannels.instagram,
                  },
                ].map(ch => {
                  const Icon = ch.icon;
                  return (
                    <div key={ch.name} className="p-3 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E1] flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-white border border-[#E8E6E1] flex items-center justify-center text-[#606C38]">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-[#2D2926]">{ch.name}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FEFAE0] text-[#BC6C25] border border-[#F1EDD4]">
                              {ch.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5">{ch.sub}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Ready</span>
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
                <span className="font-bold text-stone-700">Pre-assigned Housekeeping & Tech:</span>
                <p className="text-stone-500 text-[11px]">
                  • Made Budiasa (Housekeeping Lead) & Made Artha (HVAC Tech) configured for automated WhatsApp dispatch.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: AI Co-Pilot Autonomy & Safeguards */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#2D2926]">AI Autonomy & Safeguards</h3>
                <p className="text-xs text-stone-500 mt-0.5">Control autonomous operations vs. actions requiring your approval.</p>
              </div>

              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Autonomous Operations (Active)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Context-aware guest reply drafts',
                    'Turnover tasks created on checkout',
                    'Dynamic weekend pricing recommendations',
                    'Social caption & reel generator',
                  ].map((feat, i) => (
                    <div key={i} className="p-2.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-medium text-emerald-950">{feat}</span>
                      <Check className="w-3.5 h-3.5 text-emerald-700 font-bold" />
                    </div>
                  ))}
                </div>

                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 pt-2">
                  Strict Human Approvals Required
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Pushing rate changes to live OTA channels', role: 'Requires Manager Authorization' },
                    { label: 'Sending pricing discounts or refunds to guests', role: 'Requires Manager Authorization' },
                  ].map((guard, i) => (
                    <div key={i} className="p-2.5 bg-[#FEFAE0]/60 border border-[#F1EDD4] rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-3.5 h-3.5 text-[#BC6C25]" />
                        <span className="font-medium text-stone-800">{guard.label}</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#BC6C25] bg-white px-2 py-0.5 rounded border border-[#F1EDD4]">
                        Enforced
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-[#FAF9F6] border-t border-[#E8E6E1] flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              step === 1 ? 'opacity-30 cursor-not-allowed text-stone-400' : 'text-stone-700 hover:bg-stone-200/60'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span 
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 === step ? 'bg-[#606C38] w-4' : 'bg-stone-300 w-1.5'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#606C38] hover:bg-[#4C572C] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <span>{step === totalSteps ? 'Launch VillaOS' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
