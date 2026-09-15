import React from 'react';
import { 
  Wrench, Sparkles, CheckCircle2, Clock, AlertTriangle, 
  Users, ArrowRight, Shield, Calendar 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskCompletionTrends } from './TaskCompletionTrends';

export const OperationsHubView: React.FC = () => {
  const { 
    tasks, 
    cleaningSchedules, 
    maintenanceIssues, 
    properties, 
    setActiveTab, 
    markCleaningReady, 
    resolveMaintenance 
  } = useApp();

  const urgentTasks = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high');

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900">Operations Command Center</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Oversee field staff, turnaround checklists, inspections, and equipment repairs across all villas.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setActiveTab('cleaning')}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Housekeeping Board</span>
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
          >
            <Wrench className="w-4 h-4 text-rose-600" />
            <span>Maintenance Tickets</span>
          </button>
        </div>
      </div>

      {/* Top Operations KPI summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Turnovers Today</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-stone-900 mt-2">4 Villas</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">3 Completed • 1 In Progress</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Open Repairs</span>
            <Wrench className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-stone-900 mt-2">{maintenanceIssues.filter(m => m.status !== 'Resolved').length} Tickets</div>
          <div className="text-[10px] text-rose-600 mt-0.5">1 High priority AC fix</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Active Field Staff</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-bold text-stone-900 mt-2">8 Staff</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Wayan, Made, Ketut, Nyoman on duty</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Inspection Pass Rate</span>
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-2">98.4%</div>
          <div className="text-[10px] text-stone-500 mt-0.5">AI visual checklist validated</div>
        </div>
      </div>

      {/* Cleaning & Maintenance Task Completion Trends Visualization (Recharts) */}
      <TaskCompletionTrends />

      {/* Grid: Housekeeping schedule & Maintenance issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Housekeeping Turnovers Card */}
        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F2F1ED] pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#606C38]" />
              <h3 className="font-serif font-bold text-base text-[#2D2926]">Today's Turnaround Pipeline</h3>
            </div>
            <button
              onClick={() => setActiveTab('cleaning')}
              className="text-xs font-bold text-[#606C38] hover:text-[#4C572C] flex items-center space-x-1"
            >
              <span>Detailed Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {cleaningSchedules.length === 0 ? (
              <div className="p-8 text-center bg-[#FAF9F6] rounded-2xl border border-dashed border-[#E8E6E1] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#606C38] mx-auto" />
                <p className="text-xs font-bold text-[#2D2926]">All Turnarounds Complete</p>
                <p className="text-[11px] text-stone-500">Every scheduled villa turnover has been cleaned, inspected, and marked ready for incoming guests.</p>
              </div>
            ) : (
              cleaningSchedules.map(cs => (
                <div key={cs.id} className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2D2926]">{cs.propertyName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cs.cleaningStatus === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : cs.cleaningStatus === 'In Progress'
                        ? 'bg-[#FEFAE0] text-[#BC6C25] border border-[#F1EDD4]'
                        : 'bg-stone-200 text-stone-700'
                    }`}>
                      {cs.cleaningStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                    <div>Check-out: <strong>{cs.checkOutTime || cs.checkoutTime || '11:00 AM'}</strong></div>
                    <div>Next Arrival: <strong>{cs.nextCheckInTime}</strong></div>
                    <div>Cleaner: <strong>{cs.cleanerName}</strong></div>
                    <div>Next Guest: <strong>{cs.nextGuestName}</strong></div>
                  </div>

                  <div className="pt-2 border-t border-[#E8E6E1]/60 flex items-center justify-between">
                    <span className="text-[10px] text-stone-500">
                      Linen count: {cs.checklist?.linensChanged ? '✓ Changed' : 'Pending'}
                    </span>
                    {cs.cleaningStatus !== 'Completed' && (
                      <button
                        onClick={() => markCleaningReady(cs.id)}
                        className="px-2.5 py-1 bg-[#606C38] hover:bg-[#4C572C] text-white rounded-lg text-[11px] font-bold transition-colors"
                      >
                        Mark Ready
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Maintenance Tickets Card */}
        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F2F1ED] pb-3">
            <div className="flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-[#BC6C25]" />
              <h3 className="font-serif font-bold text-base text-[#2D2926]">Active Maintenance Tickets</h3>
            </div>
            <button
              onClick={() => setActiveTab('maintenance')}
              className="text-xs font-bold text-[#BC6C25] hover:text-[#9A561E] flex items-center space-x-1"
            >
              <span>All Tickets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {maintenanceIssues.length === 0 ? (
              <div className="p-8 text-center bg-[#FAF9F6] rounded-2xl border border-dashed border-[#E8E6E1] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#606C38] mx-auto" />
                <p className="text-xs font-bold text-[#2D2926]">No Open Maintenance Tickets</p>
                <p className="text-[11px] text-stone-500">All air conditioning, water pumps, WiFi routers, and pool equipment are fully operational.</p>
              </div>
            ) : (
              maintenanceIssues.map(issue => (
                <div key={issue.id} className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#2D2926]">{issue.propertyName}</span>
                      <span className="text-stone-400">• {issue.category || issue.aiClassification?.category || 'General'}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      issue.priority?.toLowerCase() === 'high' || issue.priority?.toLowerCase() === 'urgent' 
                        ? 'bg-rose-100 text-rose-800' 
                        : 'bg-[#FEFAE0] text-[#BC6C25] border border-[#F1EDD4]'
                    }`}>
                      {issue.priority} Priority
                    </span>
                  </div>

                  <p className="text-stone-700 font-medium leading-relaxed">
                    {issue.problem}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                    <span>Assigned: <strong>{issue.assignedTechnician}</strong> (ETA: {issue.eta})</span>
                    <span>Est: <strong>{typeof issue.estimatedCost === 'number' ? `IDR ${issue.estimatedCost.toLocaleString()}` : issue.estimatedCost}</strong></span>
                  </div>

                  {issue.status !== 'Resolved' && (
                    <div className="pt-2 border-t border-[#E8E6E1]/60 flex justify-end">
                      <button
                        onClick={() => resolveMaintenance(issue.id)}
                        className="px-2.5 py-1 bg-[#2D2926] hover:bg-stone-800 text-white rounded-lg text-[11px] font-bold transition-colors"
                      >
                        Resolve Ticket
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
