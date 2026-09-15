import React, { useState } from 'react';
import { 
  Search, Filter, CalendarCheck, CheckCircle2, Clock, 
  ExternalLink, User, DollarSign, Globe, X, Plus 
} from 'lucide-react';
import { useApp, formatIDR } from '../../context/AppContext';
import { Reservation, ReservationStatus, ChannelSource } from '../../types';

export const ReservationsView: React.FC = () => {
  const { reservations, properties, setActiveTab, createReservation, editReservation, cancelReservation } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedProperty, setSelectedProperty] = useState<string>('All');
  const [activeReservationModal, setActiveReservationModal] = useState<Reservation | null>(null);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [editingRes, setEditingRes] = useState<Reservation | null>(null);

  // New Booking form state
  const [bookingPropId, setBookingPropId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCountry, setGuestCountry] = useState('Australia');
  const [channel, setChannel] = useState<ChannelSource>('Direct');
  const [nights, setNights] = useState(3);
  const [guestsCount, setGuestsCount] = useState(2);
  const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);

  // Edit form state
  const [editGuestName, setEditGuestName] = useState('');
  const [editGuestEmail, setEditGuestEmail] = useState('');
  const [editGuestPhone, setEditGuestPhone] = useState('');
  const [editStatus, setEditStatus] = useState<ReservationStatus>('Confirmed');
  const [editNights, setEditNights] = useState(3);
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editSpecialRequests, setEditSpecialRequests] = useState('');

  const openEditModal = (res: Reservation) => {
    setEditingRes(res);
    setEditGuestName(res.guestName);
    setEditGuestEmail(res.guestEmail || '');
    setEditGuestPhone(res.guestPhone || '');
    setEditStatus(res.status);
    setEditNights(res.nights);
    setEditCheckIn(res.checkIn);
    setEditSpecialRequests(res.specialRequests || '');
    if (activeReservationModal) {
      setActiveReservationModal(null);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRes) return;

    const checkOutDate = new Date(editCheckIn);
    checkOutDate.setDate(checkOutDate.getDate() + Number(editNights));

    editReservation(editingRes.id, {
      guestName: editGuestName,
      guestEmail: editGuestEmail,
      guestPhone: editGuestPhone,
      status: editStatus,
      nights: Number(editNights),
      checkIn: editCheckIn,
      checkOut: checkOutDate.toISOString().split('T')[0],
      specialRequests: editSpecialRequests,
    });

    setEditingRes(null);
  };

  const handleCancelBooking = (resId: string) => {
    if (window.confirm('Are you sure you want to cancel this reservation? The dates will be released.')) {
      cancelReservation(resId);
      if (activeReservationModal?.id === resId) {
        setActiveReservationModal(null);
      }
    }
  };

  const sources: (ChannelSource | 'All')[] = ['All', 'Airbnb', 'Booking.com', 'Agoda', 'Direct', 'Instagram', 'WhatsApp'];
  const statuses: (ReservationStatus | 'All')[] = ['All', 'Confirmed', 'Pending', 'Checked In', 'Checked Out', 'Cancelled'];

  const filteredReservations = reservations.filter(res => {
    const matchesSearch = 
      res.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = selectedSource === 'All' || res.channel === selectedSource;
    const matchesStatus = selectedStatus === 'All' || res.status === selectedStatus;
    const matchesProp = selectedProperty === 'All' || res.propertyName === selectedProperty;
    return matchesSearch && matchesSource && matchesStatus && matchesProp;
  });

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const propId = bookingPropId || properties[0]?.id;
    if (!propId) return;

    const checkOutDate = new Date(checkIn);
    checkOutDate.setDate(checkOutDate.getDate() + Number(nights));

    createReservation({
      propertyId: propId,
      guestName: guestName || 'Walk-in Guest',
      guestEmail: guestEmail || 'guest@example.com',
      guestPhone: guestPhone || '+62 812 3456 7890',
      guestCountry,
      channel,
      nights: Number(nights),
      guestsCount: Number(guestsCount),
      checkIn,
      checkOut: checkOutDate.toISOString().split('T')[0],
      specialRequests: 'Direct booking created via VillaOS Console.',
    });

    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    setShowNewBookingModal(false);
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'Checked In': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Confirmed': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Checked Out': return 'bg-stone-200 text-stone-700 border-stone-300';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const getSourceBadge = (channel: ChannelSource) => {
    switch (channel) {
      case 'Airbnb': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Booking.com': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Agoda': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Instagram': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'WhatsApp': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Direct': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900">Reservations & Channel Bookings</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Unified multi-channel booking ledger across Airbnb, Booking.com, Agoda, Direct, and Instagram.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNewBookingModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Booking</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            Switch to Visual Calendar
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guest name, villa, booking ID..."
              className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Property Dropdown */}
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-700 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="All">All Properties ({properties.length})</option>
            {properties.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>

          {/* Source Dropdown */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-700 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {sources.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Channels' : s}</option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-700 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {statuses.map(st => (
              <option key={st} value={st}>{st === 'All' ? 'All Statuses' : st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Dates & Nights</th>
                <th className="py-3 px-4">Total Amount (IDR)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
              {filteredReservations.map(res => (
                <tr 
                  key={res.id} 
                  onClick={() => setActiveReservationModal(res)}
                  className="hover:bg-stone-50/70 transition-colors cursor-pointer"
                >
                  {/* Guest */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={res.guestAvatar}
                        alt={res.guestName}
                        className="w-8 h-8 rounded-full object-cover border border-stone-200 flex-shrink-0"
                      />
                      <div>
                        <div className="font-bold text-stone-900">{res.guestName}</div>
                        <div className="text-[10px] text-stone-400">{res.guestCountry} • {res.guestsCount} guests</div>
                      </div>
                    </div>
                  </td>

                  {/* Property */}
                  <td className="py-3.5 px-4 font-semibold text-stone-900">
                    {res.propertyName}
                  </td>

                  {/* Source */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSourceBadge(res.channel)}`}>
                      {res.channel}
                    </span>
                  </td>

                  {/* Dates */}
                  <td className="py-3.5 px-4">
                    <div>{res.checkIn} → {res.checkOut}</div>
                    <div className="text-[10px] text-stone-400">{res.nights} nights</div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-stone-900">{formatIDR(res.totalAmount)}</div>
                    {res.commission === 0 ? (
                      <div className="text-[10px] text-emerald-600 font-semibold">0% OTA Fee (Direct)</div>
                    ) : (
                      <div className="text-[10px] text-stone-400">Net: {formatIDR(res.payoutAmount, true)}</div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(res.status)}`}>
                      {res.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveReservationModal(res);
                        }}
                        className="text-stone-600 hover:text-stone-900 text-[11px] font-semibold hover:underline"
                      >
                        Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(res);
                        }}
                        className="text-amber-700 hover:text-amber-900 text-[11px] font-bold hover:underline"
                      >
                        Edit
                      </button>
                      {res.status !== 'Cancelled' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelBooking(res.id);
                          }}
                          className="text-rose-600 hover:text-rose-800 text-[11px] font-bold hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reservation Detail Modal */}
      {activeReservationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <div className="text-xs text-amber-400 font-mono">{activeReservationModal.id}</div>
                <h3 className="font-serif font-bold text-base mt-0.5">Reservation Details</h3>
              </div>
              <button
                onClick={() => setActiveReservationModal(null)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center space-x-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <img
                  src={activeReservationModal.guestAvatar}
                  alt={activeReservationModal.guestName}
                  className="w-12 h-12 rounded-full object-cover border border-stone-200"
                />
                <div>
                  <div className="font-bold text-sm text-stone-900">{activeReservationModal.guestName}</div>
                  <div className="text-stone-500">{activeReservationModal.guestEmail} • {activeReservationModal.guestPhone}</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Country: {activeReservationModal.guestCountry}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-[10px] text-stone-500 font-bold uppercase">Property</div>
                  <div className="font-bold text-stone-900 mt-0.5">{activeReservationModal.propertyName}</div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-[10px] text-stone-500 font-bold uppercase">Booking Source</div>
                  <div className="font-bold text-stone-900 mt-0.5">{activeReservationModal.channel}</div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-[10px] text-stone-500 font-bold uppercase">Check-in</div>
                  <div className="font-bold text-stone-900 mt-0.5">{activeReservationModal.checkIn}</div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-[10px] text-stone-500 font-bold uppercase">Check-out</div>
                  <div className="font-bold text-stone-900 mt-0.5">{activeReservationModal.checkOut} ({activeReservationModal.nights} nights)</div>
                </div>
              </div>

              {activeReservationModal.specialRequests && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <div className="font-bold text-[10px] uppercase text-amber-800">Special Requests / Notes</div>
                  <p className="mt-1 leading-relaxed">{activeReservationModal.specialRequests}</p>
                </div>
              )}

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">Gross Total</span>
                  <span className="font-bold text-stone-900">{formatIDR(activeReservationModal.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Channel Commission</span>
                  <span>{formatIDR(activeReservationModal.commission)}</span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-1.5 font-bold text-stone-900">
                  <span>Net Payout to Host</span>
                  <span className="text-emerald-700">{formatIDR(activeReservationModal.payoutAmount)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setActiveReservationModal(null);
                    setActiveTab('inbox');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold"
                >
                  Open in WhatsApp Inbox
                </button>
                <button
                  onClick={() => openEditModal(activeReservationModal)}
                  className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold"
                >
                  Edit Booking
                </button>
                {activeReservationModal.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleCancelBooking(activeReservationModal.id)}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
              <button
                onClick={() => setActiveReservationModal(null)}
                className="px-4 py-1.5 rounded-lg bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingRes && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveEdit} className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-600 font-bold uppercase">{editingRes.id}</span>
                <h3 className="font-serif font-bold text-base text-stone-900">Edit Reservation</h3>
              </div>
              <button type="button" onClick={() => setEditingRes(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Property</label>
                <div className="p-2 bg-stone-100 rounded-lg text-stone-700 font-semibold">{editingRes.propertyName}</div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Guest Full Name</label>
                <input
                  type="text"
                  required
                  value={editGuestName}
                  onChange={(e) => setEditGuestName(e.target.value)}
                  className="w-full p-2 border border-stone-200 rounded-lg text-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={editGuestEmail}
                    onChange={(e) => setEditGuestEmail(e.target.value)}
                    className="w-full p-2 border border-stone-200 rounded-lg text-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">WhatsApp / Phone</label>
                  <input
                    type="text"
                    value={editGuestPhone}
                    onChange={(e) => setEditGuestPhone(e.target.value)}
                    className="w-full p-2 border border-stone-200 rounded-lg text-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Check-in Date</label>
                  <input
                    type="date"
                    required
                    value={editCheckIn}
                    onChange={(e) => setEditCheckIn(e.target.value)}
                    className="w-full p-2 border border-stone-200 rounded-lg text-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Nights</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={editNights}
                    onChange={(e) => setEditNights(Number(e.target.value))}
                    className="w-full p-2 border border-stone-200 rounded-lg text-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ReservationStatus)}
                    className="w-full p-2 border border-stone-200 rounded-lg text-stone-800"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Checked In">Checked In</option>
                    <option value="Pending">Pending</option>
                    <option value="Checked Out">Checked Out</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Special Requests / Notes</label>
                <textarea
                  rows={2}
                  value={editSpecialRequests}
                  onChange={(e) => setEditSpecialRequests(e.target.value)}
                  className="w-full p-2 border border-stone-200 rounded-lg text-stone-800"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-stone-100">
              <button type="button" onClick={() => setEditingRes(null)} className="px-3 py-1.5 text-xs text-stone-600">Cancel</button>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Booking Modal */}
      {showNewBookingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateBooking} className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2">
                <CalendarCheck className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif font-bold text-base text-stone-900">New Direct / Channel Booking</h3>
              </div>
              <button type="button" onClick={() => setShowNewBookingModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Select Villa</label>
                <select 
                  value={bookingPropId || (properties[0]?.id || '')} 
                  onChange={(e) => setBookingPropId(e.target.value)}
                  className="w-full p-2 border border-stone-200 rounded-lg text-stone-800"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.area})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full p-2 border border-stone-200 rounded-lg text-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Channel Source</label>
                  <select 
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full p-2 border border-stone-200 rounded-lg text-stone-800"
                  >
                    <option value="Direct">Direct Booking (0% Commission)</option>
                    <option value="WhatsApp">WhatsApp Direct</option>
                    <option value="Instagram">Instagram Direct</option>
                    <option value="Airbnb">Airbnb (15% Commission)</option>
                    <option value="Booking.com">Booking.com (15% Commission)</option>
                    <option value="Agoda">Agoda (15% Commission)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full p-2 border border-stone-200 rounded-lg text-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+61 400 123 456"
                    className="w-full p-2 border border-stone-200 rounded-lg text-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Check-in Date</label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full p-2 border border-stone-200 rounded-lg text-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Nights</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={nights}
                    onChange={(e) => setNights(Number(e.target.value))}
                    className="w-full p-2 border border-stone-200 rounded-lg text-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Guests</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                    className="w-full p-2 border border-stone-200 rounded-lg text-stone-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-stone-100">
              <button type="button" onClick={() => setShowNewBookingModal(false)} className="px-3 py-1.5 text-xs text-stone-600">Cancel</button>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
              >
                Create Reservation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
