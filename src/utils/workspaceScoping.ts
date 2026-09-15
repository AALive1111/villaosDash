import { 
  Property, 
  Reservation, 
  Guest, 
  Task, 
  CleaningSchedule, 
  MaintenanceIssue,
  Conversation,
  SocialPost,
  SocialAccount,
  SocialLead,
  SocialAttribution,
  AiAction,
  AiLogEntry,
  NotificationItem,
  Workspace
} from '../types';
import {
  mockWorkspaces,
  mockProperties,
  mockReservations,
  mockGuests,
  mockConversations,
  mockTasks,
  mockCleaningSchedules,
  mockMaintenanceIssues,
  mockAiActions,
  mockAiLogs,
  mockSocialPosts,
  mockSocialAccounts,
  mockSocialLeads,
  mockSocialAttributions,
  mockNotifications,
} from '../data/mockData';

export const DEMO_WORKSPACE_ID = 'ws-bali-01';

export const DEMO_PROPERTY_IDS = new Set<string>([
  'prop-1',
  'prop-2',
  'prop-3',
  'prop-4',
  'prop-5'
]);

export const isDemoWorkspace = (workspaceId: string | null | undefined): boolean => {
  return workspaceId === DEMO_WORKSPACE_ID;
};

export const isDemoProperty = (propertyId: string | null | undefined): boolean => {
  if (!propertyId) return false;
  return DEMO_PROPERTY_IDS.has(propertyId);
};

// ==========================================
// CENTRALIZED WORKSPACE SCOPING SELECTORS
// ==========================================

export const getWorkspaceProperties = (
  properties: Property[], 
  workspaceId: string | null | undefined
): Property[] => {
  if (!workspaceId) return [];
  return properties.filter(p => p.workspaceId === workspaceId && !p.isArchived);
};

export const getWorkspaceArchivedProperties = (
  properties: Property[], 
  workspaceId: string | null | undefined
): Property[] => {
  if (!workspaceId) return [];
  return properties.filter(p => p.workspaceId === workspaceId && p.isArchived);
};

export const getWorkspaceReservations = (
  reservations: Reservation[], 
  workspaceId: string | null | undefined, 
  propertyId?: string | null
): Reservation[] => {
  if (!workspaceId) return [];
  return reservations.filter(r => 
    r.workspaceId === workspaceId && (!propertyId || r.propertyId === propertyId)
  );
};

export const getWorkspaceGuests = (
  guests: Guest[], 
  workspaceId: string | null | undefined
): Guest[] => {
  if (!workspaceId) return [];
  return guests.filter(g => g.workspaceId === workspaceId);
};

export const getWorkspaceTasks = (
  tasks: Task[], 
  workspaceId: string | null | undefined, 
  propertyId?: string | null
): Task[] => {
  if (!workspaceId) return [];
  return tasks.filter(t => 
    t.workspaceId === workspaceId && (!propertyId || t.propertyId === propertyId)
  );
};

export const getWorkspaceCleaningSchedules = (
  schedules: CleaningSchedule[], 
  workspaceId: string | null | undefined, 
  propertyId?: string | null
): CleaningSchedule[] => {
  if (!workspaceId) return [];
  return schedules.filter(s => 
    s.workspaceId === workspaceId && (!propertyId || s.propertyId === propertyId)
  );
};

export const getWorkspaceMaintenanceIssues = (
  issues: MaintenanceIssue[], 
  workspaceId: string | null | undefined, 
  propertyId?: string | null
): MaintenanceIssue[] => {
  if (!workspaceId) return [];
  return issues.filter(i => 
    i.workspaceId === workspaceId && (!propertyId || i.propertyId === propertyId)
  );
};

export const getWorkspaceConversations = (
  conversations: Conversation[], 
  workspaceId: string | null | undefined, 
  propertyId?: string | null
): Conversation[] => {
  if (!workspaceId) return [];
  return conversations.filter(c => 
    c.workspaceId === workspaceId && (!propertyId || c.propertyId === propertyId)
  );
};

