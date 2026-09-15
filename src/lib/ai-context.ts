import { 
  Property, 
  Reservation, 
  Guest, 
  Task, 
  CleaningSchedule, 
  MaintenanceIssue,
  SocialAccount,
  SocialPost,
  SocialLead,
  SocialAttribution
} from '../types';

/**
 * Builds a structured context string from the current application state.
 * This can be sent to an LLM (like Gemini) so it can reason over the actual
 * data rather than relying on hardcoded responses.
 */
export const buildAiSystemContext = (state: {
  workspaceName?: string;
  properties: Property[];
  reservations: Reservation[];
  guests: Guest[];
  tasks: Task[];
  cleaningSchedules: CleaningSchedule[];
  maintenanceIssues: MaintenanceIssue[];
  socialAccounts?: SocialAccount[];
  socialPosts?: SocialPost[];
  socialLeads?: SocialLead[];
  socialAttributions?: SocialAttribution[];
}): string => {
  const { 
    workspaceName = 'Unknown Workspace',
    properties, reservations, guests, tasks, cleaningSchedules, maintenanceIssues,
    socialAccounts = [], socialPosts = [], socialLeads = [], socialAttributions = []
  } = state;

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  // Calculate workspace level financials
  const activeReservations = reservations.filter(r => r.status !== 'Cancelled');
  const totalMonthRevenue = properties.reduce((acc, p) => acc + (p.monthlyRevenue || 0), 0);
  const totalReservationRevenue = activeReservations.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
  
  // Find highest occupancy property
  const sortedByOccupancy = [...properties].sort((a, b) => (b.occupancyRate || 0) - (a.occupancyRate || 0));
  const highestOccProp = sortedByOccupancy[0];

  // Today's check-ins
  const todayCheckIns = activeReservations.filter(r => r.checkIn === today);
  const todayCheckOuts = activeReservations.filter(r => r.checkOut === today);

  let contextString = `You are the AI Operational Assistant for VillaOS, managing the workspace: ${workspaceName}.\n`;
  contextString += `Current Date: ${today} (Reference Year: ${now.getFullYear()}, Tomorrow: ${tomorrow})\n\n`;

  contextString += `### EXECUTIVE & FINANCIAL SNAPSHOT\n`;
  contextString += `- Total Properties: ${properties.length}\n`;
  contextString += `- Total Month Revenue: IDR ${totalMonthRevenue.toLocaleString()} (Direct/OTA Bookings Total: IDR ${totalReservationRevenue.toLocaleString()})\n`;
  if (highestOccProp) {
    contextString += `- Highest Occupancy Property: ${highestOccProp.name} (${highestOccProp.occupancyRate}% occupancy, month revenue IDR ${(highestOccProp.monthlyRevenue || 0).toLocaleString()})\n`;
  }
  contextString += `- Check-ins Today (${today}): ${todayCheckIns.length > 0 ? todayCheckIns.map(r => `${r.propertyName} (${r.guestName}, ${r.guestsCount} guests, Channel: ${r.channel})`).join(', ') : 'None scheduled today'}\n`;
  contextString += `- Check-outs Today (${today}): ${todayCheckOuts.length > 0 ? todayCheckOuts.map(r => `${r.propertyName} (${r.guestName})`).join(', ') : 'None scheduled today'}\n\n`;

  contextString += `### PROPERTIES PORTFOLIO (${properties.length})\n`;
  properties.forEach(p => {
    const activeBooking = activeReservations.find(r => r.propertyId === p.id && r.checkIn <= today && r.checkOut >= today);
    contextString += `- Property [${p.id}] "${p.name}":
      Area: ${p.area}, Location: ${p.location}
      Bedrooms: ${p.bedrooms}BR, Max Guests: ${p.maxGuests}
      Status: ${p.status}
      Daily Rate: IDR ${p.dailyRate.toLocaleString()}
      Occupancy Rate: ${p.occupancyRate || 0}%
      Month Revenue: IDR ${(p.monthlyRevenue || 0).toLocaleString()}
      Current Status: ${activeBooking ? `Occupied by ${activeBooking.guestName} (${activeBooking.checkIn} to ${activeBooking.checkOut})` : 'Vacant/Available'}
      Rules: Check-in ${p.rules?.checkInTime || '15:00'}, Check-out ${p.rules?.checkOutTime || '11:00'}, Preferred Cleaner: ${p.rules?.preferredCleaner || 'Staff'}, Preferred Tech: ${p.rules?.preferredTechnician || 'Staff'}\n`;
  });
  contextString += `\n`;

  contextString += `### ACTIVE RESERVATIONS & CALENDAR (${activeReservations.length})\n`;
  if (activeReservations.length === 0) {
    contextString += `No active reservations found.\n`;
  } else {
    activeReservations.forEach(r => {
      contextString += `- [${r.id}] Villa: "${r.propertyName}" (Property ID: ${r.propertyId}) | Guest: ${r.guestName} (${r.guestsCount} guests) | Dates: ${r.checkIn} to ${r.checkOut} (${r.nights} nights) | Status: ${r.status} | Total: IDR ${r.totalAmount.toLocaleString()} | Channel: ${r.channel}\n`;
    });
  }
  contextString += `\n`;

  contextString += `### OPERATIONAL ISSUES & ATTENTION NEEDED\n`;
  const openMaintenance = maintenanceIssues.filter(m => m.status !== 'Resolved');
  contextString += `1. Maintenance Tickets Needing Attention (${openMaintenance.length}):\n`;
  if (openMaintenance.length === 0) {
    contextString += `   - No open maintenance issues.\n`;
  } else {
    openMaintenance.forEach(m => {
      contextString += `   - [${m.priority.toUpperCase()} PRIORITY] ${m.propertyName}: ${m.problem} (Location: ${m.location}, Assigned: ${m.assignedTechnician}, Status: ${m.status}, Est Cost: IDR ${(m.estimatedCost || 0).toLocaleString()})\n`;
    });
  }

  const urgentTasks = tasks.filter(t => t.status !== 'completed');
  contextString += `2. Operational Tasks Pending (${urgentTasks.length}):\n`;
  if (urgentTasks.length === 0) {
    contextString += `   - No pending operations tasks.\n`;
  } else {
    urgentTasks.forEach(t => {
      contextString += `   - [${t.type.toUpperCase()}] "${t.title}" for ${t.propertyName} (Assigned: ${t.assignedTo}, Due: ${t.dueTime}, Status: ${t.status}, Priority: ${t.priority})\n`;
    });
  }

  const activeCleaning = cleaningSchedules.filter(c => c.cleaningStatus !== 'Completed');
  contextString += `3. Cleaning Schedules in Progress (${activeCleaning.length}):\n`;
  if (activeCleaning.length === 0) {
    contextString += `   - All cleaning schedules completed.\n`;
  } else {
    activeCleaning.forEach(c => {
      contextString += `   - ${c.propertyName}: Status is "${c.cleaningStatus}" (Cleaner: ${c.cleanerName || c.cleaner}, Next Arrival: ${c.nextGuestName || 'Upcoming'} at ${c.nextCheckInTime}, Inspection: ${c.inspectionStatus})\n`;
    });
  }
  contextString += `\n`;

  contextString += `### SOCIAL MEDIA LEADS & ACCOUNTS (${socialLeads.length} leads, ${socialAccounts.length} accounts)\n`;
  socialLeads.forEach(l => {
    const intentStr = l.intent ? ` (Dates: ${l.intent.dates || l.intent.checkIn || 'none'}, ${l.intent.guests || '0'} guests, Price: IDR ${l.intent.calculatedPrice || l.estimatedValue})` : '';
    contextString += `- Lead: ${l.guestName} on ${l.sourcePlatform} for ${l.propertyName || 'Property'} [Status: ${l.status}]${intentStr}. Last Message: "${l.lastMessage || ''}"\n`;
  });
  contextString += `\n`;

  contextString += `### ACTION GUIDELINES FOR ASSISTANT\n`;
  contextString += `When user asks to create an operational item (e.g. cleaning task, maintenance ticket, social post, rate change):
- Propose the exact action with appropriate action type and parameter object.
- For "Create a cleaning task for [Villa] tomorrow at 11 AM":
  - Match the property by name (e.g. "Test Villa" -> find matching property ID and name).
  - Set action type to "create_cleaning_task".
  - Set parameters: { propertyId: string, propertyName: string, cleaner: string, dueTime: "${tomorrow} 11:00 AM", title: "Turnover Cleaning", notes: string }.
- For date availability requests:
  - Check if the requested villa exists.
  - Check if guest count is within maxGuests capacity.
  - Check if there are overlapping confirmed reservations for the requested dates.
  - If available, state availability clearly, calculate nights and total price (dailyRate * nights in IDR).
  - If not available or blocked, state which dates/reservations conflict.
`;

  return contextString;
};
