import React from 'react';
import { 
  X, Bell, Sparkles, MessageSquare, AlertTriangle, TrendingUp, 
  Wrench, CalendarCheck, Check, ExternalLink 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationCenter: React.FC = () => {
  const { 
    isNotificationsOpen, 
    setIsNotificationsOpen, 
    notifications, 
    markNotificationRead, 
    clearAllNotifications,
    setActiveTab 
  } = useApp();

  if (!isNotificationsOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'cleaning': return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'guest': return <MessageSquare className="w-4 h-4 text-sky-500" />;
      case 'pricing': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'maintenance': return <Wrench className="w-4 h-4 text-rose-500" />;
      case 'booking': return <CalendarCheck className="w-4 h-4 text-indigo-500" />;
      default: return <Bell className="w-4 h-4 text-stone-500" />;
    }
  };

  const handleAction = (item: any) => {
    markNotificationRead(item.id);
    if (item.actionType) {
      setActiveTab(item.actionType);
    }
    setIsNotificationsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#E8E6E1] animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#E8E6E1] flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-[#606C38]" />
            <h2 className="font-serif font-bold text-base text-[#2D2926]">Hospitality Notifications</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearAllNotifications}
              className="text-xs text-stone-500 hover:text-[#2D2926] font-medium px-2.5 py-1 rounded-lg hover:bg-[#F2F1ED] transition-colors"
            >
              Mark all read
            </button>
            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="p-1 rounded-lg hover:bg-[#F2F1ED] text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map(item => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                item.unread 
                  ? 'bg-[#FEFAE0]/80 border-[#F1EDD4] shadow-2xs' 
                  : 'bg-white border-[#E8E6E1] text-stone-600'
              }`}
            >
              <div className="flex items-start justify-between space-x-3">
                <div className="flex items-start space-x-2.5">
                  <div className="p-2 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] shadow-2xs mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className={`text-xs font-bold ${item.unread ? 'text-[#2D2926]' : 'text-stone-700'}`}>
                        {item.title}
                      </h3>
                      {item.unread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#BC6C25]" />
                      )}
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center space-x-3 mt-2 text-[11px] text-stone-400">
                      <span>{item.time}</span>
                      {item.actionRequired && (
                        <button
                          onClick={() => handleAction(item)}
                          className="font-semibold text-[#606C38] hover:text-[#4C572C] flex items-center space-x-1 hover:underline"
                        >
                          <span>Open & Resolve</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {item.unread && (
                  <button
                    onClick={() => markNotificationRead(item.id)}
                    className="p-1 rounded hover:bg-[#F2F1ED] text-stone-400 hover:text-stone-700"
                    title="Mark read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#FAF9F6] border-t border-[#E8E6E1] text-center text-xs text-stone-500 font-medium">
          VillaOS Operations AI monitors channel feeds & guest messaging 24/7
        </div>
      </div>
    </div>
  );
};
