import React, { useState } from 'react';
import { 
  Bot, Filter, CheckCircle2, AlertCircle, Clock, Sparkles, 
  TrendingUp, MessageSquare, Wrench, Share2, Wallet 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AiActivityLogView: React.FC = () => {
  const { aiLogs } = useApp();
  const [filter, setFilter] = useState<'All' | 'Operations' | 'Guest Communication' | 'Revenue' | 'Social Media' | 'Finance'>('All');

  const filteredLogs = filter === 'All' 
    ? aiLogs 
    : aiLogs.filter(l => l.category === filter);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Operations': return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'Guest Communication': return <MessageSquare className="w-4 h-4 text-sky-600" />;
      case 'Revenue': return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'Social Media': return <Share2 className="w-4 h-4 text-purple-600" />;
      case 'Finance': return <Wallet className="w-4 h-4 text-indigo-600" />;
      default: return <Bot className="w-4 h-4 text-stone-600" />;
    }
  };

  const categories = ['All', 'Operations', 'Guest Communication', 'Revenue', 'Social Media', 'Finance'] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900">AI Activity & Audit Log</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Transparent trace of autonomous operations, agent decisions, and staff notifications.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === c
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-stone-700">
            <Clock className="w-4 h-4 text-stone-400" />
            <span>Chronological Event Stream ({filteredLogs.length} Events)</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            100% System Integrity
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {filteredLogs.map(log => (
            <div key={log.id} className="p-4 hover:bg-stone-50/60 transition-colors flex items-start space-x-4">
              <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 shadow-2xs mt-0.5 flex-shrink-0">
                {getCategoryIcon(log.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                      {log.time}
                    </span>
                    <span className="text-xs font-bold text-stone-900">{log.action}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    log.status === 'Auto-executed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : log.status === 'Approved by User'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {log.status}
                  </span>
                </div>

                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {log.details}
                </p>

                <div className="mt-2 flex items-center space-x-2 text-[11px] text-stone-400">
                  <span className="font-semibold text-stone-500">{log.category}</span>
                  <span>•</span>
                  <span>{log.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
