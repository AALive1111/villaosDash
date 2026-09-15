import React, { useState } from 'react';
import { 
  Sparkles, Instagram, Share2, Copy, Check, Calendar, 
  Send, RefreshCw, Eye, Heart, Image as ImageIcon, Video 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ContentStudioView: React.FC = () => {
  const { properties, scheduleSocialPost, selectedPropertyId: globalSelectedId } = useApp();
  const [selectedPropId, setSelectedPropId] = useState<string>('');
  const [contentType, setContentType] = useState<'reel' | 'carousel' | 'story'>('reel');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  // Derive current property strictly from active workspace's scoped properties
  const currentProperty = React.useMemo(() => {
    if (selectedPropId) {
      const found = properties.find(p => p.id === selectedPropId);
      if (found) return found;
    }
    if (globalSelectedId) {
      const found = properties.find(p => p.id === globalSelectedId);
      if (found) return found;
    }
    return properties.find(p => !p.isArchived) || null;
  }, [properties, selectedPropId, globalSelectedId]);

  if (!currentProperty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-stone-500">
        <Sparkles className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-semibold text-stone-700">No properties found to create content.</p>
        <p className="text-xs text-stone-400 mt-1">Add or select a villa in this workspace to launch marketing posts.</p>
      </div>
    );
  }

  const sampleConcepts = {
    'prop-1': {
      hook: "POV: You unlock the carved teak gates of your private Seminyak sanctuary at sunset.",
      caption: "Tucked inside central Oberoi yet entirely secluded from the buzz. 4 king suites, lush frangipani gardens, and a 14-meter private pool with an in-villa breakfast chef waiting for your morning coffee.\n\n✨ Why pay 18% OTA service fees when you can book direct?\n\n📲 Comment 'SEMINYAK' below or click our bio link to claim complimentary airport pickup & VIP breakfast.",
      hashtags: "#BaliVilla #SeminyakVilla #VillaSeminyak #BaliLuxuryStays #BaliDirectBooking #OberoiBali",
      audio: "Golden Hour (Acoustic Bali Lounge Edit)",
    },
    'prop-3': {
      hook: "What does a 5-bedroom luxury estate with a rooftop cocktail bar in Canggu actually feel like?",
      caption: "Sunken living lounge, walk-in wine cellar, and rooftop sunsets over the Echo Beach horizon. Villa Canggu 08 is the ultimate private residence for design lovers and conscious luxury travelers.\n\n🥂 Host your private birthday dinner or wellness getaway.\n\nDirect host perks: Zero OTA middleman fees + free daily floating breakfast.",
      hashtags: "#CangguVilla #EchoBeach #BaliArchitecture #PrivateVillaBali #CangguStays #LuxuryTravel",
      audio: "Canggu Sunset Vibes - Deep House Mix",
    },
    'prop-2': {
      hook: "Hidden deep inside Ubud's jungle canopy where only birds and bamboo can see you.",
      caption: "Start your morning with cold plunge hydrotherapy, outdoor jungle stone showers, and panoramic rice terrace views. Villa Ubud 02 is built for restorative serenity.\n\n🧘‍♀️ Exclusive 3-night rejuvenation package available for September.\n\nDM 'UBUD' for secret direct dates.",
      hashtags: "#UbudVilla #BaliRetreat #UbudJungle #BaliWellness #LuxuryUbud",
      audio: "Ubud Rain & Gamelan Soundscape",
    },
  };

  // Safe fallback concept tailored to current property
  const activeContent = (sampleConcepts as any)[currentProperty.id] || {
    hook: `Experience ultimate tropical luxury at ${currentProperty.name}.`,
    caption: `Discover ${currentProperty.name} in ${currentProperty.area || 'Bali'}. Featuring ${currentProperty.bedrooms} bedrooms, private sanctuary pool, and bespoke guest hospitality.\n\n✨ Book direct for guaranteed best rates and complimentary VIP check-in perks.\n\n📲 Click the bio link or DM us to reserve your stay.`,
    hashtags: `#${currentProperty.name.replace(/\s+/g, '')} #BaliVilla #LuxuryStay #DirectBooking #${currentProperty.area || 'Bali'}Stays`,
    audio: "Island Sunset Chill - Acoustic Ambient",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${activeContent.caption}\n\n${activeContent.hashtags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSchedule = () => {
    scheduleSocialPost({
      id: `post-${Date.now()}`,
      platform: 'Instagram',
      type: contentType === 'reel' ? 'Reel' : 'Post',
      title: activeContent.hook,
      caption: activeContent.caption,
      mediaUrl: currentProperty.image,
      status: 'Scheduled',
      scheduledFor: 'Tomorrow, 5:30 PM (Sunset Peak)',
    });
    setScheduledSuccess(true);
    setTimeout(() => setScheduledSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-serif font-bold text-stone-900">AI Social Content Creation Studio</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800">
              Direct Acquisition Engine
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Generate high-converting Reels, carousels, viral hooks, and direct booking CTAs grounded in your villa assets.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setIsGenerating(true);
              setTimeout(() => setIsGenerating(false), 600);
            }}
            className="px-3.5 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold shadow-2xs flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate Hooks</span>
          </button>
        </div>
      </div>

      {scheduledSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Scheduled to Instagram & TikTok for peak Bali sunset engagement (5:30 PM)!</span>
        </div>
      )}

      {/* Selector Toolbar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <label className="font-bold text-stone-700">Target Property:</label>
          <select
            value={selectedPropId || currentProperty.id}
            onChange={(e) => setSelectedPropId(e.target.value)}
            className="px-3 py-1.5 border border-stone-200 rounded-lg text-xs font-semibold bg-white text-stone-800 focus:ring-2 focus:ring-amber-500"
          >
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.area})</option>
            ))}
          </select>
        </div>

        {/* Content Format Tabs */}
        <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
          {[
            { id: 'reel', label: 'Instagram Reel', icon: Video },
            { id: 'carousel', label: 'Photo Carousel', icon: ImageIcon },
            { id: 'story', label: 'Story Promo', icon: Instagram },
          ].map(fmt => {
            const Icon = fmt.icon;
            return (
              <button
                key={fmt.id}
                onClick={() => setContentType(fmt.id as any)}
                className={`px-3 py-1 rounded-lg font-semibold flex items-center space-x-1.5 transition-colors ${
                  contentType === fmt.id
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{fmt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Split Studio: Left Preview Card, Right Editor & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Mobile Phone Reel Preview (5 cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-[340px] bg-black rounded-[36px] p-3 shadow-2xl border-4 border-stone-800 relative overflow-hidden flex flex-col justify-between aspect-[9/16]">
            {/* Reel Media Background */}
            <img
              src={currentProperty.image}
              alt="Reel background"
              className="absolute inset-0 w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

            {/* Top Reel Bar */}
            <div className="relative z-10 flex items-center justify-between text-white p-2">
              <span className="text-xs font-bold flex items-center space-x-1">
                <Video className="w-3.5 h-3.5" />
                <span>Reels</span>
              </span>
              <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs font-mono">
                9:16 HD
              </span>
            </div>

            {/* Center Hook Overlay */}
            <div className="relative z-10 px-4 text-center">
              <div className="bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-white shadow-xl">
                <div className="text-[9px] font-bold uppercase tracking-widest text-amber-400 mb-1">
                  Viral Hook Preview
                </div>
                <p className="text-xs sm:text-sm font-bold leading-snug">
                  "{activeContent.hook}"
                </p>
              </div>
            </div>

            {/* Bottom Captions & Profile */}
            <div className="relative z-10 p-3 text-white space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center font-bold text-[10px]">
                  VO
                </div>
                <div>
                  <div className="text-xs font-bold leading-none">villaos.bali</div>
                  <div className="text-[9px] text-stone-300 mt-0.5 font-mono">{activeContent.audio}</div>
                </div>
              </div>

              <p className="text-[11px] text-stone-200 line-clamp-2 leading-relaxed">
                {activeContent.caption}
              </p>

              <div className="text-[10px] text-amber-300 font-bold">
                Comment "BOOK" for 0% commission direct rates ✦
              </div>
            </div>
          </div>
        </div>

        {/* Right Generated Copy, Hashtags & Scheduling Controls (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="font-serif font-bold text-base text-stone-900">
                  AI-Crafted Caption & Script
                </h3>
              </div>
              <span className="text-[11px] text-stone-500">Tone: Premium Bali Hospitality</span>
            </div>

            {/* Hook Idea */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                Visual Opening Hook (First 3 Seconds)
              </label>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900">
                "{activeContent.hook}"
              </div>
            </div>

            {/* Caption Body */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                Full Instagram Caption
              </label>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-800 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto font-sans">
                {activeContent.caption}
              </div>
            </div>

            {/* Hashtag Stack */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                Optimized Bali Hashtag Stack
              </label>
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs font-mono text-amber-800">
                {activeContent.hashtags}
              </div>
            </div>

            {/* CTA Strategy Note */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
              <span className="font-bold">Direct Conversion Mechanism:</span>
              <p className="text-stone-700 leading-relaxed">
                VillaOS AI WhatsApp bot will instantly detect incoming DMs matching keywords from this reel and send the guest your direct booking engine link with automatic pricing.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Caption & Tags'}</span>
            </button>

            <button
              onClick={handleSchedule}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule to Instagram (5:30 PM)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
