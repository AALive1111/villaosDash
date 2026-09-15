import React, { useState } from 'react';
import { 
  Search, Filter, Users, Star, MessageSquare, Plus, 
  MapPin, Heart, Shield, Check, Phone, Mail, Calendar, 
  Sparkles, DollarSign, X, Tag 
} from 'lucide-react';
import { useApp, formatIDR } from '../../context/AppContext';
import { Guest, GuestTag } from '../../types';

export const GuestCrmView: React.FC = () => {
  const { guests, setActiveTab, setActiveConversationId } = useApp();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  
  // Update selection if guests change
  React.useEffect(() => {
    if (selectedGuest && !guests.some(g => g.id === selectedGuest.id)) {
      setSelectedGuest(guests[0] || null);
    } else if (!selectedGuest && guests.length > 0) {
      setSelectedGuest(guests[0]);
    }
  }, [guests, selectedGuest]);
  const [editingNotes, setEditingNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const allTags = ['All', 'VIP', 'Returning Guest', 'High Spender', 'Couple', 'Family', 'Digital Nomad', 'Honeymoon'];

  const filteredGuests = guests.filter(g => {
    const matchesSearch = 
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase()) ||
      g.nationality.toLowerCase().includes(search.toLowerCase()) ||
      (g.propertiesStayed || []).some(p => p.toLowerCase().includes(search.toLowerCase()));
    const matchesTag = selectedTag === 'All' || g.tags.includes(selectedTag as GuestTag);
    return matchesSearch && matchesTag;
  });

  const handleStartEdit = (g: Guest) => {
    setEditingNotes(g.notes);
    setIsEditing(true);
  };

  const handleSaveNotes = () => {
    if (!selectedGuest) return;
    selectedGuest.notes = editingNotes;
    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleOpenChat = () => {
    setActiveConversationId('conv-1');
    setActiveTab('inbox');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-serif font-bold text-stone-900">Guest CRM & VIP Profiles</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              Personalized Hospitality
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Cross-property guest profiles, lifetime spend in IDR, dietary preferences, and private host notes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-stone-600 bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-2xs">
            {guests.length} Profiles Tracked
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Guest private notes updated and synchronized across all staff tablets!</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search guests by name, email, nationality, or villa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Tag Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Split: Guest List (5 cols) & VIP Detail Card (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Guest Directory (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden flex flex-col max-h-[750px]">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <span className="text-xs font-bold text-stone-700">Guest Directory ({filteredGuests.length})</span>
            <span className="text-[10px] text-stone-400">Click to inspect dossier</span>
          </div>

          <div className="overflow-y-auto divide-y divide-stone-100">
            {filteredGuests.map(guest => {
              const isSelected = selectedGuest?.id === guest.id;
              return (
                <div
                  key={guest.id}
                  onClick={() => {
                    setSelectedGuest(guest);
                    setIsEditing(false);
                  }}
                  className={`p-4 transition-colors cursor-pointer flex items-center space-x-3 ${
                    isSelected ? 'bg-amber-50/60 border-l-4 border-amber-600' : 'hover:bg-stone-50'
                  }`}
                >
                  <img
                    src={guest.avatar}
                    alt={guest.name}
                    className="w-11 h-11 rounded-full object-cover border border-stone-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-stone-900 truncate">{guest.name}</h4>
                      <span className="text-[10px] font-mono text-stone-400">{guest.countryCode}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 truncate">{guest.email}</p>
                    <div className="flex items-center space-x-1.5 mt-1.5 flex-wrap gap-y-1">
                      {guest.tags.slice(0, 2).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800"
                        >
                          {t}
                        </span>
                      ))}
                      <span className="text-[10px] text-stone-400 font-semibold">
                        {guest.staysCount} {guest.staysCount === 1 ? 'stay' : 'stays'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Dossier Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-6 flex flex-col justify-between">
          {selectedGuest ? (
            <div className="space-y-6">
              {/* Profile Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedGuest.avatar}
                    alt={selectedGuest.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-stone-200 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-serif font-bold text-lg text-stone-900">{selectedGuest.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                        {selectedGuest.nationality}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 flex items-center space-x-3 mt-1">
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                        <span>{selectedGuest.email}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        <span>{selectedGuest.phone}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleOpenChat}
                  className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Message</span>
                </button>
              </div>

              {/* KPI Badges */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Lifetime Spend</span>
                  <div className="text-sm font-bold text-stone-900 mt-0.5">
                    {formatIDR(selectedGuest.totalSpend, true)}
                  </div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Total Stays</span>
                  <div className="text-sm font-bold text-stone-900 mt-0.5">
                    {selectedGuest.staysCount} Reservations
                  </div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Avg Length</span>
                  <div className="text-sm font-bold text-stone-900 mt-0.5">
                    {selectedGuest.averageStayDays} Nights / Stay
                  </div>
                </div>
              </div>

              {/* Tags and Preferences */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Guest Tags & Archetypes
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedGuest.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 border border-amber-200 text-amber-900 flex items-center space-x-1"
                      >
                        <Tag className="w-3 h-3 text-amber-600" />
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Hospitality Preferences & Perks
                  </h4>
                  <div className="space-y-1.5">
                    {selectedGuest.preferences.map((pref, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>{pref}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Villas Stayed
                  </h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {selectedGuest.propertiesStayed.map((prop, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 font-semibold">
                        {prop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Private Staff Notes */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">Private Host & Concierge Notes</span>
                  {!isEditing ? (
                    <button
                      onClick={() => handleStartEdit(selectedGuest)}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800"
                    >
                      Edit Notes
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="text-xs text-stone-500 hover:text-stone-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        className="px-2.5 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <textarea
                    rows={3}
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-xs text-stone-700 leading-relaxed font-sans">
                    {selectedGuest.notes}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-stone-400">
              Select a guest profile to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
