import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Home, ChevronDown, Plus, Check, MapPin, Archive } from 'lucide-react';

export const PropertySwitcher: React.FC = () => {
  const { properties, selectedPropertyId, setSelectedPropertyId, activeWorkspace, setIsPropertyOnboardingOpen, setEditingProperty } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  if (activeWorkspace?.isDemo && !selectedPropertyId) {
    // If demo and nothing selected, maybe default to "All Properties" view
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition-all border border-transparent hover:border-stone-200"
      >
        <div className="w-8 h-8 rounded-lg bg-[#FEFAE0] flex items-center justify-center text-[#606C38]">
          <Home className="w-4 h-4" />
        </div>
        <div className="text-left hidden lg:block">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">
            Property
          </p>
          <div className="flex items-center space-x-1">
            <span className="text-sm font-bold text-stone-900 truncate max-w-[150px]">
              {selectedProperty?.name || 'All Properties'}
            </span>
            <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
            <div className="px-4 py-2 border-b border-stone-100 mb-2 flex items-center justify-between">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Select Property</p>
              <button 
                onClick={() => setSelectedPropertyId(null)}
                className="text-[10px] font-bold text-[#606C38] uppercase hover:underline"
              >
                Clear
              </button>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedPropertyId(null);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-stone-50 transition-colors ${
                  selectedPropertyId === null ? 'bg-stone-50 font-bold' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400">
                  <Archive className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">All Properties</p>
                  <p className="text-[10px] text-stone-500">View entire portfolio</p>
                </div>
                {selectedPropertyId === null && (
                  <Check className="w-4 h-4 text-[#606C38] shrink-0 ml-auto" />
                )}
              </button>

              {properties.map(prop => (
                <button
                  key={prop.id}
                  onClick={() => {
                    setSelectedPropertyId(prop.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-stone-50 transition-colors ${
                    selectedPropertyId === prop.id ? 'bg-stone-50' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    <img src={prop.image} alt={prop.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-stone-900 truncate">{prop.name}</p>
                    <p className="text-[10px] text-stone-500 flex items-center">
                      <MapPin className="w-2 h-2 mr-1" />
                      {prop.location}
                    </p>
                  </div>
                  {selectedPropertyId === prop.id && (
                    <Check className="w-4 h-4 text-[#606C38] shrink-0 ml-auto" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-stone-100 px-2">
              <button
                onClick={() => {
                  setEditingProperty(null);
                  setIsPropertyOnboardingOpen(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all font-medium text-sm"
              >
                <div className="w-8 h-8 rounded-lg border-2 border-dashed border-stone-200 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <span>Add New Property</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
