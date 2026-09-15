import React, { useState } from 'react';
import { 
  Menu, Bell, Search, Bot, Sparkles, Compass, CheckCircle2, 
  UserCheck, Shield, ChevronDown, Globe, AlertCircle, Moon, Sun
} from 'lucide-react';
import { useApp, NavigationTab } from '../../context/AppContext';
import { UserRole } from '../../types';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { PropertySwitcher } from './PropertySwitcher';

export const Header: React.FC<{ onOpenSidebar: () => void }> = ({ onOpenSidebar }) => {
  const { 
    activeTab, 
    setActiveTab, 
    userRole, 
    setUserRole, 
    notifications, 
    setIsOnboardingOpen, 
    setIsAskAiOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
    activeWorkspace,
    theme,
    toggleTheme
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const unreadNotifications = notifications.filter(n => n.unread).length;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsAskAiOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsAskAiOpen]);

  const roles: UserRole[] = [
    'Owner',
    'Property Manager',
    'Operations Manager',
    'Marketing Manager',
    'Cleaner',
    'Maintenance',
    'Front Desk',
  ];

  const getTabTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard': return 'Executive Dashboard';
      case 'properties': return 'Property Management';
      case 'reservations': return 'Reservations & Channels';
      case 'calendar': return 'Unified Multi-Property Calendar';
      case 'guests': return 'Guest CRM Database';
      case 'inbox': return 'Unified Guest Inbox';
      case 'operations': return 'Operations Command Center';
      case 'cleaning': return 'Housekeeping & Turnovers';
      case 'maintenance': return 'Maintenance & Asset Health';
      case 'social': return 'Social Media Management';
      case 'contentStudio': return 'AI Hospitality Content Studio';
      case 'revenue': return 'Revenue & Dynamic Pricing';
      case 'finance': return 'Financial P&L & Cashflow';
      case 'analytics': return 'Portfolio Analytics';
      case 'aiManager': return 'AI Property Manager Engine';
      case 'settings': return 'System Settings & Knowledge';
      case 'guestPortal': return 'In-Villa Guest QR Portal';
      default: return 'Dashboard';
    }
  };

  return (
    <>
      {activeWorkspace?.isDemo && (
        <div className="bg-orange-50 border-b border-orange-100 px-4 lg:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-orange-800 text-[10px] font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>Viewing Demo Workspace: VillaOS Bali Collection</span>
          </div>
          <div className="hidden sm:flex items-center space-x-3">
            <span className="text-[10px] text-orange-600 font-medium italic">Data is read-only in demo mode</span>
            <button 
              onClick={() => {/* Trigger Workspace Onboarding */}}
              className="bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-bold hover:bg-orange-700 transition-colors"
            >
              Set Up My Business
            </button>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8E6E1] px-4 lg:px-8 py-2 flex items-center justify-between min-h-[64px]">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center space-x-4 lg:space-x-8">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 text-stone-600 hover:text-[#2D2926] rounded-lg hover:bg-[#F2F1ED] focus:outline-none"
            aria-label="Open Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <WorkspaceSwitcher />
            <div className="h-8 w-[1px] bg-stone-200 hidden sm:block" />
            <PropertySwitcher />
          </div>
        </div>

        {/* Center / Right: Global Search & Quick Actions */}
        <div className="flex items-center space-x-2.5 sm:space-x-4">
          {/* Quick Search Bar */}
          <div className="hidden xl:flex items-center relative w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search villas, guests, reservations... (⌘K)"
            onClick={() => setIsAskAiOpen(true)}
            readOnly
            className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-full pl-9 pr-4 py-1.5 text-xs text-[#2D2926] placeholder-stone-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#606C38]/20 focus:border-[#606C38] cursor-pointer hover:border-stone-300 transition-colors"
          />
        </div>

        {/* Ask AI Trigger Button */}
        <button
          id="btn-ask-ai-header"
          onClick={() => setIsAskAiOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#606C38] hover:bg-[#4C572C] text-white text-xs font-medium shadow-xs hover:shadow transition-all"
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask AI Manager</span>
          <span className="sm:hidden">AI</span>
        </button>

        {/* Onboarding Trigger */}
        <button
          onClick={() => setIsOnboardingOpen(true)}
          className="hidden xl:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-[#E8E6E1] bg-white hover:bg-[#F2F1ED] text-stone-700 text-xs font-medium shadow-2xs transition-colors"
          title="Open Setup Wizard"
        >
          <Compass className="w-3.5 h-3.5 text-[#BC6C25]" />
          <span>Setup Wizard</span>
        </button>

        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-[#E8E6E1] bg-white hover:bg-[#F2F1ED] text-stone-800 text-xs font-medium shadow-2xs transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-[#606C38]" />
            <span className="hidden sm:inline font-semibold text-[#2D2926]">{userRole}</span>
            <ChevronDown className="w-3 h-3 text-stone-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#E8E6E1] py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                Simulate Role View
              </div>
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setUserRole(r);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#F2F1ED] transition-colors ${
                    userRole === r ? 'font-bold text-[#606C38] bg-[#FEFAE0]' : 'text-stone-700'
                  }`}
                >
                  <span>{r}</span>
                  {userRole === r && <CheckCircle2 className="w-3.5 h-3.5 text-[#606C38]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle (Light vs Villa Night Mode) */}
        <button
          id="btn-theme-toggle"
          type="button"
          onClick={toggleTheme}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 shadow-2xs ${
            theme === 'night'
              ? 'border-amber-500/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20'
              : 'border-[#E8E6E1] bg-white hover:bg-[#F2F1ED] text-stone-700'
          }`}
          title={theme === 'night' ? 'Night Mode active — click for Day Mode' : 'Switch to In-Villa Night Mode'}
          aria-label="Toggle Night Mode"
        >
          {theme === 'night' ? (
            <>
              <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30" />
              <span className="hidden sm:inline">Night Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-stone-500 hover:text-amber-600" />
              <span className="hidden sm:inline text-stone-600">Night Mode</span>
            </>
          )}
        </button>

        {/* Notifications Bell */}
        <button
          id="btn-notifications-toggle"
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className="relative p-2 rounded-lg border border-[#E8E6E1] bg-white hover:bg-[#F2F1ED] text-stone-700 shadow-2xs transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-stone-600" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#BC6C25] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
              {unreadNotifications}
            </span>
          )}
        </button>

        {/* Bali Time Pill */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#F2F1ED] border border-[#E8E6E1] text-[#2D2926] text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#606C38]" />
          <span>Bali WITA 11:42</span>
        </div>
      </div>
    </header>
    </>
  );
};
