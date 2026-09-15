import React, { useState, useMemo } from 'react';
import { 
  Send, Sparkles, Check, Edit3, RotateCcw, MessageSquare, 
  Phone, Calendar, Clock, Bot, Shield, CheckCircle2, Paperclip, 
  Smile, Search, Key, Wifi, User, MapPin, DollarSign, ArrowRight,
  Info, AlertCircle, ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatIDR } from '../../data/mockData';

export const UnifiedInboxView: React.FC = () => {
  const { 
    conversations, 
    sendChatMessage, 
    properties, 
    reservations, 
    guests, 
    cleaningSchedules, 
    approveAiAction, 
    setActiveTab,
    notifyCleaner
  } = useApp();

  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [textInput, setTextInput] = useState('');
  const [isEditingAiDraft, setIsEditingAiDraft] = useState(false);
  const [customDraftText, setCustomDraftText] = useState('');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showContextSidebar, setShowContextSidebar] = useState(true);

  // Auto-select valid conversation for active workspace
  React.useEffect(() => {
    if (selectedConvId && !conversations.some(c => c.id === selectedConvId)) {
      setSelectedConvId(conversations[0]?.id || '');
    } else if (!selectedConvId && conversations.length > 0) {
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations, selectedConvId]);

  const activeConv = conversations.find(c => c.id === selectedConvId) || null;

  // Resolve context entities
  const property = useMemo(() => {
    if (!activeConv) return null;
    return properties.find(p => p.id === activeConv.propertyId || p.name === activeConv.propertyName) || null;
  }, [activeConv, properties]);

  const reservation = useMemo(() => {
    if (!activeConv) return null;
    return reservations.find(r => r.id === activeConv.reservationId || r.guestName === activeConv.guestName) || null;
  }, [activeConv, reservations]);

  const guest = useMemo(() => {
    if (!activeConv) return null;
    return guests.find(g => g.name === activeConv.guestName || g.id === activeConv.guestId) || null;
  }, [activeConv, guests]);

  const cleanerSchedule = useMemo(() => {
    if (!property) return null;
    return cleaningSchedules.find(cs => cs.propertyId === property.id);
  }, [property, cleaningSchedules]);

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      const matchesChannel = filterChannel === 'all' || c.channel.toLowerCase() === filterChannel.toLowerCase();
      const matchesSearch = !searchQuery || 
        c.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesChannel && matchesSearch;
    });
  }, [conversations, filterChannel, searchQuery]);

  // Contextual AI dynamic draft
  const currentAiDraft = useMemo(() => {
    if (!activeConv || !property) return null;

    // Check if there is already an AI suggested reply or generate one contextually
    if (activeConv.aiSuggestedReply) {
      return {
        text: activeConv.aiSuggestedReply,
        reason: `Based on ${property.name} rules (check-in ${property.rules.checkInTime}, early fee IDR ${(property.rules.earlyCheckInFee).toLocaleString()}) and current turnover status.`,
      };
    }

    return {
      text: `Hi ${activeConv.guestName}! Thank you for reaching out regarding ${property.name}. Keypad PIN is ${property.rules.accessCode} and Wi-Fi is "${property.rules.wifiPassword}". Let us know how our team can assist your Bali stay!`,
      reason: `Grounded in ${property.name} credentials and check-in guide.`,
    };
  }, [activeConv, property]);

  const handleSendMessage = (msgContent?: string) => {
    const text = msgContent || textInput;
    if (!text.trim() || !activeConv) return;

    sendChatMessage(activeConv.id, text, 'host');
    setTextInput('');
  };

  const handleApproveAiDraft = () => {
    if (!activeConv || !currentAiDraft) return;
    const toSend = isEditingAiDraft ? customDraftText : currentAiDraft.text;
    sendChatMessage(activeConv.id, toSend, 'ai');
    setIsEditingAiDraft(false);
    approveAiAction('ai-act-2');
  };

  const handleSelectQuickTemplate = (type: 'early' | 'wifi' | 'airport' | 'late') => {
    if (!property || !activeConv) return;
    let template = '';
    if (type === 'early') {
      template = `Hi ${activeConv.guestName}! Yes, early check-in at 1:00 PM is approved as turnover finishes at 12:30 PM. An early check-in fee of IDR ${(property.rules.earlyCheckInFee).toLocaleString()} applies. Keypad code is ${property.rules.accessCode}.`;
    } else if (type === 'wifi') {
      template = `Hi ${activeConv.guestName}! The high-speed fiber Wi-Fi is "${property.rules.wifiProvider}" with password: "${property.rules.wifiPassword}". Speed is 300 Mbps across all bedrooms.`;
    } else if (type === 'airport') {
      template = `Hi ${activeConv.guestName}! We can arrange our private driver Ketut to meet you at Ngurah Rai Airport with a welcome board for IDR 350,000. Please share your flight number and landing time!`;
    } else if (type === 'late') {
      template = `Hi ${activeConv.guestName}! Late check-out until 2:00 PM is available today for IDR ${(property.rules.lateCheckOutFee).toLocaleString()}. Please let us know if you would like us to confirm this with housekeeping.`;
    }
    setCustomDraftText(template);
    setIsEditingAiDraft(true);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8E6E1] shadow-xs overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[680px]">
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Conversations List */}
        <div className="w-full md:w-80 lg:w-88 border-r border-[#E8E6E1] flex flex-col bg-[#FAF9F6]">
          {/* Header & Filters */}
          <div className="p-4 border-b border-[#E8E6E1] bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-[#2D2926]">Guest Inbox</h3>
                <p className="text-[11px] text-stone-500">Real-time WhatsApp, Airbnb & OTA sync</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEFAE0] text-[#606C38] border border-[#F1EDD4]">
                {conversations.length} Active
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guest or villa..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl text-xs text-[#2D2926] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#606C38]/20 focus:border-[#606C38]"
              />
            </div>

            {/* Channel Tabs */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {['all', 'whatsapp', 'airbnb', 'instagram'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => setFilterChannel(ch)}
                  className={`px-2.5 py-1 rounded-lg font-semibold capitalize whitespace-nowrap transition-colors ${
                    filterChannel === ch
                      ? 'bg-[#606C38] text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#F2F1ED]">
            {filteredConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => {
                  setSelectedConvId(conv.id);
                  setIsEditingAiDraft(false);
                }}
                className={`p-3.5 cursor-pointer transition-colors flex items-start space-x-3 ${
                  selectedConvId === conv.id
                    ? 'bg-[#FEFAE0]/70 border-l-4 border-[#606C38]'
                    : 'hover:bg-white'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={conv.guestAvatar}
                    alt={conv.guestName}
                    className="w-10 h-10 rounded-full object-cover border border-stone-200"
                  />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#BC6C25] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#2D2926] truncate">{conv.guestName}</span>
                    <span className="text-[10px] text-stone-400 font-mono">{conv.lastMessageTime}</span>
                  </div>
                  <div className="text-[11px] font-medium text-stone-500 truncate mt-0.5">{conv.propertyName}</div>
                  <p className="text-[11px] text-stone-600 truncate mt-1">
                    {conv.lastMessage}
                  </p>
                  <div className="mt-1.5 flex items-center space-x-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      conv.channel === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800' :
                      conv.channel === 'Airbnb' ? 'bg-red-50 text-red-700' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {conv.channel}
                    </span>
                    {conv.aiSuggestedReply && (
                      <span className="flex items-center space-x-0.5 text-[9px] font-bold text-[#BC6C25] bg-[#FEFAE0] px-1.5 py-0.5 rounded border border-[#F1EDD4]">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>AI Draft Ready</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Chat Thread */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {activeConv ? (
            <>
              {/* Active Conversation Top Bar */}
              <div className="p-3.5 sm:p-4 border-b border-[#E8E6E1] bg-[#FAF9F6] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={activeConv.guestAvatar}
                    alt={activeConv.guestName}
                    className="w-10 h-10 rounded-full object-cover border border-[#E8E6E1]"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-serif font-bold text-sm text-[#2D2926]">{activeConv.guestName}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        activeConv.channel === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800' :
                        activeConv.channel === 'Airbnb' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {activeConv.channel}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-stone-500 mt-0.5">
                      <span className="font-semibold text-[#606C38]">{property?.name}</span>
                      <span>•</span>
                      <span>{property?.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowContextSidebar(!showContextSidebar)}
                    className="px-2.5 py-1.5 rounded-xl border border-[#E8E6E1] bg-white text-xs font-semibold text-stone-700 hover:border-[#606C38] transition-colors flex items-center space-x-1"
                  >
                    <Info className="w-3.5 h-3.5 text-[#606C38]" />
                    <span className="hidden sm:inline">{showContextSidebar ? 'Hide Rules' : 'Villa Rules & Booking'}</span>
                  </button>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#FDFCFB]">
                {activeConv.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'guest' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-md rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'guest'
                        ? 'bg-white text-stone-800 rounded-tl-none border border-[#E8E6E1] shadow-2xs'
                        : msg.sender === 'ai'
                        ? 'bg-[#606C38] text-white rounded-tr-none shadow-xs'
                        : 'bg-stone-900 text-white rounded-tr-none shadow-xs'
                    }`}>
                      {msg.sender === 'ai' && (
                        <div className="flex items-center space-x-1 text-[10px] font-bold text-[#FEFAE0] mb-1">
                          <Sparkles className="w-3 h-3 text-[#DDA15E]" />
                          <span>VillaOS AI Auto-Dispatched</span>
                        </div>
                      )}
                      <p className="leading-relaxed">{msg.text}</p>
                      <div className={`text-[10px] mt-1.5 flex items-center justify-end space-x-1 font-mono ${
                        msg.sender === 'guest' ? 'text-stone-400' : 'text-white/70'
                      }`}>
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Context-Aware AI Suggestion Box */}
              {currentAiDraft && (
                <div className="p-3.5 sm:p-4 bg-[#FEFAE0]/80 border-t border-[#F1EDD4] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-[#BC6C25]" />
                      <span className="text-xs font-bold text-[#BC6C25]">Context-Grounded AI Draft</span>
                      <span className="text-[10px] font-medium text-stone-500 bg-white/80 px-2 py-0.5 rounded-full border border-[#E8E6E1]">
                        Property Policies & CRM Matched
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-[11px]">
                      <button
                        onClick={() => handleSelectQuickTemplate('early')}
                        className="px-2 py-0.5 bg-white border border-[#E8E6E1] rounded hover:border-[#606C38] text-stone-600 text-[10px] font-medium"
                      >
                        Early Check-in
                      </button>
                      <button
                        onClick={() => handleSelectQuickTemplate('wifi')}
                        className="px-2 py-0.5 bg-white border border-[#E8E6E1] rounded hover:border-[#606C38] text-stone-600 text-[10px] font-medium"
                      >
                        Wi-Fi & Code
                      </button>
                      <button
                        onClick={() => handleSelectQuickTemplate('airport')}
                        className="px-2 py-0.5 bg-white border border-[#E8E6E1] rounded hover:border-[#606C38] text-stone-600 text-[10px] font-medium"
                      >
                        Airport Transfer
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-600 leading-snug">
                    <span className="font-semibold text-[#606C38]">Reasoning: </span>
                    {currentAiDraft.reason}
                  </p>

                  {isEditingAiDraft ? (
                    <textarea
                      value={customDraftText}
                      onChange={(e) => setCustomDraftText(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-white border border-[#606C38] rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#606C38]/20"
                    />
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-[#F1EDD4] text-xs text-stone-800 leading-relaxed shadow-2xs font-sans">
                      "{currentAiDraft.text}"
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          if (!isEditingAiDraft) {
                            setCustomDraftText(currentAiDraft.text);
                            setIsEditingAiDraft(true);
                          } else {
                            setIsEditingAiDraft(false);
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 border border-stone-200 rounded-xl bg-white flex items-center space-x-1 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isEditingAiDraft ? 'Cancel Edit' : 'Edit Draft'}</span>
                      </button>
                    </div>

                    <button
                      onClick={handleApproveAiDraft}
                      className="px-4 py-1.5 bg-[#606C38] hover:bg-[#4C572C] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Send via {activeConv.channel}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Standard Composer Bar */}
              <div className="p-3 sm:p-4 bg-white border-t border-[#E8E6E1] flex items-center space-x-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Write message to ${activeConv.guestName}...`}
                  className="flex-1 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#606C38]/20 focus:border-[#606C38]"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!textInput.trim()}
                  className="px-4 py-2.5 bg-[#2D2926] hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition-colors"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-stone-400">
              Select a conversation to inspect and reply.
            </div>
          )}
        </div>

        {/* Right: Property & Reservation Rules Sidebar */}
        {showContextSidebar && property && (
          <div className="w-full md:w-72 lg:w-80 border-t md:border-t-0 md:border-l border-[#E8E6E1] bg-[#FAF9F6] p-4 overflow-y-auto space-y-4">
            <div>
              <h4 className="font-serif font-bold text-sm text-[#2D2926]">Property Policies & Info</h4>
              <p className="text-[11px] text-stone-500">Live operational rules for {property.name}</p>
            </div>

            {/* Property Card */}
            <div className="p-3 rounded-2xl bg-white border border-[#E8E6E1] shadow-2xs space-y-2.5">
              <div className="flex items-center space-x-2.5">
                <img
                  src={property.image}
                  alt={property.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <h5 className="font-bold text-xs text-[#2D2926] truncate">{property.name}</h5>
                  <p className="text-[11px] text-stone-500">{property.area} • {property.bedrooms} Beds</p>
                  <span className="text-[10px] font-mono text-[#606C38] font-bold">
                    {formatIDR(property.dailyRate)} / night
                  </span>
                </div>
              </div>

              {/* Access & Credentials */}
              <div className="pt-2 border-t border-stone-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-stone-50">
                  <span className="text-stone-500 flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-[#BC6C25]" />
                    <span>Access PIN</span>
                  </span>
                  <span className="font-mono font-bold text-stone-800">{property.rules.accessCode}</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-stone-50">
                  <span className="text-stone-500 flex items-center space-x-1.5">
                    <Wifi className="w-3.5 h-3.5 text-[#606C38]" />
                    <span>Wi-Fi Network</span>
                  </span>
                  <span className="font-medium text-stone-800 text-[11px]">{property.rules.wifiProvider}</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-stone-50">
                  <span className="text-stone-500 text-[11px]">Wi-Fi Pass</span>
                  <span className="font-mono font-bold text-stone-800 text-[11px]">{property.rules.wifiPassword}</span>
                </div>
              </div>
            </div>

            {/* Check-in / Out Policies */}
            <div className="p-3 rounded-2xl bg-white border border-[#E8E6E1] shadow-2xs space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Check-in Rules & Fees
              </div>
              <div className="space-y-1.5 text-xs text-stone-700">
                <div className="flex justify-between">
                  <span className="text-stone-500">Standard Check-In</span>
                  <span className="font-semibold">{property.rules.checkInTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Standard Check-Out</span>
                  <span className="font-semibold">{property.rules.checkOutTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Early Check-In Fee</span>
                  <span className="font-bold text-[#606C38]">{formatIDR(property.rules.earlyCheckInFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Late Check-Out Fee</span>
                  <span className="font-bold text-[#606C38]">{formatIDR(property.rules.lateCheckOutFee)}</span>
                </div>
              </div>
            </div>

            {/* Cleaner Status */}
            {cleanerSchedule && (
              <div className="p-3 rounded-2xl bg-white border border-[#E8E6E1] shadow-2xs space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Housekeeper
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    cleanerSchedule.cleaningStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {cleanerSchedule.cleaningStatus}
                  </span>
                </div>
                <p className="font-semibold text-stone-800">{cleanerSchedule.cleaner}</p>
                <p className="text-[11px] text-stone-500">Target turnover completion: 12:30 PM</p>
                <button
                  onClick={() => notifyCleaner(cleanerSchedule.id)}
                  className="w-full mt-1.5 py-1 text-[11px] font-bold text-[#606C38] bg-[#FEFAE0] hover:bg-[#F1EDD4] rounded-lg transition-colors border border-[#F1EDD4]"
                >
                  Send WhatsApp Reminder
                </button>
              </div>
            )}

            {/* Connected Reservation */}
            {reservation && (
              <div className="p-3 rounded-2xl bg-white border border-[#E8E6E1] shadow-2xs space-y-2 text-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Active Stay Details
                </div>
                <div className="space-y-1 text-stone-700">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Booking ID</span>
                    <span className="font-mono font-bold">{reservation.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Dates</span>
                    <span>{reservation.checkIn} → {reservation.checkOut} ({reservation.nights}n)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Total Booking</span>
                    <span className="font-bold text-[#2D2926]">{formatIDR(reservation.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Payment Status</span>
                    <span className="font-bold text-emerald-700">Paid in Full</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
