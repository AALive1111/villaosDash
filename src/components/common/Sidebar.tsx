import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Building2, CalendarCheck, CalendarRange, Users, 
  MessageSquare, Sliders, PenTool, Bot, Settings, ChevronDown, ChevronRight,
  TrendingUp, Wallet, BarChart3, Share2, RotateCcw, Sparkles, Wrench, 
  QrCode, Search, X, ChevronsUpDown, Moon, Sun
} from 'lucide-react';
import { useApp, NavigationTab } from '../../context/AppContext';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  highlight?: boolean;
  alertBadge?: boolean;
}

interface NavCategory {
  id: string;
  label: string;
  icon?: React.ElementType;
  items: NavItem[];
}

const STORAGE_KEY = 'villaos_sidebar_collapsed_categories_v2';

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen, onClose }) => {
  const { 
    activeTab, 
    setActiveTab, 
    userRole, 
    resetDemoData,
    properties,
    reservations,
    guests,
    conversations,
    cleaningSchedules,
    maintenanceIssues,
    aiActions,
    socialLeads,
    theme,
    toggleTheme
  } = useApp();

  const [resetSuccess, setResetSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic live metric calculations for badges
  const activeReservationsCount = useMemo(() => {
    return reservations.filter(r => r.status === 'Confirmed').length || reservations.length;
  }, [reservations]);

  const unreadMessagesCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [conversations]);

  const pendingCleaningsCount = useMemo(() => {
    return cleaningSchedules.filter(c => c.status !== 'Ready' && c.status !== 'Passed').length;
  }, [cleaningSchedules]);

  const activeMaintenanceCount = useMemo(() => {
    return maintenanceIssues.filter(m => m.status !== 'Resolved').length;
  }, [maintenanceIssues]);

  const pendingAiActionsCount = useMemo(() => {
    return aiActions.filter(a => a.status === 'pending').length;
  }, [aiActions]);

  // Structured Category Groups for all Dashboard Views
  const categories: NavCategory[] = useMemo(() => [
    {
      id: 'overview',
      label: 'Core & Portfolio',
      icon: LayoutDashboard,
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'properties', label: 'Properties', icon: Building2, badge: properties.length },
        { id: 'reservations', label: 'Reservations', icon: CalendarCheck, badge: activeReservationsCount },
        { id: 'calendar', label: 'Multi-Villa Calendar', icon: CalendarRange },
      ],
    },
    {
      id: 'operations',
      label: 'Operations Hub',
      icon: Sliders,
      items: [
        { id: 'operations', label: 'Operations Command', icon: Sliders },
        { 
          id: 'cleaning', 
          label: 'Housekeeping', 
          icon: Sparkles, 
          badge: pendingCleaningsCount > 0 ? pendingCleaningsCount : undefined,
          alertBadge: pendingCleaningsCount > 0
        },
        { 
          id: 'maintenance', 
          label: 'Maintenance', 
          icon: Wrench, 
          badge: activeMaintenanceCount > 0 ? activeMaintenanceCount : undefined,
          alertBadge: activeMaintenanceCount > 0
        },
        { 
          id: 'inbox', 
          label: 'Unified Inbox', 
          icon: MessageSquare, 
          badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
          alertBadge: unreadMessagesCount > 0
        },
        { id: 'guests', label: 'Guest CRM', icon: Users, badge: guests.length },
        { id: 'guestPortal', label: 'In-Villa QR Portal', icon: QrCode, badge: 'Guest' },
      ],
    },
    {
      id: 'finance',
      label: 'Finance & Revenue',
      icon: Wallet,
      items: [
        { id: 'finance', label: 'Financial P&L', icon: Wallet },
        { id: 'revenue', label: 'Dynamic Pricing Engine', icon: TrendingUp },
        { id: 'analytics', label: 'Portfolio Analytics', icon: BarChart3 },
      ],
    },
    {
      id: 'social',
      label: 'Social & Marketing',
      icon: Share2,
      items: [
        { 
          id: 'social', 
          label: 'Social Media Studio', 
          icon: Share2, 
          badge: socialLeads.length > 0 ? `${socialLeads.length} leads` : undefined 
        },
        { id: 'contentStudio', label: 'AI Content Studio', icon: PenTool },
      ],
    },
    {
      id: 'system',
      label: 'AI & Settings',
      icon: Bot,
      items: [
        { 
          id: 'aiManager', 
          label: 'AI General Manager', 
          icon: Bot, 
          highlight: true, 
          badge: pendingAiActionsCount > 0 ? `${pendingAiActionsCount} pending` : 'Active' 
        },
        { id: 'settings', label: 'Knowledge & Settings', icon: Settings },
      ],
    },
  ], [
    properties.length,
    activeReservationsCount,
    unreadMessagesCount,
    pendingCleaningsCount,
    activeMaintenanceCount,
    pendingAiActionsCount,
    guests.length,
    socialLeads.length
  ]);

  // Collapsed state dictionary: { [categoryId]: boolean }
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore JSON parse error
    }
    // Default: all categories open
    return {
      overview: false,
      operations: false,
      finance: false,
      social: false,
      system: false,
    };
  });

  // Save collapsed state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsedGroups));
    } catch {
      // ignore storage error
    }
  }, [collapsedGroups]);

  // Automatically ensure the category containing activeTab is expanded
  useEffect(() => {
    const parentCategory = categories.find(cat => cat.items.some(item => item.id === activeTab));
    if (parentCategory && collapsedGroups[parentCategory.id]) {
      setCollapsedGroups(prev => ({
        ...prev,
        [parentCategory.id]: false
      }));
    }
  }, [activeTab, categories]);

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const areAllCollapsed = useMemo(() => {
    return categories.every(cat => !!collapsedGroups[cat.id]);
  }, [categories, collapsedGroups]);

  const toggleAllGroups = () => {
    const newState = !areAllCollapsed;
    const updated: Record<string, boolean> = {};
    categories.forEach(cat => {
      updated[cat.id] = newState;
    });
    setCollapsedGroups(updated);
  };

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (onClose) onClose();
  };

  const handleReset = () => {
    if (confirm('Reset all demo databases, reservations, and tasks back to initial state?')) {
      resetDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    }
  };

  // Filtered categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase().trim();
    
    return categories
      .map(cat => {
        const matchesCategory = cat.label.toLowerCase().includes(query);
        const matchingItems = cat.items.filter(item => 
          item.label.toLowerCase().includes(query) || item.id.toLowerCase().includes(query)
        );
        
        if (matchesCategory) {
          return cat;
        }
        if (matchingItems.length > 0) {
          return {
            ...cat,
            items: matchingItems
          };
        }
        return null;
      })
      .filter((cat): cat is NavCategory => cat !== null);
  }, [categories, searchQuery]);

  return (
    <aside
      id="villaos-sidebar"
      className={`fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0 bg-[#FDFCFB] text-[#2D2926] flex flex-col border-r border-[#E8E6E1] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-[#E8E6E1] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#606C38] flex items-center justify-center text-white font-bold shadow-xs">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-serif font-bold text-lg text-[#2D2926] tracking-tight">VillaOS</span>
              <span className="text-[#BC6C25] text-xs font-bold uppercase tracking-widest px-1.5 py-0.5 bg-[#FEFAE0] rounded border border-[#F1EDD4]">
                AI
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-medium tracking-tight">Bali Luxury Operating System</p>
          </div>
        </div>

        {/* Demo Mode Badge */}
        <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200" title="Running in Prototype Demo Mode">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-bold text-stone-600 uppercase tracking-wider">Demo</span>
        </div>
      </div>

      {/* Quick Search & Group Expansion Controls */}
      <div className="px-3 pt-3 pb-2 border-b border-[#E8E6E1]/60 bg-[#FAF9F5]/60 space-y-2">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-stone-400 pointer-events-none" />
          <input
            id="sidebar-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search views..."
            className="w-full pl-8 pr-7 py-1 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#606C38] focus:border-[#606C38] placeholder-stone-400 text-stone-700"
          />
          {searchQuery && (
            <button
              id="sidebar-clear-search-btn"
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 p-0.5 text-stone-400 hover:text-stone-600 rounded"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Categories Bar & Quick Collapse/Expand Toggle */}
        <div className="flex items-center justify-between px-1 text-[10px] text-stone-400 font-semibold">
          <span className="uppercase tracking-wider">Categories</span>
          <button
            id="sidebar-toggle-all-groups-btn"
            type="button"
            onClick={toggleAllGroups}
            className="flex items-center space-x-1 hover:text-[#606C38] transition-colors py-0.5 px-1.5 rounded hover:bg-stone-100"
            title={areAllCollapsed ? 'Expand all categories' : 'Collapse all categories'}
          >
            <ChevronsUpDown className="w-3 h-3" />
            <span>{areAllCollapsed ? 'Expand All' : 'Collapse All'}</span>
          </button>
        </div>
      </div>

      {/* Nav Categories List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-3">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-6 px-4">
            <p className="text-xs text-stone-400 font-medium">No views match &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs font-semibold text-[#606C38] hover:underline"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          filteredCategories.map(category => {
            const isCollapsed = !searchQuery && !!collapsedGroups[category.id];
            const hasActiveItem = category.items.some(item => item.id === activeTab);
            const totalAlertBadges = category.items.reduce((sum, item) => {
              if (item.alertBadge && typeof item.badge === 'number') {
                return sum + item.badge;
              }
              return sum;
            }, 0);

            return (
              <div 
                key={category.id} 
                id={`category-group-${category.id}`}
                className="rounded-xl transition-colors"
              >
                {/* Collapsible Category Header Button */}
                <button
                  type="button"
                  id={`btn-toggle-group-${category.id}`}
                  onClick={() => toggleGroup(category.id)}
                  aria-expanded={!isCollapsed}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-stone-500 hover:text-stone-900 hover:bg-stone-100/60 transition-all group"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 group-hover:text-stone-800 truncate">
                      {category.label}
                    </span>
                    {/* Collapsed indicators */}
                    {isCollapsed && hasActiveItem && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-[#606C38]/15 text-[#606C38] border border-[#606C38]/30">
                        Active
                      </span>
                    )}
                    {isCollapsed && totalAlertBadges > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title={`${totalAlertBadges} pending items`} />
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 text-stone-400 group-hover:text-stone-600">
                    <span className="text-[10px] text-stone-400 font-medium">
                      {category.items.length}
                    </span>
                    {isCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 transition-transform" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 transition-transform" />
                    )}
                  </div>
                </button>

                {/* Sub-Items List */}
                {!isCollapsed && (
                  <div className="mt-0.5 space-y-0.5 pl-1 animate-in fade-in duration-150">
                    {category.items.map(item => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      
                      return (
                        <button
                          key={item.id}
                          id={`nav-${item.id}`}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            item.highlight
                              ? isActive
                                ? 'bg-[#FEFAE0] text-[#606C38] font-bold border border-[#F1EDD4] shadow-xs'
                                : 'bg-[#FEFAE0]/70 text-[#BC6C25] border border-[#F1EDD4] hover:bg-[#FEFAE0]'
                              : isActive
                              ? 'bg-[#F2F1ED] text-[#606C38] font-semibold shadow-2xs'
                              : 'text-stone-600 hover:text-[#2D2926] hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 truncate">
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${
                              item.highlight 
                                ? 'text-[#BC6C25]' 
                                : isActive 
                                ? 'text-[#606C38]' 
                                : 'text-stone-400'
                            }`} />
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge !== undefined && (
                            <span className={`ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                              item.highlight
                                ? 'bg-[#BC6C25] text-white shadow-2xs'
                                : item.alertBadge
                                ? 'bg-amber-500 text-white'
                                : isActive 
                                ? 'bg-[#606C38] text-white' 
                                : 'bg-stone-100 text-stone-600 border border-stone-200'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Theme Toggle & Demo Reset Bar */}
      <div className="px-3 py-2 border-t border-[#E8E6E1] bg-[#FAF9F5] space-y-1.5">
        <button
          id="sidebar-theme-toggle-btn"
          type="button"
          onClick={toggleTheme}
          className={`w-full py-1.5 px-2.5 rounded-lg border text-[11px] font-semibold flex items-center justify-between transition-all duration-200 shadow-2xs ${
            theme === 'night'
              ? 'border-amber-500/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20'
              : 'border-stone-200 hover:border-amber-400/60 bg-white hover:bg-stone-50 text-stone-700'
          }`}
          title={theme === 'night' ? 'Night Mode active — click for Day Mode' : 'Switch to In-Villa Night Mode'}
        >
          <div className="flex items-center space-x-2">
            {theme === 'night' ? (
              <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-stone-500" />
            )}
            <span>{theme === 'night' ? 'Night Mode' : 'Day Mode'}</span>
          </div>
          <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider ${
            theme === 'night' 
              ? 'bg-amber-400/20 text-amber-200' 
              : 'bg-stone-100 text-stone-500'
          }`}>
            {theme === 'night' ? 'Night' : 'Day'}
          </span>
        </button>

        <button
          id="sidebar-reset-demo-btn"
          onClick={handleReset}
          className="w-full py-1.5 px-2.5 rounded-lg border border-stone-200 hover:border-amber-400 hover:bg-amber-50 text-[11px] font-semibold text-stone-600 hover:text-amber-900 flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
        >
          <RotateCcw className={`w-3 h-3 text-stone-400 ${resetSuccess ? 'text-amber-600 animate-spin' : ''}`} />
          <span>{resetSuccess ? 'Data Reset!' : 'Reset Demo Data'}</span>
        </button>
      </div>

      {/* Footer Profile */}
      <div className="p-3 border-t border-[#E8E6E1] bg-[#F9F8F6]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#E8E6E1] border border-white overflow-hidden flex items-center justify-center text-xs font-bold text-[#2D2926]">
            YA
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-semibold truncate text-[#2D2926]">Yazan Al-Khatib</p>
            <p className="text-[9px] text-stone-400 uppercase tracking-wider font-bold">{properties.length} Luxury Villas • {userRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
