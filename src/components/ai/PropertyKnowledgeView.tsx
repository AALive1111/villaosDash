import React, { useState } from 'react';
import { 
  BrainCircuit, Save, CheckCircle2, Clock, Users, Shield, 
  Sparkles, Wrench, DollarSign, Calendar 
} from 'lucide-react';
import { useApp, formatIDR } from '../../context/AppContext';

export const PropertyKnowledgeView: React.FC = () => {
  const { properties, updatePropertyRules, selectedPropertyId } = useApp();
  const [selectedPropId, setSelectedPropId] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Derive current property strictly from active workspace's scoped properties
  const currentProperty = React.useMemo(() => {
    if (selectedPropId) {
      const found = properties.find(p => p.id === selectedPropId);
      if (found) return found;
    }
    if (selectedPropertyId) {
      const found = properties.find(p => p.id === selectedPropertyId);
      if (found) return found;
    }
    return properties.find(p => !p.isArchived) || null;
  }, [properties, selectedPropId, selectedPropertyId]);

  const defaultRules = {
    checkInTime: '15:00',
    checkOutTime: '11:00',
    quietHours: '22:00 – 07:00',
    earlyCheckInFee: 0,
    lateCheckOutFee: 0,
    poolCleaningDays: [],
    preferredCleaner: '',
    preferredTechnician: '',
    wifiProvider: '',
    wifiPassword: '',
    accessCode: '',
  };

  const [formData, setFormData] = useState(currentProperty?.rules || defaultRules);

  React.useEffect(() => {
    if (currentProperty) {
      setFormData(currentProperty.rules || defaultRules);
    }
  }, [currentProperty]);

  if (!currentProperty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-stone-500">
        <BrainCircuit className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-semibold text-stone-700">No properties found to configure knowledge.</p>
        <p className="text-xs text-stone-400 mt-1">Add or select a villa in this workspace to configure AI operational rules.</p>
      </div>
    );
  }

  const handleSelectProperty = (id: string) => {
    setSelectedPropId(id);
    const prop = properties.find(p => p.id === id);
    if (prop) setFormData(prop.rules);
    setSavedSuccess(false);
  };

  const handleSave = () => {
    updatePropertyRules(selectedPropId, formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-serif font-bold text-stone-900">AI Property Knowledge & Memory</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              Operational Memory
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Define ground-truth property rules, fee schedules, and staff preferences that the AI engine strictly enforces.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Property Knowledge</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Knowledge updated! VillaOS AI will use these exact parameters for guest replies and pricing calculations.</span>
        </div>
      )}

      {/* Property Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b border-stone-200">
        {properties.map(p => (
          <button
            key={p.id}
            onClick={() => handleSelectProperty(p.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-colors whitespace-nowrap border-b-2 -mb-px flex items-center space-x-2 ${
              selectedPropId === p.id
                ? 'border-amber-600 text-amber-700 bg-amber-50/40'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>{p.name}</span>
            <span className="text-[10px] text-stone-400 font-normal">({p.area})</span>
          </button>
        ))}
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timings & Capacity */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm border-b border-stone-100 pb-3">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Check-in & Hours</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Standard Check-in Time</label>
              <input
                type="text"
                value={formData.checkInTime}
                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">e.g. 15:00</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Standard Check-out Time</label>
              <input
                type="text"
                value={formData.checkOutTime}
                onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">e.g. 11:00</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Quiet Hours Policy</label>
            <input
              type="text"
              value={formData.quietHours}
              onChange={(e) => setFormData({ ...formData, quietHours: e.target.value })}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
            <span className="text-[10px] text-stone-400 mt-1 block">AI reminds late-arriving guests in WhatsApp</span>
          </div>
        </div>

        {/* Fees & Add-ons */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm border-b border-stone-100 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Early/Late Departure Fees (IDR)</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Early Check-in Fee</label>
              <input
                type="number"
                value={formData.earlyCheckInFee}
                onChange={(e) => setFormData({ ...formData, earlyCheckInFee: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                {formatIDR(formData.earlyCheckInFee)}
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Late Check-out Fee</label>
              <input
                type="number"
                value={formData.lateCheckOutFee}
                onChange={(e) => setFormData({ ...formData, lateCheckOutFee: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                {formatIDR(formData.lateCheckOutFee)}
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
            When a guest messages "Can I check in early?", the AI checks cleaner completion and automatically quotes this exact fee.
          </div>
        </div>

        {/* Maintenance & Service Staff Preferences */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-4 md:col-span-2">
          <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm border-b border-stone-100 pb-3">
            <Wrench className="w-4 h-4 text-sky-600" />
            <span>Assigned Operations Staff & Cadence</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Preferred Housekeeper</label>
              <input
                type="text"
                value={formData.preferredCleaner}
                onChange={(e) => setFormData({ ...formData, preferredCleaner: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">Receives automatic WhatsApp dispatch</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Preferred AC / General Tech</label>
              <input
                type="text"
                value={formData.preferredTechnician}
                onChange={(e) => setFormData({ ...formData, preferredTechnician: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">Dispatched for high-priority tickets</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Pool Cleaning Schedule</label>
              <input
                type="text"
                value={formData.poolCleaningDays.join(', ')}
                onChange={(e) => setFormData({ ...formData, poolCleaningDays: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">Comma-separated days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
