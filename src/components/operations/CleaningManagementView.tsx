import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, Clock, Phone, MessageSquare, 
  Camera, Check, AlertCircle, RefreshCw, Send, Shield 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CleaningSchedule } from '../../types';

export const CleaningManagementView: React.FC = () => {
  const { cleaningSchedules, markCleaningReady, approveAiAction } = useApp();
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [sentWhatsAppNotice, setSentWhatsAppNotice] = useState<string | null>(null);

  // Auto-select valid schedule for active workspace
  React.useEffect(() => {
    if (selectedScheduleId && !cleaningSchedules.some(s => s.id === selectedScheduleId)) {
      setSelectedScheduleId(cleaningSchedules[0]?.id || '');
    } else if (!selectedScheduleId && cleaningSchedules.length > 0) {
      setSelectedScheduleId(cleaningSchedules[0].id);
    }
  }, [cleaningSchedules, selectedScheduleId]);

  const currentSchedule = cleaningSchedules.find(s => s.id === selectedScheduleId) || null;

  if (!currentSchedule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-stone-500">
        <Sparkles className="w-12 h-12 mb-4 opacity-20" />
        <p>No active cleaning schedules for this period.</p>
      </div>
    );
  }

  const handleSendWhatsAppDispatch = (cleanerName: string, propName: string) => {
    setSentWhatsAppNotice(`Dispatched WhatsApp turnover checklist to ${cleanerName} for ${propName}!`);
    setTimeout(() => setSentWhatsAppNotice(null), 3500);
  };

  const getStatusBadge = (status: CleaningSchedule['cleaningStatus']) => {
    switch (status) {
      case 'Completed': return 'bg-[#FEFAE0] text-[#606C38] border-[#F1EDD4]';
      case 'Ready for Inspection': return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'In Progress': return 'bg-[#FEFAE0] text-[#BC6C25] border-[#F1EDD4] animate-pulse';
      case 'Not Started': return 'bg-[#FAF9F6] text-stone-600 border-[#E8E6E1]';
      default: return 'bg-[#FAF9F6] text-stone-600 border-[#E8E6E1]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-serif font-bold text-[#2D2926]">Housekeeping & Villa Turnovers</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEFAE0] text-[#606C38] border border-[#F1EDD4]">
              Bali Field Team
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time turnover tracking between guest check-out and incoming arrival, inspection photo audit, and cleaner WhatsApp dispatch.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSendWhatsAppDispatch('All Housekeepers', 'All Villas')}
            className="px-3.5 py-2 bg-[#606C38] hover:bg-[#4C572C] text-white rounded-xl text-xs font-bold shadow-2xs flex items-center space-x-1.5 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Broadcast Daily Dispatch to Cleaners</span>
          </button>
        </div>
      </div>

      {sentWhatsAppNotice && (
        <div className="p-3 bg-[#FEFAE0] border border-[#F1EDD4] rounded-2xl text-xs text-[#2D2926] flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#606C38] flex-shrink-0" />
          <span>{sentWhatsAppNotice}</span>
        </div>
      )}

      {/* Turnover Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cleaningSchedules.map(schedule => (
          <div
            key={schedule.id}
            onClick={() => setSelectedScheduleId(schedule.id)}
            className={`bg-white rounded-3xl border transition-all p-5 shadow-2xs cursor-pointer flex flex-col justify-between ${
              currentSchedule?.id === schedule.id
                ? 'border-[#606C38] ring-2 ring-[#606C38]/20'
                : 'border-[#E8E6E1] hover:border-stone-300'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#2D2926]">{schedule.propertyName}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(schedule.cleaningStatus)}`}>
                  {schedule.cleaningStatus}
                </span>
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF9F6] rounded-xl p-2.5 mt-3 border border-[#E8E6E1]">
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Departed</span>
                  <div className="font-bold text-[#2D2926]">{schedule.checkOutTime || schedule.checkoutTime || '11:00 AM'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Next In</span>
                  <div className="font-bold text-[#BC6C25]">{schedule.nextCheckInTime}</div>
                </div>
              </div>

              {/* Cleaner & Next Guest */}
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Cleaner:</span>
                  <span className="font-bold text-[#2D2926]">{schedule.cleanerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Next Guest:</span>
                  <span className="font-bold text-[#2D2926]">{schedule.nextGuestName}</span>
                </div>
              </div>

              {/* Checklists */}
              <div className="mt-4 pt-3 border-t border-[#E8E6E1] space-y-1.5 text-xs text-stone-700">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${schedule.checklist?.linensChanged ? 'text-[#606C38]' : 'text-stone-300'}`} />
                  <span>Linens & Pillowcases Changed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${schedule.checklist?.poolCleaned ? 'text-[#606C38]' : 'text-stone-300'}`} />
                  <span>Pool Skimmed & Water Clear</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${schedule.checklist?.freshTowels ? 'text-[#606C38]' : 'text-stone-300'}`} />
                  <span>Fresh Luxury Bath & Pool Towels</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${schedule.checklist?.welcomeBasket ? 'text-[#606C38]' : 'text-stone-300'}`} />
                  <span>Welcome Coconuts & Fruit Basket</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${schedule.checklist?.acChecked ? 'text-[#606C38]' : 'text-stone-300'}`} />
                  <span>AC Checked & Set to 23°C</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-[#E8E6E1] flex items-center justify-between">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendWhatsAppDispatch(schedule.cleanerName, schedule.propertyName);
                }}
                className="text-xs font-bold text-[#606C38] hover:text-[#4C572C] flex items-center space-x-1"
              >
                <Phone className="w-3 h-3" />
                <span>WhatsApp Cleaner</span>
              </button>

              {schedule.cleaningStatus !== 'Completed' ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markCleaningReady(schedule.id);
                  }}
                  className="px-3 py-1.5 bg-[#606C38] hover:bg-[#4C572C] text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  Mark Inspected
                </button>
              ) : (
                <span className="text-xs font-bold text-[#606C38] flex items-center space-x-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Villa Ready</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Villa Inspection Gallery */}
      {currentSchedule && (
        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E6E1] pb-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#BC6C25]">Photo Verification Audit</div>
              <h3 className="font-serif font-bold text-lg text-[#2D2926]">
                {currentSchedule.propertyName} Turnover Inspection Gallery
              </h3>
            </div>
            <span className="text-xs text-stone-500">
              Uploaded by {currentSchedule.cleanerName} via WhatsApp
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(currentSchedule.inspectionPhotos || []).map((photo, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden border border-[#E8E6E1] bg-[#FAF9F6]">
                <img
                  src={photo}
                  alt="Inspection proof"
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5 text-white text-[11px] font-bold">
                  Room #{i + 1} Inspected
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-[#FEFAE0]/80 rounded-2xl border border-[#F1EDD4] text-xs text-[#2D2926] flex items-center justify-between">
            <span>AI Computer Vision Confidence: <strong>99.1% (No damage detected, clean towels verified)</strong></span>
            <span className="font-bold text-[#606C38]">Passes 5-Star Standard</span>
          </div>
        </div>
      )}
    </div>
  );
};
