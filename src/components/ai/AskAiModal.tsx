import React, { useState, useMemo } from 'react';
import { 
  X, Search, Building2, CalendarCheck, Users, Sliders, Settings, 
  Bot, Sparkles, ArrowRight, CornerDownLeft, Wrench
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AskAiModal: React.FC = () => {
  const { 
    isAskAiOpen, 
    setIsAskAiOpen, 
    setActiveTab, 
    properties, 
    reservations, 
    guests, 
    tasks,
    cleaningSchedules,
    maintenanceIssues,
    socialAccounts,
    socialPosts,
    socialLeads,
    socialAttributions,
    activeWorkspace,
    setSelectedPropertyId,
    executeAiOperationalPlan
  } = useApp();

  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);

  if (!isAskAiOpen) return null;

  // Filtered lists based on search query
  const q = query.trim().toLowerCase();

  const matchedProperties = properties.filter(p => 
    !q || p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.area.toLowerCase().includes(q)
  ).slice(0, 4);

  const matchedReservations = reservations.filter(r => 
    !q || r.guestName.toLowerCase().includes(q) || r.propertyName.toLowerCase().includes(q) || r.channel.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
  ).slice(0, 4);

  const matchedGuests = guests.filter(g => 
    !q || g.name.toLowerCase().includes(q) || g.nationality.toLowerCase().includes(q) || g.email.toLowerCase().includes(q)
  ).slice(0, 3);

  const matchedTasks = tasks.filter(t => 
    !q || t.title.toLowerCase().includes(q) || t.propertyName.toLowerCase().includes(q) || t.assignedTo.toLowerCase().includes(q)
  ).slice(0, 3);

  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id);
    setActiveTab('properties');
    setIsAskAiOpen(false);
  };

  const handleSelectReservation = () => {
    setActiveTab('reservations');
    setIsAskAiOpen(false);
  };

  const handleSelectGuest = () => {
    setActiveTab('guests');
    setIsAskAiOpen(false);
  };

  const handleSelectTask = () => {
    setActiveTab('operations');
    setIsAskAiOpen(false);
  };

  const handleSelectTab = (tab: any) => {
    setActiveTab(tab);
    setIsAskAiOpen(false);
  };

  const handleRunAiQuery = async (customPrompt?: string) => {
    const text = customPrompt || query;
    if (!text) return;

    setResult('Thinking...');
    
    try {
      const contextModule = await import('../../lib/ai-context');
      const contextString = contextModule.buildAiSystemContext({ 
        workspaceName: activeWorkspace?.businessName,
        properties, reservations, guests, tasks, cleaningSchedules, maintenanceIssues,
        socialAccounts, socialPosts, socialLeads, socialAttributions
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context: contextString }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const resJson = await response.json();
      setResult(resJson.message);
      
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setResult('I am temporarily unable to connect to my reasoning core.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-200"
      onClick={() => setIsAskAiOpen(false)}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="p-3.5 border-b border-stone-200 flex items-center space-x-3 bg-[#FAF9F6]">
          <Search className="w-5 h-5 text-stone-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunAiQuery()}
            placeholder="Search villas, bookings, guests, tasks, or ask AI... (Cmd+K)"
            autoFocus
            className="w-full bg-transparent text-sm sm:text-base text-stone-800 placeholder-stone-400 focus:outline-none font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-stone-400 hover:text-stone-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-stone-400 bg-stone-100 border border-stone-200 rounded">
            ESC
          </kbd>
        </div>

        {/* AI Answer Banner if active */}
        {result && (
          <div className="p-4 bg-[#FEFAE0]/80 border-b border-[#F1EDD4] flex items-start space-x-3 text-xs text-stone-800">
            <Sparkles className="w-4 h-4 text-[#BC6C25] flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-bold text-[#606C38]">AI Operational Assistant</p>
              <p className="leading-relaxed text-stone-700">{result}</p>
            </div>
            <button 
              onClick={() => setResult(null)}
              className="text-stone-400 hover:text-stone-600 text-xs"
            >
              Clear
            </button>
          </div>
        )}

        {/* Search & Navigation Results */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 divide-y divide-stone-100">
          {/* Quick Navigation Targets */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 mb-1.5">
              Quick Navigation
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                onClick={() => handleSelectTab('dashboard')}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-[#F2F1ED] hover:text-[#606C38] transition-colors text-left"
              >
                <Sliders className="w-3.5 h-3.5 text-stone-400" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => handleSelectTab('reservations')}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-[#F2F1ED] hover:text-[#606C38] transition-colors text-left"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-stone-400" />
                <span>Reservations</span>
              </button>
              <button
                onClick={() => handleSelectTab('operations')}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-[#F2F1ED] hover:text-[#606C38] transition-colors text-left"
              >
                <Wrench className="w-3.5 h-3.5 text-stone-400" />
                <span>Operations</span>
              </button>
              <button
                onClick={() => handleSelectTab('aiManager')}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#BC6C25] bg-[#FEFAE0]/50 hover:bg-[#FEFAE0] transition-colors text-left font-semibold"
              >
                <Bot className="w-3.5 h-3.5 text-[#BC6C25]" />
                <span>AI Manager</span>
              </button>
            </div>
          </div>

          {/* Properties Section */}
          <div className="pt-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 mb-1.5 flex items-center justify-between">
              <span>Properties</span>
              <span className="text-stone-400">{matchedProperties.length} shown</span>
            </div>
            <div className="space-y-1">
              {matchedProperties.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProperty(p.id)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 transition-colors group text-left"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 group-hover:bg-[#FEFAE0] group-hover:text-[#BC6C25]">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-stone-800 truncate group-hover:text-[#606C38]">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        {p.location} • {p.bedrooms} Beds • {p.status === 'occupied' ? 'Occupied' : 'Vacant'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-600 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Reservations Section */}
          <div className="pt-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 mb-1.5 flex items-center justify-between">
              <span>Reservations</span>
              <span className="text-stone-400">{matchedReservations.length} shown</span>
            </div>
            <div className="space-y-1">
              {matchedReservations.map(r => (
                <button
                  key={r.id}
                  onClick={handleSelectReservation}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 transition-colors group text-left"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 group-hover:bg-emerald-50 group-hover:text-emerald-700">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <p className="text-xs font-bold text-stone-800 truncate group-hover:text-emerald-800">
                          {r.guestName}
                        </p>
                        <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                          {r.channel}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400">
                        {r.propertyName} • {r.checkIn} to {r.checkOut} ({r.nights}n)
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium text-stone-500">
                    {r.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tasks & Operations */}
          <div className="pt-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 mb-1.5 flex items-center justify-between">
              <span>Operational Tasks</span>
              <span className="text-stone-400">{matchedTasks.length} shown</span>
            </div>
            <div className="space-y-1">
              {matchedTasks.map(t => (
                <button
                  key={t.id}
                  onClick={handleSelectTask}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 transition-colors group text-left"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 group-hover:bg-amber-50 group-hover:text-amber-700">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-stone-800 truncate group-hover:text-[#606C38]">
                        {t.title}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        {t.propertyName} • Assigned to {t.assignedTo} ({t.dueTime})
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    t.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {t.priority}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Natural Language AI Actions */}
          <div className="pt-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 mb-1.5">
              Direct AI Commands
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {[
                'Trigger turnover routine for Villa Canggu 08',
                'Retrieve Wi-Fi passwords & access codes',
                'Inspect checkout status for today',
                'Show all pending guest messages',
              ].map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(cmd);
                    handleRunAiQuery(cmd);
                  }}
                  className="p-2 rounded-lg border border-stone-200 hover:border-[#606C38] hover:bg-[#FEFAE0]/30 text-left text-xs font-medium text-stone-700 flex items-center justify-between transition-colors"
                >
                  <span className="truncate">{cmd}</span>
                  <CornerDownLeft className="w-3 h-3 text-stone-400 flex-shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-400">
          <div className="flex items-center space-x-3">
            <span><kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200">↑↓</kbd> to navigate</span>
            <span><kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200">↵</kbd> to select</span>
          </div>
          <button
            onClick={() => handleSelectTab('settings')}
            className="flex items-center space-x-1 hover:text-stone-700 transition-colors"
          >
            <Settings className="w-3 h-3" />
            <span>Settings & Rules</span>
          </button>
        </div>
      </div>
    </div>
  );
};
