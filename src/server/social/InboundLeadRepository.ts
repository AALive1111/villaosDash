import fs from 'fs';
import path from 'path';

export interface InboundSocialLead {
  id: string;
  workspaceId: string;
  propertyId: string;
  propertyName: string;
  externalAccountId: string;
  guestName: string;
  sourcePlatform: 'Instagram' | 'WhatsApp' | 'Facebook' | 'TikTok';
  lastMessage: string;
  status: 'New' | 'Conversing' | 'Converted' | 'Lost';
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
  aiSummary?: string;
  estimatedValue: number;
  timestamp: string;
  senderId: string;
  messageId?: string;
}

export class InboundLeadRepository {
  private filePath: string;

  constructor() {
    this.filePath = path.join(process.cwd(), 'data', 'inbound_leads.json');
    this.ensureDirectory();
  }

  private ensureDirectory() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private readAll(): InboundSocialLead[] {
    if (!fs.existsSync(this.filePath)) {
      return [];
    }
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('[InboundLeadRepository] Failed to read leads file', e);
      return [];
    }
  }

  private writeAll(leads: InboundSocialLead[]) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(leads, null, 2), 'utf-8');
    } catch (e) {
      console.error('[InboundLeadRepository] Failed to write leads file', e);
    }
  }

  async saveLead(lead: InboundSocialLead): Promise<void> {
    const leads = this.readAll();
    const existingIndex = leads.findIndex(l => l.id === lead.id || (l.senderId === lead.senderId && l.propertyId === lead.propertyId && l.status !== 'Converted'));

    if (existingIndex >= 0) {
      leads[existingIndex] = {
        ...leads[existingIndex],
        ...lead,
        lastMessage: lead.lastMessage,
        timestamp: lead.timestamp
      };
    } else {
      leads.unshift(lead);
    }

    this.writeAll(leads);
  }

  async getLeads(workspaceId?: string, propertyId?: string): Promise<InboundSocialLead[]> {
    let leads = this.readAll();
    if (workspaceId) {
      leads = leads.filter(l => l.workspaceId === workspaceId);
    }
    if (propertyId) {
      leads = leads.filter(l => l.propertyId === propertyId);
    }
    return leads;
  }
}