export const getWorkspaceSocialPosts = (
  posts: SocialPost[], 
  workspaceId: string | null | undefined, 
  propertyId?: string | null
): SocialPost[] => {
  if (!workspaceId) return [];
  return posts.filter(p => 
    p.workspaceId === workspaceId && (!propertyId || p.propertyId === propertyId)
  );
};

export const getWorkspaceSocialAccounts = (
  accounts: SocialAccount[], 
  workspaceId: string | null | undefined, 
  propertyId?: string | null
): SocialAccount[] => {
  if (!workspaceId) return [];
  return accounts.filter(a => 
    a.workspaceId === workspaceId && (!propertyId || a.propertyId === propertyId)
  );
};

export const getWorkspaceSocialLeads = (
  leads: SocialLead[], 
  workspaceId: string | null | undefined, 
  propertyId?: string | null
): SocialLead[] => {
  if (!workspaceId) return [];
  return leads.filter(l => 
    l.workspaceId === workspaceId && (!propertyId || l.propertyId === propertyId)
  );
};

export const getWorkspaceSocialAttributions = (
  attributions: SocialAttribution[], 
  workspaceId: string | null | undefined
): SocialAttribution[] => {
  if (!workspaceId) return [];
  return attributions.filter(a => a.workspaceId === workspaceId);
};

export const getWorkspaceAiActions = (
  actions: AiAction[], 
  workspaceId: string | null | undefined, 
  propertyId?: string | null
): AiAction[] => {
  if (!workspaceId) return [];
  return actions.filter(a => 
    a.workspaceId === workspaceId && (!propertyId || a.propertyId === propertyId)
  );
};

export const getWorkspaceAiLogs = (
  logs: AiLogEntry[], 
  workspaceId: string | null | undefined
): AiLogEntry[] => {
  if (!workspaceId) return [];
  return logs.filter(l => l.workspaceId === workspaceId);
};

export const getWorkspaceNotifications = (
  notifications: NotificationItem[], 
  workspaceId: string | null | undefined
): NotificationItem[] => {
  if (!workspaceId) return [];
  return notifications.filter(n => n.workspaceId === workspaceId);
};

// ==========================================
// DATA MIGRATION & REPAIR (ANTI-LEAK ENGINE)
// ==========================================

export interface SanitizedAppState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  properties: Property[];
  reservations: Reservation[];
  guests: Guest[];
  conversations: Conversation[];
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
}

/**
 * Inspects all state and storage records.
 * Identifies and repairs cross-workspace leaks (e.g., real properties leaked into Demo workspace).
 * Guarantees:
 *  - Every property belongs to exactly 1 workspaceId.
 *  - Demo workspace ('ws-bali-01') contains ONLY demo properties (prop-1 through prop-5).
 *  - Any real property (like "Test Villa") is migrated to its legitimate real workspace.
 *  - All child entities (reservations, tasks, leads, etc.) are strictly partitioned.
 */
