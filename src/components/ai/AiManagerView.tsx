import React, { useState } from 'react';
import { 
  Bot, Send, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, 
  Clock, ArrowRight, Check, MessageSquare, Wrench, Calendar, 
  HelpCircle, ThumbsUp, RotateCcw, Shield, Activity, Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const formatIDR = (val: number) => {
  if (val >= 1000000000) return `IDR ${(val / 1000000000).toFixed(1)}B`;
  if (val >= 1000000) return `IDR ${(val / 1000000).toFixed(1)}M`;
  return `IDR ${val.toLocaleString()}`;
};

interface AiMessage {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  timestamp: string;
  type?: 'info' | 'recommendation' | 'warning' | 'action_approval';
  villaMetric?: {
    villaName: string;
    revenue: string;
    occupancy: string;
    adr: string;
    bookings: number;
    explanation: string;
    recommendedAction: string;
  };
  approvalCard?: {
    id: string;
    title: string;
    description: string;
    actionLabel: string;
    status: 'pending' | 'approved';
    onApprove: () => void;
  };
  dataList?: { label: string; value: string; badge?: string }[];
}

export const AiManagerView: React.FC = () => {
  const { 
    properties, 
    reservations, 
    guests,
    cleaningSchedules, 
    maintenanceIssues, 
    tasks, 
    aiLogs, 
    socialAccounts,
    socialPosts,
    socialLeads,
    socialAttributions,
    activeWorkspace,
    approveAiAction, 
    updatePropertyPrice,
    sendChatMessage,
    notifyCleaner,
    createTask,
    createCleaningSchedule,
    createMaintenanceIssue,
    executeAiOperationalPlan,
    addSocialPost,
    setActiveTab
  } = useApp();

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [executedCards, setExecutedCards] = useState<Record<string, boolean>>({
    'prop-1-price': false,
  });

  const initialMessages: AiMessage[] = [
    {
      id: 'init-1',
      sender: 'ai',
      text: 'Good morning Yazan. I am actively monitoring your 5 luxury villas across Seminyak, Canggu, Ubud, and Uluwatu. Today we have 6 check-ins, 4 check-outs, and 1 high-priority maintenance dispatch.',
      timestamp: '09:00 AM',
      type: 'info',
    },
    {
      id: 'init-2',
      sender: 'user',
      text: 'Which villa performed best this month?',
      timestamp: '09:02 AM',
    },
    {
      id: 'init-3',
      sender: 'ai',
      timestamp: '09:02 AM',
      type: 'info',
      villaMetric: {
        villaName: 'Villa Seminyak 04',
        revenue: 'IDR 64.8M',
        occupancy: '91%',
        adr: 'IDR 2.85M',
        bookings: 23,
        explanation: 'Villa Seminyak 04 achieved 91% occupancy driven by Australian long-stay bookings and strong Airbnb Premier Host positioning. Direct repeat bookings contributed IDR 17.1M with 0% OTA fees.',
        recommendedAction: 'Increase weekend rates for October by 10% to capture upcoming Australian school holiday surge.',
      },
      approvalCard: {
        id: 'prop-1-price',
        title: 'Apply +10% Weekend Pricing Surge for Villa Seminyak 04',
        description: 'Update October weekend rates across Airbnb, Booking.com, and Direct engine to IDR 3,135,000.',
        actionLabel: 'Approve & Push to OTAs',
        status: 'pending',
        onApprove: () => {
          updatePropertyPrice('prop-1', 3135000, 'Weekend surge applied based on 91% occupancy');
          setExecutedCards(prev => ({ ...prev, 'prop-1-price': true }));
        },
      },
    },
  ];

  const [messages, setMessages] = useState<AiMessage[]>(initialMessages);

  const samplePrompts = [
    'Which villa is making the most money?',
    'Why is occupancy lower this month?',
    'Tell the cleaner to prepare Villa 7.',
    'Show me all check-ins tomorrow.',
    'What guests need a response?',
    'Create a social media post for Villa 3.',
    'Increase weekend pricing for Seminyak villas by 10%.',
    'Which bookings came from Instagram?',
    'What maintenance issues are still open?',
    'Prepare Villa 8 for tomorrow’s guest.',
  ];

  const handleSendMessage = async (promptText?: string) => {
    const query = (promptText || inputValue).trim();
    if (!query) return;

    const userMsg: AiMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!promptText) setInputValue('');
    setIsTyping(true);

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
        body: JSON.stringify({ message: query, context: contextString }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();
      const cardId = `card-${Date.now()}`;
      
      const newAiMsg: AiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: result.intent === 'warning' || result.intent === 'maintenance' ? 'warning' : 'info'
      };

      if (result.action) {
        let actionLabel = 'Approve Action';
        let onApprove = () => {};

        if (result.action.type === 'create_maintenance_ticket') {
          const params = result.action.parameters || {};
          const prop = properties.find(p => p.id === params.propertyId || p.name.toLowerCase() === params.propertyName?.toLowerCase());
          const propId = prop?.id || params.propertyId || properties[0]?.id;
          const propName = prop?.name || params.propertyName || 'Property';
          const tech = params.assignedTechnician || prop?.rules?.preferredTechnician || 'Made Artha';

          actionLabel = `Dispatch Maintenance (${propName})`;
          onApprove = () => {
             createMaintenanceIssue({
                propertyId: propId,
                propertyName: propName,
                problem: params.problem || 'Standard maintenance issue',
                priority: params.priority || 'high',
                assignedTechnician: tech,
                estimatedCost: params.estimatedCost || 350000,
             });
             setExecutedCards(prev => ({ ...prev, [cardId]: true }));
          };
        } else if (result.action.type === 'send_guest_message') {
          const params = result.action.parameters || {};
          actionLabel = 'Send Guest Message';
          onApprove = () => {
             sendChatMessage('conv-1', params.text || '', 'ai');
             setExecutedCards(prev => ({ ...prev, [cardId]: true }));
          };
        } else if (result.action.type === 'generate_social_content') {
          const params = result.action.parameters || {};
          const prop = properties.find(p => p.id === params.propertyId || p.name.toLowerCase() === params.propertyName?.toLowerCase());
          const propId = prop?.id || params.propertyId || properties[0]?.id;
          const propName = prop?.name || params.propertyName || 'Property';

          actionLabel = 'Save to Content Studio';
          onApprove = () => {
             addSocialPost({
                propertyId: propId,
                propertyName: propName,
                caption: (params.caption || '') + (params.hashtags ? '\n\n' + params.hashtags.join(' ') : ''),
                channel: params.channel || 'Instagram',
                scheduledFor: 'Draft',
                status: 'draft'
             });
             setExecutedCards(prev => ({ ...prev, [cardId]: true }));
          };
        } else if (result.action.type === 'change_price') {
           const params = result.action.parameters || {};
           const prop = properties.find(p => p.id === params.propertyId || p.name.toLowerCase() === params.propertyName?.toLowerCase());
           const propId = prop?.id || params.propertyId || properties[0]?.id;

           actionLabel = 'Update Rate';
           onApprove = () => {
              if (propId && params.newRate) {
                updatePropertyPrice(propId, params.newRate);
              }
              setExecutedCards(prev => ({ ...prev, [cardId]: true }));
           };
        } else if (result.action.type === 'create_cleaning_task') {
           const params = result.action.parameters || {};
           const prop = properties.find(p => p.id === params.propertyId || p.name.toLowerCase() === params.propertyName?.toLowerCase());
           const propId = prop?.id || params.propertyId || properties[0]?.id;
           const propName = prop?.name || params.propertyName || 'Property';
           const cleaner = params.cleaner || prop?.rules?.preferredCleaner || 'Made Budiasa';
           const dueTime = params.dueTime || 'Tomorrow 11:00 AM';
           const title = params.title || `Turnover Cleaning - ${propName}`;
           const notes = params.notes || `Scheduled via AI Manager for ${dueTime}`;

           actionLabel = `Dispatch Cleaner (${propName})`;
           onApprove = () => {
              createTask({
                 propertyId: propId,
                 propertyName: propName,
                 title,
                 type: 'cleaning',
                 assignedTo: cleaner,
                 priority: 'urgent',
                 dueTime,
                 status: 'todo',
                 notes,
              });
              if (propId) {
                createCleaningSchedule({
                   propertyId: propId,
                   propertyName: propName,
                   cleanerName: cleaner,
                   cleaningStatus: 'In Progress',
                   inspectionStatus: 'Pending',
                });
              }
              setExecutedCards(prev => ({ ...prev, [cardId]: true }));
           };
        }

        newAiMsg.approvalCard = {
          id: cardId,
          title: actionLabel,
          description: result.action.requiresApproval ? 'Review and approve this action.' : 'Action ready to execute.',
          actionLabel,
          status: 'pending',
          onApprove
        };
      }

      setMessages(prev => [...prev, newAiMsg]);

    } catch (error) {
      console.error('Failed to get AI response:', error);
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: 'I am temporarily unable to connect to my reasoning core. Please ensure the backend is running and configured with a Gemini API key.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'warning'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-[#606C38] rounded-3xl p-6 text-white shadow-xs relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FEFAE0] text-[#606C38] flex items-center justify-center shadow-xs font-bold text-xl">
              <Bot className="w-6 h-6 text-[#606C38]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-serif font-bold text-white">AI Property Manager</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEFAE0] text-[#606C38] border border-[#F1EDD4]">
                  Active Co-Pilot
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Autonomously monitoring guest inquiries, turnover quality, technician dispatches, and revenue in Bali.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white font-mono text-[11px]">
              Active Memory: 5 Bali Villas
            </span>
          </div>
        </div>
      </div>

      {/* Chat & Reasoning Container */}
      <div className="bg-white rounded-3xl border border-[#E8E6E1] shadow-xs flex flex-col h-[620px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FDFCFB]">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-[#BC6C25] text-white'
                    : 'bg-[#606C38] text-white'
                }`}>
                  {msg.sender === 'user' ? 'YA' : 'AI'}
                </div>

                {/* Message Bubble & Cards */}
                <div className="space-y-2.5 w-full">
                  {msg.text && (
                    <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-[#606C38] text-white font-medium rounded-tr-none'
                        : 'bg-[#FEFAE0] text-[#2D2926] rounded-tl-none border border-[#F1EDD4]'
                    }`}>
                      {msg.text}
                    </div>
                  )}

                  {/* Villa Metric Card */}
                  {msg.villaMetric && (
                    <div className="p-4 rounded-2xl bg-white border border-[#F1EDD4] shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-[#F2F1ED] pb-2.5">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#BC6C25]">Top Performer Analysis</div>
                          <h4 className="font-serif font-bold text-base text-[#2D2926]">{msg.villaMetric.villaName}</h4>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEFAE0] text-[#606C38] border border-[#F1EDD4]">
                          {msg.villaMetric.occupancy} Occupancy
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 text-center">
                        <div className="p-2 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1]">
                          <div className="text-[10px] text-stone-500">Revenue</div>
                          <div className="font-bold text-xs sm:text-sm text-[#2D2926]">{msg.villaMetric.revenue}</div>
                        </div>
                        <div className="p-2 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1]">
                          <div className="text-[10px] text-stone-500">ADR (Avg Daily)</div>
                          <div className="font-bold text-xs sm:text-sm text-[#2D2926]">{msg.villaMetric.adr}</div>
                        </div>
                        <div className="p-2 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1]">
                          <div className="text-[10px] text-stone-500">Bookings</div>
                          <div className="font-bold text-xs sm:text-sm text-[#2D2926]">{msg.villaMetric.bookings} stays</div>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {msg.villaMetric.explanation}
                      </p>

                      <div className="p-3 bg-[#FEFAE0] rounded-xl border border-[#F1EDD4] text-xs text-[#2D2926] flex items-start space-x-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#BC6C25] mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-[#BC6C25]">Operational Reasoning: </span>
                          <span>{msg.villaMetric.recommendedAction}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Data List Card */}
                  {msg.dataList && (
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E8E6E1] shadow-2xs space-y-2">
                      {msg.dataList.map((item, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-[#FAF9F6] text-xs gap-1 sm:gap-2">
                          <div className="font-bold text-[#2D2926]">{item.label}</div>
                          <div className="flex items-center space-x-2">
                            <span className="text-stone-600">{item.value}</span>
                            {item.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEFAE0] text-[#606C38] border border-[#F1EDD4] whitespace-nowrap">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interactive Approval Card with Real Execution State */}
                  {msg.approvalCard && (
                    <div className="p-4 rounded-2xl bg-[#FEFAE0]/80 border border-[#F1EDD4] shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-[#BC6C25]" />
                          <span className="text-xs font-bold text-[#BC6C25]">AI Operational Execution Card</span>
                        </div>
                        {executedCards[msg.approvalCard.id] && (
                          <span className="flex items-center space-x-1 text-[11px] font-bold text-[#606C38] bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Executed & Logged</span>
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-xs text-[#2D2926]">
                        {msg.approvalCard.title}
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {msg.approvalCard.description}
                      </p>
                      <div className="pt-2 flex items-center justify-end space-x-2">
                        {executedCards[msg.approvalCard.id] ? (
                          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center space-x-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Approved • Active in System</span>
                          </div>
                        ) : (
                          <button
                            id={`btn-approve-${msg.approvalCard.id}`}
                            onClick={msg.approvalCard.onApprove}
                            className="px-4 py-2 bg-[#606C38] hover:bg-[#4C572C] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{msg.approvalCard.actionLabel}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className={`text-[10px] text-stone-400 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center space-x-2 text-stone-500 text-xs p-2">
              <Bot className="w-4 h-4 animate-bounce text-[#606C38]" />
              <span>VillaOS AI is analyzing Bali portfolio rules and real-time operations...</span>
            </div>
          )}
        </div>

        {/* 10 Core Prompt Pills */}
        <div className="px-4 py-2.5 bg-[#FAF9F6] border-t border-[#E8E6E1] overflow-x-auto scrollbar-none flex items-center space-x-2">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex-shrink-0 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-[#BC6C25]" />
            <span>Tasks:</span>
          </span>
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-[#F2F1ED] text-stone-700 text-[11px] font-medium border border-[#E8E6E1] shadow-2xs flex-shrink-0 hover:border-[#606C38] transition-colors whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#E8E6E1] flex items-center space-x-2 sm:space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Instruct AI Manager (e.g. 'Tell cleaner to prepare Villa 7', 'Increase weekend pricing by 10%')..."
            className="flex-1 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#2D2926] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#606C38]/20 focus:border-[#606C38] transition-all"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim()}
            className="px-4 py-2.5 bg-[#606C38] hover:bg-[#4C572C] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center space-x-1.5 shadow-2xs transition-all flex-shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </div>

      {/* Real-time AI Activity Log Section */}
      <div className="bg-white rounded-3xl border border-[#E8E6E1] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#FEFAE0] flex items-center justify-center text-[#BC6C25]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2D2926]">Live AI Activity Log</h3>
              <p className="text-xs text-stone-500">Autonomous executions, staff dispatches, and approved decisions</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-stone-100 text-stone-600 border border-stone-200">
            {aiLogs.length} Events Logged
          </span>
        </div>

        <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
          {aiLogs.slice(0, 8).map((log) => (
            <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.category === 'Operations' ? 'bg-amber-100 text-amber-800' :
                    log.category === 'Revenue' ? 'bg-emerald-100 text-emerald-800' :
                    log.category === 'Guest Communication' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {log.category}
                  </span>
                  <span className="font-bold text-stone-800 truncate">{log.action}</span>
                </div>
                <p className="text-stone-500 text-[11px] truncate sm:whitespace-normal">{log.details}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="font-mono text-[11px] text-stone-400">{log.time}</span>
                <div className="text-[10px] font-semibold text-emerald-700">{log.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
