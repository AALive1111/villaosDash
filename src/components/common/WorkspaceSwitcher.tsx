import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, ChevronDown, Plus, Check, Briefcase, Globe } from 'lucide-react';

export const WorkspaceSwitcher: React.FC = () => {
  const { workspaces, activeWorkspaceId, switchWorkspace, setIsWorkspaceOnboardingOpen } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition-all border border-transparent hover:border-stone-200"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${activeWorkspace?.isDemo ? 'bg-orange-500' : 'bg-stone-900'}`}>
          {activeWorkspace?.isDemo ? <Globe className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
        </div>
        <div className="text-left hidden md:block">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">
            {activeWorkspace?.isDemo ? 'Demo Mode' : 'Workspace'}
          </p>
          <div className="flex items-center space-x-1">
            <span className="text-sm font-bold text-stone-900 truncate max-w-[120px]">
              {activeWorkspace?.businessName || 'Select Workspace'}
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
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
            <div className="px-4 py-2 border-b border-stone-100 mb-2">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Your Workspaces</p>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => {
                    switchWorkspace(ws.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-stone-50 transition-colors ${
                    activeWorkspaceId === ws.id ? 'bg-stone-50' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${ws.isDemo ? 'bg-orange-400' : 'bg-stone-800'}`}>
                    {ws.isDemo ? <Globe className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-stone-900 truncate">{ws.businessName}</p>
                    <p className="text-[10px] text-stone-500 truncate">{ws.operationalArea}</p>
                  </div>
                  {activeWorkspaceId === ws.id && (
                    <Check className="w-4 h-4 text-green-600 shrink-0 ml-auto" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-stone-100 px-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsWorkspaceOnboardingOpen(true);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all font-medium text-sm"
              >
                <div className="w-8 h-8 rounded-lg border-2 border-dashed border-stone-200 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <span>Create New Workspace</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
