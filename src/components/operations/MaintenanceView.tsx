import React, { useState } from 'react';
import { 
  Wrench, AlertTriangle, CheckCircle2, Clock, DollarSign, 
  User, Sparkles, Plus, Shield, Phone, ExternalLink 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MaintenanceIssue } from '../../types';

export const MaintenanceView: React.FC = () => {
  const { maintenanceIssues, resolveMaintenance, properties, createMaintenanceIssue } = useApp();
  const [filterCategory, setFilterCategory] = useState('All');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketPropId, setTicketPropId] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Air Conditioning');
  const [ticketProblem, setTicketProblem] = useState('');
  const [ticketLocation, setTicketLocation] = useState('Master Bedroom');

  const categories = ['All', 'Air Conditioning', 'Wi-Fi & Electronics', 'Pool & Pump', 'Plumbing'];

  const filteredIssues = filterCategory === 'All'
    ? maintenanceIssues
    : maintenanceIssues.filter(m => (m.category || m.aiClassification?.category || '').includes(filterCategory));

  const handleDispatchTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const propId = ticketPropId || properties[0]?.id;
    if (!propId) return;

    createMaintenanceIssue({
      propertyId: propId,
      problem: ticketProblem || `${ticketCategory} inspection and repair required`,
      location: ticketLocation,
      priority: 'high',
      aiClassification: {
        category: ticketCategory,
        urgencyReason: 'Direct technician dispatch from Maintenance console.',
      },
    });

    setTicketProblem('');
    setShowNewTicketModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-serif font-bold text-stone-900">Maintenance & Equipment Tracker</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
              Field Engineers
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time equipment repair ledger, technician dispatch, IDR cost tracking, and AI issue detection from guest chat.
          </p>
        </div>

        <button
          onClick={() => setShowNewTicketModal(true)}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Maintenance Ticket</span>
        </button>
      </div>

      {/* AI Issue Detection Callout Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-white rounded-2xl border border-amber-200 flex items-start space-x-3.5">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-800 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 text-xs">
          <div className="font-bold text-amber-950">Autonomous AI Incident Detection Active</div>
          <p className="text-stone-600 mt-0.5 leading-relaxed">
            When in-house guests mention terms like "AC isn't cold", "Wi-Fi dropped", or "pool has leaves", VillaOS AI automatically opens a draft ticket and cross-references your preferred technician from Property Knowledge.
          </p>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterCategory === c
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredIssues.map(issue => (
          <div
            key={issue.id}
            className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    issue.priority?.toLowerCase() === 'high' || issue.priority?.toLowerCase() === 'urgent' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {issue.priority.toUpperCase()} Priority
                  </span>
                  <span className="text-xs font-mono text-stone-400">{issue.id}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  issue.status === 'Resolved' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : issue.status === 'In Progress'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-sky-100 text-sky-800'
                }`}>
                  {issue.status}
                </span>
              </div>

              <div className="mt-3">
                <h4 className="font-serif font-bold text-base text-stone-900">{issue.propertyName}</h4>
                <div className="text-xs font-semibold text-stone-600 mt-0.5">{issue.category || issue.aiClassification?.category || 'General Maintenance'}</div>
                <p className="text-xs text-stone-700 mt-2 bg-stone-50 p-3 rounded-xl border border-stone-200/70 leading-relaxed">
                  {issue.problem}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Technician</span>
                  <div className="font-bold text-stone-800 mt-0.5">{issue.assignedTechnician}</div>
                  <div className="text-[10px] text-stone-500">ETA: {issue.eta}</div>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Estimated Repair Cost</span>
                  <div className="font-bold text-stone-900 mt-0.5">{typeof issue.estimatedCost === 'number' ? `IDR ${issue.estimatedCost.toLocaleString()}` : issue.estimatedCost}</div>
                  <div className="text-[10px] text-stone-500">Approved in OPEX</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[11px] text-stone-400">Reported: {issue.reportedAt}</span>

              {issue.status !== 'Resolved' ? (
                <button
                  onClick={() => resolveMaintenance(issue.id)}
                  className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Mark Resolved
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Work Completed</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleDispatchTicket} className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-stone-900">New Maintenance Dispatch</h3>
              <button type="button" onClick={() => setShowNewTicketModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Select Property</label>
                <select 
                  value={ticketPropId || (properties[0]?.id || '')} 
                  onChange={(e) => setTicketPropId(e.target.value)}
                  className="w-full p-2 border border-stone-200 rounded-lg text-stone-800"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Issue Category</label>
                <select 
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full p-2 border border-stone-200 rounded-lg text-stone-800"
                >
                  <option value="Air Conditioning">Air Conditioning</option>
                  <option value="Pool & Pump">Pool & Pump</option>
                  <option value="Wi-Fi & Electronics">Wi-Fi & Electronics</option>
                  <option value="Plumbing & Water Heater">Plumbing & Water Heater</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Location / Room</label>
                <input
                  type="text"
                  value={ticketLocation}
                  onChange={(e) => setTicketLocation(e.target.value)}
                  placeholder="e.g. Master Bedroom, Pool Deck..."
                  className="w-full p-2 border border-stone-200 rounded-lg text-stone-800"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <textarea 
                  rows={3} 
                  value={ticketProblem}
                  onChange={(e) => setTicketProblem(e.target.value)}
                  placeholder="Describe the issue symptom..." 
                  className="w-full p-2 border border-stone-200 rounded-lg text-stone-800" 
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setShowNewTicketModal(false)} className="px-3 py-1.5 text-xs text-stone-600">Cancel</button>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
              >
                Dispatch Ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