export const sanitizeAndPartitionState = (raw: {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  properties: Property[];
  reservations: Reservation[];
  guests: Guest[];
  conversations: Conversation[];
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
}): SanitizedAppState => {
  // 1. Workspaces repair
  let workspaces = [...raw.workspaces];
  let demoWs = workspaces.find(w => w.id === DEMO_WORKSPACE_ID);
  if (!demoWs) {
    demoWs = {
      id: DEMO_WORKSPACE_ID,
      businessName: 'Bali Luxury Collection',
      ownerName: 'Made Wijaya',
      businessType: 'Villa Management Company',
      operationalArea: 'Seminyak, Canggu & Ubud',
      isDemo: true,
      createdAt: '2024-01-01T00:00:00Z',
    };
    workspaces.unshift(demoWs);
  } else {
    // Ensure marked as demo
    demoWs.isDemo = true;
  }

  // Find or determine primary real workspace
  let realWorkspaces = workspaces.filter(w => !w.isDemo && w.id !== DEMO_WORKSPACE_ID);
  
  // Check if any real property exists without a real workspace
  const hasOrphanRealProperties = raw.properties.some(p => !DEMO_PROPERTY_IDS.has(p.id));
  if (realWorkspaces.length === 0 && hasOrphanRealProperties) {
    const defaultRealWs: Workspace = {
      id: `ws-real-${Date.now()}`,
      businessName: 'My Villa Collection',
      ownerName: 'Villa Owner',
      businessType: 'Private Villa Owner',
      operationalArea: 'Bali, Indonesia',
      isDemo: false,
      createdAt: new Date().toISOString(),
    };
    workspaces.push(defaultRealWs);
    realWorkspaces.push(defaultRealWs);
  }

  const primaryRealWsId = realWorkspaces[0]?.id || null;

  // 2. Properties repair
  const repairedProperties: Property[] = raw.properties.map(p => {
    // If it's one of the 5 mock demo properties, it MUST belong to DEMO_WORKSPACE_ID
    if (DEMO_PROPERTY_IDS.has(p.id)) {
      return {
        ...p,
        workspaceId: DEMO_WORKSPACE_ID,
      };
    }

    // If it's a real property (e.g. "Test Villa"), it MUST NEVER belong to DEMO_WORKSPACE_ID
    if (p.workspaceId === DEMO_WORKSPACE_ID || !p.workspaceId) {
      console.warn(`[VillaOS Isolation] Detected leaked property "${p.name}" (ID: ${p.id}) in Demo Workspace. Migrating to real workspace: ${primaryRealWsId}`);
      return {
        ...p,
        workspaceId: primaryRealWsId || `ws-real-${Date.now()}`,
      };
    }

    // Ensure it belongs to a known workspace
    const wsExists = workspaces.some(w => w.id === p.workspaceId);
    if (!wsExists && primaryRealWsId) {
      return {
        ...p,
        workspaceId: primaryRealWsId,
      };
    }

    return p;
  });

  // Create property-to-workspace mapping for cascading child entities
  const propertyWorkspaceMap = new Map<string, string>();
  repairedProperties.forEach(p => {
    propertyWorkspaceMap.set(p.id, p.workspaceId);
  });

  // 3. Cascade and repair child entities
  const repairedReservations: Reservation[] = raw.reservations.map(r => {
    const owningWs = propertyWorkspaceMap.get(r.propertyId);
    if (owningWs) {
      return { ...r, workspaceId: owningWs };
    }
    if (r.workspaceId === DEMO_WORKSPACE_ID && !DEMO_PROPERTY_IDS.has(r.propertyId)) {
      return { ...r, workspaceId: primaryRealWsId || DEMO_WORKSPACE_ID };
    }
    return { ...r, workspaceId: r.workspaceId || DEMO_WORKSPACE_ID };
  });

  const repairedGuests: Guest[] = raw.guests.map(g => {
    return { ...g, workspaceId: g.workspaceId || DEMO_WORKSPACE_ID };
  });

  const repairedConversations: Conversation[] = raw.conversations.map(c => {
    const owningWs = propertyWorkspaceMap.get(c.propertyId);
    if (owningWs) {
      return { ...c, workspaceId: owningWs };
    }
    return { ...c, workspaceId: c.workspaceId || DEMO_WORKSPACE_ID };
  });

  const repairedTasks: Task[] = raw.tasks.map(t => {
    const owningWs = propertyWorkspaceMap.get(t.propertyId);
    if (owningWs) {
      return { ...t, workspaceId: owningWs };
    }
    return { ...t, workspaceId: t.workspaceId || DEMO_WORKSPACE_ID };
  });

  const repairedCleaningSchedules: CleaningSchedule[] = raw.cleaningSchedules.map(s => {
    const owningWs = propertyWorkspaceMap.get(s.propertyId);
    if (owningWs) {
      return { ...s, workspaceId: owningWs };
    }
    return { ...s, workspaceId: s.workspaceId || DEMO_WORKSPACE_ID };
  });

  const repairedMaintenanceIssues: MaintenanceIssue[] = raw.maintenanceIssues.map(m => {
    const owningWs = propertyWorkspaceMap.get(m.propertyId);
    if (owningWs) {
      return { ...m, workspaceId: owningWs };
    }
    return { ...m, workspaceId: m.workspaceId || DEMO_WORKSPACE_ID };
  });

  const repairedAiActions: AiAction[] = raw.aiActions.map(a => {
    if (a.propertyId) {
      const owningWs = propertyWorkspaceMap.get(a.propertyId);
      if (owningWs) {
        return { ...a, workspaceId: owningWs };
      }
    }
    return { ...a, workspaceId: a.workspaceId || DEMO_WORKSPACE_ID };
  });

  const repairedAiLogs: AiLogEntry[] = raw.aiLogs.map(l => {
    return { ...l, workspaceId: l.workspaceId || DEMO_WORKSPACE_ID };
  });

  const repairedSocialPosts: SocialPost[] = raw.socialPosts.map(p => {
    if (p.propertyId) {
      const owningWs = propertyWorkspaceMap.get(p.propertyId);
      if (owningWs) {
        return { ...p, workspaceId: owningWs };
      }
    }
    return { ...p, workspaceId: p.workspaceId || DEMO_WORKSPACE_ID };
  });

  const repairedSocialAccounts: SocialAccount[] = raw.socialAccounts.map(a => {
    const owningWs = propertyWorkspaceMap.get(a.propertyId);
    if (owningWs) {
      return { ...a, workspaceId: owningWs };
    }
    return { ...a, workspaceId: a.workspaceId || DEMO_WORKSPACE_ID };
  });

  const repairedSocialLeads: SocialLead[] = raw.socialLeads.map(l => {
    const owningWs = propertyWorkspaceMap.get(l.propertyId);
    if (owningWs) {
      return { ...l, workspaceId: owningWs };
    }
    return { ...l, workspaceId: l.workspaceId || DEMO_WORKSPACE_ID };
  });

  const repairedSocialAttributions: SocialAttribution[] = raw.socialAttributions.map(a => {
    return { ...a, workspaceId: a.workspaceId || DEMO_WORKSPACE_ID };
  });

  const repairedNotifications: NotificationItem[] = raw.notifications.map(n => {
    return { ...n, workspaceId: n.workspaceId || DEMO_WORKSPACE_ID };
  });

  // 4. Validate activeWorkspaceId
  let activeWorkspaceId = raw.activeWorkspaceId;
  if (!activeWorkspaceId || !workspaces.some(w => w.id === activeWorkspaceId)) {
    activeWorkspaceId = DEMO_WORKSPACE_ID;
  }

  return {
    workspaces,
    activeWorkspaceId,
    properties: repairedProperties,
    reservations: repairedReservations,
    guests: repairedGuests,
    conversations: repairedConversations,
    tasks: repairedTasks,
    cleaningSchedules: repairedCleaningSchedules,
    maintenanceIssues: repairedMaintenanceIssues,
    aiActions: repairedAiActions,
    aiLogs: repairedAiLogs,
    socialPosts: repairedSocialPosts,
    socialAccounts: repairedSocialAccounts,
    socialLeads: repairedSocialLeads,
    socialAttributions: repairedSocialAttributions,
    notifications: repairedNotifications,
  };
};

