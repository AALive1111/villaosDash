import React, { useState } from 'react';
import { 
  Globe, CheckCircle2, RefreshCw, ExternalLink, ShieldCheck, 
  MessageSquare, Instagram, CreditCard, Share2, Calendar, Info, Check
} from 'lucide-react';

interface IntegrationItem {
  id: string;
  name: string;
  category: 'OTA Channels' | 'Guest Messaging' | 'Social Platforms' | 'Payments & Banking' | 'Accounting & Tools';
  status: 'Connected (Demo)' | 'Ready to Connect';
  description: string;
  lastSync: string;
  badge?: string;
}

export const IntegrationsView: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    { id: '1', name: 'Airbnb Direct XML API', category: 'OTA Channels', status: 'Connected (Demo)', description: '2-way rate distribution, instant booking retrieval, and cancellation webhooks.', lastSync: '3 mins ago' },
    { id: '2', name: 'Booking.com Channel API', category: 'OTA Channels', status: 'Connected (Demo)', description: 'Real-time inventory sync, automated guest messaging, and virtual card payouts.', lastSync: '6 mins ago' },
    { id: '3', name: 'Agoda YCS Connect', category: 'OTA Channels', status: 'Connected (Demo)', description: 'Asian traveler distribution engine and promotional package syndication.', lastSync: '12 mins ago' },
    { id: '4', name: 'WhatsApp Business API (Meta Cloud)', category: 'Guest Messaging', status: 'Connected (Demo)', description: 'Autonomous guest concierge, cleaner turnover checklists, and instant ETA coordination.', lastSync: 'Real-time' },
    { id: '5', name: 'Instagram Graph API', category: 'Social Platforms', status: 'Connected (Demo)', description: 'Publish Reels, track DM inquiries, and auto-reply to direct booking keywords.', lastSync: '10 mins ago' },
    { id: '6', name: 'TikTok for Business API', category: 'Social Platforms', status: 'Connected (Demo)', description: 'Video scheduler and viral sound attribution for Bali travel audiences.', lastSync: '1 hour ago' },
    { id: '7', name: 'Midtrans Payment Gateway', category: 'Payments & Banking', status: 'Connected (Demo)', description: 'Indonesian QRIS, BCA/Mandiri Virtual Accounts, and local IDR bank transfers.', lastSync: 'Live', badge: 'Indonesia Core' },
    { id: '8', name: 'Stripe International Payouts', category: 'Payments & Banking', status: 'Connected (Demo)', description: 'Accept Visa, Mastercard, and Amex from European, US, and Australian travelers.', lastSync: 'Live' },
    { id: '9', name: 'Google Calendar 2-Way Sync', category: 'Accounting & Tools', status: 'Connected (Demo)', description: 'iCal export feeds for owner personal calendars and maintenance staff blocks.', lastSync: '5 mins ago' },
    { id: '10', name: 'Xero Cloud Accounting', category: 'Accounting & Tools', status: 'Connected (Demo)', description: 'Automated invoice creation for reservations, staff payroll, and tax ledger.', lastSync: 'Today at 04:00 AM' },
  ]);

  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  const handleSync = (id: string, name: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
      setSyncSuccessMessage(`Demo connection for "${name}" synchronized successfully.`);
      setTimeout(() => setSyncSuccessMessage(null), 3000);
    }, 600);
  };

  const categories = ['OTA Channels', 'Guest Messaging', 'Social Platforms', 'Payments & Banking', 'Accounting & Tools'] as const;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#2D2926]">Connected Channels & Ecosystem APIs</h2>
          <p className="text-xs text-stone-500 mt-1">
            Simulated feeds and integrations connecting your Bali villas to OTAs, WhatsApp, payments, and accounting.
          </p>
        </div>

        <span className="text-xs font-bold text-[#606C38] bg-[#FEFAE0] border border-[#F1EDD4] px-3 py-1.5 rounded-xl shadow-2xs">
          Demo Connections Active (10/10)
        </span>
      </div>

      {/* Transparency Callout Banner */}
      <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] flex items-start space-x-3 text-xs">
        <Info className="w-4 h-4 text-[#BC6C25] flex-shrink-0 mt-0.5" />
        <div className="text-stone-600 leading-relaxed">
          <strong className="text-[#2D2926]">Prototype Transparency:</strong> All external channel feeds (Airbnb, Booking.com, WhatsApp Business API, and Midtrans) are operating under simulated <strong className="text-[#606C38]">Demo Connections</strong> for validation with Bali property managers. In production, these link directly to your official API keys and webhook endpoints.
        </div>
      </div>

      {syncSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{syncSuccessMessage}</span>
        </div>
      )}

      {/* Categories Layout */}
      <div className="space-y-6">
        {categories.map(cat => {
          const items = integrations.filter(i => i.category === cat);
          return (
            <div key={cat} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                {cat}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#E8E6E1] p-4 shadow-2xs flex flex-col justify-between space-y-3 hover:border-stone-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-xs sm:text-sm text-[#2D2926]">{item.name}</h4>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FEFAE0] text-[#BC6C25] border border-[#F1EDD4]">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEFAE0] text-[#606C38] border border-[#F1EDD4] flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-[#606C38]" />
                          <span>{item.status}</span>
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#F2F1ED] flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-stone-400">Last sync: {item.lastSync}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 font-mono">
                          Demo Connection
                        </span>
                      </div>
                      <button
                        onClick={() => handleSync(item.id, item.name)}
                        disabled={syncingId === item.id}
                        className="px-2.5 py-1 rounded-lg border border-[#E8E6E1] text-[#2D2926] hover:bg-[#FAF9F6] font-semibold flex items-center space-x-1 text-[11px] transition-colors"
                      >
                        <RefreshCw className={`w-3 h-3 ${syncingId === item.id ? 'animate-spin text-[#606C38]' : 'text-stone-400'}`} />
                        <span>{syncingId === item.id ? 'Syncing...' : 'Test Sync'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
