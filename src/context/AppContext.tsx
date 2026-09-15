import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Property, PropertyStatus, Reservation, Guest, Conversation, Task, CleaningSchedule, 
  MaintenanceIssue, AiAction, AiLogEntry, SocialPost, SocialAccount, SocialLead, SocialAttribution, NotificationItem, UserRole,
  Workspace, AppTheme
} from '../types';
import { 
  mockProperties, mockReservations, mockGuests, mockConversations, 
  mockTasks, mockCleaningSchedules, mockMaintenanceIssues, mockAiActions, 
  mockAiLogs, mockSocialPosts, mockSocialAccounts, mockSocialLeads, mockSocialAttributions, mockNotifications,
  mockWorkspaces
} from '../data/mockData';
import {
  loadAndSanitizeInitialData,
  persistPartitionedData,
  getWorkspaceProperties,
  getWorkspaceArchivedProperties,
  getWorkspaceReservations,
  getWorkspaceGuests,
  getWorkspaceTasks,
  getWorkspaceCleaningSchedules,
  getWorkspaceMaintenanceIssues,
  getWorkspaceConversations,
  getWorkspaceSocialPosts,
  getWorkspaceSocialAccounts,
  getWorkspaceSocialLeads,
  getWorkspaceSocialAttributions,
  getWorkspaceAiActions,
  getWorkspaceAiLogs,
  getWorkspaceNotifications,
  DEMO_WORKSPACE_ID,
  DEMO_PROPERTY_IDS
} from '../utils/workspaceScoping';

export type NavigationTab = 
  | 'dashboard'
  | 'properties'
  | 'reservations'
  | 'calendar'
  | 'guests'
  | 'inbox'
  | 'operations'
  | 'cleaning'
  | 'maintenance'
  | 'social'
  | 'contentStudio'
  | 'revenue'
  | 'finance'
  | 'analytics'
  | 'aiManager'
  | 'settings'
  | 'guestPortal';

