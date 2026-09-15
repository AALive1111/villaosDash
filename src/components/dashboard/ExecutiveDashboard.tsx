import React, { useState } from 'react';
import { 
  Building2, TrendingUp, Calendar, Users, MessageSquare, 
  Sparkles, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, 
  Bot, ChevronRight, Wrench, Shield, Send, ArrowRight, Check,
  DoorOpen, LogOut, PhoneCall
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatIDR } from '../../data/mockData';
import { AiActionCard } from '../ai/AiActionCard';
import { WeatherWidget } from './WeatherWidget';
import { PropertyGroundsMap } from './PropertyGroundsMap';

export const ExecutiveDashboard: React.FC = () => {
  const { 
    activeWorkspace,
    properties, 
    reservations, 
    tasks, 
    cleaningSchedules, 
    maintenanceIssues, 
    aiActions, 
    conversations,
    setActiveTab, 
    setSelectedPropertyId,
    setIsAskAiOpen,
    checkoutReservation,
    notifyCleaner,
    approveAiAction
  } = useApp();

  const [quickAiInput, setQuickAiInput] = useState('');
  const [quickAiResponse, setQuickAiResponse] = useState<string | null>(null);

  // Derived today's operational data
  const todayStr = new Date().toISOString().split('T')[0];
  const activeReservations = reservations.filter(r => r.status !== 'Cancelled');
  const todayCheckIns = activeReservations.filter(r => r.status === 'Confirmed' || r.checkIn === todayStr).slice(0, 3);
  const todayCheckOuts = activeReservations.filter(r => r.status === 'Checked In' || r.checkOut === todayStr).slice(0, 3);
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const activeProperties = properties.filter(p => !p.isArchived);
  const avgOccupancy = activeProperties.length > 0
    ? Math.round(activeProperties.reduce((sum, p) => sum + (p.occupancyRate || 0), 0) / activeProperties.length)
    : 0;

  const monthRevenue = activeReservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0) ||
    activeProperties.reduce((sum, p) => sum + (p.monthlyRevenue || 0), 0);

  const todayReservations = activeReservations.filter(r => r.checkIn === todayStr || r.createdAt === 'Today');
  const todayRevenue = todayReservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0);

  const kpis = [
    { label: 'Occupancy', value: `${avgOccupancy}%`, subtext: '+4.2% vs last month', icon: Building2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Revenue Today', value: formatIDR(todayRevenue || Math.round(monthRevenue / 30), true), subtext: `${todayReservations.length || 1} active bookings`, icon: TrendingUp, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Revenue This Month', value: formatIDR(monthRevenue, true), subtext: `Target: ${formatIDR(monthRevenue * 1.15, true)}`, icon: TrendingUp, color: 'text-stone-900', bg: 'bg-stone-100' },
    { label: 'Active Reservations', value: `${activeReservations.length}`, subtext: `${activeProperties.length} ${activeProperties.length === 1 ? 'villa' : 'villas'} combined`, icon: Calendar, color: 'text-sky-700', bg: 'bg-sky-50' },
    { label: 'Check-ins Today', value: `${todayCheckIns.length}`, subtext: 'First arrival: 14:00', icon: Users, color: 'text-indigo-700', bg: 'bg-indigo-50' },
    { label: 'Check-outs Today', value: `${todayCheckOuts.length}`, subtext: 'Housekeeping synced', icon: Users, color: 'text-purple-700', bg: 'bg-purple-50' },
    { label: 'Unread Messages', value: `${unreadMessagesCount || 0}`, subtext: 'WhatsApp & Direct', icon: MessageSquare, color: 'text-amber-800', bg: 'bg-amber-100/60' },
    { label: 'Open Tasks', value: `${tasks.filter(t => t.status !== 'completed').length}`, subtext: 'Field staff dispatched', icon: Wrench, color: 'text-rose-700', bg: 'bg-rose-50' },
  ];

  const handleQuickAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAiInput.trim()) return;

    if (quickAiInput.toLowerCase().includes('clean') || quickAiInput.toLowerCase().includes('villa 7')) {
      setQuickAiResponse('AI: Notified cleaner Made Budiasa via WhatsApp for Villa 7 turnover. Scheduled to be inspection-ready by 14:00.');
    } else if (quickAiInput.toLowerCase().includes('money') || quickAiInput.toLowerCase().includes('top')) {
      setQuickAiResponse('AI: Villa Seminyak 04 is your top earner at IDR 64.8M this month (91% occupancy, ADR IDR 2.85M).');
    } else {
      setQuickAiResponse(`AI: Action analyzed for "${quickAiInput}". Context loaded from 5 Bali villas. Click 'AI Manager' for full multi-turn operations.`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D2926]">
              Good morning, {activeWorkspace?.ownerName.split(' ')[0] || 'Owner'}
            </h2>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEFAE0] text-[#606C38] border border-[#F1EDD4]">
              ⚡ {properties.length} {properties.length === 1 ? 'Villa' : 'Villas'} Live
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Real-time operations, guest arrivals, housekeeping turnover, and autonomous pricing.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setActiveTab('calendar')}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E8E6E1] hover:bg-[#F2F1ED] text-stone-700 text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1.5"
          >
            <Calendar className="w-4 h-4 text-stone-500" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E8E6E1] hover:bg-[#F2F1ED] text-stone-700 text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1.5"
          >
            <MessageSquare className="w-4 h-4 text-[#BC6C25]" />
            <span>Inbox</span>
            <span className="bg-[#BC6C25] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {unreadMessagesCount || 4}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('aiManager')}
            className="px-4 py-2 rounded-xl bg-[#606C38] hover:bg-[#4C572C] text-white text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Bot className="w-4 h-4" />
            <span>AI Manager</span>
          </button>
        </div>
      </div>

      {/* Real-time Bali Weather Widget */}
      <WeatherWidget />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-3.5 bg-white rounded-2xl border border-[#E8E6E1] shadow-2xs flex flex-col justify-between hover:border-stone-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest truncate">{kpi.label}</span>
                <div className="p-1 rounded-lg bg-[#FAF9F6]">
                  <Icon className="w-3.5 h-3.5 text-[#606C38]" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-lg sm:text-xl font-bold text-[#2D2926] tracking-tight">{kpi.value}</div>
                <div className="text-[10px] font-medium text-stone-400 mt-0.5 truncate">{kpi.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PRIMARY MVP FOCUS: "TODAY" OPERATIONAL COMMAND BOARD */}
      <div className="bg-white rounded-3xl border border-[#E8E6E1] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F2F1ED] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FEFAE0] flex items-center justify-center text-[#606C38] font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2D2926]">Today's Operational Command</h3>
              <p className="text-xs text-stone-500">Live check-ins, check-outs, turnover dispatch & guest arrivals</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-[#FEFAE0] text-[#606C38] font-bold border border-[#F1EDD4]">
              {todayCheckIns.length} Check-ins
            </span>
            <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-bold border border-stone-200">
              {todayCheckOuts.length} Check-outs
            </span>
            <button
              onClick={() => setActiveTab('operations')}
              className="text-[#606C38] font-bold hover:underline ml-2"
            >
              Operations Hub →
            </button>
          </div>
        </div>

        {/* 3-Column Actionable Operational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Today's Check-ins */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#2D2926]">
              <span className="flex items-center space-x-1.5">
                <DoorOpen className="w-4 h-4 text-[#606C38]" />
                <span>Arrivals & Check-ins</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono font-normal">Next: 13:00</span>
            </div>

            <div className="space-y-2">
              {todayCheckIns.map(res => (
                <div key={res.id} className="p-3 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2D2926]">{res.guestName}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {res.channel}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    <div>{res.propertyName} • {res.nights} nights</div>
                    <div className="text-[#BC6C25] font-medium mt-0.5">Welcome coconuts requested</div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                    <span className="font-mono text-[10px] text-stone-400">{res.id}</span>
                    <button
                      onClick={() => {
                        setActiveTab('inbox');
                      }}
                      className="text-[10px] font-bold text-[#606C38] hover:text-[#4C572C] flex items-center space-x-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Send Welcome Pin</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Today's Check-outs & Turnovers */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#2D2926]">
              <span className="flex items-center space-x-1.5">
                <LogOut className="w-4 h-4 text-[#BC6C25]" />
                <span>Departures & Turnovers</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono font-normal">Standard 11:00</span>
            </div>

            <div className="space-y-2">
              {todayCheckOuts.map(res => (
                <div key={res.id} className="p-3 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2D2926]">{res.guestName}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      res.status === 'Checked Out' ? 'bg-stone-200 text-stone-700' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {res.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    <div>{res.propertyName}</div>
                    <div className="text-stone-400">Total: {formatIDR(res.totalAmount)}</div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                    <span className="font-mono text-[10px] text-stone-400">Departing</span>
                    {res.status !== 'Checked Out' ? (
                      <button
                        onClick={() => checkoutReservation(res.id)}
                        className="px-2 py-0.5 bg-[#BC6C25] hover:bg-[#9b581d] text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 shadow-2xs transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        <span>Checkout & Clean</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700">Turnover In Progress</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Housekeeping Staff & Live Turnovers */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#2D2926]">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-[#606C38]" />
                <span>Housekeeping Dispatch</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono font-normal">WhatsApp Ready</span>
            </div>

            <div className="space-y-2">
              {cleaningSchedules.slice(0, 3).map(cs => {
                const cleanerName = cs.cleanerName || (cs as any).cleaner || 'Made Budiasa';
                return (
                  <div key={cs.id} className="p-3 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2D2926] truncate">{cs.propertyName}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        cs.cleaningStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-[#FEFAE0] text-[#BC6C25] border border-[#F1EDD4]'
                      }`}>
                        {cs.cleaningStatus}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Staff: <strong className="text-stone-700">{cleanerName}</strong> • Next: {cs.nextGuestName || 'Guest'} ({cs.nextCheckInTime || '15:00'})
                    </div>
                    <div className="pt-1 flex items-center justify-end">
                      <button
                        onClick={() => notifyCleaner(cs.id)}
                        className="px-2 py-0.5 bg-white border border-[#E8E6E1] hover:border-[#606C38] text-[#606C38] rounded-lg text-[10px] font-bold transition-colors"
                      >
                        Notify via WhatsApp
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Property & Villa Grounds Map Module */}
      <PropertyGroundsMap />

      {/* AI Hero Operations Card & Actions Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main AI Assistant Card */}
        <section className="lg:col-span-2 bg-white rounded-3xl border border-[#E8E6E1] shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-[#F2F1ED] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#FEFAE0] border border-[#F1EDD4] rounded-xl flex items-center justify-center text-xl shadow-2xs">
                ✨
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2D2926] leading-tight">AI Property Manager Co-Pilot</h3>
                <p className="text-xs text-stone-400">Monitoring occupancy, technician dispatch, and guest messages</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-[#FEFAE0] text-[#606C38] border border-[#F1EDD4] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                Active Reasoning
              </span>
            </div>
          </div>

          <div className="flex-1 p-5 sm:p-6 space-y-4 bg-[#FDFCFB] overflow-hidden">
            {/* User prompt preview */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-xs font-bold text-stone-700 flex-shrink-0">
                YA
              </div>
              <div className="bg-white border border-[#E8E6E1] p-3 rounded-2xl rounded-tl-none text-xs sm:text-sm max-w-md shadow-2xs text-[#2D2926]">
                Which villa performed best this month?
              </div>
            </div>

            {/* AI conversational response */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#606C38] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 shadow-2xs">
                AI
              </div>
              <div className="bg-[#FEFAE0] border border-[#F1EDD4] p-4 rounded-2xl rounded-tl-none text-xs sm:text-sm max-w-lg shadow-2xs space-y-3">
                <p className="font-serif font-bold text-sm sm:text-base text-[#2D2926]">Villa Seminyak 04</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-[#2D2926]">
                  <div className="flex justify-between"><span className="text-stone-600">Revenue:</span> <span className="font-bold">64.8M IDR</span></div>
                  <div className="flex justify-between"><span className="text-stone-600">Occupancy:</span> <span className="font-bold">91%</span></div>
                  <div className="flex justify-between"><span className="text-stone-600">ADR:</span> <span className="font-bold">2.85M IDR</span></div>
                  <div className="flex justify-between"><span className="text-stone-600">Bookings:</span> <span className="font-bold">23 stays</span></div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#F1EDD4] text-xs space-y-2">
                  <p className="font-bold text-[#BC6C25] flex items-center space-x-1">
                    <span>💡 Recommendation</span>
                  </p>
                  <p className="text-stone-700 leading-relaxed">
                    Demand for Seminyak is peaking for next weekend. I recommend increasing the rate for remaining dates by 12% across Airbnb and Direct engine.
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      onClick={() => approveAiAction('ai-act-1')}
                      className="bg-[#606C38] hover:bg-[#4C572C] text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-2xs transition-colors"
                    >
                      Apply +12% Rate
                    </button>
                    <button
                      onClick={() => setActiveTab('aiManager')}
                      className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    >
                      Open AI Manager
                    </button>
                  </div>
                </div>

                {quickAiResponse && (
                  <div className="p-3 bg-white border border-[#BC6C25]/40 rounded-xl text-[#2D2926] text-xs animate-in fade-in">
                    {quickAiResponse}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick AI Input Bar */}
          <div className="p-4 bg-white border-t border-[#F2F1ED]">
            <div className="flex items-center gap-2 mb-3 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none text-[10px]">
              {[
                'Tell cleaner to prepare Villa 7',
                'Which villa is making the most money?',
                'Show maintenance log',
                'Create Instagram plan for Ubud',
              ].map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQuickAiInput(p)}
                  className="border border-stone-200 px-3 py-1.5 rounded-full hover:bg-[#FAF9F6] text-stone-600 whitespace-nowrap transition-colors"
                >
                  "{p}"
                </button>
              ))}
            </div>

            <form onSubmit={handleQuickAsk} className="relative flex items-center">
              <input
                type="text"
                value={quickAiInput}
                onChange={(e) => setQuickAiInput(e.target.value)}
                placeholder="Instruct AI Manager (e.g. 'Tell cleaner to prepare Villa 7')..."
                className="w-full bg-[#FAF9F6] border border-stone-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-[#606C38]/20 focus:border-[#606C38] transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm p-1.5 rounded-lg hover:bg-stone-200/50 text-[#606C38] cursor-pointer"
                title="Dispatch to AI"
              >
                ✨
              </button>
            </form>
          </div>
        </section>

        {/* Right Aside Column: Approval Queue */}
        <aside className="flex flex-col gap-6">
          {/* Smart Inbox Banner */}
          <div className="bg-[#606C38] text-white rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="relative z-10">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#FEFAE0] mb-1.5">Smart Inbox</h4>
              <p className="text-base sm:text-lg font-serif font-medium mb-4 leading-tight">
                {unreadMessagesCount || 4} Unread Guest Inquiries requiring response.
              </p>
              <button
                onClick={() => setActiveTab('inbox')}
                className="bg-[#FEFAE0] text-[#606C38] hover:bg-white px-4 py-2 rounded-full text-xs font-bold shadow-xs transition-colors"
              >
                Open Unified Inbox →
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white opacity-5 rounded-full pointer-events-none" />
          </div>

          {/* AI Action System Approval Queue */}
          <div className="bg-white rounded-3xl border border-[#E8E6E1] p-5 sm:p-6 shadow-xs flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#F2F1ED] pb-3">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-[#BC6C25]" />
                  <h3 className="font-serif font-bold text-sm text-[#2D2926]">AI Safeguards Approval Queue</h3>
                </div>
                <span className="text-[11px] font-bold text-[#BC6C25] bg-[#FEFAE0] border border-[#F1EDD4] px-2 py-0.5 rounded-full">
                  {aiActions.filter(a => a.status === 'pending').length} Pending
                </span>
              </div>

              <p className="text-xs text-stone-500 mt-2.5">
                Every action with operational, rate, or guest impact requires your explicit authorization:
              </p>

              <div className="mt-3 space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {aiActions.slice(0, 2).map(action => (
                  <AiActionCard key={action.id} action={action} />
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#F2F1ED] flex items-center justify-between text-xs mt-3">
              <span className="text-stone-400">Human-in-the-loop safeguards</span>
              <button
                onClick={() => setActiveTab('aiManager')}
                className="font-bold text-[#606C38] hover:text-[#4C572C] flex items-center space-x-1"
              >
                <span>Full Activity Log</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Property Portfolio Snapshot & Live Field Operations Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Properties Snapshot */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E8E6E1] p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F2F1ED] pb-3">
            <div>
              <h3 className="font-serif font-bold text-base text-[#2D2926]">Bali Portfolio Status</h3>
              <p className="text-xs text-stone-400 mt-0.5">Live rates, occupancy, and current guest in-house</p>
            </div>
            <button
              onClick={() => setActiveTab('properties')}
              className="text-xs font-bold text-[#606C38] hover:text-[#4C572C] flex items-center space-x-1"
            >
              <span>Manage {properties.length} {properties.length === 1 ? 'Property' : 'Properties'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-[#F2F1ED]">
            {properties.map(property => (
              <div 
                key={property.id} 
                onClick={() => {
                  setSelectedPropertyId(property.id);
                  setActiveTab('properties');
                }}
                className="py-3 flex items-center justify-between hover:bg-[#FAF9F6] rounded-xl px-2.5 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#E8E6E1] flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs sm:text-sm font-bold text-[#2D2926]">{property.name}</h4>
                      <span className="text-[10px] text-stone-400">• {property.area}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {property.currentGuest ? (
                        <span>Guest: <strong className="text-stone-700">{property.currentGuest.name}</strong> ({property.currentGuest.channel})</span>
                      ) : (
                        <span className="text-[#BC6C25] font-medium">Vacant • Next: {property.nextCheckIn?.guestName} ({property.nextCheckIn?.date})</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-[#2D2926]">{formatIDR(property.monthlyRevenue)}</div>
                  <div className="flex items-center justify-end space-x-1.5 text-[11px] text-stone-500">
                    <span className="font-semibold text-[#606C38]">{property.occupancyRate}% Occ</span>
                    <span>•</span>
                    <span>★ {property.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Operations & Turnovers Ticker */}
        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#F2F1ED] pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-[#2D2926]">Open Maintenance & Issues</h3>
                <p className="text-xs text-stone-400 mt-0.5">Technician dispatches & repairs</p>
              </div>
              <button
                onClick={() => setActiveTab('operations')}
                className="text-xs font-bold text-[#606C38] hover:text-[#4C572C]"
              >
                All Tickets
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {maintenanceIssues.slice(0, 2).map(m => (
                <div key={m.id} className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2D2926]">{m.propertyName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.priority === 'urgent' || m.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {m.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#2D2926] font-medium">{m.problem}</p>
                  <p className="text-[10px] text-stone-500">Tech: <strong>{m.assignedTechnician}</strong> (ETA: {m.eta})</p>
                </div>
              ))}

              {maintenanceIssues.length === 0 && (
                <div className="text-center py-6 text-xs text-stone-400">
                  No open maintenance tickets. All {properties.length} {properties.length === 1 ? 'villa' : 'villas'} in top condition.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#F2F1ED] flex items-center justify-between text-xs mt-3">
            <span className="text-stone-400">Field response: &lt; 2h</span>
            <button
              onClick={() => setActiveTab('operations')}
              className="font-bold text-[#606C38] hover:text-[#4C572C] flex items-center space-x-1"
            >
              <span>Operations Board</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
