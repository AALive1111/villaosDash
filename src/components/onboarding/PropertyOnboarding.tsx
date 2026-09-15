import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Home, MapPin, Bed, Bath, Users, Clock, DollarSign, List, Image as ImageIcon, ArrowRight, Loader2, X } from 'lucide-react';

export const PropertyOnboarding: React.FC = () => {
  const { createProperty, editProperty, activeWorkspace, properties, setIsPropertyOnboardingOpen, editingProperty, setEditingProperty } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: editingProperty?.name || '',
    type: 'Villa',
    location: editingProperty?.location || '',
    area: editingProperty?.area || 'Seminyak',
    bedrooms: editingProperty?.bedrooms || 3,
    bathrooms: editingProperty?.bathrooms || 3,
    maxGuests: editingProperty?.maxGuests || 6,
    checkInTime: editingProperty?.rules?.checkInTime || '15:00',
    checkOutTime: editingProperty?.rules?.checkOutTime || '11:00',
    dailyRate: editingProperty?.dailyRate || 2500000,
    cleaningFee: 300000,
    houseRules: 'No smoking indoors. Quiet hours 10pm-7am.',
    image: editingProperty?.image || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
  });

  React.useEffect(() => {
    if (editingProperty) {
      setFormData({
        name: editingProperty.name,
        type: 'Villa',
        location: editingProperty.location,
        area: editingProperty.area || 'Seminyak',
        bedrooms: editingProperty.bedrooms,
        bathrooms: editingProperty.bathrooms,
        maxGuests: editingProperty.maxGuests,
        checkInTime: editingProperty.rules?.checkInTime || '15:00',
        checkOutTime: editingProperty.rules?.checkOutTime || '11:00',
        dailyRate: editingProperty.dailyRate,
        cleaningFee: 300000,
        houseRules: 'No smoking indoors. Quiet hours 10pm-7am.',
        image: editingProperty.image,
      });
    } else {
      setFormData({
        name: '',
        type: 'Villa',
        location: '',
        area: 'Seminyak',
        bedrooms: 3,
        bathrooms: 3,
        maxGuests: 6,
        checkInTime: '15:00',
        checkOutTime: '11:00',
        dailyRate: 2500000,
        cleaningFee: 300000,
        houseRules: 'No smoking indoors. Quiet hours 10pm-7am.',
        image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      });
    }
  }, [editingProperty]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (editingProperty) {
      editProperty(editingProperty.id, {
        name: formData.name,
        location: formData.location,
        area: formData.area,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        maxGuests: formData.maxGuests,
        dailyRate: formData.dailyRate,
        image: formData.image,
        gallery: [formData.image],
        rules: {
          ...editingProperty.rules,
          checkInTime: formData.checkInTime,
          checkOutTime: formData.checkOutTime,
        }
      });
      setEditingProperty(null);
    } else {
      createProperty({
        name: formData.name,
        location: formData.location || `${formData.area}, Bali`,
        area: formData.area,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        maxGuests: formData.maxGuests,
        dailyRate: formData.dailyRate,
        image: formData.image,
        gallery: [formData.image],
        rules: {
          checkInTime: formData.checkInTime,
          checkOutTime: formData.checkOutTime,
          quietHours: '22:00 – 07:00',
          earlyCheckInFee: 300000,
          lateCheckOutFee: 400000,
          poolCleaningDays: ['Monday', 'Thursday'],
          preferredCleaner: 'Staff member',
          preferredTechnician: 'Technical support',
          wifiProvider: 'Fiber Optic',
          wifiPassword: 'balisanctuary',
          accessCode: '1234',
        }
      });
    }
    setIsSubmitting(false);
    setIsPropertyOnboardingOpen(false);
  };

  const handleClose = () => {
    setEditingProperty(null);
    setIsPropertyOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden my-8 animate-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center text-white">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-serif text-stone-900">
                  {editingProperty ? 'Edit Property' : 'Add New Property'}
                </h1>
                <p className="text-sm text-stone-500">
                  {editingProperty ? `Updating ${editingProperty.name}` : `Welcome ${activeWorkspace?.ownerName || 'Host'}, configure your villa in ${activeWorkspace?.businessName || 'VillaOS'}.`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Property Name</label>
                  <div className="relative">
                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-11 pr-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                      placeholder="e.g. Villa Sunset Uluwatu"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Location Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      required
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-11 pr-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                      placeholder="Street name, Village"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Area</label>
                    <select
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all appearance-none"
                    >
                      <option value="Seminyak">Seminyak</option>
                      <option value="Canggu">Canggu</option>
                      <option value="Ubud">Ubud</option>
                      <option value="Uluwatu">Uluwatu</option>
                      <option value="Pererenan">Pererenan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Property Type</label>
                    <input
                      required
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                      placeholder="Villa / Guest House"
                    />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Bedrooms</label>
                    <div className="relative">
                      <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        required
                        type="number"
                        min="1"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 1 })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Baths</label>
                    <div className="relative">
                      <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        required
                        type="number"
                        min="1"
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 1 })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Guests</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        required
                        type="number"
                        min="1"
                        value={formData.maxGuests}
                        onChange={(e) => setFormData({ ...formData, maxGuests: parseInt(e.target.value) || 1 })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Check-in</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        required
                        type="text"
                        value={formData.checkInTime}
                        onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-11 pr-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                        placeholder="15:00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Check-out</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        required
                        type="text"
                        value={formData.checkOutTime}
                        onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-11 pr-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                        placeholder="11:00"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Nightly Rate (IDR)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        required
                        type="number"
                        value={formData.dailyRate}
                        onChange={(e) => setFormData({ ...formData, dailyRate: parseInt(e.target.value) || 0 })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-11 pr-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Cleaning Fee (IDR)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        required
                        type="number"
                        value={formData.cleaningFee}
                        onChange={(e) => setFormData({ ...formData, cleaningFee: parseInt(e.target.value) || 0 })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-11 pr-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">House Rules</label>
                <div className="relative">
                  <List className="absolute left-4 top-4 w-4 h-4 text-stone-400" />
                  <textarea
                    value={formData.houseRules}
                    onChange={(e) => setFormData({ ...formData, houseRules: e.target.value })}
                    rows={3}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-11 pr-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                    placeholder="e.g. No parties, quiet hours after 10pm..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Property Photo URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-11 pr-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-stone-900 hover:bg-stone-800 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{editingProperty ? 'Save Changes' : 'Create Property'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