interface AppContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  
  // Workspace and Multi-property
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;
  activeWorkspace: Workspace | null;
  
  properties: Property[];
  archivedProperties: Property[];
  allProperties: Property[]; // Raw list before filtering
  selectedPropertyId: string | null;
  setSelectedPropertyId: (id: string | null) => void;
  
  reservations: Reservation[];
  guests: Guest[];
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  tasks: Task[];
  cleaningSchedules: CleaningSchedule[];
  maintenanceIssues: MaintenanceIssue[];
  aiActions: AiAction[];
  aiLogs: AiLogEntry[];
  socialPosts: SocialPost[];
  socialAccounts: SocialAccount[];
  socialLeads: SocialLead[];
  socialAttributions: SocialAttribution[];
  notifications: NotificationItem[];
  
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isPropertyOnboardingOpen: boolean;
  setIsPropertyOnboardingOpen: (open: boolean) => void;
  isWorkspaceOnboardingOpen: boolean;
  setIsWorkspaceOnboardingOpen: (open: boolean) => void;
  editingProperty: Property | null;
  setEditingProperty: (prop: Property | null) => void;
  isAskAiOpen: boolean;
  setIsAskAiOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;

  // Action methods
  switchWorkspace: (id: string | null) => void;
  onboardWorkspace: (data: Omit<Workspace, 'id' | 'createdAt'>) => void;
  createProperty: (property: Partial<Property>) => Property | undefined;
  editProperty: (propertyId: string, updates: Partial<Property>) => void;
  archiveProperty: (propertyId: string) => void;
  restoreProperty: (propertyId: string) => void;
  deleteProperty: (propertyId: string) => void;
  
  connectSocialAccount: (propertyId: string, provider: 'Instagram' | 'Facebook' | 'TikTok' | 'Google Business') => Promise<void>;
  disconnectSocialAccount: (accountId: string) => Promise<void>;
  syncSocialAccount: (accountId: string) => Promise<void>;

  approveAiAction: (actionId: string) => void;
  dismissAiAction: (actionId: string) => void;
  createTask: (task: Partial<Task>) => Task | undefined;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  createCleaningSchedule: (schedule: Partial<CleaningSchedule>) => CleaningSchedule | undefined;
  markCleaningReady: (scheduleId: string) => void;
  requestCleaningInspection: (scheduleId: string) => void;
  notifyCleaner: (scheduleId: string) => void;
  createMaintenanceIssue: (issue: Partial<MaintenanceIssue>) => void;
  resolveMaintenanceIssue: (id: string) => void;
  resolveMaintenance: (id: string) => void;
  createReservation: (resData: Partial<Reservation>) => Reservation | undefined;
  editReservation: (reservationId: string, updates: Partial<Reservation>) => void;
  cancelReservation: (reservationId: string) => void;
  checkoutReservation: (reservationId: string) => void;
  resetDemoData: () => void;
  executeAiOperationalPlan: (plan: { title: string; propertyId: string; actions: string[] }) => void;
  sendChatMessage: (conversationId: string, text: string, sender?: 'host' | 'ai' | 'guest') => void;
  sendGuestMessage: (conversationId: string, text: string) => void;
  submitGuestPortalRequest: (params: {
    propertyId: string;
    text: string;
    type?: 'chat' | 'cleaning' | 'maintenance' | 'assistance';
    guestName?: string;
    preferredTime?: string;
  }) => Promise<{ conversationId: string; aiSuggestedReply?: string; actionCreated?: boolean }>;
  updatePropertyRules: (propertyId: string, updatedRules: Partial<Property['rules']>) => void;
  updatePropertyPrice: (propertyId: string, newRate: number) => void;
  addSocialPost: (post: Omit<SocialPost, 'id'>) => void;
  scheduleSocialPost: (post: any) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  analyzeSocialLead: (leadId: string, message: string) => Promise<void>;
  convertLeadToBooking: (leadId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const formatIDR = (amount: number, compact = false): string => {
  if (compact) {
    if (amount >= 1_000_000_000) {
      return `IDR ${(amount / 1_000_000_000).toFixed(1)}B`;
    }
    if (amount >= 1_000_000) {
      return `IDR ${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
      return `IDR ${(amount / 1_000).toFixed(0)}k`;
    }
    return `IDR ${amount}`;
  }
  return `IDR ${new Intl.NumberFormat('id-ID').format(amount)}`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('Owner');

  // Theme Management (Light vs Villa Night Mode)
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('villaos_theme') as AppTheme;
      if (saved === 'light' || saved === 'night') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'night';
      }
    }
    return 'light';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('villaos_theme', newTheme);
      } catch {
        // ignore
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'night' : 'light');
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'night') {
        root.classList.add('night', 'dark');
        root.setAttribute('data-theme', 'night');
      } else {
        root.classList.remove('night', 'dark');
        root.setAttribute('data-theme', 'light');
      }
    }
  }, [theme]);
  
  // Initialize partitioned & sanitized data from storage or defaults
  const [initialData] = useState(() => loadAndSanitizeInitialData());

  // Workspace State
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialData.workspaces);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(initialData.activeWorkspaceId);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || null;

  // Data Stores (sanitized and strictly partitioned)
  const [allProperties, setAllProperties] = useState<Property[]>(initialData.properties);
  const [selectedPropertyId, setSelectedPropertyIdState] = useState<string | null>(null);
  
  const [allReservations, setAllReservations] = useState<Reservation[]>(initialData.reservations);
  const [allGuests, setAllGuests] = useState<Guest[]>(initialData.guests);
  const [allConversations, setAllConversations] = useState<Conversation[]>(initialData.conversations);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-1');
  
  const [allTasks, setAllTasks] = useState<Task[]>(initialData.tasks);
  const [allCleaningSchedules, setAllCleaningSchedules] = useState<CleaningSchedule[]>(initialData.cleaningSchedules);
  const [allMaintenanceIssues, setAllMaintenanceIssues] = useState<MaintenanceIssue[]>(initialData.maintenanceIssues);
  
  const [allAiActions, setAllAiActions] = useState<AiAction[]>(initialData.aiActions);
  const [allAiLogs, setAllAiLogs] = useState<AiLogEntry[]>(initialData.aiLogs);
  
  const [allSocialPosts, setAllSocialPosts] = useState<SocialPost[]>(initialData.socialPosts);
  const [allSocialAccounts, setAllSocialAccounts] = useState<SocialAccount[]>(initialData.socialAccounts);
  const [allSocialLeads, setAllSocialLeads] = useState<SocialLead[]>(initialData.socialLeads);
  const [allSocialAttributions, setAllSocialAttributions] = useState<SocialAttribution[]>(initialData.socialAttributions);
  
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>(initialData.notifications);

  // Aliases for local component mutation handlers
  const setAiActions = setAllAiActions;
  const setAiLogs = setAllAiLogs;
  const setSocialAttributions = setAllSocialAttributions;
  const setNotifications = setAllNotifications;

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isPropertyOnboardingOpen, setIsPropertyOnboardingOpen] = useState<boolean>(false);
  const [isWorkspaceOnboardingOpen, setIsWorkspaceOnboardingOpen] = useState<boolean>(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isAskAiOpen, setIsAskAiOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Scoped Selectors (strictly scoped to activeWorkspaceId)
  const properties = React.useMemo(() => {
    return getWorkspaceProperties(allProperties, activeWorkspaceId);
  }, [allProperties, activeWorkspaceId]);

  const archivedProperties = React.useMemo(() => {
    return getWorkspaceArchivedProperties(allProperties, activeWorkspaceId);
  }, [allProperties, activeWorkspaceId]);

  const reservations = React.useMemo(() => {
    return getWorkspaceReservations(allReservations, activeWorkspaceId, selectedPropertyId);
  }, [allReservations, activeWorkspaceId, selectedPropertyId]);

  const guests = React.useMemo(() => {
    return getWorkspaceGuests(allGuests, activeWorkspaceId);
  }, [allGuests, activeWorkspaceId]);

  const tasks = React.useMemo(() => {
    return getWorkspaceTasks(allTasks, activeWorkspaceId, selectedPropertyId);
  }, [allTasks, activeWorkspaceId, selectedPropertyId]);

  const cleaningSchedules = React.useMemo(() => {
    return getWorkspaceCleaningSchedules(allCleaningSchedules, activeWorkspaceId, selectedPropertyId);
  }, [allCleaningSchedules, activeWorkspaceId, selectedPropertyId]);

  const maintenanceIssues = React.useMemo(() => {
    return getWorkspaceMaintenanceIssues(allMaintenanceIssues, activeWorkspaceId, selectedPropertyId);
  }, [allMaintenanceIssues, activeWorkspaceId, selectedPropertyId]);

  const conversations = React.useMemo(() => {
    return getWorkspaceConversations(allConversations, activeWorkspaceId, selectedPropertyId);
  }, [allConversations, activeWorkspaceId, selectedPropertyId]);

  const socialPosts = React.useMemo(() => {
    return getWorkspaceSocialPosts(allSocialPosts, activeWorkspaceId, selectedPropertyId);
  }, [allSocialPosts, activeWorkspaceId, selectedPropertyId]);

  const socialAccounts = React.useMemo(() => {
    return getWorkspaceSocialAccounts(allSocialAccounts, activeWorkspaceId, selectedPropertyId);
  }, [allSocialAccounts, activeWorkspaceId, selectedPropertyId]);

  const socialLeads = React.useMemo(() => {
    return getWorkspaceSocialLeads(allSocialLeads, activeWorkspaceId, selectedPropertyId);
  }, [allSocialLeads, activeWorkspaceId, selectedPropertyId]);

  const socialAttributions = React.useMemo(() => {
    return getWorkspaceSocialAttributions(allSocialAttributions, activeWorkspaceId);
  }, [allSocialAttributions, activeWorkspaceId]);

  const aiActions = React.useMemo(() => {
    return getWorkspaceAiActions(allAiActions, activeWorkspaceId, selectedPropertyId);
  }, [allAiActions, activeWorkspaceId, selectedPropertyId]);

  const aiLogs = React.useMemo(() => {
    return getWorkspaceAiLogs(allAiLogs, activeWorkspaceId);
  }, [allAiLogs, activeWorkspaceId]);

  const notifications = React.useMemo(() => {
    return getWorkspaceNotifications(allNotifications, activeWorkspaceId);
  }, [allNotifications, activeWorkspaceId]);

  // Safe property selection guard: reject selection if property does not belong to active workspace
  const setSelectedPropertyId = (id: string | null) => {
    if (!id) {
      setSelectedPropertyIdState(null);
      return;
    }
    const prop = allProperties.find(p => p.id === id);
    if (!prop || prop.workspaceId !== activeWorkspaceId) {
      console.warn('Selection rejected: Property does not belong to active workspace', { propertyId: id, activeWorkspaceId });
      setSelectedPropertyIdState(null);
      return;
    }
    setSelectedPropertyIdState(id);
  };

  // Synchronous Workspace Switcher: clears property selection, updates activeWorkspaceId
  const switchWorkspace = (id: string | null) => {
    setActiveWorkspaceId(id);
    setSelectedPropertyIdState(null);
  };

  // Inbound Webhook Leads Polling / Ingestion
  React.useEffect(() => {
    if (!activeWorkspaceId) return;

    const fetchInboundLeads = async () => {
      try {
        const res = await fetch(`/api/social/inbound-leads?workspaceId=${encodeURIComponent(activeWorkspaceId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.leads) && data.leads.length > 0) {
            setAllSocialLeads(prev => {
              const existingIds = new Set(prev.map(l => l.id));
              const newLeads = data.leads.filter((l: any) => !existingIds.has(l.id));
              if (newLeads.length === 0) return prev;
              return [...newLeads, ...prev];
            });
          }
        }
      } catch (e) {
        // silent catch on background poll
      }
    };

    fetchInboundLeads();
    const interval = setInterval(fetchInboundLeads, 15000);
    return () => clearInterval(interval);
  }, [activeWorkspaceId]);

  // Partitioned Persistence Effect: saves partitioned data to local storage
  React.useEffect(() => {
    persistPartitionedData(activeWorkspaceId, {
      workspaces,
      properties: allProperties,
      reservations: allReservations,
      guests: allGuests,
      conversations: allConversations,
      tasks: allTasks,
      cleaningSchedules: allCleaningSchedules,
      maintenanceIssues: allMaintenanceIssues,
      aiActions: allAiActions,
      aiLogs: allAiLogs,
      socialPosts: allSocialPosts,
      socialAccounts: allSocialAccounts,
      socialLeads: allSocialLeads,
      socialAttributions: allSocialAttributions,
      notifications: allNotifications,
    });
  }, [
    workspaces,
    activeWorkspaceId,
    allProperties,
    allReservations,
    allGuests,
    allConversations,
    allTasks,
    allCleaningSchedules,
    allMaintenanceIssues,
    allAiActions,
    allAiLogs,
    allSocialPosts,
    allSocialAccounts,
    allSocialLeads,
    allSocialAttributions,
    allNotifications,
  ]);

  const onboardWorkspace = (data: Omit<Workspace, 'id' | 'createdAt'>) => {
    const newWorkspace: Workspace = {
      ...data,
      id: `ws-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isDemo: false,
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
    setActiveWorkspaceId(newWorkspace.id);
    setSelectedPropertyId(null);
    setIsWorkspaceOnboardingOpen(false);
  };

  const createProperty = (newProp: Partial<Property>): Property | undefined => {
    if (!activeWorkspaceId) {
      console.error('Cannot create property: No active workspace');
      return;
    }
    const propId = `prop-${Date.now()}`;
    const fullProp: Property = {
      id: propId,
      workspaceId: activeWorkspaceId,
      name: newProp.name || 'New Villa Sanctuary',
      location: newProp.location || 'Seminyak, Bali',
      area: newProp.area || 'Seminyak',
      bedrooms: newProp.bedrooms || 3,
      bathrooms: newProp.bathrooms || 3,
      maxGuests: newProp.maxGuests || 6,
      image: newProp.image || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      gallery: [newProp.image || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'],
      status: 'vacant',
      occupancyRate: 0,
      isArchived: false,
      monthlyRevenue: 0,
      dailyRate: newProp.dailyRate || 2500000,
      rating: 0,
      reviewCount: 0,
      connectedChannels: [
        { channel: 'Airbnb', connected: false, syncStatus: 'synced', lastSync: 'Pending' },
        { channel: 'Booking.com', connected: false, syncStatus: 'synced', lastSync: 'Pending' },
        { channel: 'Direct', connected: true, syncStatus: 'synced', lastSync: 'Live' },
      ],
      description: newProp.description || 'Luxurious private sanctuary with private pool, tropical garden, and concierge.',
      amenities: newProp.amenities || ['Private Pool', 'High-Speed Wi-Fi', 'Daily Housekeeping', 'Air Conditioning'],
      rules: newProp.rules || {
        checkInTime: '15:00',
        checkOutTime: '11:00',
        quietHours: '22:00 – 07:00',
        earlyCheckInFee: 300000,
        lateCheckOutFee: 400000,
        poolCleaningDays: ['Monday', 'Thursday'],
        preferredCleaner: 'Staff Member',
        preferredTechnician: 'Technical Support',
        wifiProvider: 'Fiber Internet',
        wifiPassword: 'changeme',
        accessCode: '0000',
      },
    };

    setAllProperties(prev => [fullProp, ...prev]);
    setSelectedPropertyIdState(propId);
    
    setAiLogs(prev => [
      {
        id: `log-${Date.now()}`,
        workspaceId: activeWorkspaceId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        category: 'Operations',
        action: `Onboarded new property: ${fullProp.name}`,
        details: `Configured base settings for ${fullProp.name} in ${activeWorkspace?.businessName}.`,
        status: 'Auto-executed',
      },
      ...prev,
    ]);

    return fullProp;
  };

  const editProperty = (propertyId: string, updates: Partial<Property>) => {
    // Prevent accidental cross-workspace mutation or workspaceId overwriting
    const { workspaceId: _, ...safeUpdates } = updates;
    setAllProperties(prev => prev.map(p => {
      if (p.id === propertyId && p.workspaceId === activeWorkspaceId) {
        return { ...p, ...safeUpdates, workspaceId: p.workspaceId };
      }
      return p;
    }));

    if (safeUpdates.name) {
      const newName = safeUpdates.name;
      setAllReservations(prev => prev.map(r => (r.propertyId === propertyId && r.workspaceId === activeWorkspaceId) ? { ...r, propertyName: newName } : r));
      setAllTasks(prev => prev.map(t => (t.propertyId === propertyId && t.workspaceId === activeWorkspaceId) ? { ...t, propertyName: newName } : t));
      setAllCleaningSchedules(prev => prev.map(c => (c.propertyId === propertyId && c.workspaceId === activeWorkspaceId) ? { ...c, propertyName: newName } : c));
      setAllMaintenanceIssues(prev => prev.map(m => (m.propertyId === propertyId && m.workspaceId === activeWorkspaceId) ? { ...m, propertyName: newName } : m));
      setAllConversations(prev => prev.map(cv => (cv.propertyId === propertyId && cv.workspaceId === activeWorkspaceId) ? { ...cv, propertyName: newName } : cv));
      setAllAiActions(prev => prev.map(a => (a.propertyId === propertyId && a.workspaceId === activeWorkspaceId) ? { ...a, propertyName: newName } : a));
    }

    setAiLogs(prev => [
      {
        id: `log-${Date.now()}`,
        workspaceId: activeWorkspaceId!,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        category: 'Operations',
        action: `Updated property: ${safeUpdates.name || propertyId}`,
        details: `Updated specifications and configuration for villa in ${activeWorkspace?.businessName}.`,
        status: 'Auto-executed',
      },
      ...prev,
    ]);
  };

  const archiveProperty = (propertyId: string) => {
    setAllProperties(prev => prev.map(p => (p.id === propertyId && p.workspaceId === activeWorkspaceId) ? { ...p, isArchived: true } : p));
    if (selectedPropertyId === propertyId) setSelectedPropertyIdState(null);

    setAiLogs(prev => [
      {
        id: `log-${Date.now()}`,
        workspaceId: activeWorkspaceId!,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        category: 'Operations',
        action: `Archived property: ${propertyId}`,
        details: `Property archived. Removed from active listings while preserving historical business analytics.`,
        status: 'Auto-executed',
      },
      ...prev,
    ]);
  };

  const restoreProperty = (propertyId: string) => {
    setAllProperties(prev => prev.map(p => (p.id === propertyId && p.workspaceId === activeWorkspaceId) ? { ...p, isArchived: false } : p));
    
    setAiLogs(prev => [
      {
        id: `log-${Date.now()}`,
        workspaceId: activeWorkspaceId!,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        category: 'Operations',
        action: `Restored property: ${propertyId}`,
        details: `Property restored to active portfolio.`,
        status: 'Auto-executed',
      },
      ...prev,
    ]);
  };

  const createTask = (task: Partial<Task>): Task | undefined => {
    if (!activeWorkspaceId) return;
    const propId = task.propertyId;
    const prop = allProperties.find(p => p.id === propId && p.workspaceId === activeWorkspaceId);
    const newTask: Task = {
      id: `task-${Date.now()}`,
      workspaceId: activeWorkspaceId,
      propertyId: prop?.id || propId || '',
      propertyName: prop?.name || task.propertyName || 'General Operations',
      title: task.title || 'Operational Task',
      type: task.type || 'cleaning',
      assignedTo: task.assignedTo || prop?.rules?.preferredCleaner || 'Staff Member',
      priority: task.priority || 'medium',
      dueTime: task.dueTime || 'Today 15:00',
      status: task.status || 'todo',
      notes: task.notes || '',
      cost: task.cost,
    };
    setAllTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const createCleaningSchedule = (schedule: Partial<CleaningSchedule>): CleaningSchedule | undefined => {
    if (!activeWorkspaceId) return;
    const propId = schedule.propertyId;
    const prop = allProperties.find(p => p.id === propId && p.workspaceId === activeWorkspaceId);
    if (!prop) return;
    const newSchedule: CleaningSchedule = {
      id: `cs-${Date.now()}`,
      workspaceId: activeWorkspaceId,
      propertyId: prop.id,
      propertyName: prop.name,
      checkOutTime: schedule.checkOutTime || '11:00 AM',
      cleanerName: schedule.cleanerName || prop.rules.preferredCleaner || 'Staff Member',
      cleaningStatus: schedule.cleaningStatus || 'In Progress',
      inspectionStatus: schedule.inspectionStatus || 'Pending',
      nextCheckInTime: schedule.nextCheckInTime || '15:00',
      nextGuestName: schedule.nextGuestName || 'Upcoming Guest',
      checklist: schedule.checklist || {
        linensChanged: false,
        poolCleaned: false,
        freshTowels: true,
        welcomeBasket: false,
        acChecked: false,
      },
    };
    setAllCleaningSchedules(prev => [newSchedule, ...prev.filter(cs => cs.propertyId !== prop.id)]);
    return newSchedule;
  };

  const deleteProperty = (propertyId: string) => {
    const targetProp = allProperties.find(p => p.id === propertyId && p.workspaceId === activeWorkspaceId);
    if (!targetProp) return;

    const hasHistory = allReservations.some(r => r.propertyId === propertyId);
    if (hasHistory) {
      alert('Cannot permanently delete property because it has historical reservations and financial records. Archiving is recommended instead.');
      return;
    }
    if (window.confirm('Are you sure you want to permanently delete this property?')) {
      setAllProperties(prev => prev.filter(p => p.id !== propertyId));
      if (selectedPropertyId === propertyId) setSelectedPropertyId(null);
    }
  };

  const resetDemoData = () => {
    // Reset ONLY the demo workspace without deleting user's real workspaces or properties
    const realWorkspaces = workspaces.filter(w => !w.isDemo && w.id !== DEMO_WORKSPACE_ID);
    const demoWs = mockWorkspaces.find(w => w.id === DEMO_WORKSPACE_ID) || mockWorkspaces[0];
    setWorkspaces([demoWs, ...realWorkspaces]);

    setAllProperties(prev => [
      ...mockProperties,
      ...prev.filter(p => p.workspaceId !== DEMO_WORKSPACE_ID && !DEMO_PROPERTY_IDS.has(p.id))
    ]);

    setAllReservations(prev => [
      ...mockReservations,
      ...prev.filter(r => r.workspaceId !== DEMO_WORKSPACE_ID)
    ]);

    setAllGuests(prev => [
      ...mockGuests,
      ...prev.filter(g => g.workspaceId !== DEMO_WORKSPACE_ID)
    ]);

    setAllConversations(prev => [
      ...mockConversations,
      ...prev.filter(c => c.workspaceId !== DEMO_WORKSPACE_ID)
    ]);

    setAllTasks(prev => [
      ...mockTasks,
      ...prev.filter(t => t.workspaceId !== DEMO_WORKSPACE_ID)
    ]);

    setAllCleaningSchedules(prev => [
      ...mockCleaningSchedules,
      ...prev.filter(s => s.workspaceId !== DEMO_WORKSPACE_ID)
    ]);

    setAllMaintenanceIssues(prev => [
      ...mockMaintenanceIssues,
      ...prev.filter(m => m.workspaceId !== DEMO_WORKSPACE_ID)
    ]);

    setAllAiActions(prev => [
      ...mockAiActions,
      ...prev.filter(a => a.workspaceId !== DEMO_WORKSPACE_ID)
    ]);

    setAllAiLogs(prev => [
      ...mockAiLogs,
      ...prev.filter(l => l.workspaceId !== DEMO_WORKSPACE_ID)
    ]);

    setAllSocialPosts(prev => [
      ...mockSocialPosts,
      ...prev.filter(p => p.workspaceId !== DEMO_WORKSPACE_ID)
    ]);

    setAllSocialAccounts(prev => [
      ...mockSocialAccounts,
      ...prev.filter(a => a.workspaceId !== DEMO_WORKSPACE_ID)
    ]);

    setAllSocialLeads(prev => [
      ...mockSocialLeads,
      ...prev.filter(l => l.workspaceId !== DEMO_WORKSPACE_ID)
    ]);

    setAllSocialAttributions(prev => [
      ...mockSocialAttributions,
      ...prev.filter(a => a.workspaceId !== DEMO_WORKSPACE_ID)
    ]);

    setAllNotifications(prev => [
      {
        id: `notif-reset-${Date.now()}`,
        workspaceId: DEMO_WORKSPACE_ID,
        type: 'booking',
        title: 'Demo Data Reset',
        message: 'Demo workspace data restored to initial state without affecting your real workspaces.',
        time: 'Just now',
        unread: true,
      },
      ...prev.filter(n => n.workspaceId !== DEMO_WORKSPACE_ID)
    ]);
  };

  const createReservation = (resData: Partial<Reservation>): Reservation | undefined => {
    if (!activeWorkspaceId) return undefined;
    const targetProperty = properties.find(p => p.id === resData.propertyId);
    if (!targetProperty) return undefined;

    const newId = `res-${Date.now().toString().slice(-4)}`;
    const guestName = resData.guestName?.trim() || 'Guest';
    const nights = Number(resData.nights) || 3;
    const rate = targetProperty.dailyRate || 2500000;
    const total = Number(resData.totalAmount) || (rate * nights);
    const channel = resData.channel || 'Direct';
    const isDirect = channel === 'Direct' || channel === 'WhatsApp' || channel === 'Instagram';
    const commission = resData.commission !== undefined ? resData.commission : (isDirect ? 0 : Math.round(total * 0.15));
    const payout = total - commission;

    const todayStr = new Date().toISOString().split('T')[0];
    const defaultCheckOut = new Date();
    defaultCheckOut.setDate(defaultCheckOut.getDate() + nights);
    const defaultCheckOutStr = defaultCheckOut.toISOString().split('T')[0];

    const checkIn = resData.checkIn || todayStr;
    const checkOut = resData.checkOut || defaultCheckOutStr;

    const newRes: Reservation = {
      id: newId,
      workspaceId: activeWorkspaceId,
      propertyId: targetProperty.id,
      propertyName: targetProperty.name,
      guestId: resData.guestId || `guest-${Date.now().toString().slice(-4)}`,
      guestName,
      guestEmail: resData.guestEmail || `${guestName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      guestPhone: resData.guestPhone || '+62 812 3456 7890',
      guestCountry: resData.guestCountry || 'Australia',
      guestAvatar: resData.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      channel,
      checkIn,
      checkOut,
      nights,
      guestsCount: Number(resData.guestsCount) || 2,
      totalAmount: total,
      payoutAmount: payout,
      commission,
      status: resData.status || 'Confirmed',
      specialRequests: resData.specialRequests || 'Direct reservation. Welcome drink requested on arrival.',
      createdAt: 'Today',
    };

    setAllReservations(prev => [newRes, ...prev]);

    // Update Property state
    setAllProperties(prev => prev.map(p => {
      if (p.id === targetProperty.id) {
        const isOccupiedToday = checkIn <= todayStr && checkOut > todayStr;
        return {
          ...p,
          status: isOccupiedToday ? ('occupied' as PropertyStatus) : p.status,
          currentGuest: isOccupiedToday ? {
            name: guestName,
            checkOutDate: checkOut,
            channel,
          } : p.currentGuest,
          nextCheckIn: {
            date: checkIn,
            guestName,
            time: targetProperty.rules?.checkInTime || '15:00',
          },
          monthlyRevenue: p.monthlyRevenue + total,
        };
      }
      return p;
    }));

    // Add or update guest in CRM
    setAllGuests(prev => {
      const existingGuestIndex = prev.findIndex(g => 
        g.workspaceId === activeWorkspaceId && 
        (g.id === newRes.guestId || g.name.toLowerCase() === guestName.toLowerCase() || (newRes.guestEmail && g.email.toLowerCase() === newRes.guestEmail.toLowerCase()))
      );

      if (existingGuestIndex >= 0) {
        const existing = prev[existingGuestIndex];
        const updatedGuest: Guest = {
          ...existing,
          totalSpend: existing.totalSpend + total,
          staysCount: existing.staysCount + 1,
          lastStay: checkIn,
          propertiesStayed: Array.from(new Set([...(existing.propertiesStayed || []), targetProperty.name])),
        };
        const copy = [...prev];
        copy[existingGuestIndex] = updatedGuest;
        return copy;
      }

      const newGuest: Guest = {
        id: newRes.guestId,
        workspaceId: activeWorkspaceId,
        name: guestName,
        nationality: resData.guestCountry || 'International',
        countryCode: 'AU',
        email: newRes.guestEmail,
        phone: newRes.guestPhone,
        avatar: newRes.guestAvatar,
        tags: ['New Guest', channel],
        totalSpend: total,
        staysCount: 1,
        averageStayDays: nights,
        propertiesStayed: [targetProperty.name],
        preferences: ['Cold towel on arrival', 'Quiet villa setup'],
        notes: `Booked via ${channel}. Direct reservation ID: ${newId}.`,
        lastStay: checkIn,
        ratingGiven: 5.0,
      };
      return [newGuest, ...prev];
    });

    // Create a pre-arrival operations task
    setAllTasks(prev => [
      {
        id: `task-arr-${Date.now()}`,
        workspaceId: activeWorkspaceId,
        propertyId: targetProperty.id,
        propertyName: targetProperty.name,
        title: `Pre-Arrival Setup for ${guestName} (${channel})`,
        type: 'cleaning',
        assignedTo: targetProperty.rules?.preferredCleaner || 'Wayan Suparta',
        priority: 'high',
        dueTime: `${checkIn} 14:00`,
        status: 'todo',
        notes: `Verify key lockbox (${targetProperty.rules?.accessCode || '8842'}), chill young coconuts, and inspect AC.`,
      },
      ...prev,
    ]);

    // Create / update Cleaning schedule
    setAllCleaningSchedules(prev => {
      const cleaner = targetProperty.rules?.preferredCleaner || 'Wayan Suparta';
      const existing = prev.find(cs => cs.propertyId === targetProperty.id && cs.workspaceId === activeWorkspaceId);
      const scheduleItem: CleaningSchedule = {
        id: existing?.id || `clean-${Date.now()}`,
        workspaceId: activeWorkspaceId,
        propertyId: targetProperty.id,
        propertyName: targetProperty.name,
        cleaner,
        cleaningStatus: 'In Progress',
        inspectionStatus: 'Pending',
        checkOutTime: '11:00 Check-out',
        nextCheckInTime: `${checkIn} ${targetProperty.rules?.checkInTime || '15:00'}`,
        nextGuestName: guestName,
        checklist: existing?.checklist || {
          linensChanged: false,
          poolCleaned: false,
          freshTowels: true,
          welcomeBasket: false,
          acChecked: false,
        },
      };
      return [scheduleItem, ...prev.filter(cs => cs.propertyId !== targetProperty.id)];
    });

    // AI Log Entry
    setAllAiLogs(prev => [
      {
        id: `log-${Date.now()}`,
        workspaceId: activeWorkspaceId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        category: 'Bookings',
        action: `New ${channel} Booking Created: ${guestName}`,
        details: `${targetProperty.name} (${checkIn} to ${checkOut}, ${nights} nights, ${formatIDR(total)}). Scheduled pre-arrival operations setup.`,
        status: 'Auto-executed',
      },
      ...prev,
    ]);

    // Notification
    setAllNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        workspaceId: activeWorkspaceId,
        type: 'booking',
        title: 'New Reservation Confirmed',
        message: `${guestName} booked ${targetProperty.name} (${nights} nights, ${formatIDR(total)}).`,
        time: 'Just now',
        unread: true,
      },
      ...prev,
    ]);

    return newRes;
  };

  const editReservation = (reservationId: string, updates: Partial<Reservation>) => {
    if (!activeWorkspaceId) return;

    setAllReservations(prev => prev.map(res => {
      if (res.id !== reservationId || res.workspaceId !== activeWorkspaceId) return res;

      const updatedRes: Reservation = {
        ...res,
        ...updates,
      };

      // Recalculate totals if nights or dailyRate altered
      if (updates.nights && !updates.totalAmount) {
        const prop = allProperties.find(p => p.id === updatedRes.propertyId);
        if (prop) {
          updatedRes.totalAmount = prop.dailyRate * updates.nights;
          const isDirect = updatedRes.channel === 'Direct' || updatedRes.channel === 'WhatsApp' || updatedRes.channel === 'Instagram';
          updatedRes.commission = isDirect ? 0 : Math.round(updatedRes.totalAmount * 0.15);
          updatedRes.payoutAmount = updatedRes.totalAmount - updatedRes.commission;
        }
      }

      // If guest name or contact info was edited, update CRM
      if (updates.guestName || updates.guestEmail || updates.guestPhone) {
        setAllGuests(gPrev => gPrev.map(g => {
          if (g.workspaceId === activeWorkspaceId && (g.id === res.guestId || g.name === res.guestName)) {
            return {
              ...g,
              name: updates.guestName || g.name,
              email: updates.guestEmail || g.email,
              phone: updates.guestPhone || g.phone,
            };
          }
          return g;
        }));
      }

      // If status changed to Cancelled, trigger property status reset
      if (updates.status === 'Cancelled') {
        setAllProperties(pPrev => pPrev.map(p => {
          if (p.id === res.propertyId && p.currentGuest?.name === res.guestName) {
            return {
              ...p,
              status: 'vacant',
              currentGuest: undefined,
            };
          }
          return p;
        }));
      }

      return updatedRes;
    }));

    // AI Log Entry
    setAllAiLogs(prev => [
      {
        id: `log-edit-${Date.now()}`,
        workspaceId: activeWorkspaceId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        category: 'Bookings',
        action: `Reservation Modified (${reservationId})`,
        details: `Updated reservation details for ${updates.guestName || 'guest'}.`,
        status: 'Auto-executed',
      },
      ...prev,
    ]);
  };

  const cancelReservation = (reservationId: string) => {
    if (!activeWorkspaceId) return;
    const targetRes = allReservations.find(r => r.id === reservationId && r.workspaceId === activeWorkspaceId);
    if (!targetRes) return;

    setAllReservations(prev => prev.map(res => {
      if (res.id === reservationId && res.workspaceId === activeWorkspaceId) {
        return {
          ...res,
          status: 'Cancelled',
        };
      }
      return res;
    }));

    // Free up property if currently occupied by this reservation
    setAllProperties(prev => prev.map(p => {
      if (p.id === targetRes.propertyId && p.currentGuest?.name === targetRes.guestName) {
        return {
          ...p,
          status: 'vacant',
          currentGuest: undefined,
        };
      }
      return p;
    }));

    // Mark pre-arrival tasks for this reservation as completed/cancelled
    setAllTasks(prev => prev.map(t => {
      if (t.propertyId === targetRes.propertyId && t.title.includes(targetRes.guestName)) {
        return {
          ...t,
          status: 'completed',
          notes: `${t.notes || ''} [Booking cancelled]`,
        };
      }
      return t;
    }));

    // AI Log
    setAllAiLogs(prev => [
      {
        id: `log-cancel-${Date.now()}`,
        workspaceId: activeWorkspaceId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        category: 'Bookings',
        action: `Reservation Cancelled: ${targetRes.guestName}`,
        details: `Cancelled booking for ${targetRes.propertyName} (${targetRes.checkIn} to ${targetRes.checkOut}). Dates released on multi-calendar.`,
        status: 'Auto-executed',
      },
      ...prev,
    ]);

    // Notification
    setAllNotifications(prev => [
      {
        id: `notif-cancel-${Date.now()}`,
        workspaceId: activeWorkspaceId,
        type: 'booking',
        title: 'Reservation Cancelled',
        message: `${targetRes.guestName} cancelled reservation at ${targetRes.propertyName}. Dates released.`,
        time: 'Just now',
        unread: true,
      },
      ...prev,
    ]);
  };

  const checkoutReservation = (reservationId: string) => {
    const res = allReservations.find(r => r.id === reservationId);
    if (!res) return;

    // Update reservation status
    setAllReservations(prev => prev.map(r => r.id === reservationId ? { ...r, status: 'Checked Out' } : r));

    // Update property occupancy
    const prop = allProperties.find(p => p.id === res.propertyId);
    if (prop) {
      setAllProperties(prev => prev.map(p => {
        if (p.id === prop.id) {
          return {
            ...p,
            status: 'vacant',
            currentGuest: undefined,
          };
        }
        return p;
      }));

      const cleaner = prop.rules.preferredCleaner || 'Made Budiasa';

      // Create Turnover Cleaning Schedule
      const newScheduleId = `clean-${Date.now()}`;
      const newSchedule: CleaningSchedule = {
        id: newScheduleId,
        workspaceId: activeWorkspaceId!,
        propertyId: prop.id,
        propertyName: prop.name,
        cleaner,
        cleaningStatus: 'In Progress',
        inspectionStatus: 'Pending',
        checkOutTime: '11:00 Today',
        nextCheckInTime: prop.nextCheckIn?.time || '15:00',
        nextGuestName: prop.nextCheckIn?.guestName || 'Upcoming Guest',
        checklist: {
          linensChanged: false,
          poolCleaned: false,
          freshTowels: true,
          welcomeBasket: false,
          acChecked: false,
        },
      };
      setAllCleaningSchedules(prev => [newSchedule, ...prev.filter(cs => cs.propertyId !== prop.id)]);

      // Create Turnover Task
      const newTask: Task = {
        id: `task-turnover-${Date.now()}`,
        workspaceId: activeWorkspaceId!,
        propertyId: prop.id,
        propertyName: prop.name,
        title: `Full Turnover Cleaning for ${cleaner}`,
        type: 'cleaning',
        assignedTo: cleaner,
        priority: 'urgent',
        dueTime: `${prop.nextCheckIn?.time ? '14:00' : '15:00'} Today`,
        status: 'in_progress',
        notes: `Checkout complete for ${res.guestName}. Next arrival: ${prop.nextCheckIn?.guestName || 'Soon'}.`,
      };
      setAllTasks(prev => [newTask, ...prev]);

      // If next guest arrives soon, create an AI Alert in aiActions
      if (prop.nextCheckIn) {
        const warningAction: AiAction = {
          id: `act-warn-${Date.now()}`,
          workspaceId: activeWorkspaceId!,
          propertyId: prop.id,
          propertyName: prop.name,
          title: `Cleaning Late Warning: ${prop.name}`,
          type: 'cleaning',
          confidence: 0.94,
          reasoning: `${prop.name} has next guest (${prop.nextCheckIn.guestName}) arriving at ${prop.nextCheckIn.time}. Turnover cleaning was just initiated and is not yet marked ready.`,
          suggestedAction: `Dispatch urgent turnover checklist notification to ${cleaner} via WhatsApp.`,
          status: 'pending',
          impactEstimate: 'Prevents negative check-in review',
        };
        setAiActions(prev => [warningAction, ...prev]);
      }

      // Log to AI Log
      setAiLogs(prev => [
        {
          id: `log-${Date.now()}`,
          workspaceId: activeWorkspaceId!,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: 'Today',
          category: 'Operations',
          action: `Checkout completed: ${res.guestName} at ${prop.name}`,
          details: `Triggered turnover cleaning for ${cleaner}. Inspected next check-in window.`,
          status: 'Auto-executed',
        },
        ...prev,
      ]);

      // Notification
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          workspaceId: activeWorkspaceId!,
          type: 'cleaning',
          title: 'Guest Checkout Completed',
          message: `${res.guestName} checked out of ${prop.name}. Housekeeping turnover created for ${cleaner}.`,
          time: 'Just now',
          unread: true,
        },
        ...prev,
      ]);
    }
  };

  const connectSocialAccount = (propertyId: string, provider: 'Instagram' | 'Facebook' | 'TikTok' | 'Google Business') => {
    return new Promise(async (resolve, reject) => {
      if (provider === 'Instagram') {
        try {
          const redirectUri = `${window.location.origin}/api/social/instagram/callback`;
          console.log(`[VillaOS] Initiating Instagram connect for property: ${propertyId}`);
          
          const response = await fetch('/api/social/instagram/auth-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ redirectUri, propertyId, workspaceId: activeWorkspaceId })
          });
          
          if (!response.ok) {
            throw new Error('Failed to reach authentication server.');
          }

          const data = await response.json();
          console.log(`[VillaOS] Auth URL generated. Mode: ${data.isLive ? 'LIVE' : 'DEMO'}`);
          
          const popup = window.open(data.url, 'oauth', 'width=600,height=700');
          if (!popup) {
            throw new Error('Popup blocked. Please allow popups to connect your Instagram account.');
          }

          const handleMessage = (event: MessageEvent) => {
            if (!event.origin.endsWith('.run.app') && !event.origin.includes('localhost') && !event.origin.includes('127.0.0.1')) {
              return;
            }

            if (event.data?.type === 'INSTAGRAM_CONNECTED') {
              const { payload } = event.data;
              console.log(`[VillaOS] Instagram connection received: ${payload.externalAccountId}`);
              
              const property = properties.find(p => p.id === payload.propertyId);
              
              if (payload.alreadyExists) {
                const existingAcc = socialAccounts.find(a => a.externalAccountId === payload.externalAccountId);
                if (existingAcc) {
                  const errorMsg = `This Instagram account (@${payload.profile.username}) is already connected to ${existingAcc.propertyName}.`;
                  alert(errorMsg);
                  window.removeEventListener('message', handleMessage);
                  reject(new Error(errorMsg));
                  return;
                }
              }

              if (property && payload.success) {
                const newAccount: SocialAccount = {
                  id: `soc-acc-${Date.now()}`,
                  workspaceId: activeWorkspaceId!,
                  externalAccountId: payload.externalAccountId,
                  platform: provider,
                  handle: `@${payload.profile?.username || 'new_account'}`,
                  name: property.name,
                  propertyId: property.id,
                  propertyName: property.name,
                  status: payload.isLive ? 'Connected' : 'Demo Connection',
                  followers: payload.profile?.followers || 0,
                  engagementRate: payload.profile?.engagementRate || 0,
                  lastSync: 'Just now',
                  connectedAt: new Date().toISOString()
                };
                setAllSocialAccounts(prev => [...prev, newAccount]);
                console.log(`[VillaOS] Social account added to state: ${newAccount.handle}`);
                window.removeEventListener('message', handleMessage);
                resolve(data);
              } else {
                reject(new Error('Property mapping failed or connection unsuccessful.'));
              }
            } else if (event.data?.type === 'INSTAGRAM_AUTH_ERROR') {
              console.error('[VillaOS] Instagram auth error:', event.data.error);
              alert(`Authentication failed: ${event.data.error}`);
              window.removeEventListener('message', handleMessage);
              reject(new Error(event.data.error));
            }
          };

          window.addEventListener('message', handleMessage);
          
          // Cleanup if popup is closed
          const checkPopup = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkPopup);
              console.log('[VillaOS] OAuth popup closed by user');
              setTimeout(() => {
                window.removeEventListener('message', handleMessage);
                resolve(data); 
              }, 1000);
            }
          }, 1000);

      } catch (e: any) {
        console.error('[VillaOS] Failed to initiate Instagram connect', e);
        reject(e);
      }
    } else {
      // Fallback for other providers
      try {
        const response = await fetch('/api/social/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, code: 'mock-oauth-code-123' })
        });
        const data = await response.json();
        
        const property = properties.find(p => p.id === propertyId);
        if (property && data.success && activeWorkspaceId) {
          const newAccount: SocialAccount = {
            id: `soc-acc-${Date.now()}`,
            workspaceId: activeWorkspaceId,
            externalAccountId: data.externalAccountId,
            platform: provider,
            handle: `@${data.profile?.username || 'new_account'}`,
            name: property.name,
            propertyId: property.id,
            propertyName: property.name,
            status: 'Connected',
            followers: data.profile?.followers || 0,
            engagementRate: 0,
            lastSync: 'Just now'
          };
          setAllSocialAccounts(prev => [...prev, newAccount]);
          resolve(data);
        } else {
          reject(new Error(`Failed to connect ${provider} account`));
        }
      } catch (e) {
        console.error(`Failed to connect ${provider} account`, e);
        reject(e);
      }
    }
    });
  };

  const disconnectSocialAccount = async (accountId: string) => {
    try {
      await fetch('/api/social/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });
      setAllSocialAccounts(prev => prev.map(a => a.id === accountId ? { ...a, status: 'Disconnected' } : a));
    } catch (e) {
      console.error('Failed to disconnect social account', e);
    }
  };

  const syncSocialAccount = async (accountId: string) => {
    setAllSocialAccounts(prev => prev.map(a => a.id === accountId ? { ...a, status: 'Syncing' } : a));
    try {
      const account = socialAccounts.find(a => a.id === accountId);
      if (!account) return;

      const response = await fetch('/api/social/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: account.externalAccountId })
      });
      const data = await response.json();
      
      if (response.ok && data.success && data.profile) {
        setAllSocialAccounts(prev => prev.map(a => 
          a.id === accountId ? { 
            ...a, 
            followers: data.profile.followers || a.followers, 
            engagementRate: data.profile.engagementRate || a.engagementRate,
            status: a.platform === 'Instagram' && account.externalAccountId?.startsWith('ig-demo-') ? 'Demo Connection' : 'Connected',
            lastSync: 'Just now',
            lastError: undefined
          } : a
        ));
      } else {
        const errorMsg = data.error || 'Sync failed';
        let status: SocialAccount['status'] = 'Error';
        
        if (errorMsg.includes('REAUTH_REQUIRED')) {
          status = 'Reauth Required';
        }

        setAllSocialAccounts(prev => prev.map(a => 
          a.id === accountId ? { ...a, status, lastError: errorMsg, lastSync: 'Failed' } : a
        ));
      }
    } catch (e: any) {
      console.error('Failed to sync social account', e);
      setAllSocialAccounts(prev => prev.map(a => 
        a.id === accountId ? { ...a, status: 'Error', lastError: e.message } : a
      ));
    }
  };

  const notifyCleaner = (scheduleId: string) => {
    const sched = cleaningSchedules.find(cs => cs.id === scheduleId);
    if (!sched) return;

    setAllCleaningSchedules(prev => prev.map(cs => cs.id === scheduleId ? { ...cs, cleaningStatus: 'In Progress' } : cs));

    setAiLogs(prev => [
      {
        id: `log-${Date.now()}`,
        workspaceId: activeWorkspaceId || DEMO_WORKSPACE_ID,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        category: 'Operations',
        action: `Turnover dispatch sent to ${sched.cleaner} for ${sched.propertyName}`,
        details: `Sent turnover checklist and expected arrival time (${sched.nextCheckInTime}) via WhatsApp.`,
        status: 'Auto-executed',
      },
      ...prev,
    ]);

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        workspaceId: activeWorkspaceId || DEMO_WORKSPACE_ID,
        type: 'cleaning',
        title: 'Cleaner Notified via WhatsApp',
        message: `Direct WhatsApp turnover alert dispatched to ${sched.cleaner}.`,
        time: 'Just now',
        unread: true,
      },
      ...prev,
    ]);
  };

  const executeAiOperationalPlan = (plan: { title: string; propertyId: string; actions: string[] }) => {
    if (!activeWorkspaceId) return;
    const prop = properties.find(p => p.id === plan.propertyId);
    if (!prop) return;
    
    const cleaner = prop.rules.preferredCleaner || 'Made Budiasa';
    const tech = prop.rules.preferredTechnician || 'Nyoman Jaya';

    // 1. Create turnover task
    const taskLinens: Task = {
      id: `task-plan-1-${Date.now()}`,
      workspaceId: activeWorkspaceId,
      propertyId: prop.id,
      propertyName: prop.name,
      title: `Pre-Arrival Room & Linen Inspection`,
      type: 'cleaning',
      assignedTo: cleaner,
      priority: 'urgent',
      dueTime: '12:00 PM Today',
      status: 'in_progress',
      notes: `Master suite linens changed, frangipani welcome setup, young coconuts in fridge. Access PIN: ${prop.rules.accessCode || '8842'}.`,
    };

    // 2. Create AC / Pool inspection task
    const taskAc: Task = {
      id: `task-plan-2-${Date.now()}`,
      workspaceId: activeWorkspaceId,
      propertyId: prop.id,
      propertyName: prop.name,
      title: `HVAC & Pool Water Quality Check`,
      type: 'maintenance',
      assignedTo: tech,
      priority: 'high',
      dueTime: '01:00 PM Today',
      status: 'todo',
      notes: `Ensure all 5 bedroom AC units cool to 21°C. Test Wi-Fi speed (${prop.rules.wifiProvider || 'Biznet'}).`,
    };

    setAllTasks(prev => [taskLinens, taskAc, ...prev]);

    // 3. Mark cleaning schedule active
    setAllCleaningSchedules(prev => prev.map(cs => {
      if (cs.propertyId === prop.id) {
        return {
          ...cs,
          cleaningStatus: 'In Progress',
          nextCheckInTime: prop.nextCheckIn?.time || '15:00',
        };
      }
      return cs;
    }));

    // 4. Log to AI Logs
    setAiLogs(prev => [
      {
        id: `log-${Date.now()}`,
        workspaceId: activeWorkspaceId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        category: 'Operations',
        action: `Executed Coordinated Plan: ${plan.title}`,
        details: `Assigned turnover to ${cleaner}, climate inspection to ${tech}, and verified Wi-Fi/access codes for incoming guest.`,
        status: 'Approved by User',
      },
      ...prev,
    ]);

    // 5. Notify user
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        workspaceId: activeWorkspaceId,
        type: 'cleaning',
        title: 'Operational Plan Executed',
        message: `${plan.title} activated. Housekeeper and technician dispatched.`,
        time: 'Just now',
        unread: true,
      },
      ...prev,
    ]);
  };

  const approveAiAction = (actionId: string) => {
    const action = aiActions.find(a => a.id === actionId);
    if (!action) return;

    // Update the action status
    setAiActions(prev => prev.map(a => a.id === actionId ? { ...a, status: 'approved' } : a));

    // Execute state effects based on action type
    if (action.type === 'pricing' && action.propertyId) {
      setAllProperties(prev => prev.map(p => {
        if (p.id === action.propertyId) {
          const adjustment = action.dataPayload?.discountPercent 
            ? p.dailyRate * (1 - action.dataPayload.discountPercent / 100)
            : action.dataPayload?.increasePercent 
              ? p.dailyRate * (1 + action.dataPayload.increasePercent / 100)
              : p.dailyRate;
          return { ...p, dailyRate: Math.round(adjustment) };
        }
        return p;
      }));
    } else if (action.type === 'messaging') {
      sendChatMessage('conv-1', 'Hi Sophia! Early check-in at 1:00 PM is confirmed. Villa Canggu 08 turnover is priority scheduled for Made Budiasa, and keypad access PIN is 8842.', 'ai');
    } else if (action.type === 'cleaning') {
      const propId = action.propertyId;
      if (!propId) return;
      const propName = action.propertyName || 'Property';
      const prop = properties.find(p => p.id === propId);
      const cleaner = prop?.rules.preferredCleaner || 'Made Budiasa';
      setAllTasks(prev => [
        {
          id: `task-gen-${Date.now()}`,
          workspaceId: activeWorkspaceId!,
          propertyId: propId,
          propertyName: propName,
          title: action.title,
          type: 'cleaning',
          assignedTo: cleaner,
          priority: 'urgent',
          dueTime: '12:30 PM Today',
          status: 'in_progress',
          notes: `Action approved by user. Cleaner ${cleaner} alerted.`,
        },
        ...prev,
      ]);
      setAllCleaningSchedules(prev => prev.map(cs => cs.propertyId === propId ? { ...cs, cleaningStatus: 'In Progress' } : cs));
    } else if (action.type === 'maintenance') {
      const propId = action.propertyId;
      if (!propId) return;
      const prop = properties.find(p => p.id === propId);
      const tech = prop?.rules.preferredTechnician || 'Made Artha';
      createMaintenanceIssue({
        propertyId: propId,
        propertyName: action.propertyName || prop?.name || 'Property',
        problem: action.title,
        priority: 'high',
        assignedTechnician: tech,
        eta: 'Within 2 hours',
      });
    }

    // Append to AI Log
    const newLog: AiLogEntry = {
      id: `log-${Date.now()}`,
      workspaceId: activeWorkspaceId!,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      category: action.type === 'pricing' ? 'Revenue' : action.type === 'messaging' ? 'Guest Communication' : 'Operations',
      action: `Approved: ${action.title}`,
      details: action.suggestedAction,
      status: 'Approved by User',
    };
    setAiLogs(prev => [newLog, ...prev]);

    // Add positive notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        type: 'booking',
        title: 'Action Executed',
        message: `${action.title} was approved and executed successfully.`,
        time: 'Just now',
        unread: true,
      },
      ...prev,
    ]);
  };

  const dismissAiAction = (actionId: string) => {
    setAiActions(prev => prev.map(a => a.id === actionId ? { ...a, status: 'dismissed' } : a));
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  const markCleaningReady = (scheduleId: string) => {
    setAllCleaningSchedules(prev => prev.map(cs => {
      if (cs.id === scheduleId) {
        return {
          ...cs,
          cleaningStatus: 'Completed',
          inspectionStatus: 'Passed',
          checklist: {
            linensChanged: true,
            poolCleaned: true,
            freshTowels: true,
            welcomeBasket: true,
            acChecked: true,
          },
        };
      }
      return cs;
    }));

    // Append to AI logs
    setAiLogs(prev => [
      {
        id: `log-${Date.now()}`,
        workspaceId: activeWorkspaceId || DEMO_WORKSPACE_ID,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        category: 'Operations',
        action: 'Villa marked clean and ready for guest arrival',
        details: 'Cleaning checklist validated. Guest welcome frangipanis prepared.',
        status: 'Auto-executed',
      },
      ...prev,
    ]);
  };

  const requestCleaningInspection = (scheduleId: string) => {
    setAllCleaningSchedules(prev => prev.map(cs => {
      if (cs.id === scheduleId) {
        return {
          ...cs,
          cleaningStatus: 'Ready for Inspection',
          inspectionStatus: 'Pending',
        };
      }
      return cs;
    }));
  };

  const createMaintenanceIssue = (issue: Partial<MaintenanceIssue>) => {
    if (!activeWorkspaceId) return;
    const propId = issue.propertyId;
    if (!propId) return;
    const prop = properties.find(p => p.id === propId);
    if (!prop) return;

    const tech = issue.assignedTechnician || prop.rules.preferredTechnician || 'Staff member';
    const propName = prop.name;
    const problem = issue.problem || 'Standard inspection needed';
    
    const newIssue: MaintenanceIssue = {
      id: `maint-${Date.now()}`,
      workspaceId: activeWorkspaceId,
      propertyId: propId,
      propertyName: propName,
      problem,
      location: issue.location || 'General',
      priority: issue.priority || 'medium',
      assignedTechnician: tech,
      eta: issue.eta || 'Within 2 hours',
      status: 'Open',
      estimatedCost: issue.estimatedCost || 350000,
      reportedBy: issue.reportedBy || 'AI Operations Agent',
      reportedAt: 'Just now',
      aiClassification: issue.aiClassification || {
        category: 'General Maintenance',
        urgencyReason: 'Proactive preventative assessment.',
      },
    };
    setAllMaintenanceIssues(prev => [newIssue, ...prev]);

    // Create a matching operations task
    setAllTasks(prev => [
      {
        id: `task-maint-${Date.now()}`,
        workspaceId: activeWorkspaceId,
        propertyId: newIssue.propertyId,
        propertyName: propName,
        title: `Repair: ${problem}`,
        type: 'maintenance',
        assignedTo: tech,
        priority: newIssue.priority === 'urgent' ? 'urgent' : newIssue.priority === 'high' ? 'high' : 'medium',
        dueTime: newIssue.eta,
        status: 'todo',
        notes: `AI Classified: ${newIssue.aiClassification.category}. Reason: ${newIssue.aiClassification.urgencyReason}`,
        cost: newIssue.estimatedCost,
      },
      ...prev,
    ]);

    // AI Log
    setAiLogs(prev => [
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        category: 'Operations',
        action: `Classified & Dispatched Maintenance: ${problem}`,
        details: `Assigned technician ${tech} to ${propName}. Estimated cost: ${formatIDR(newIssue.estimatedCost)}.`,
        status: 'Auto-executed',
      },
      ...prev,
    ]);

    // Notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        type: 'maintenance',
        title: 'Maintenance Ticket Dispatched',
        message: `${problem} at ${propName} assigned to ${tech}.`,
        time: 'Just now',
        unread: true,
      },
      ...prev,
    ]);
  };

  const resolveMaintenanceIssue = (id: string) => {
    setAllMaintenanceIssues(prev => prev.map(m => m.id === id ? { ...m, status: 'Resolved' } : m));
  };

  const sendChatMessage = (conversationId: string, text: string, sender: 'host' | 'ai' | 'guest' = 'host') => {
    setAllConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        const newMessage = {
          id: `m-${Date.now()}`,
          sender,
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          channel: c.channel || 'Guest Portal',
        };
        return {
          ...c,
          lastMessage: text,
          lastMessageTime: 'Just now',
          unreadCount: sender === 'guest' ? (c.unreadCount || 0) + 1 : 0,
          messages: [...c.messages, newMessage],
        };
      }
      return c;
    }));
  };

  const updatePropertyRules = (propertyId: string, updatedRules: Partial<Property['rules']>) => {
    setAllProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        return {
          ...p,
          rules: { ...p.rules, ...updatedRules },
        };
      }
      return p;
    }));
  };

  const updatePropertyPrice = (propertyId: string, newRate: number) => {
    setAllProperties(prev => prev.map(p => p.id === propertyId ? { ...p, dailyRate: newRate } : p));
  };

  const scheduleSocialPost = (post: any) => {
    const newPost: SocialPost = {
      ...post,
      id: post.id || `soc-${Date.now()}`,
    };
    setAllSocialPosts(prev => [newPost, ...prev]);
  };

  const resolveMaintenance = (id: string) => {
    resolveMaintenanceIssue(id);
  };

  const sendGuestMessage = (conversationId: string, text: string) => {
    setAllConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        const newMessage = {
          id: `m-g-${Date.now()}`,
          sender: 'guest' as const,
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          channel: c.channel || 'Guest Portal',
        };
        return {
          ...c,
          lastMessage: text,
          lastMessageTime: 'Just now',
          unreadCount: (c.unreadCount || 0) + 1,
          messages: [...c.messages, newMessage],
        };
      }
      return c;
    }));
  };

  const submitGuestPortalRequest = async (params: {
    propertyId: string;
    text: string;
    type?: 'chat' | 'cleaning' | 'maintenance' | 'assistance';
    guestName?: string;
    preferredTime?: string;
  }) => {
    const { propertyId, text, type = 'chat', preferredTime } = params;
    const prop = allProperties.find(p => p.id === propertyId);
    if (!prop) {
      throw new Error(`Property ${propertyId} not found`);
    }

    const boundWorkspaceId = prop.workspaceId;
    const currentGuest = params.guestName || 'In-Villa Guest';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Find or create conversation for this property
    let targetConvId = '';
    const existingConv = allConversations.find(c => 
      c.workspaceId === boundWorkspaceId && 
      (c.propertyId === propertyId || c.propertyName === prop.name) &&
      c.channel === 'Guest Portal'
    ) || allConversations.find(c => 
      c.workspaceId === boundWorkspaceId && 
      (c.propertyId === propertyId || c.propertyName === prop.name)
    );

    const guestMsg = {
      id: `msg-g-${Date.now()}`,
      sender: 'guest' as const,
      text: preferredTime ? `${text} (Preferred Time: ${preferredTime})` : text,
      timestamp,
      channel: 'Guest Portal' as const,
      category: type
    };

    // AI Intent & Suggestion Generation
    const lower = text.toLowerCase();
    const isMaintenance = type === 'maintenance' || 
      lower.includes('ac') || lower.includes('leak') || lower.includes('broken') || 
      lower.includes('hot water') || lower.includes('drain') || lower.includes('light') || 
      lower.includes('wifi') || lower.includes('electric') || lower.includes('pool pump');

    const isCleaning = type === 'cleaning' || 
      lower.includes('towel') || lower.includes('linen') || lower.includes('clean') || 
      lower.includes('housekeep') || lower.includes('trash') || lower.includes('amenities');

    const isAssistance = type === 'assistance' || 
      lower.includes('breakfast') || lower.includes('scooter') || lower.includes('driver') || 
      lower.includes('airport') || lower.includes('massage') || lower.includes('late checkout');

    let aiReply = `Hi ${currentGuest}, thank you for reaching out! Our team at ${prop.name} has received your message and is attending to this.`;
    let actionCreated = false;

    if (isMaintenance) {
      const tech = prop.rules.preferredTechnician || 'Nyoman Jaya';
      aiReply = `Hi ${currentGuest}, we have logged this maintenance report for ${prop.name}. Our technician (${tech}) has been alerted and will inspect within 1-2 hours.`;
      
      const newAction: AiAction = {
        id: `act-maint-${Date.now()}`,
        workspaceId: boundWorkspaceId,
        propertyId: prop.id,
        propertyName: prop.name,
        title: `Guest Maintenance: ${text.substring(0, 45)}`,
        type: 'maintenance',
        confidence: 0.96,
        reasoning: `Guest reported maintenance via In-Villa QR Portal: "${text}". Requires technical dispatch.`,
        suggestedAction: `Dispatch ${tech} to inspect and resolve at ${prop.name}.`,
        status: 'pending',
        impactEstimate: 'Prevents guest dissatisfaction & review impact',
      };
      setAiActions(prev => [newAction, ...prev]);
      actionCreated = true;

      setAllAiLogs(prev => [
        {
          id: `log-${Date.now()}`,
          workspaceId: boundWorkspaceId,
          time: timestamp,
          date: 'Today',
          category: 'Operations',
          action: `Classified Guest QR Maintenance Ticket: ${text.substring(0, 40)}`,
          details: `Proposed technician dispatch to ${tech} for ${prop.name}.`,
          status: 'Auto-executed',
        },
        ...prev,
      ]);

      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          workspaceId: boundWorkspaceId,
          type: 'maintenance',
          title: `In-Villa QR: Maintenance Report (${prop.name})`,
          message: `${currentGuest}: "${text}". Ready for owner approval.`,
          time: 'Just now',
          unread: true,
        },
        ...prev,
      ]);
    } else if (isCleaning) {
      const cleaner = prop.rules.preferredCleaner || 'Wayan Suparta';
      aiReply = `Hi ${currentGuest}, our housekeeping team (${cleaner}) has received your request and will provide fresh service to ${prop.name} shortly.`;
      
      const newAction: AiAction = {
        id: `act-clean-${Date.now()}`,
        workspaceId: boundWorkspaceId,
        propertyId: prop.id,
        propertyName: prop.name,
        title: `Guest Housekeeping Request: ${text.substring(0, 45)}`,
        type: 'cleaning',
        confidence: 0.95,
        reasoning: `Guest requested cleaning/amenities via In-Villa QR Portal: "${text}".`,
        suggestedAction: `Notify housekeeper ${cleaner} to attend to ${prop.name}.`,
        status: 'pending',
        impactEstimate: 'High guest hospitality score',
      };
      setAiActions(prev => [newAction, ...prev]);
      actionCreated = true;

      setAllAiLogs(prev => [
        {
          id: `log-${Date.now()}`,
          workspaceId: boundWorkspaceId,
          time: timestamp,
          date: 'Today',
          category: 'Operations',
          action: `Classified Guest QR Housekeeping: ${text.substring(0, 40)}`,
          details: `Prepared turnover/refresh task for ${cleaner}.`,
          status: 'Auto-executed',
        },
        ...prev,
      ]);

      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          workspaceId: boundWorkspaceId,
          type: 'cleaning',
          title: `In-Villa QR: Housekeeping Request (${prop.name})`,
          message: `${currentGuest}: "${text}". Ready for owner dispatch.`,
          time: 'Just now',
          unread: true,
        },
        ...prev,
      ]);
    } else if (isAssistance) {
      aiReply = `Hi ${currentGuest}, we would be delighted to organize this for you! Our concierge desk is arranging this now.`;
      
      const newAction: AiAction = {
        id: `act-assist-${Date.now()}`,
        workspaceId: boundWorkspaceId,
        propertyId: prop.id,
        propertyName: prop.name,
        title: `Concierge Request: ${text.substring(0, 45)}`,
        type: 'messaging',
        confidence: 0.92,
        reasoning: `Guest requested concierge assistance via In-Villa QR Portal: "${text}".`,
        suggestedAction: `Coordinate requested service for ${currentGuest} at ${prop.name}.`,
        status: 'pending',
        impactEstimate: 'Upsell & 5-star experience opportunity',
      };
      setAiActions(prev => [newAction, ...prev]);
      actionCreated = true;

      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          workspaceId: boundWorkspaceId,
          type: 'booking',
          title: `In-Villa QR: Concierge Request (${prop.name})`,
          message: `${currentGuest}: "${text}".`,
          time: 'Just now',
          unread: true,
        },
        ...prev,
      ]);
    } else {
      if (lower.includes('wifi') || lower.includes('internet')) {
        aiReply = `Hi ${currentGuest}! The Wi-Fi network is "${prop.rules.wifiName || prop.name + ' HighSpeed'}" with password: "${prop.rules.wifiPassword || 'balivilla2026'}".`;
      } else if (lower.includes('checkout') || lower.includes('check out') || lower.includes('time')) {
        aiReply = `Hi ${currentGuest}! Standard check-out time is ${prop.rules.checkOutTime || '11:00'}. Please leave keys in lockbox code ${prop.rules.accessCode || '8842'}. Let us know if you need airport transport!`;
      }

      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          workspaceId: boundWorkspaceId,
          type: 'booking',
          title: `New Guest Message (${prop.name})`,
          message: `${currentGuest}: "${text}".`,
          time: 'Just now',
          unread: true,
        },
        ...prev,
      ]);
    }

    if (existingConv) {
      targetConvId = existingConv.id;
      setAllConversations(prev => prev.map(c => {
        if (c.id === existingConv.id) {
          return {
            ...c,
            lastMessage: text,
            lastMessageTime: 'Just now',
            unreadCount: (c.unreadCount || 0) + 1,
            aiSuggestedReply: aiReply,
            messages: [...c.messages, guestMsg],
          };
        }
        return c;
      }));
    } else {
      targetConvId = `conv-qr-${prop.id}-${Date.now()}`;
      const newConv: Conversation = {
        id: targetConvId,
        workspaceId: boundWorkspaceId,
        propertyId: prop.id,
        propertyName: prop.name,
        guestId: `guest-${prop.id}`,
        guestName: currentGuest,
        guestAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        channel: 'Guest Portal',
        lastMessage: text,
        lastMessageTime: 'Just now',
        unreadCount: 1,
        aiSuggestedReply: aiReply,
        messages: [
          {
            id: `msg-welcome-${Date.now()}`,
            sender: 'host',
            text: `Welcome to ${prop.name}! Our on-call villa team is here to assist your stay anytime.`,
            timestamp: 'Earlier',
            channel: 'Guest Portal'
          },
          guestMsg
        ]
      };
      setAllConversations(prev => [newConv, ...prev]);
    }

    // Also notify backend server silently
    try {
      fetch('/api/guest-portal/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          text,
          guestName: currentGuest,
          category: type
        })
      }).catch(() => {});
    } catch {}

    return { conversationId: targetConvId, aiSuggestedReply: aiReply, actionCreated };
  };

  const addSocialPost = (post: Omit<SocialPost, 'id'>) => {
    if (!activeWorkspaceId) return;
    const newPost: SocialPost = {
      ...post,
      id: `soc-${Date.now()}`,
      workspaceId: activeWorkspaceId,
    };
    setAllSocialPosts(prev => [newPost, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const analyzeSocialLead = async (leadId: string, message: string) => {
    try {
      const lead = allSocialLeads.find(l => l.id === leadId);
      if (!lead) return;

      const property = allProperties.find(p => p.id === lead.propertyId);
      if (!property) return;

      const propertyContext = `
        Villa Name: ${property.name}
        Location: ${property.location}
        Area: ${property.area}
        Bedrooms: ${property.bedrooms}
        Max Guests: ${property.maxGuests}
        Daily Rate: ${property.dailyRate} IDR (${formatIDR(property.dailyRate)})
        Amenities: ${property.amenities.join(', ')}
        Check-in: ${property.rules.checkInTime}, Check-out: ${property.rules.checkOutTime}
      `;

      const propertyReservations = allReservations.filter(r => r.propertyId === property.id && r.status !== 'Cancelled');
      const availabilityContext = `
        Current Confirmed Bookings:
        ${propertyReservations.length === 0 ? 'No active bookings. Dates are fully open.' : propertyReservations.map(r => `- ${r.checkIn} to ${r.checkOut} (Status: ${r.status}, Guests: ${r.guestsCount})`).join('\n')}
      `;

      const response = await fetch('/api/social/analyze-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, propertyContext, availabilityContext })
      });

      const analysis = await response.json();

      if (response.ok && analysis.intent) {
        const checkIn = analysis.intent.checkIn || (analysis.intent.dates?.split(' to ')[0]);
        const checkOut = analysis.intent.checkOut || (analysis.intent.dates?.split(' to ')[1]);
        const nights = analysis.intent.nights || (checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))) : 3);
        const calculatedPrice = analysis.intent.calculatedPrice || (property.dailyRate * nights);

        const updatedIntent = {
          ...analysis.intent,
          checkIn,
          checkOut,
          nights,
          calculatedPrice,
          draftReply: analysis.suggestedReply,
        };

        setAllSocialLeads(prev => prev.map(l => l.id === leadId ? {
          ...l,
          intent: updatedIntent,
          aiSummary: analysis.summary,
          lastMessage: message,
          estimatedValue: calculatedPrice,
          status: 'Conversing'
        } : l));

        setAllConversations(prev => prev.map(c => {
          if (c.guestName === lead.guestName && c.channel === lead.sourcePlatform) {
            return { ...c, aiSuggestedReply: analysis.suggestedReply };
          }
          return c;
        }));
      }
    } catch (e) {
      console.error('Failed to analyze social lead', e);
    }
  };

  const convertLeadToBooking = async (leadId: string) => {
    if (!activeWorkspaceId) return;
    const lead = allSocialLeads.find(l => l.id === leadId && l.workspaceId === activeWorkspaceId);
    if (!lead || !lead.intent) return;

    const property = allProperties.find(p => p.id === lead.propertyId && p.workspaceId === activeWorkspaceId);
    if (!property) return;

    const checkIn = lead.intent.checkIn || lead.intent.dates?.split(' to ')[0] || new Date().toISOString().split('T')[0];
    const checkOut = lead.intent.checkOut || lead.intent.dates?.split(' to ')[1] || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nights = lead.intent.nights || Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
    const totalAmount = lead.intent.calculatedPrice || (property.dailyRate * nights);

    const resData: Partial<Reservation> = {
      workspaceId: activeWorkspaceId,
      propertyId: property.id,
      guestName: lead.guestName,
      channel: lead.sourcePlatform as any,
      checkIn,
      checkOut,
      nights,
      guestsCount: lead.intent.guests || 2,
      totalAmount,
      specialRequests: `Lead converted from ${lead.sourcePlatform} inquiry. Full revenue and channel attribution preserved.`,
    };

    const newRes = createReservation(resData);

    setAllSocialLeads(prev => prev.map(l => l.id === leadId ? {
      ...l,
      status: 'Converted',
      reservationId: newRes.id,
      estimatedValue: totalAmount,
    } : l));

    setAllSocialAttributions(prev => {
      const exists = prev.some(a => a.workspaceId === activeWorkspaceId && a.platform === lead.sourcePlatform);
      if (exists) {
        return prev.map(a => (a.workspaceId === activeWorkspaceId && a.platform === lead.sourcePlatform) ? {
          ...a,
          bookings: a.bookings + 1,
          revenue: a.revenue + totalAmount
        } : a);
      }
      return [
        ...prev,
        {
          workspaceId: activeWorkspaceId,
          platform: lead.sourcePlatform,
          leads: 1,
          bookings: 1,
          revenue: totalAmount
        }
      ];
    });

    setAllAiLogs(prev => [
      {
        id: `log-${Date.now()}`,
        workspaceId: activeWorkspaceId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        category: 'Social Media',
        action: `Lead Converted: ${lead.guestName}`,
        details: `Converted ${lead.sourcePlatform} lead into confirmed booking #${newRes.id} for ${property.name} (${checkIn} to ${checkOut}, ${nights} nights). Revenue: ${formatIDR(totalAmount)}.`,
        status: 'Auto-executed',
      },
      ...prev,
    ]);

    setAllNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        workspaceId: activeWorkspaceId,
        type: 'booking',
        title: 'Social Lead Converted!',
        message: `${lead.guestName} booked ${property.name} via ${lead.sourcePlatform} (${nights} nights, ${formatIDR(totalAmount)}).`,
        time: 'Just now',
        unread: true,
      },
      ...prev,
    ]);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        userRole,
        setUserRole,
        theme,
        setTheme,
        toggleTheme,
        
        // Workspace
        workspaces,
        activeWorkspaceId,
        setActiveWorkspaceId,
        activeWorkspace,
        
        properties,
        archivedProperties,
        allProperties,
        selectedPropertyId,
        setSelectedPropertyId,
        
        onboardWorkspace,
        switchWorkspace,
        createProperty,
        editProperty,
        archiveProperty,
        restoreProperty,
        deleteProperty,
        
        reservations,
        guests,
        conversations,
        activeConversationId,
        setActiveConversationId,
        tasks,
        cleaningSchedules,
        maintenanceIssues,
        aiActions,
        aiLogs,
        socialPosts,
        socialAccounts,
        socialLeads,
        socialAttributions,
        notifications,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isPropertyOnboardingOpen,
        setIsPropertyOnboardingOpen,
        isWorkspaceOnboardingOpen,
        setIsWorkspaceOnboardingOpen,
        editingProperty,
        setEditingProperty,
        isAskAiOpen,
        setIsAskAiOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        approveAiAction,
        dismissAiAction,
        createTask,
        updateTaskStatus,
        createCleaningSchedule,
        markCleaningReady,
        requestCleaningInspection,
        notifyCleaner,
        createMaintenanceIssue,
        resolveMaintenanceIssue,
        resolveMaintenance,
        createReservation,
        editReservation,
        cancelReservation,
        checkoutReservation,
        resetDemoData,
        executeAiOperationalPlan,
        sendChatMessage,
        sendGuestMessage,
        submitGuestPortalRequest,
        updatePropertyRules,
        updatePropertyPrice,
        addSocialPost,
        scheduleSocialPost,
        markNotificationRead,
        clearAllNotifications,
        connectSocialAccount,
        disconnectSocialAccount,
        syncSocialAccount,
        analyzeSocialLead,
        convertLeadToBooking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
