import React, { useState } from 'react';
import { SocialLead, Property } from '../../../types';
import { MessageCircle, Send, Sparkles, CheckCircle2, XCircle, DollarSign, Calendar, Users as UsersIcon, ThumbsUp } from 'lucide-react';
import { useApp, formatIDR } from '../../../context/AppContext';

interface SocialInboxProps {
  leads: SocialLead[];
  selectedPropertyId: string | null;
  properties: Property[];
}

export const SocialInbox: React.FC<SocialInboxProps> = ({ leads, selectedPropertyId, properties }) => {
  const filteredLeads = selectedPropertyId ? leads.filter(l => l.propertyId === selectedPropertyId) : leads;
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(filteredLeads[0]?.id || null);
  const [aiDraft, setAiDraft] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [isOwnerApproved, setIsOwnerApproved] = useState(false);

  const { 
    socialAccounts,
    analyzeSocialLead, convertLeadToBooking
  } = useApp();

  const selectedLead = filteredLeads.find(l => l.id === selectedLeadId) || filteredLeads[0] || null;
  const targetProperty = properties.find(p => p.id === selectedLead?.propertyId);

  // Sync drafted message whenever selected lead changes or updates
  React.useEffect(() => {
    if (selectedLead?.intent?.draftReply) {
      setAiDraft(selectedLead.intent.draftReply);
    } else {
      setAiDraft('');
    }
    setIsOwnerApproved(false);
  }, [selectedLead?.id, selectedLead?.intent?.draftReply]);

  const currentAccount = socialAccounts.find(a => a.externalAccountId === selectedLead?.accountId);
  const isDemo = currentAccount?.status === 'Demo Connection';

  const handleAiReply = async () => {
    if (!selectedLead) return;
    setIsDrafting(true);
    
    const message = selectedLead.lastMessage || "Is Test Villa available from September 20 to 23 for 4 guests?";
    await analyzeSocialLead(selectedLead.id, message);
    setIsDrafting(false);
  };

  const handleConvert = async () => {
    if (!selectedLead) return;
    await convertLeadToBooking(selectedLead.id);
  };

  return (
    <div className="flex h-[640px] bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm animate-in fade-in">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-stone-200 flex flex-col bg-stone-50/50">
        <div className="p-4 border-b border-stone-200 bg-white flex items-center justify-between">
          <h3 className="font-bold font-serif text-stone-900">Social Leads Inbox</h3>
          <span className="text-xs bg-stone-100 text-stone-600 font-semibold px-2 py-0.5 rounded-full">
            {filteredLeads.length} Leads
          </span>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
          {filteredLeads.map(lead => {
            const prop = properties.find(p => p.id === lead.propertyId);
            const isSelected = selectedLead?.id === lead.id;
            return (
              <button 
                key={lead.id}
                onClick={() => { setSelectedLeadId(lead.id); }}
                className={`w-full text-left p-4 hover:bg-stone-100 transition-colors ${isSelected ? 'bg-stone-100/90 border-l-4 border-amber-600' : 'bg-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm text-stone-900">{lead.guestName}</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-200/70 text-stone-700">{lead.sourcePlatform}</span>
                </div>
                <p className="text-xs text-stone-600 truncate mb-2">
                  {lead.lastMessage || `Inquiry for ${prop?.name || 'Villa'}...`}
                </p>
                <div className="flex justify-between items-center text-[10px]">
                  <span className={`font-bold px-2 py-0.5 rounded-full ${
                    lead.status === 'Converted' ? 'bg-emerald-100 text-emerald-800' :
                    lead.status === 'Conversing' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {lead.status}
                  </span>
                  <span className="text-stone-400">{lead.createdAt}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat & AI Workflow Area */}
      {selectedLead ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-white">
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-stone-900 text-base">{selectedLead.guestName}</h4>
                <span className="text-xs bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200">
                  {selectedLead.sourcePlatform} Direct
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Target Property: <span className="font-semibold text-stone-800">{targetProperty?.name || 'Villa'}</span> ({formatIDR(targetProperty?.dailyRate || 0)} / night)
              </p>
            </div>
            {selectedLead.estimatedValue > 0 && (
              <div className="text-right">
                <div className="text-xs text-stone-400 uppercase font-semibold">Inquiry Value</div>
                <div className="text-sm font-bold text-emerald-700">{formatIDR(selectedLead.estimatedValue)}</div>
              </div>
            )}
          </div>
          
          {/* Content Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-stone-50/60">
            {isDemo && (
              <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl flex items-center space-x-3 text-xs text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p>
                  <span className="font-bold">Real-Time Lead Analyzer:</span> AI inspects live property rates, checks multi-calendar dates, calculates revenue, and drafts owner replies.
                </p>
              </div>
            )}

            {/* Guest Message */}
            <div className="flex items-start max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0 mr-3 text-stone-700 font-bold text-xs">
                {selectedLead.guestName.charAt(0)}
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-stone-200 shadow-sm space-y-1">
                <div className="text-xs font-semibold text-stone-400 flex items-center justify-between">
                  <span>{selectedLead.guestName}</span>
                  <span>{selectedLead.createdAt}</span>
                </div>
                <p className="text-sm text-stone-800 font-medium">
                  {selectedLead.lastMessage || 'Is Test Villa available from September 20 to 23 for 4 guests?'}
                </p>
              </div>
            </div>
            
            {/* AI Analysis Card */}
            {selectedLead.intent && (
              <div className="max-w-[90%] ml-auto">
                <div className="bg-stone-900 text-white p-5 rounded-2xl shadow-md border border-stone-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
                        AI Intent, Availability & Pricing Analysis
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {selectedLead.intent.isAvailable !== false ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Dates Available</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3 h-3" />
                          <span>Dates Blocked</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Extracted Data Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-800/60 p-3 rounded-xl">
                    <div>
                      <div className="flex items-center space-x-1 text-[10px] text-stone-400 uppercase font-semibold">
                        <Calendar className="w-3 h-3" />
                        <span>Dates</span>
                      </div>
                      <p className="text-xs font-bold text-stone-100 mt-0.5">
                        {selectedLead.intent.dates || `${selectedLead.intent.checkIn} → ${selectedLead.intent.checkOut}`}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1 text-[10px] text-stone-400 uppercase font-semibold">
                        <UsersIcon className="w-3 h-3" />
                        <span>Guests</span>
                      </div>
                      <p className="text-xs font-bold text-stone-100 mt-0.5">{selectedLead.intent.guests || 2} Guests</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1 text-[10px] text-stone-400 uppercase font-semibold">
                        <DollarSign className="w-3 h-3" />
                        <span>Calculated Price</span>
                      </div>
                      <p className="text-xs font-bold text-emerald-400 mt-0.5">
                        {formatIDR(selectedLead.intent.calculatedPrice || selectedLead.estimatedValue)}
                      </p>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400 uppercase font-semibold">Sentiment</div>
                      <p className="text-xs font-bold text-stone-100 capitalize mt-0.5">
                        {selectedLead.intent.sentiment || 'Positive'}
                      </p>
                    </div>
                  </div>

                  {/* AI Summary */}
                  {selectedLead.aiSummary && (
                    <div className="text-xs text-stone-300 bg-stone-800/40 p-3 rounded-xl border border-stone-700/50">
                      <span className="text-[10px] text-amber-400 font-bold uppercase block mb-1">Inquiry Assessment</span>
                      {selectedLead.aiSummary}
                    </div>
                  )}

                  {/* Owner Approval and Reply Section */}
                  {selectedLead.intent.draftReply && selectedLead.status !== 'Converted' && (
                    <div className="bg-stone-800/80 p-3.5 rounded-xl border border-stone-700 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-stone-300 font-bold uppercase tracking-wider">
                          AI Drafted Luxury Reply
                        </span>
                        <button
                          onClick={() => setIsOwnerApproved(!isOwnerApproved)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 transition-all ${
                            isOwnerApproved 
                              ? 'bg-emerald-500 text-white shadow-sm' 
                              : 'bg-stone-700 hover:bg-stone-600 text-stone-200'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{isOwnerApproved ? 'Owner Approved ✓' : 'Approve Draft'}</span>
                        </button>
                      </div>
                      <p className="text-xs text-stone-200 leading-relaxed italic bg-stone-900/60 p-2.5 rounded-lg">
                        "{selectedLead.intent.draftReply}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Converted Success Banner */}
            {selectedLead.status === 'Converted' && (
              <div className="flex justify-center my-2">
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-5 py-3 rounded-2xl text-xs font-bold flex items-center space-x-3 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div>Lead Successfully Converted to Confirmed Booking!</div>
                    <div className="text-[11px] font-normal text-emerald-700 mt-0.5">
                      Reservation #{selectedLead.reservationId} synced to Multi-Calendar, Guest CRM, Operations Tasks, and Revenue attribution.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="p-4 border-t border-stone-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleAiReply}
                  disabled={isDrafting}
                  className="px-3.5 py-2 bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isDrafting ? 'Analyzing Intent & Availability...' : 'AI Analyze Lead'}</span>
                </button>

                {selectedLead.intent && selectedLead.status !== 'Converted' && (
                  <button 
                    onClick={handleConvert}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Convert Lead to Booking</span>
                  </button>
                )}
              </div>

              <div className="text-[11px] text-stone-500 font-medium">
                {isOwnerApproved ? (
                  <span className="text-emerald-600 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 inline" />
                    <span>Owner Approved</span>
                  </span>
                ) : (
                  <span>Owner approval required before converting</span>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Type response or review AI drafted reply..." 
                className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-400"
                value={aiDraft}
                onChange={(e) => setAiDraft(e.target.value)}
              />
              <button 
                onClick={() => {
                  if (aiDraft) {
                    setIsOwnerApproved(true);
                  }
                }}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl font-bold text-xs transition-colors border border-stone-200"
              >
                Approve & Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-stone-400 bg-white">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40 text-stone-400" />
            <p className="text-sm font-medium">Select a social lead to view conversation</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default SocialInbox;