/**
 * Persists data to workspace-partitioned localStorage keys
 * AND updates the sanitized global keys for backwards compatibility.
 */
export const persistPartitionedData = (
  workspaceId: string,
  state: {
    workspaces: Workspace[];
    properties: Property[];
    reservations: Reservation[];
    guests: Guest[];
    conversations: Conversation[];
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
  }
) => {
  try {
    // 1. Save workspace metadata and active pointer
    localStorage.setItem('villaos_workspaces', JSON.stringify(state.workspaces));
    localStorage.setItem('villaos_active_workspace_id', workspaceId);

    // 2. Partitioned per-workspace storage
    for (const ws of state.workspaces) {
      const wsProps = state.properties.filter(p => p.workspaceId === ws.id);
      const wsRes = state.reservations.filter(r => r.workspaceId === ws.id);
      const wsGuests = state.guests.filter(g => g.workspaceId === ws.id);
      const wsTasks = state.tasks.filter(t => t.workspaceId === ws.id);
      const wsCleaning = state.cleaningSchedules.filter(s => s.workspaceId === ws.id);
      const wsMaint = state.maintenanceIssues.filter(m => m.workspaceId === ws.id);
      const wsConv = state.conversations.filter(c => c.workspaceId === ws.id);
      const wsPosts = state.socialPosts.filter(p => p.workspaceId === ws.id);
      const wsAccounts = state.socialAccounts.filter(a => a.workspaceId === ws.id);
      const wsLeads = state.socialLeads.filter(l => l.workspaceId === ws.id);
      const wsAttributions = state.socialAttributions.filter(a => a.workspaceId === ws.id);
      const wsAiActions = state.aiActions.filter(a => a.workspaceId === ws.id);
      const wsAiLogs = state.aiLogs.filter(l => l.workspaceId === ws.id);
      const wsNotifs = state.notifications.filter(n => n.workspaceId === ws.id);

      localStorage.setItem(`villaos_ws_${ws.id}_properties`, JSON.stringify(wsProps));
      localStorage.setItem(`villaos_ws_${ws.id}_reservations`, JSON.stringify(wsRes));
      localStorage.setItem(`villaos_ws_${ws.id}_guests`, JSON.stringify(wsGuests));
      localStorage.setItem(`villaos_ws_${ws.id}_tasks`, JSON.stringify(wsTasks));
      localStorage.setItem(`villaos_ws_${ws.id}_cleaning_schedules`, JSON.stringify(wsCleaning));
      localStorage.setItem(`villaos_ws_${ws.id}_maintenance_issues`, JSON.stringify(wsMaint));
      localStorage.setItem(`villaos_ws_${ws.id}_conversations`, JSON.stringify(wsConv));
      localStorage.setItem(`villaos_ws_${ws.id}_social_posts`, JSON.stringify(wsPosts));
      localStorage.setItem(`villaos_ws_${ws.id}_social_accounts`, JSON.stringify(wsAccounts));
      localStorage.setItem(`villaos_ws_${ws.id}_social_leads`, JSON.stringify(wsLeads));
      localStorage.setItem(`villaos_ws_${ws.id}_social_attributions`, JSON.stringify(wsAttributions));
      localStorage.setItem(`villaos_ws_${ws.id}_ai_actions`, JSON.stringify(wsAiActions));
      localStorage.setItem(`villaos_ws_${ws.id}_ai_logs`, JSON.stringify(wsAiLogs));
      localStorage.setItem(`villaos_ws_${ws.id}_notifications`, JSON.stringify(wsNotifs));
    }

    // 3. Keep sanitized global keys synchronized
    localStorage.setItem('villaos_properties', JSON.stringify(state.properties));
    localStorage.setItem('villaos_reservations', JSON.stringify(state.reservations));
    localStorage.setItem('villaos_guests', JSON.stringify(state.guests));
    localStorage.setItem('villaos_tasks', JSON.stringify(state.tasks));
    localStorage.setItem('villaos_cleaning_schedules', JSON.stringify(state.cleaningSchedules));
    localStorage.setItem('villaos_maintenance_issues', JSON.stringify(state.maintenanceIssues));
    localStorage.setItem('villaos_conversations', JSON.stringify(state.conversations));
    localStorage.setItem('villaos_social_posts', JSON.stringify(state.socialPosts));
    localStorage.setItem('villaos_social_accounts', JSON.stringify(state.socialAccounts));
    localStorage.setItem('villaos_social_leads', JSON.stringify(state.socialLeads));
    localStorage.setItem('villaos_social_attributions', JSON.stringify(state.socialAttributions));
    localStorage.setItem('villaos_ai_actions', JSON.stringify(state.aiActions));
    localStorage.setItem('villaos_ai_logs', JSON.stringify(state.aiLogs));
    localStorage.setItem('villaos_notifications', JSON.stringify(state.notifications));
  } catch (err) {
    console.error('[VillaOS Isolation] Storage persistence failed:', err);
  }
};

