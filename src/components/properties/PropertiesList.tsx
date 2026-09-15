import React, { useState } from 'react';
import { 
  X, Star, MapPin, Users, Bed, Bath, Globe, Sparkles, 
  CheckCircle2, Calendar, DollarSign, Wrench, Shield, ArrowRight, 
  ExternalLink, Plus, Archive, RotateCcw, Trash2, Edit3, Home,
  QrCode, Printer, Eye, Copy, Check
} from 'lucide-react';
import { Property } from '../../types';
import { useApp, formatIDR } from '../../context/AppContext';
import { PropertyQrModal } from './PropertyQrModal';

export const PropertyDetailModal: React.FC<{ property: Property; onClose: () => void }> = ({ property, onClose }) => {
  const { 
    setActiveTab, 
    socialAccounts, 
    socialAttributions, 
    socialLeads,
    connectSocialAccount,
    disconnectSocialAccount,
    syncSocialAccount,
    archiveProperty,
    deleteProperty,
    setIsPropertyOnboardingOpen,
    setEditingProperty
  } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'channels' | 'amenities' | 'rules' | 'ai' | 'social' | 'qr'>('overview');

  const propertyAccounts = socialAccounts.filter(a => a.propertyId === property.id);
  const propertyLeads = socialLeads.filter(l => l.propertyId === property.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Hero Banner */}
        <div className="relative h-64 sm:h-72 w-full bg-stone-900 overflow-hidden">
          <img
            src={property.image}
            alt={property.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & Badges */}
          <div className="absolute bottom-4 left-4 sm:left-6 right-4 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-stone-950">
                  {property.area} Luxury
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                  {property.status.toUpperCase()}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold mt-1 text-white">{property.name}</h2>
              <div className="flex items-center space-x-2 text-xs text-stone-300 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{property.location}</span>
                <span>•</span>
                <span className="flex items-center space-x-1 text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{property.rating}</span>
                  <span className="text-stone-400">({property.reviewCount} reviews)</span>
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-stone-300">Nightly Rate</div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                {formatIDR(property.dailyRate)}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Subtabs */}
        <div className="flex items-center space-x-2 px-6 border-b border-stone-200 bg-stone-50/70 overflow-x-auto text-xs font-bold">
          {[
            { id: 'overview', label: 'Overview & Stats' },
            { id: 'qr', label: 'Guest QR Portal 📲' },
            { id: 'channels', label: 'Connected Channels (7)' },
            { id: 'social', label: 'Social Media' },
            { id: 'amenities', label: 'Amenities & Photos' },
            { id: 'rules', label: 'Rules & Check-in' },
            { id: 'ai', label: 'AI Operations & Strategy' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'border-amber-600 text-amber-800 bg-amber-50/50'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-[11px] font-semibold text-stone-500">Monthly Revenue</div>
                  <div className="text-base font-bold text-stone-900 mt-1">{formatIDR(property.monthlyRevenue)}</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">+8.4% vs last mo</div>
                </div>
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-[11px] font-semibold text-stone-500">Occupancy Rate</div>
                  <div className="text-base font-bold text-emerald-700 mt-1">{property.occupancyRate}%</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">Bali avg: 72%</div>
                </div>
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-[11px] font-semibold text-stone-500">Specs</div>
                  <div className="text-xs font-bold text-stone-900 mt-1">
                    {property.bedrooms} Bed • {property.bathrooms} Bath • Max {property.maxGuests} Guests
                  </div>
                </div>
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-[11px] font-semibold text-stone-500">Current Status</div>
                  <div className="text-xs font-bold text-stone-900 mt-1 capitalize">
                    {property.currentGuest ? `Occupied by ${property.currentGuest.name}` : 'Vacant (Pre-arrival Prep)'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-serif font-bold text-sm text-stone-900 mb-1.5">Property Description</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{property.description}</p>
              </div>

              {/* Guest status */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[10px] font-bold uppercase text-stone-400">Current Guest In-House</div>
                  {property.currentGuest ? (
                    <div className="mt-1 font-semibold text-stone-900">
                      {property.currentGuest.name} (via {property.currentGuest.channel}) • Checkout: {property.currentGuest.checkOutDate}
                    </div>
                  ) : (
                    <div className="mt-1 text-stone-500 italic">No guest in-house today</div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-stone-400">Upcoming Check-in</div>
                  {property.nextCheckIn ? (
                    <div className="mt-1 font-semibold text-stone-900">
                      {property.nextCheckIn.guestName} on {property.nextCheckIn.date} at {property.nextCheckIn.time}
                    </div>
                  ) : (
                    <div className="mt-1 text-stone-500 italic">No incoming check-in scheduled</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'channels' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-stone-900">Connected Channels & OTAs</h4>
                  <p className="text-xs text-stone-500">2-way rates, calendar synchronization, and automated booking retrieval.</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  All Feeds Synced
                </span>
              </div>

              <div className="space-y-2.5">
                {property.connectedChannels.map((c, i) => (
                  <div key={i} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center font-bold text-xs text-stone-800">
                        <Globe className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">{c.channel}</div>
                        <div className="text-[11px] text-stone-500">Sync status: {c.syncStatus} • {c.lastSync}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Connected</span>
                      </span>
                      <button 
                        onClick={() => alert(`Synchronizing ${c.channel} 2-way feed...`)}
                        className="text-xs font-semibold text-stone-600 hover:text-stone-900 px-2 py-1 rounded bg-white border border-stone-200 shadow-2xs"
                      >
                        Sync Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'amenities' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-serif font-bold text-sm text-stone-900 mb-2">Hospitality Amenities</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {property.amenities.map((amenity, i) => (
                    <div key={i} className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/80 text-xs font-medium text-stone-800 flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-serif font-bold text-sm text-stone-900 mb-2">Property Gallery</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.gallery.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Gallery ${i}`}
                      className="w-full h-32 object-cover rounded-xl border border-stone-200"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'rules' && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-sm text-stone-900">Operating Rules & Staff</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="font-bold text-stone-900">Hours & Fees</div>
                  <div>Check-in: <strong>{property.rules.checkInTime}</strong></div>
                  <div>Check-out: <strong>{property.rules.checkOutTime}</strong></div>
                  <div>Early check-in fee: <strong>{formatIDR(property.rules.earlyCheckInFee)}</strong></div>
                  <div>Late check-out fee: <strong>{formatIDR(property.rules.lateCheckOutFee)}</strong></div>
                  <div>Quiet hours: <strong>{property.rules.quietHours}</strong></div>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="font-bold text-stone-900">Assigned Team</div>
                  <div>Preferred Cleaner: <strong>{property.rules.preferredCleaner}</strong></div>
                  <div>Preferred Tech: <strong>{property.rules.preferredTechnician}</strong></div>
                  <div>Pool Cleaning Days: <strong>{property.rules.poolCleaningDays.join(', ')}</strong></div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>AI Revenue & Optimization Insight</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  "For {property.name}, weekend rates can sustain a +10% to +12% lift for the next 6 weeks. Direct bookings from Instagram DM have the highest margin (0% OTA commission saved IDR 4.8M this quarter)."
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                <span>Want AI to draft social content for this property?</span>
                <button
                  onClick={() => {
                    onClose();
                    setActiveTab('contentStudio');
                  }}
                  className="font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1"
                >
                  <span>Open Content Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'social' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
                <div>
                  <h3 className="font-bold text-stone-900 font-serif">Connected Accounts</h3>
                  <div className="text-xs text-stone-500 mt-1">
                    {propertyAccounts.length} accounts connected to {property.name}
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    setActiveTab('social');
                  }}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Open Social Media
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-[11px] font-semibold text-stone-500">Total Followers</div>
                  <div className="text-base font-bold text-stone-900 mt-1">
                    {propertyAccounts.reduce((sum, a) => sum + a.followers, 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-[11px] font-semibold text-stone-500">Avg Engagement</div>
                  <div className="text-base font-bold text-emerald-700 mt-1">
                    {propertyAccounts.length > 0 ? (propertyAccounts.reduce((sum, a) => sum + a.engagementRate, 0) / propertyAccounts.length).toFixed(1) : 0}%
                  </div>
                </div>
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-[11px] font-semibold text-stone-500">Social Leads</div>
                  <div className="text-base font-bold text-amber-700 mt-1">
                    {propertyLeads.length}
                  </div>
                </div>
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-[11px] font-semibold text-stone-500">Est. Pipeline</div>
                  <div className="text-base font-bold text-stone-900 mt-1">
                    {formatIDR(propertyLeads.reduce((sum, l) => sum + l.estimatedValue, 0), true)}
                  </div>
                </div>
              </div>

              <div className="mt-6 border border-stone-200 rounded-xl overflow-hidden bg-white">
                <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
                  <h4 className="font-bold text-stone-900 text-sm">Account Integration Details</h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => connectSocialAccount(property.id, 'Instagram')}
                      className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-colors"
                    >
                      + Connect Instagram
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-stone-100">
                  {propertyAccounts.length === 0 ? (
                    <div className="p-8 text-center text-stone-500 text-sm">
                      No social accounts connected for this property yet.
                    </div>
                  ) : (
                    propertyAccounts.map(account => (
                      <div key={account.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-stone-900">{account.platform}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              account.status === 'Connected' ? 'bg-emerald-100 text-emerald-700' :
                              account.status === 'Demo Connection' ? 'bg-amber-100 text-amber-700' :
                              account.status === 'Syncing' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                              account.status === 'Reauth Required' || account.status === 'Token Expired' || account.status === 'Error' ? 'bg-red-100 text-red-700' :
                              'bg-stone-100 text-stone-700'
                            }`}>
                              {account.status === 'Connected' ? 'LIVE' : account.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 mt-1 flex flex-col space-y-1">
                            <div className="flex items-center space-x-3">
                              <span className="font-medium">{account.handle}</span>
                              <span>•</span>
                              <span>{account.followers.toLocaleString()} followers</span>
                              <span>•</span>
                              <span className={account.status === 'Error' || account.status === 'Reauth Required' ? 'text-red-500' : ''}>
                                Sync: {account.lastSync}
                              </span>
                            </div>
                            {account.lastError && (
                              <div className="text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded inline-block">
                                Error: {account.lastError}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => syncSocialAccount(account.id)}
                            className="px-3 py-1.5 border border-stone-200 hover:bg-stone-50 rounded-lg text-xs font-semibold text-stone-700 transition-colors"
                          >
                            Sync Now
                          </button>
                          <button 
                            onClick={() => disconnectSocialAccount(account.id)}
                            className="px-3 py-1.5 border border-red-200 hover:bg-red-50 rounded-lg text-xs font-semibold text-red-700 transition-colors"
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'qr' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-2xl p-6 border border-stone-800 shadow-xl">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* QR Preview Box */}
                  <div className="bg-white p-3 rounded-2xl shrink-0 shadow-lg text-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}?guestPortal=true&propertyId=${property.id}`)}`}
                      alt={`QR Code for ${property.name}`}
                      className="w-40 h-40 rounded-lg object-contain"
                    />
                    <span className="text-[10px] text-stone-600 font-mono font-bold block mt-1.5">
                      {property.id}
                    </span>
                  </div>

                  {/* QR Details & Actions */}
                  <div className="flex-1 space-y-3 text-center md:text-left">
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Zero-App In-Villa Experience</span>
                    </div>

                    <h3 className="text-xl font-serif font-bold text-white">
                      Instant Guest QR Portal
                    </h3>

                    <p className="text-xs text-stone-300 leading-relaxed">
                      Placed as a bedside or living room tent card. Guests scan with any camera to immediately access Wi-Fi credentials, request housekeeping, report maintenance, chat with your team, and view check-out instructions.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}?guestPortal=true&propertyId=${property.id}`;
                          window.open(url, '_blank');
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold flex items-center space-x-2 transition-colors shadow-xs"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Launch Guest View</span>
                      </button>

                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-stone-700 transition-colors"
                      >
                        <Printer className="w-4 h-4 text-stone-400" />
                        <span>Print In-Villa Tent Card</span>
                      </button>

                      <button
                        onClick={() => {
                          const url = `${window.location.origin}?guestPortal=true&propertyId=${property.id}`;
                          navigator.clipboard.writeText(url);
                          alert('Copied Guest Portal URL to clipboard!');
                        }}
                        className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-medium border border-stone-700 transition-colors"
                      >
                        Copy Portal Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* In-Villa Information Synchronized */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                  <div className="font-bold text-stone-900 flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Security & Anti-Spoofing</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    Signed with HMAC-SHA256 token scoped exclusively to workspace <strong>{property.workspaceId}</strong> and property <strong>{property.id}</strong>. Financial data, owner payouts, and reservations of other villas are strictly blocked from guest payloads.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                  <div className="font-bold text-stone-900 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Operational Automation</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    Guest messages in the portal route into your VillaOS Inbox. AI automatically classifies housekeeping requests (notifying {property.rules.preferredCleaner}) and maintenance tickets (dispatching {property.rules.preferredTechnician}) for owner approval.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setEditingProperty(property);
                setIsPropertyOnboardingOpen(true);
                onClose();
              }}
              className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 rounded-xl text-xs font-bold text-stone-800 transition-colors flex items-center space-x-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-stone-600" />
              <span>Edit Property</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to archive ${property.name}? It will be hidden from active operations and switcher.`)) {
                  archiveProperty(property.id);
                  onClose();
                }
              }}
              className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-amber-50 rounded-xl text-xs font-bold text-amber-800 transition-colors flex items-center space-x-1.5"
            >
              <Archive className="w-3.5 h-3.5 text-amber-600" />
              <span>Archive</span>
            </button>
            <button
              onClick={() => {
                deleteProperty(property.id);
                onClose();
              }}
              className="px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 rounded-xl text-xs font-bold text-red-700 transition-colors flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              <span>Delete</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <span className="text-xs text-stone-400">ID: {property.id}</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PropertiesList: React.FC = () => {
  const { properties, archivedProperties, setSelectedPropertyId, selectedPropertyId, setIsPropertyOnboardingOpen, setEditingProperty, restoreProperty } = useApp();
  const [filterArea, setFilterArea] = useState<string>('All');
  const [qrModalProperty, setQrModalProperty] = useState<Property | null>(null);

  const areas = ['All', 'Seminyak', 'Canggu', 'Ubud', 'Uluwatu', 'Pererenan'];

  const filteredProperties = filterArea === 'All'
    ? properties
    : properties.filter(p => p.area === filterArea);

  const selectedProp = properties.find(p => p.id === selectedPropertyId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900">Property Portfolio</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage your Bali luxury villas, connected OTA channels, rates, and current guest occupancy.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setEditingProperty(null);
              setIsPropertyOnboardingOpen(true);
            }}
            className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Property</span>
          </button>
        </div>
      </div>

      {/* Area Filters */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {areas.map(area => (
          <button
            key={area}
            onClick={() => setFilterArea(area)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterArea === area
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      {/* Property Cards Grid */}
      {filteredProperties.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-stone-200 text-center space-y-4">
          <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-base">No active properties found</h3>
            <p className="text-xs text-stone-500 mt-1">Get started by adding your first luxury villa property.</p>
          </div>
          <button
            onClick={() => {
              setEditingProperty(null);
              setIsPropertyOnboardingOpen(true);
            }}
            className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
          >
            + Add New Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <div
              key={property.id}
              onClick={() => setSelectedPropertyId(property.id)}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col group"
            >
              {/* Image & Badges */}
              <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                <img
                  src={property.image}
                  alt={property.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-stone-900 backdrop-blur-xs">
                    {property.area}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-xs ${
                    property.status === 'occupied' 
                      ? 'bg-emerald-500/90 text-white' 
                      : 'bg-amber-500/90 text-white'
                  }`}>
                    {property.status}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-base leading-tight">{property.name}</h3>
                    <div className="flex items-center space-x-1 text-[11px] text-stone-200 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold">{property.rating}</span>
                      <span className="text-stone-300">({property.reviewCount})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white">{formatIDR(property.dailyRate, true)}</div>
                    <div className="text-[10px] text-stone-300">/ night</div>
                  </div>
                </div>
              </div>

              {/* Body Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2 text-xs">
                  {/* Current & Next Guest */}
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-500 font-medium">Current Guest:</span>
                      <span className="font-bold text-stone-800">
                        {property.currentGuest ? property.currentGuest.name : 'Vacant'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-500 font-medium">Next Arrival:</span>
                      <span className="font-bold text-stone-800">
                        {property.nextCheckIn ? `${property.nextCheckIn.guestName} (${property.nextCheckIn.date})` : 'None'}
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/60">
                      <div className="text-[10px] text-stone-500">Occupancy</div>
                      <div className="font-bold text-xs text-emerald-700">{property.occupancyRate}%</div>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/60">
                      <div className="text-[10px] text-stone-500">Month Revenue</div>
                      <div className="font-bold text-xs text-stone-900">{formatIDR(property.monthlyRevenue, true)}</div>
                    </div>
                  </div>
                </div>

                {/* Connected Channel Pills & Actions */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQrModalProperty(property);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/30 flex items-center space-x-1.5 text-xs font-bold transition-colors"
                      title="Open In-Villa Guest QR Portal"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[11px]">Guest QR</span>
                    </button>
                    <div className="hidden sm:flex items-center space-x-1 text-[10px] text-stone-400">
                      <Globe className="w-3 h-3 text-stone-400" />
                      <span>7 Ch</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-700 group-hover:text-amber-800 flex items-center space-x-1">
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Archived Properties Section */}
      {archivedProperties.length > 0 && (
        <div className="mt-12 space-y-4 pt-6 border-t border-stone-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-stone-700 flex items-center space-x-2">
              <Archive className="w-4 h-4 text-stone-500" />
              <span>Archived Properties ({archivedProperties.length})</span>
            </h3>
            <span className="text-xs text-stone-400">Historical data preserved</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedProperties.map(prop => (
              <div key={prop.id} className="bg-stone-50 rounded-xl border border-stone-200 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={prop.image} alt={prop.name} className="w-12 h-12 rounded-lg object-cover grayscale" />
                  <div>
                    <h4 className="font-bold text-stone-800 text-xs">{prop.name}</h4>
                    <p className="text-[10px] text-stone-500">{prop.location}</p>
                  </div>
                </div>
                <button
                  onClick={() => restoreProperty(prop.id)}
                  className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 rounded-lg text-xs font-bold text-stone-700 flex items-center space-x-1 shadow-2xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
                  <span>Restore</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedProp && (
        <PropertyDetailModal
          property={selectedProp}
          onClose={() => setSelectedPropertyId(null)}
        />
      )}

      {/* Direct Property QR Modal */}
      {qrModalProperty && (
        <PropertyQrModal
          property={qrModalProperty}
          isOpen={true}
          onClose={() => setQrModalProperty(null)}
          onPreviewPortal={(propId) => {
            setQrModalProperty(null);
            const url = `${window.location.origin}?guestPortal=true&propertyId=${propId}`;
            window.open(url, '_blank');
          }}
        />
      )}
    </div>
  );
};
