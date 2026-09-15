import React from 'react';
import { 
  Check, X, Edit3, TrendingUp, MessageSquare, Sparkles, Wrench, 
  ShieldAlert, Clock, ArrowRight 
} from 'lucide-react';
import { AiAction } from '../../types';
import { useApp } from '../../context/AppContext';

export const AiActionCard: React.FC<{ action: AiAction }> = ({ action }) => {
  const { approveAiAction, dismissAiAction } = useApp();

  const getIcon = (type: AiAction['type']) => {
    switch (type) {
      case 'pricing': return <TrendingUp className="w-4 h-4 text-[#606C38]" />;
      case 'messaging': return <MessageSquare className="w-4 h-4 text-[#BC6C25]" />;
      case 'cleaning': return <Sparkles className="w-4 h-4 text-[#606C38]" />;
      case 'maintenance': return <Wrench className="w-4 h-4 text-[#BC6C25]" />;
      default: return <Sparkles className="w-4 h-4 text-[#606C38]" />;
    }
  };

  const getBadgeStyle = (type: AiAction['type']) => {
    switch (type) {
      case 'pricing': return 'bg-[#FEFAE0] text-[#606C38] border-[#F1EDD4]';
      case 'messaging': return 'bg-[#FAF9F6] text-[#BC6C25] border-[#E8E6E1]';
      case 'cleaning': return 'bg-[#FEFAE0] text-[#606C38] border-[#F1EDD4]';
      case 'maintenance': return 'bg-[#FAF9F6] text-[#BC6C25] border-[#E8E6E1]';
      default: return 'bg-[#FAF9F6] text-stone-800 border-[#E8E6E1]';
    }
  };

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      action.status === 'approved' 
        ? 'bg-[#FEFAE0]/70 border-[#F1EDD4]'
        : action.status === 'dismissed'
        ? 'bg-[#F2F1ED]/60 border-[#E8E6E1] opacity-60'
        : 'bg-white border-[#E8E6E1] shadow-2xs hover:shadow-xs'
    }`}>
      {/* Top Meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${getBadgeStyle(action.type)}`}>
            {getIcon(action.type)}
            <span className="capitalize">{action.type} Recommendation</span>
          </span>
          {action.propertyName && (
            <span className="text-[11px] font-semibold text-stone-600">
              • {action.propertyName}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 text-[11px] text-stone-400">
          <Clock className="w-3 h-3" />
          <span>{action.createdAt}</span>
        </div>
      </div>

      {/* Content */}
      <div className="mt-2.5">
        <h4 className="text-xs font-bold text-[#2D2926] leading-snug">
          {action.title}
        </h4>
        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
          {action.description}
        </p>

        {/* Proposed Execution */}
        <div className="mt-2.5 p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] text-xs font-medium text-[#2D2926] flex items-start space-x-2">
          <ArrowRight className="w-3.5 h-3.5 text-[#BC6C25] mt-0.5 flex-shrink-0" />
          <span className="leading-snug">{action.suggestedAction}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3.5 pt-3 border-t border-[#F2F1ED] flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-[11px] text-stone-500">
          <ShieldAlert className="w-3.5 h-3.5 text-[#BC6C25]" />
          <span>Owner Approval Required</span>
        </div>

        {action.status === 'pending' ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => dismissAiAction(action.id)}
              className="px-2.5 py-1 text-xs font-medium text-stone-500 hover:text-[#2D2926] rounded-lg hover:bg-[#F2F1ED] transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                alert(`Editing action: "${action.title}". Customize parameters in settings.`);
              }}
              className="px-2.5 py-1 text-xs font-medium text-stone-700 hover:text-[#2D2926] border border-[#E8E6E1] rounded-lg hover:bg-[#F2F1ED] transition-colors flex items-center space-x-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => approveAiAction(action.id)}
              className="px-3.5 py-1 text-xs font-bold text-white bg-[#606C38] hover:bg-[#4C572C] rounded-lg shadow-2xs transition-colors flex items-center space-x-1"
            >
              <Check className="w-3 h-3" />
              <span>Approve</span>
            </button>
          </div>
        ) : (
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
            action.status === 'approved' 
              ? 'bg-[#FEFAE0] text-[#606C38] border-[#F1EDD4]' 
              : 'bg-stone-200 text-stone-600 border-stone-300'
          }`}>
            {action.status === 'approved' ? '✓ Approved & Executed' : 'Dismissed'}
          </span>
        )}
      </div>
    </div>
  );
};
