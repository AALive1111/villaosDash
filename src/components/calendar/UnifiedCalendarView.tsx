import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, 
  Sparkles, Wrench, CheckCircle2, User, Clock, Info, X 
} from 'lucide-react';
import { useApp, formatIDR } from '../../context/AppContext';
import { ChannelSource, ReservationStatus, Reservation } from '../../types';

export const UnifiedCalendarView: React.FC = () => {
  const { properties, reservations, cleaningSchedules, maintenanceIssues, cancelReservation } = useApp();
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [selectedChannel, setSelectedChannel] = useState<string>('All');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('All');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Days for September 2026 calendar range (e.g. Sep 1 to Sep 21)
  const calendarDays = Array.from({ length: 18 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-09-${dayNum.toString().padStart(2, '0')}`;
    const dateObj = new Date(2026, 8, dayNum);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    return { dayNum, dateStr, dayName };
  });

  const getChannelColor = (channel: ChannelSource) => {
    switch (channel) {
      case 'Airbnb': return 'bg-rose-500 text-white border-rose-600';
      case 'Booking.com': return 'bg-blue-600 text-white border-blue-700';
      case 'Agoda': return 'bg-purple-600 text-white border-purple-700';
      case 'Instagram': return 'bg-gradient-to-r from-pink-500 to-amber-500 text-white border-pink-600';
      case 'WhatsApp': return 'bg-emerald-600 text-white border-emerald-700';
      case 'Direct': return 'bg-amber-600 text-white border-amber-700';
      default: return 'bg-stone-700 text-white border-stone-800';
    }
  };

  const filteredProperties = selectedPropertyId === 'All'
    ? properties
    : properties.filter(p => p.id === selectedPropertyId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900">Unified Multi-Property Calendar</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Gantt-style live tape chart tracking check-ins, check-outs, maintenance gaps, and cleaning blocks.
          </p>
        </div>

        {/* View Switchers & Controls */}
        <div className="flex items-center space-x-2">
          {/* Day / Week / Month Toggles */}
          <div className="bg-stone-100 p-1 rounded-xl flex items-center text-xs font-semibold text-stone-600 border border-stone-200">
            {(['day', 'week', 'month'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                  viewMode === mode ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'hover:text-stone-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1 bg-white border border-stone-200 rounded-xl px-2 py-1 shadow-2xs">
            <button className="p-1 rounded hover:bg-stone-100 text-stone-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-stone-800 px-2">September 2026</span>
            <button className="p-1 rounded hover:bg-stone-100 text-stone-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-stone-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span>Filter By:</span>
          </div>

          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="px-2.5 py-1.5 border border-stone-200 rounded-lg text-xs font-medium bg-white text-stone-700 focus:ring-2 focus:ring-amber-500"
          >
            <option value="All">All Properties ({properties.length})</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-2.5 py-1.5 border border-stone-200 rounded-lg text-xs font-medium bg-white text-stone-700 focus:ring-2 focus:ring-amber-500"
          >
            <option value="All">All Booking Channels</option>
            <option value="Airbnb">Airbnb</option>
            <option value="Booking.com">Booking.com</option>
            <option value="Agoda">Agoda</option>
            <option value="Direct">Direct</option>
            <option value="Instagram">Instagram</option>
            <option value="WhatsApp">WhatsApp</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[11px] text-stone-500">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span>Airbnb</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
            <span>Booking.com</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-pink-500" />
            <span>Instagram Direct</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span>Cleaning Turnover</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-800" />
            <span>Maintenance</span>
          </div>
        </div>
      </div>

      {/* Gantt Timeline Board */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Header Row with Dates */}
          <div className="grid grid-cols-[220px_repeat(18,1fr)] border-b border-stone-200 bg-stone-50 text-center text-xs">
            <div className="p-3 text-left font-bold text-stone-700 border-r border-stone-200">
              Villa / Unit
            </div>
            {calendarDays.map((d) => (
              <div
                key={d.dateStr}
                className={`p-2 border-r border-stone-200/80 ${
                  d.dateStr === '2026-09-07' ? 'bg-amber-100/60 font-bold text-amber-900' : 'text-stone-600'
                }`}
              >
                <div className="text-[10px] text-stone-400 uppercase">{d.dayName}</div>
                <div className="font-bold text-xs">{d.dayNum}</div>
              </div>
            ))}
          </div>

          {/* Properties Rows */}
          <div className="divide-y divide-stone-200/70">
            {filteredProperties.length === 0 ? (
              <div className="py-12 text-center text-stone-500">
                <p className="text-sm font-semibold">No properties in this workspace.</p>
                <p className="text-xs text-stone-400 mt-1">Add a villa to view multi-property timeline schedules.</p>
              </div>
            ) : (
              filteredProperties.map(property => {
                const propReservations = reservations.filter(r => 
                  r.propertyId === property.id && 
                  r.status !== 'Cancelled' &&
                  (selectedChannel === 'All' || r.channel === selectedChannel)
                );
                const hasCleaning = cleaningSchedules.some(cs => cs.propertyId === property.id && cs.cleaningStatus !== 'Completed');
                const hasMaintenance = maintenanceIssues.some(m => m.propertyId === property.id && m.status !== 'Resolved');

                return (
                  <div key={property.id} className="grid grid-cols-[220px_repeat(18,1fr)] items-center relative min-h-[76px] hover:bg-stone-50/40 transition-colors">
                    {/* Property Name & Thumbnail */}
                    <div className="p-3 border-r border-stone-200 bg-white sticky left-0 z-10 flex items-center space-x-2.5 shadow-xs">
                      <img
                        src={property.image}
                        alt={property.name}
                        className="w-9 h-9 rounded-lg object-cover border border-stone-200 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-stone-900 truncate">{property.name}</div>
                        <div className="text-[10px] text-stone-400">{property.area} • {property.occupancyRate}% Occ</div>
                      </div>
                    </div>

                    {/* Empty Grid Cells */}
                    {calendarDays.map((d) => (
                      <div
                        key={d.dateStr}
                        className={`h-full border-r border-stone-100 ${
                          d.dateStr === '2026-09-07' ? 'bg-amber-50/40' : ''
                        }`}
                      />
                    ))}

                    {/* Reservation Overlay Blocks */}
                    {propReservations.map(res => {
                      const startDay = parseInt(res.checkIn.split('-')[2]) || 1;
                      const endDay = parseInt(res.checkOut.split('-')[2]) || (startDay + res.nights);

                      // Calculate column span and offset relative to grid
                      const colStart = Math.max(1, startDay);
                      const colSpan = Math.max(1, endDay - startDay);

                      return (
                        <div
                          key={res.id}
                          onClick={() => setSelectedReservation(res)}
                          style={{
                            gridColumnStart: colStart + 1,
                            gridColumnEnd: `span ${colSpan}`,
                          }}
                          className={`absolute inset-y-2 rounded-lg p-1.5 text-xs shadow-xs border flex flex-col justify-between overflow-hidden cursor-pointer hover:brightness-105 hover:scale-[1.01] transition-all z-2 ${getChannelColor(res.channel)}`}
                          title={`${res.guestName} (${res.channel}) • ${res.checkIn} to ${res.checkOut}`}
                        >
                          <div className="flex items-center justify-between font-bold text-[11px] truncate">
                            <span className="truncate">{res.guestName}</span>
                            <span className="text-[9px] opacity-85 uppercase ml-1 flex-shrink-0">{res.channel}</span>
                          </div>
                          <div className="text-[9px] opacity-80 truncate">
                            {res.nights}n • {res.guestsCount} guests • {formatIDR(res.totalAmount, true)}
                          </div>
                        </div>
                      );
                    })}

                    {/* Special Cleaning & Maintenance Blocks */}
                    {hasCleaning && (
                      <div
                        style={{
                          gridColumnStart: 8,
                          gridColumnEnd: 9,
                        }}
                        className="absolute inset-y-3 rounded bg-amber-400/90 text-stone-950 text-[9px] font-bold flex items-center justify-center border border-amber-500 shadow-2xs z-3"
                        title="Active Turnover Cleaning"
                      >
                        <Sparkles className="w-3 h-3 mr-0.5" />
                        <span>Clean</span>
                      </div>
                    )}

                    {hasMaintenance && (
                      <div
                        style={{
                          gridColumnStart: 8,
                          gridColumnEnd: 9,
                        }}
                        className="absolute bottom-1 right-2 w-14 h-4 rounded bg-stone-900 text-stone-200 text-[9px] font-bold flex items-center justify-center border border-stone-800 z-3"
                        title="Active Maintenance Inspection"
                      >
                        <Wrench className="w-2.5 h-2.5 mr-0.5 text-amber-400" />
                        <span>AC Tech</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Reservation Detail Popup */}
      {selectedReservation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 font-mono">{selectedReservation.id}</span>
                <h3 className="font-serif font-bold text-base mt-0.5">{selectedReservation.propertyName}</h3>
              </div>
              <button 
                onClick={() => setSelectedReservation(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="flex items-center space-x-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <img
                  src={selectedReservation.guestAvatar}
                  alt={selectedReservation.guestName}
                  className="w-10 h-10 rounded-full object-cover border border-stone-200"
                />
                <div>
                  <div className="font-bold text-stone-900">{selectedReservation.guestName}</div>
                  <div className="text-stone-500">{selectedReservation.guestEmail} • {selectedReservation.guestPhone}</div>
                  <div className="text-[10px] text-stone-400">Source: {selectedReservation.channel}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Dates</span>
                  <div className="font-semibold text-stone-800 mt-0.5">{selectedReservation.checkIn} → {selectedReservation.checkOut}</div>
                  <div className="text-[10px] text-stone-500">{selectedReservation.nights} nights</div>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Total Revenue</span>
                  <div className="font-bold text-stone-900 mt-0.5">{formatIDR(selectedReservation.totalAmount)}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">Net Payout: {formatIDR(selectedReservation.payoutAmount)}</div>
                </div>
              </div>

              {selectedReservation.specialRequests && (
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px]">
                  <span className="font-bold uppercase text-[9px] text-amber-800 block mb-0.5">Special Requests</span>
                  {selectedReservation.specialRequests}
                </div>
              )}
            </div>

            <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={() => {
                  if (window.confirm('Cancel this reservation?')) {
                    cancelReservation(selectedReservation.id);
                    setSelectedReservation(null);
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold"
              >
                Cancel Reservation
              </button>
              <button
                onClick={() => setSelectedReservation(null)}
                className="px-4 py-1.5 bg-stone-900 text-white hover:bg-stone-800 rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
