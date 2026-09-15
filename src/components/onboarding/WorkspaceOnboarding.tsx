import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, User, MapPin, ArrowRight, Loader2, X } from 'lucide-react';

export const WorkspaceOnboarding: React.FC = () => {
  const { onboardWorkspace, workspaces, isWorkspaceOnboardingOpen, setIsWorkspaceOnboardingOpen } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    businessType: 'Private Villa Owner' as any,
    operationalArea: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onboardWorkspace(formData);
      setIsSubmitting(false);
    }, 500);
  };

  const handleClose = () => {
    setIsWorkspaceOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-stone-50 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center text-white">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-serif text-stone-900">Create New Workspace</h1>
                <p className="text-sm text-stone-500">Set up your business workspace.</p>
              </div>
            </div>
            {(workspaces.length > 0 || isWorkspaceOnboardingOpen) && (
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Business Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    required
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-11 pr-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                    placeholder="e.g. Uluwatu Luxury Villas"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Owner Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    required
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-11 pr-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                    placeholder="Your Full Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Business Type</label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value as any })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all appearance-none"
                >
                  <option value="Private Villa Owner">Private Villa Owner</option>
                  <option value="Villa Management Company">Villa Management Company</option>
                  <option value="Guest House / Boutique Property">Guest House / Boutique Property</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Operational Area</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    required
                    type="text"
                    value={formData.operationalArea}
                    onChange={(e) => setFormData({ ...formData, operationalArea: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-11 pr-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                    placeholder="e.g. Uluwatu & Ungasan"
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
                  <span>Create Workspace</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
        <div className="bg-stone-50 p-6 border-t border-stone-100">
          <p className="text-[10px] text-stone-400 uppercase tracking-widest text-center font-bold">
            Powered by VillaOS Intelligence
          </p>
        </div>
      </div>
    </div>
  );
};
