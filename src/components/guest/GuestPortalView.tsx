import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Wifi, Shield, Check, Copy, Send, Sparkles, AlertCircle, 
  Clock, MapPin, Phone, Key, Calendar, User, MessageSquare, 
  Wrench, CheckCircle2, ChevronRight, X, Star, Coffee, Bed, 
  Bath, Users, RefreshCw, LogIn, ExternalLink, HelpCircle,
  Home, Waves, Sun
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Property, Reservation } from '../../types';
import welcomeBgImage from '../../assets/images/guest_welcome_bg_1789386364930.jpg';

interface GuestPortalViewProps {
  propertyId?: string;
  token?: string;
  onExitPreview?: () => void;
}

export const GuestPortalView: React.FC<GuestPortalViewProps> = ({
  propertyId: initialPropId,
  token: initialToken,
  onExitPreview
}) => {
  const { 
    allProperties, 
    conversations, 
    sendChatMessage, 
    submitGuestPortalRequest,
    reservations
  } = useApp();

  // Resolve propertyId from props or URL
  const queryParams = new URLSearchParams(window.location.search);
  const resolvedPropId = initialPropId || queryParams.get('propertyId') || queryParams.get('propId') || 'prop-1';
  const resolvedToken = initialToken || queryParams.get('token') || '';

  const property = useMemo(() => {
    return allProperties.find(p => p.id === resolvedPropId) || allProperties[0] || null;
  }, [allProperties, resolvedPropId]);

  // Guest verification state
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedGuestName, setVerifiedGuestName] = useState<string>('In-Villa Guest');
  const [verificationInput, setVerificationInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Active stay linked reservation
  const linkedReservation = useMemo(() => {
    if (!property) return null;
    return reservations.find(r => 
      r.propertyId === property.id && 
      (r.status === 'Confirmed' || r.status === 'Checked In')
    ) || null;
  }, [property, reservations]);

  // UI Tabs: 'welcome' | 'chat' | 'services' | 'guide' | 'villa'
  const [activeTab, setActiveTab] = useState<'welcome' | 'chat' | 'services' | 'guide' | 'villa'>('welcome');

  // Modals for Quick Requests
  const [serviceModal, setServiceModal] = useState<'cleaning' | 'maintenance' | 'assistance' | null>(null);
  const [serviceDetails, setServiceDetails] = useState({
    title: '',
    description: '',
    preferredTime: 'As soon as possible',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });
  const [requestSuccessNotice, setRequestSuccessNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chat message input
  const [chatInput, setChatInput] = useState('');
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [copiedAccess, setCopiedAccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find or observe live conversation for this property
  const activeConversation = useMemo(() => {
    if (!property) return null;
    return conversations.find(c => 
      c.propertyId === property.id && 
      (c.channel === 'Guest Portal' || c.propertyName === property.name)
    ) || null;
  }, [conversations, property]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages, activeTab]);

  // 1-tap Copy Wi-Fi
  const handleCopyWifi = () => {
    const password = property?.rules?.wifiPassword || 'balivilla2026';
    navigator.clipboard.writeText(password);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2500);
  };

  // 1-tap Copy Keypad Code
  const handleCopyAccess = () => {
    const code = property?.rules?.accessCode || '8842';
    navigator.clipboard.writeText(code);
    setCopiedAccess(true);
    setTimeout(() => setCopiedAccess(false), 2500);
  };

  // Handle Guest Verification
  const handleVerifyStay = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!verificationInput.trim() || !property) return;

    setIsVerifying(true);
    setVerifyError('');

    const input = verificationInput.trim().toLowerCase();
    
    // Check match against active reservations or property access code
    const matchedRes = reservations.find(r => 
      r.propertyId === property.id && 
      (r.guestName.toLowerCase().includes(input) || r.id.toLowerCase().includes(input))
    );

    const accessCodeMatches = property.rules?.accessCode && property.rules.accessCode.trim() === input;

    setTimeout(() => {
      setIsVerifying(false);
      if (matchedRes) {
        setIsVerified(true);
        setVerifiedGuestName(matchedRes.guestName);
        setShowVerifyModal(false);
        setRequestSuccessNotice(`Welcome, ${matchedRes.guestName}! Your session is linked to your confirmed reservation.`);
        setTimeout(() => setRequestSuccessNotice(null), 5000);
      } else if (accessCodeMatches) {
        setIsVerified(true);
        setVerifiedGuestName(linkedReservation ? linkedReservation.guestName : 'Verified Resident');
        setShowVerifyModal(false);
        setRequestSuccessNotice('Villa access code verified. Full guest privileges unlocked.');
        setTimeout(() => setRequestSuccessNotice(null), 5000);
      } else {
        setVerifyError('No reservation found matching this surname or booking code. Please check your confirmation or front desk message.');
      }
    }, 400);
  };

  // Quick 1-tap verification if in preview mode or for active stay
  const handleInstantQuickVerify = () => {
    if (linkedReservation) {
      setIsVerified(true);
      setVerifiedGuestName(linkedReservation.guestName);
      setShowVerifyModal(false);
      setRequestSuccessNotice(`Linked to active stay for ${linkedReservation.guestName}.`);
      setTimeout(() => setRequestSuccessNotice(null), 4000);
    } else {
      setIsVerified(true);
      setVerifiedGuestName('Lucas Vance');
      setShowVerifyModal(false);
    }
  };

  // Send message in chat
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !property) return;

    const text = chatInput.trim();
    setChatInput('');

    try {
      await submitGuestPortalRequest({
        propertyId: property.id,
        text,
        type: 'chat',
        guestName: verifiedGuestName
      });
    } catch (err) {
      console.error('Failed to post guest message', err);
    }
  };

  // Submit structured service request (Cleaning, Maintenance, Assistance)
  const handleSubmitServiceRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceModal || !property || !serviceDetails.title.trim()) return;

    setIsSubmitting(true);
    const category = serviceModal;
    const formattedText = `[${category.toUpperCase()} REQUEST] ${serviceDetails.title}. ${serviceDetails.description ? `Details: ${serviceDetails.description}.` : ''} Preferred: ${serviceDetails.preferredTime}.`;

    try {
      await submitGuestPortalRequest({
        propertyId: property.id,
        text: formattedText,
        type: category,
        guestName: verifiedGuestName,
        preferredTime: serviceDetails.preferredTime
      });

      setServiceModal(null);
      setServiceDetails({
        title: '',
        description: '',
        preferredTime: 'As soon as possible',
        priority: 'medium'
      });

      setRequestSuccessNotice(
        category === 'cleaning' 
          ? 'Housekeeping request sent! Villa housekeeper alerted.'
          : category === 'maintenance'
            ? 'Maintenance ticket dispatched to on-call technician.'
            : 'Concierge request sent to villa management team.'
      );
      setTimeout(() => setRequestSuccessNotice(null), 6000);
      setActiveTab('chat');
    } catch (err) {
      console.error('Failed submitting service request', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-stone-800/80 p-8 rounded-2xl border border-stone-700">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold font-serif">Property QR Not Found</h2>
          <p className="text-stone-400 text-sm mt-2">
            The scanned QR code is either invalid or expired. Please contact villa reception.
          </p>
          {onExitPreview && (
            <button
              onClick={onExitPreview}
              className="mt-6 px-6 py-2.5 bg-stone-700 hover:bg-stone-600 rounded-xl text-sm font-semibold text-white transition-colors"
            >
              Return to VillaOS
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121110] text-[#EFECE6] flex flex-col font-sans selection:bg-amber-900/40 selection:text-amber-200">
      
      {/* Top Banner & Villa Header */}
      <header className="relative bg-stone-900 border-b border-stone-800 shrink-0">
        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
          <img
            src={welcomeBgImage || property.image}
            alt={`Welcome to ${property.name}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-75 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121110] via-[#121110]/50 to-transparent" />

          {/* Top Bar with Status & Exit button */}
          <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-stone-950 flex items-center space-x-1 shadow-xs">
                <Sparkles className="w-3 h-3" />
                <span>IN-VILLA QR PORTAL</span>
              </span>
              {isVerified ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Verified Stay</span>
                </span>
              ) : (
                <button
                  onClick={() => setShowVerifyModal(true)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700 flex items-center space-x-1 transition-colors"
                >
                  <LogIn className="w-3 h-3 text-amber-400" />
                  <span>Verify Stay</span>
                </button>
              )}
            </div>

            {onExitPreview && (
              <button
                onClick={onExitPreview}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-black/60 hover:bg-black/90 text-stone-300 backdrop-blur-xs border border-stone-700 transition-colors"
              >
                Back to Dashboard
              </button>
            )}
          </div>

          {/* Villa Title & Address */}
          <div className="absolute bottom-3 left-4 right-4">
            <div className="flex items-baseline justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                  {property.name}
                </h1>
                <div className="flex items-center space-x-2 text-xs text-stone-300 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{property.location}</span>
                  <span>•</span>
                  <span className="text-amber-300 flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{property.rating}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Quick Wi-Fi Pill Bar */}
        <div className="px-4 py-2.5 bg-stone-900/95 border-t border-stone-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Wifi className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-stone-400 text-[11px] block">Villa Wi-Fi:</span>
              <span className="font-mono font-medium text-stone-200 truncate">
                {property.rules?.wifiPassword || 'balivilla2026'}
              </span>
            </div>
          </div>
          <button
            onClick={handleCopyWifi}
            className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center space-x-1 transition-all shrink-0 ${
              copiedWifi 
                ? 'bg-emerald-600 text-white' 
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
            }`}
          >
            {copiedWifi ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-400" />
                <span>Copy Password</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Success Notification Alert */}
      {requestSuccessNotice && (
        <div className="bg-emerald-950/80 border-b border-emerald-800/80 px-4 py-2.5 text-xs text-emerald-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{requestSuccessNotice}</span>
          </div>
          <button onClick={() => setRequestSuccessNotice(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Body with Tabs */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden max-w-2xl mx-auto w-full">
        
        {/* Quick Action Grid (Always available for guest convenience) */}
        <div className="p-4 grid grid-cols-3 gap-2 shrink-0 border-b border-stone-800/60 bg-[#171615]">
          <button
            onClick={() => setServiceModal('cleaning')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-800 text-center transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <RefreshCw className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-stone-200">Housekeeping</span>
            <span className="text-[10px] text-stone-400 mt-0.5">Towels & Linens</span>
          </button>

          <button
            onClick={() => setServiceModal('maintenance')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-800 text-center transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-stone-200">Report Issue</span>
            <span className="text-[10px] text-stone-400 mt-0.5">AC, Pool, Wi-Fi</span>
          </button>

          <button
            onClick={() => setServiceModal('assistance')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-800 text-center transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Coffee className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-stone-200">Concierge</span>
            <span className="text-[10px] text-stone-400 mt-0.5">Breakfast, Rides</span>
          </button>
        </div>

        {/* View Selection Segment Tabs */}
        <div className="flex border-b border-stone-800 px-4 bg-[#141312] shrink-0 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            id="tab-guest-welcome"
            onClick={() => setActiveTab('welcome')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'welcome'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Welcome & Stay</span>
          </button>

          <button
            id="tab-guest-chat"
            onClick={() => setActiveTab('chat')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'chat'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Host Chat</span>
            {activeConversation?.messages && activeConversation.messages.length > 1 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            id="tab-guest-guide"
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'guide'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Rules & Access</span>
          </button>

          <button
            id="tab-guest-villa"
            onClick={() => setActiveTab('villa')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'villa'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Villa Info</span>
          </button>
        </div>

        {/* Tab 0: Personalized Welcome & Stay Dashboard */}
        {activeTab === 'welcome' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Hero Personalized Welcome Card with Generated Background */}
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 shadow-lg group">
              <img
                src={welcomeBgImage}
                alt="Balinese Villa Sunset"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121110] via-[#121110]/75 to-[#121110]/35" />
              
              <div className="relative p-5 sm:p-6 text-white space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Personalized Guest Portal</span>
                  </span>
                  <span className="text-xs text-stone-300 flex items-center space-x-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-stone-800">
                    <Sun className="w-3 h-3 text-amber-400" />
                    <span>Bali 29°C • Tropical Sunset</span>
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
                    Selamat Datang, {verifiedGuestName}!
                  </h2>
                  <p className="text-stone-200 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
                    We are honored to have you at <span className="text-amber-300 font-semibold">{property.name}</span>. May the tranquility of your private pool and lush tropical gardens bring you total relaxation.
                  </p>
                </div>

                {/* Stay Summary Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="bg-stone-950/70 backdrop-blur-md p-2.5 rounded-xl border border-stone-800/80">
                    <span className="text-[10px] text-stone-400 block uppercase tracking-wider font-semibold">Check-in</span>
                    <span className="font-semibold text-stone-100">{linkedReservation?.checkIn || '14:00 WITA'}</span>
                  </div>
                  <div className="bg-stone-950/70 backdrop-blur-md p-2.5 rounded-xl border border-stone-800/80">
                    <span className="text-[10px] text-stone-400 block uppercase tracking-wider font-semibold">Check-out</span>
                    <span className="font-semibold text-stone-100">{linkedReservation?.checkOut || '11:00 WITA'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 bg-stone-950/70 backdrop-blur-md p-2.5 rounded-xl border border-stone-800/80">
                    <span className="text-[10px] text-stone-400 block uppercase tracking-wider font-semibold">Status</span>
                    <span className="font-semibold text-emerald-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{linkedReservation?.status || 'In-Villa Stay Active'}</span>
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons inside the hero card */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat with Host</span>
                  </button>
                  <button
                    onClick={() => setServiceModal('assistance')}
                    className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-100 border border-stone-700 font-semibold text-xs flex items-center justify-center space-x-1.5 backdrop-blur-md transition-colors"
                  >
                    <Coffee className="w-4 h-4 text-amber-400" />
                    <span>Order In-Villa Breakfast</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Access Strip: Wi-Fi & Digital Key */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Wi-Fi Card */}
              <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-stone-400 block">Wi-Fi Password</span>
                    <span className="text-xs font-mono font-bold text-stone-200 truncate block">
                      {property.rules?.wifiPassword || 'balivilla2026'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCopyWifi}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 shrink-0 transition-colors"
                >
                  {copiedWifi ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Digital Door Code Card */}
              <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                    <Key className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-stone-400 block">Villa Smart Lock Code</span>
                    <span className="text-xs font-mono font-bold text-emerald-300 tracking-wider">
                      {property.rules?.accessCode || '7829#'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (property.rules?.accessCode) {
                      navigator.clipboard?.writeText(property.rules.accessCode);
                      setCopiedAccess(true);
                      setTimeout(() => setCopiedAccess(false), 2000);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-700 text-emerald-300 border border-stone-700 shrink-0 transition-colors"
                >
                  {copiedAccess ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Curated In-Villa Experiences */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Curated In-Villa Experiences</span>
                </h3>
                <span className="text-[10px] text-stone-400">Available on request</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div 
                  onClick={() => {
                    setServiceModal('assistance');
                    setServiceDetails({
                      title: 'Floating Breakfast in Pool',
                      description: 'Traditional Balinese tropical fruit, smoothie bowls, fresh croissants, and island coffee served floating in the pool.',
                      preferredTime: 'Tomorrow at 08:30 AM',
                      priority: 'medium'
                    });
                  }}
                  className="p-3 bg-stone-950/60 hover:bg-stone-950/90 rounded-xl border border-stone-800/80 cursor-pointer transition-colors flex items-start space-x-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:bg-amber-500/20">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-200 group-hover:text-amber-300 transition-colors">Floating Pool Breakfast</h4>
                    <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">Tropical smoothie bowls & fresh coffee served in your private pool.</p>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    setServiceModal('assistance');
                    setServiceDetails({
                      title: 'In-Villa Balinese Massage',
                      description: '60-minute relaxing traditional Balinese full body massage with frangipani aromatherapy oil by licensed local spa therapist.',
                      preferredTime: 'Today at 05:00 PM',
                      priority: 'medium'
                    });
                  }}
                  className="p-3 bg-stone-950/60 hover:bg-stone-950/90 rounded-xl border border-stone-800/80 cursor-pointer transition-colors flex items-start space-x-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20 group-hover:bg-cyan-500/20">
                    <Waves className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-200 group-hover:text-cyan-300 transition-colors">Balinese Spa & Massage</h4>
                    <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">Traditional holistic massage by the pool with aromatic frangipani oils.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Live Chat with Host */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#121110]">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Host greeting box */}
              <div className="flex items-start space-x-2.5 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                  H
                </div>
                <div>
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl rounded-tl-xs p-3 text-xs text-stone-200 leading-relaxed shadow-sm">
                    <p className="font-semibold text-amber-400 mb-1">Villa Host & Concierge</p>
                    Welcome to {property.name}! Our dedicated management team and staff are on-call 24/7. You can request housekeeping, ask questions about Bali, or report any villa issue right here.
                  </div>
                  <span className="text-[10px] text-stone-500 ml-1 mt-1 block">Always active</span>
                </div>
              </div>

              {/* Dynamic messages */}
              {activeConversation?.messages?.map((msg, idx) => {
                const isGuest = msg.sender === 'guest';
                return (
                  <div
                    key={msg.id || idx}
                    className={`flex items-start space-x-2.5 ${isGuest ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isGuest && (
                      <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        H
                      </div>
                    )}
                    <div className={`max-w-[82%] ${isGuest ? 'text-right' : 'text-left'}`}>
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isGuest
                            ? 'bg-amber-600 text-white rounded-tr-xs shadow-sm'
                            : 'bg-stone-900 border border-stone-800 text-stone-200 rounded-tl-xs shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-stone-500 px-1 mt-1 block">
                        {isGuest ? (verifiedGuestName || 'You') : 'Villa Host'} • {msg.timestamp || 'Just now'}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggested chips */}
            <div className="px-4 py-2 border-t border-stone-800/80 bg-stone-900/40 flex items-center space-x-2 overflow-x-auto text-[11px] no-scrollbar">
              <button
                onClick={() => setChatInput('Can we get 2 extra pool towels please?')}
                className="px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 whitespace-nowrap transition-colors"
              >
                🏊 Extra pool towels
              </button>
              <button
                onClick={() => setChatInput('What time is check-out tomorrow?')}
                className="px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 whitespace-nowrap transition-colors"
              >
                ⏰ Check-out time
              </button>
              <button
                onClick={() => setChatInput('Could you recommend a good dinner spot nearby?')}
                className="px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 whitespace-nowrap transition-colors"
              >
                🍽️ Local dinner spots
              </button>
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendChatMessage} className="p-3 bg-stone-900 border-t border-stone-800 flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message your villa host or staff..."
                className="flex-1 bg-stone-800/90 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Rules & Access Guide */}
        {activeTab === 'guide' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Wi-Fi & Credentials Card */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <Wifi className="w-4 h-4" />
                <span>Wi-Fi & Connectivity</span>
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 bg-stone-950/60 rounded-xl border border-stone-800/80">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Network Name (SSID)</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {property.rules?.wifiName || `${property.name} HighSpeed`}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                    Dedicated Fiber
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-stone-950/60 rounded-xl border border-stone-800/80">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Wi-Fi Password</span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {property.rules?.wifiPassword || 'balivilla2026'}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyWifi}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Check-in, Check-out & Access */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <Clock className="w-4 h-4" />
                <span>Timings & Villa Access</span>
              </h3>
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/80">
                  <span className="text-[10px] text-stone-400 block">Check-in</span>
                  <span className="text-sm font-bold text-white">{property.rules?.checkInTime || '15:00'}</span>
                </div>
                <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/80">
                  <span className="text-[10px] text-stone-400 block">Check-out</span>
                  <span className="text-sm font-bold text-white">{property.rules?.checkOutTime || '11:00'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-stone-950/60 rounded-xl border border-stone-800/80">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-[10px] text-stone-400 block">Key Lockbox Access PIN</span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {property.rules?.accessCode || '8842'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCopyAccess}
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* House Rules */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <Shield className="w-4 h-4" />
                <span>House Rules & Etiquette</span>
              </h3>
              <ul className="space-y-2 text-xs text-stone-300">
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Quiet Hours:</strong> 22:00 – 07:00. Please be mindful of neighboring villas.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Smoking Policy:</strong> Designated outdoor tropical garden areas only. Strictly non-smoking inside bedrooms.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>AC Conservation:</strong> Please close glass balcony doors when air conditioning is running.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Pool Safety:</strong> Children must be supervised around the pool at all times.</span>
                </li>
              </ul>
            </div>

            {/* 24/7 Emergency Assistance */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Phone className="w-4 h-4" />
                <span>Emergency Contact</span>
              </h3>
              <p className="text-xs text-stone-300">
                Villa Manager & Medical On-Call: <span className="font-mono font-semibold text-white">+62 811 389 4001</span>
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Villa Info & Amenities */}
        {activeTab === 'villa' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Specs */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                Villa Specifications
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/80">
                  <Bed className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="text-xs font-bold text-white block">{property.bedrooms} Bedrooms</span>
                  <span className="text-[10px] text-stone-400">King En-suites</span>
                </div>
                <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/80">
                  <Bath className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="text-xs font-bold text-white block">{property.bathrooms} Baths</span>
                  <span className="text-[10px] text-stone-400">Stone Tubs</span>
                </div>
                <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/80">
                  <Users className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="text-xs font-bold text-white block">Up to {property.maxGuests}</span>
                  <span className="text-[10px] text-stone-400">Guests</span>
                </div>
              </div>
            </div>

            {/* Amenities Chips */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                Featured Amenities
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {property.amenities.map((amenity, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-stone-950/80 border border-stone-800 text-xs text-stone-300"
                  >
                    ✓ {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Location & Directions */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4" />
                <span>Location & Arrival</span>
              </h3>
              <p className="text-xs text-stone-300 mb-3 leading-relaxed">
                {property.location}, Bali, Indonesia.
              </p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(property.name + ' ' + property.location)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-200 border border-stone-700 transition-colors"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Guest Stay Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Verify Your Stay</span>
              </h3>
              <button onClick={() => setShowVerifyModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-stone-400 mb-4 leading-relaxed">
              Enter your booking reference or last name to link this portal session directly to your reservation.
            </p>

            <form onSubmit={handleVerifyStay} className="space-y-3">
              <div>
                <label className="text-[11px] text-stone-300 block mb-1">Guest Surname or Access PIN</label>
                <input
                  type="text"
                  value={verificationInput}
                  onChange={(e) => setVerificationInput(e.target.value)}
                  placeholder="e.g. Vance or 8842"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {verifyError && (
                <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                  {verifyError}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying || !verificationInput.trim()}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs transition-colors"
              >
                {isVerifying ? 'Verifying...' : 'Verify Session'}
              </button>

              {linkedReservation && (
                <button
                  type="button"
                  onClick={handleInstantQuickVerify}
                  className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700 transition-colors"
                >
                  Quick Link: Current Stay ({linkedReservation.guestName})
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Structured Service Request Modal */}
      {serviceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                {serviceModal === 'cleaning' && <RefreshCw className="w-4 h-4 text-cyan-400" />}
                {serviceModal === 'maintenance' && <Wrench className="w-4 h-4 text-amber-400" />}
                {serviceModal === 'assistance' && <Coffee className="w-4 h-4 text-rose-400" />}
                <span>
                  {serviceModal === 'cleaning' && 'Request Housekeeping / Cleaning'}
                  {serviceModal === 'maintenance' && 'Report Maintenance Issue'}
                  {serviceModal === 'assistance' && 'Concierge Assistance Request'}
                </span>
              </h3>
              <button onClick={() => setServiceModal(null)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-400 mb-4">
              {serviceModal === 'cleaning' && 'Our housekeeping team will refresh your villa, change linens, or bring fresh amenities.'}
              {serviceModal === 'maintenance' && 'Let us know of any AC, pool, plumbing or electrical concerns for immediate technician dispatch.'}
              {serviceModal === 'assistance' && 'Book floating breakfast, scooter rentals, airport drivers, or in-villa massage.'}
            </p>

            <form onSubmit={handleSubmitServiceRequest} className="space-y-3">
              <div>
                <label className="text-[11px] text-stone-300 block mb-1">
                  {serviceModal === 'cleaning' && 'Service Type'}
                  {serviceModal === 'maintenance' && 'What is the issue?'}
                  {serviceModal === 'assistance' && 'Requested Service'}
                </label>
                <input
                  type="text"
                  required
                  value={serviceDetails.title}
                  onChange={(e) => setServiceDetails(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={
                    serviceModal === 'cleaning'
                      ? 'e.g. Fresh bath & pool towels, full villa refresh'
                      : serviceModal === 'maintenance'
                        ? 'e.g. Master AC not cooling, pool light blinking'
                        : 'e.g. Floating breakfast for 2 tomorrow 09:00 AM'
                  }
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-stone-300 block mb-1">Preferred Time / Notes</label>
                <input
                  type="text"
                  value={serviceDetails.preferredTime}
                  onChange={(e) => setServiceDetails(prev => ({ ...prev, preferredTime: e.target.value }))}
                  placeholder="e.g. As soon as possible, or Today 14:00"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {serviceModal === 'maintenance' && (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="urgentToggle"
                    checked={serviceDetails.priority === 'urgent'}
                    onChange={(e) => setServiceDetails(prev => ({ 
                      ...prev, 
                      priority: e.target.checked ? 'urgent' : 'medium' 
                    }))}
                    className="rounded border-stone-700 bg-stone-950 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="urgentToggle" className="text-xs text-amber-300 font-medium">
                    Mark as Urgent (e.g. water leak or AC outage)
                  </label>
                </div>
              )}

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setServiceModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !serviceDetails.title.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Sending...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