/**
 * Loads application data on startup, sanitizes cross-workspace contamination,
 * writes clean partitioned data back to localStorage, and returns state.
 */
export const loadAndSanitizeInitialData = (): SanitizedAppState => {
  try {
    const parse = <T>(key: string, fallback: T): T => {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      try {
        return JSON.parse(item);
      } catch {
        return fallback;
      }
    };

    const savedWorkspaces = parse<Workspace[]>('villaos_workspaces', mockWorkspaces);
    const savedActiveWorkspaceId = localStorage.getItem('villaos_active_workspace_id') || DEMO_WORKSPACE_ID;

    // Load either from workspace-partitioned keys or global keys
    const savedProps = parse<Property[]>('villaos_properties', mockProperties);
    const savedRes = parse<Reservation[]>('villaos_reservations', mockReservations);
    const savedGuests = parse<Guest[]>('villaos_guests', mockGuests);
    const savedConv = parse<Conversation[]>('villaos_conversations', mockConversations);
    const savedTasks = parse<Task[]>('villaos_tasks', mockTasks);
    const savedCleaning = parse<CleaningSchedule[]>('villaos_cleaning_schedules', mockCleaningSchedules);
    const savedMaint = parse<MaintenanceIssue[]>('villaos_maintenance_issues', mockMaintenanceIssues);
    const savedAiActions = parse<AiAction[]>('villaos_ai_actions', mockAiActions);
    const savedAiLogs = parse<AiLogEntry[]>('villaos_ai_logs', mockAiLogs);
    const savedSocialPosts = parse<SocialPost[]>('villaos_social_posts', mockSocialPosts);
    const savedSocialAccounts = parse<SocialAccount[]>('villaos_social_accounts', mockSocialAccounts);
    const savedSocialLeads = parse<SocialLead[]>('villaos_social_leads', mockSocialLeads);
    const savedSocialAttributions = parse<SocialAttribution[]>('villaos_social_attributions', mockSocialAttributions);
    const savedNotifications = parse<NotificationItem[]>('villaos_notifications', mockNotifications);

    // Run through the anti-leak sanitization engine
    const sanitized = sanitizeAndPartitionState({
      workspaces: savedWorkspaces,
      activeWorkspaceId: savedActiveWorkspaceId,
      properties: savedProps,
      reservations: savedRes,
      guests: savedGuests,
      conversations: savedConv,
      tasks: savedTasks,
      cleaningSchedules: savedCleaning,
      maintenanceIssues: savedMaint,
      aiActions: savedAiActions,
      aiLogs: savedAiLogs,
      socialPosts: savedSocialPosts,
      socialAccounts: savedSocialAccounts,
      socialLeads: savedSocialLeads,
      socialAttributions: savedSocialAttributions,
      notifications: savedNotifications,
    });

    // Write partitioned keys immediately to ensure localStorage is in clean state
    persistPartitionedData(sanitized.activeWorkspaceId, sanitized);

    return sanitized;
  } catch (err) {
    console.error('[VillaOS Isolation] Initial data load failed, falling back to clean mock state:', err);
    return sanitizeAndPartitionState({
      workspaces: mockWorkspaces,
      activeWorkspaceId: DEMO_WORKSPACE_ID,
      properties: mockProperties,
      reservations: mockReservations,
      guests: mockGuests,
      conversations: mockConversations,
      tasks: mockTasks,
      cleaningSchedules: mockCleaningSchedules,
      maintenanceIssues: mockMaintenanceIssues,
      aiActions: mockAiActions,
      aiLogs: mockAiLogs,
      socialPosts: mockSocialPosts,
      socialAccounts: mockSocialAccounts,
      socialLeads: mockSocialLeads,
      socialAttributions: mockSocialAttributions,
      notifications: mockNotifications,
    });
  }
};
