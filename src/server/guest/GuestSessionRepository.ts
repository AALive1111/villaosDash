import fs from 'fs';
import path from 'path';
import { GuestPortalSession, GuestServiceRequest, ChatMessage, Conversation } from '../../types/index.js';
import { mockConversations, mockProperties, mockReservations } from '../../data/mockData.js';

export class GuestSessionRepository {
  private sessionsFile: string;
  private requestsFile: string;
  private conversationsFile: string;

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.sessionsFile = path.join(dataDir, 'guest_sessions.json');
    this.requestsFile = path.join(dataDir, 'guest_requests.json');
    this.conversationsFile = path.join(dataDir, 'conversations.json');
    this.seedIfEmpty();
  }

  private seedIfEmpty() {
    if (!fs.existsSync(this.conversationsFile)) {
      try {
        fs.writeFileSync(this.conversationsFile, JSON.stringify(mockConversations, null, 2), 'utf-8');
      } catch (e) {
        console.error('[GuestSessionRepository] Failed seeding conversations', e);
      }
    }
    if (!fs.existsSync(this.sessionsFile)) {
      fs.writeFileSync(this.sessionsFile, JSON.stringify([], null, 2), 'utf-8');
    }
    if (!fs.existsSync(this.requestsFile)) {
      fs.writeFileSync(this.requestsFile, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  // --- Sessions ---
  public async getSession(sessionId: string): Promise<GuestPortalSession | null> {
    try {
      if (!fs.existsSync(this.sessionsFile)) return null;
      const data = JSON.parse(fs.readFileSync(this.sessionsFile, 'utf-8'));
      return data.find((s: GuestPortalSession) => s.sessionId === sessionId) || null;
    } catch {
      return null;
    }
  }

  public async saveSession(session: GuestPortalSession): Promise<void> {
    try {
      let sessions: GuestPortalSession[] = [];
      if (fs.existsSync(this.sessionsFile)) {
        sessions = JSON.parse(fs.readFileSync(this.sessionsFile, 'utf-8'));
      }
      const existingIdx = sessions.findIndex(s => s.sessionId === session.sessionId);
      if (existingIdx >= 0) {
        sessions[existingIdx] = session;
      } else {
        sessions.unshift(session);
      }
      fs.writeFileSync(this.sessionsFile, JSON.stringify(sessions, null, 2), 'utf-8');
    } catch (e) {
      console.error('[GuestSessionRepository] Failed saving session', e);
    }
  }

  // --- Conversations & Messages ---
  public async getConversations(): Promise<Conversation[]> {
    try {
      if (!fs.existsSync(this.conversationsFile)) return [...mockConversations];
      const data = JSON.parse(fs.readFileSync(this.conversationsFile, 'utf-8'));
      return Array.isArray(data) ? data : [...mockConversations];
    } catch {
      return [...mockConversations];
    }
  }

  public async getConversationForProperty(workspaceId: string, propertyId: string, guestName?: string): Promise<Conversation> {
    const all = await this.getConversations();
    // Look for existing conversation for this property in this workspace
    let conv = all.find(c => c.workspaceId === workspaceId && c.propertyId === propertyId);

    if (!conv) {
      const prop = mockProperties.find(p => p.id === propertyId);
      const name = prop ? prop.name : `Villa ${propertyId}`;
      conv = {
        id: `conv-guest-${propertyId}-${Date.now()}`,
        workspaceId,
        propertyId,
        propertyName: name,
        guestId: `guest-${propertyId}`,
        guestName: guestName || 'In-Villa Guest',
        guestAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        channel: 'Guest Portal',
        lastMessage: 'Welcome to your villa! Let us know if you need anything.',
        lastMessageTime: 'Just now',
        unreadCount: 0,
        messages: [
          {
            id: `msg-welcome-${Date.now()}`,
            sender: 'host',
            text: `Welcome to ${name}! Our team is on call to make your Bali stay seamless. You can request housekeeping, report any issues, or message our concierge here anytime.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            channel: 'Guest Portal'
          }
        ]
      };
      await this.saveConversation(conv);
    }

    return conv;
  }

  public async saveConversation(conv: Conversation): Promise<void> {
    try {
      const all = await this.getConversations();
      const idx = all.findIndex(c => c.id === conv.id);
      if (idx >= 0) {
        all[idx] = conv;
      } else {
        all.unshift(conv);
      }
      fs.writeFileSync(this.conversationsFile, JSON.stringify(all, null, 2), 'utf-8');
    } catch (e) {
      console.error('[GuestSessionRepository] Failed saving conversation', e);
    }
  }

  public async addMessageToConversation(
    conversationId: string, 
    message: ChatMessage,
    aiReplySuggestion?: string
  ): Promise<Conversation | null> {
    const all = await this.getConversations();
    const conv = all.find(c => c.id === conversationId);
    if (!conv) return null;

    conv.messages.push(message);
    conv.lastMessage = message.text;
    conv.lastMessageTime = message.timestamp || 'Just now';
    if (message.sender === 'guest') {
      conv.unreadCount = (conv.unreadCount || 0) + 1;
      if (aiReplySuggestion) {
        conv.aiSuggestedReply = aiReplySuggestion;
      }
    }
    await this.saveConversation(conv);
    return conv;
  }

  // --- Service Requests ---
  public async getRequests(workspaceId?: string, propertyId?: string): Promise<GuestServiceRequest[]> {
    try {
      if (!fs.existsSync(this.requestsFile)) return [];
      const data: GuestServiceRequest[] = JSON.parse(fs.readFileSync(this.requestsFile, 'utf-8'));
      return data.filter(r => 
        (!workspaceId || r.workspaceId === workspaceId) &&
        (!propertyId || r.propertyId === propertyId)
      );
    } catch {
      return [];
    }
  }

  public async saveRequest(request: GuestServiceRequest): Promise<void> {
    try {
      let requests: GuestServiceRequest[] = [];
      if (fs.existsSync(this.requestsFile)) {
        requests = JSON.parse(fs.readFileSync(this.requestsFile, 'utf-8'));
      }
      requests.unshift(request);
      fs.writeFileSync(this.requestsFile, JSON.stringify(requests, null, 2), 'utf-8');
    } catch (e) {
      console.error('[GuestSessionRepository] Failed saving request', e);
    }
  }
}
