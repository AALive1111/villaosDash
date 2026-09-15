export type PropertyStatus = 'active' | 'maintenance' | 'occupied' | 'vacant';

export type AppTheme = 'light' | 'night';

export interface Workspace {
  id: string;
  businessName: string;
  ownerName: string;
  businessType: 'Private Villa Owner' | 'Villa Management Company' | 'Guest House / Boutique Property';
  operationalArea: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface Property {
  id: string;
  workspaceId: string;
  name: string;
  location: string;
  area: 'Seminyak' | 'Canggu' | 'Ubud' | 'Uluwatu' | 'Pererenan' | string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  image: string;
  gallery: string[];
  status: PropertyStatus;
  occupancyRate: number; // percentage
  isArchived?: boolean;
  currentGuest?: {
    name: string;
    checkOutDate: string;
    channel: string;
  };
  nextCheckIn?: {
    date: string;
    guestName: string;
    time: string;
  };
  nextCheckOut?: {
    date: string;
    guestName: string;
    time: string;
  };
  monthlyRevenue: number; // in IDR
  dailyRate: number; // in IDR
  rating: number;
  reviewCount: number;
  connectedChannels: {
    channel: string;
    connected: boolean;
    syncStatus: 'synced' | 'syncing' | 'error';
    lastSync: string;
  }[];
  description: string;
  amenities: string[];
  rules: {
    checkInTime: string;
    checkOutTime: string;
    quietHours: string;
    earlyCheckInFee: number;
    lateCheckOutFee: number;
    poolCleaningDays: string[];
    preferredCleaner: string;
    preferredTechnician: string;
    wifiName?: string;
    wifiProvider?: string;
    wifiPassword?: string;
    accessCode?: string;
  };
}

export type ChannelSource = 'Airbnb' | 'Booking.com' | 'Agoda' | 'Direct' | 'Instagram' | 'WhatsApp' | 'Expedia';

export type ReservationStatus = 'Confirmed' | 'Pending' | 'Checked In' | 'Checked Out' | 'Cancelled';

export interface Reservation {
  id: string;
  workspaceId: string;
  propertyId: string;
  propertyName: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry: string;
  guestAvatar: string;
  channel: ChannelSource;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestsCount: number;
  totalAmount: number; // IDR
  payoutAmount: number; // IDR
  commission: number; // IDR
  status: ReservationStatus;
  specialRequests?: string;
  createdAt: string;
  externalBookingId?: string;       // OTA external confirmation or iCal UID
  channelConnectionId?: string;     // Linked ChannelConnection ID
  syncStatus?: 'Synced' | 'Conflict' | 'Manual';
  conflictDetails?: string;
}

export type ChannelSyncProtocol = 'ical_two_way' | 'api_direct' | 'webhook_push' | 'ai_inbox';
export type ChannelConnectionStatus = 'connected' | 'disconnected' | 'syncing' | 'error' | 'reauth_required' | 'paused';

export interface ChannelSyncLog {
  id: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  importedCount?: number;
  updatedCount?: number;
  cancelledCount?: number;
  conflictCount?: number;
  details?: string;
}

export interface ChannelConnection {
  id: string;
  workspaceId: string;
  propertyId: string;
  propertyName: string;
  channel: ChannelSource;
  status: ChannelConnectionStatus;
  protocol: ChannelSyncProtocol;
  externalListingId?: string;
  externalAccountName?: string;
  iCalExportUrl?: string;
  iCalImportUrl?: string;
  pricingMarkupPercent?: number;
  lastSyncAt?: string;
  lastSyncStatus?: 'success' | 'failed';
  lastErrorMessage?: string;
  syncLogs?: ChannelSyncLog[];
  createdAt: string;
  updatedAt: string;
}

export type GuestTag = 'VIP' | 'Returning Guest' | 'Family' | 'Couple' | 'Digital Nomad' | 'High Spender' | 'Honeymoon' | 'New Guest' | 'Direct' | 'Airbnb' | 'Booking.com' | string;

export interface Guest {
  id: string;
  workspaceId: string;
  name: string;
  nationality: string;
  countryCode: string;
  email: string;
  phone: string;
  avatar: string;
  tags: GuestTag[];
  totalSpend: number; // IDR
  staysCount: number;
  averageStayDays: number;
  propertiesStayed: string[];
  preferences: string[];
  notes: string;
  lastStay: string;
  ratingGiven: number;
}

export interface ChatMessage {
  id: string;
  sender: 'guest' | 'host' | 'ai';
  text: string;
  timestamp: string;
  channel: 'WhatsApp' | 'Instagram' | 'Airbnb' | 'Booking.com' | 'Email' | 'Guest Portal';
  category?: 'chat' | 'cleaning' | 'maintenance' | 'assistance';
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  workspaceId: string;
  guestId: string;
  guestName: string;
  guestAvatar: string;
  propertyId: string;
  propertyName: string;
  channel: 'WhatsApp' | 'Instagram' | 'Airbnb' | 'Booking.com' | 'Email' | 'Guest Portal';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  reservationId?: string;
  messages: ChatMessage[];
  aiSuggestedReply?: string;
}

export interface GuestPortalSession {
  sessionId: string;
  propertyId: string;
  propertyName: string;
  workspaceId: string;
  isVerified: boolean;
  reservationId?: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn?: string;
  checkOut?: string;
  token: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface GuestServiceRequest {
  id: string;
  sessionId: string;
  propertyId: string;
  propertyName: string;
  workspaceId: string;
  guestName: string;
  type: 'cleaning' | 'maintenance' | 'assistance' | 'general';
  title: string;
  description: string;
  preferredTime?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  aiClassification?: {
    intent: string;
    suggestedAction: string;
    urgency: string;
    estimatedCost?: number;
    recommendedAssignee?: string;
  };
}

export type TaskType = 'cleaning' | 'maintenance' | 'inspection' | 'guest_service' | 'check_in';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  workspaceId: string;
  propertyId: string;
  propertyName: string;
  title: string;
  type: TaskType;
  assignedTo: string;
  priority: TaskPriority;
  dueTime: string;
  status: TaskStatus;
  notes?: string;
  cost?: number;
}

export interface CleaningSchedule {
  id: string;
  workspaceId: string;
  propertyId: string;
  propertyName: string;
  checkOutTime: string;
  checkoutTime?: string;
  cleaningStartTime?: string;
  cleanerName?: string;
  cleaner?: string;
  cleaningStatus: 'Not Started' | 'In Progress' | 'Ready for Inspection' | 'Completed';
  inspectionStatus: 'Pending' | 'Passed' | 'Action Needed';
  nextCheckInTime: string;
  nextGuestName: string;
  checklistItems?: { item: string; done: boolean }[];
  checklist?: {
    linensChanged?: boolean;
    poolCleaned?: boolean;
    freshTowels?: boolean;
    welcomeBasket?: boolean;
    acChecked?: boolean;
  };
  inspectionPhotos?: string[];
}

export interface MaintenanceIssue {
  id: string;
  workspaceId: string;
  propertyId: string;
  propertyName: string;
  problem: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTechnician: string;
  eta: string;
  status: 'Open' | 'Technician Dispatched' | 'In Progress' | 'Resolved';
  estimatedCost: number; // IDR
  actualCost?: number;
  reportedBy: string;
  reportedAt: string;
  aiClassification?: {
    category: string;
    urgencyReason: string;
  };
}

export interface AiAction {
  id: string;
  workspaceId: string;
  type: 'pricing' | 'messaging' | 'cleaning' | 'maintenance' | 'marketing';
  title: string;
  description?: string;
  propertyId?: string;
  propertyName?: string;
  status: 'pending' | 'approved' | 'dismissed' | 'executed';
  suggestedAction: string;
  dataPayload?: any;
  createdAt?: string;
  confidence?: number;
  reasoning?: string;
  impactEstimate?: string;
}

export interface AiLogEntry {
  id: string;
  workspaceId: string;
  time: string;
  date: string;
  category: 'Operations' | 'Guest Communication' | 'Revenue' | 'Social Media' | 'Finance';
  action: string;
  details: string;
  status: 'Auto-executed' | 'Approved by User' | 'Recommendation Generated';
}

export interface SocialAccount {
  id: string;
  workspaceId: string;
  externalAccountId?: string;
  platform: 'Instagram' | 'TikTok' | 'Facebook' | 'Google Business';
  handle: string;
  name: string;
  propertyId: string;
  propertyName: string;
  status: 'Connected' | 'Disconnected' | 'Demo Connection' | 'Error' | 'Token Expired' | 'Syncing' | 'Reauth Required';
  followers: number;
  engagementRate: number;
  lastSync: string;
  connectedAt?: string;
  lastError?: string;
  syncMetadata?: Record<string, any>;
}

export interface SocialMetric {
  reach: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

export interface SocialPost {
  id: string;
  workspaceId: string;
  accountId: string;
  propertyId: string;
  propertyName: string;
  platform: 'Instagram' | 'Facebook' | 'TikTok' | 'Google Business';
  contentType: 'Reel' | 'Post' | 'Story' | 'Carousel' | 'Video';
  status: 'Draft' | 'Scheduled' | 'Published';
  scheduledDate?: string;
  publishedDate?: string;
  caption: string;
  hook?: string;
  cta?: string;
  hashtags?: string[];
  mediaUrl: string;
  metrics?: SocialMetric;
  aiAnalysis?: string;
}

export interface SocialLead {
  id: string;
  workspaceId: string;
  sourcePlatform: 'Instagram' | 'Facebook' | 'TikTok' | 'Google Business';
  accountId: string;
  propertyId: string;
  propertyName?: string;
  guestName: string;
  externalUserId?: string;
  status: 'Inquiry' | 'Conversing' | 'Converted' | 'Lost';
  createdAt: string;
  estimatedValue: number;
  reservationId?: string;
  intent?: {
    dates?: string;
    checkIn?: string;
    checkOut?: string;
    nights?: number;
    guests?: number;
    interest?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    isAvailable?: boolean;
    calculatedPrice?: number;
    draftReply?: string;
  };
  lastMessage?: string;
  aiSummary?: string;
}

export interface SocialAttribution {
  workspaceId: string;
  platform: 'Instagram' | 'Facebook' | 'TikTok' | 'Google Business';
  leads: number;
  bookings: number;
  revenue: number;
}

export interface NotificationItem {
  id: string;
  workspaceId: string;
  type: 'cleaning' | 'guest' | 'pricing' | 'social' | 'maintenance' | 'booking' | 'payment';
  title: string;
  message: string;
  time: string;
  unread: boolean;
  actionRequired?: boolean;
  actionType?: string;
}

export type UserRole = 
  | 'Owner'
  | 'Property Manager'
  | 'Operations Manager'
  | 'Marketing Manager'
  | 'Cleaner'
  | 'Maintenance'
  | 'Front Desk';
