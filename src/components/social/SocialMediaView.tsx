import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart2, Users, LayoutGrid, MessageCircle, Calendar as CalendarIcon, Wand2
} from 'lucide-react';

import { SocialOverview } from './views/SocialOverview';
import { SocialAccounts } from './views/SocialAccounts';
import { SocialPosts } from './views/SocialPosts';
import { SocialInbox } from './views/SocialInbox';
import { SocialCalendar } from './views/SocialCalendar';
import { ContentStudioView } from './ContentStudioView';

export const SocialMediaView: React.FC = () => {
  const { 
    properties,
    socialAccounts, 
    socialPosts, 
    socialLeads, 
    socialAttributions,
    activeTab: globalActiveTab
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'posts' | 'inbox' | 'calendar' | 'studio'>(
    globalActiveTab === 'contentStudio' ? 'studio' : 'overview'
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'accounts', label: 'Accounts', icon: <Users className="w-4 h-4" /> },
    { id: 'posts', label: 'Posts', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'inbox', label: 'Inbox', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarIcon className="w-4 h-4" /> },
    { id: 'studio', label: 'AI Studio', icon: <Wand2 className="w-4 h-4 text-amber-600" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">Social Media</h1>
          <p className="text-sm text-stone-500 mt-1">Manage accounts, content, and track lead conversion.</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            className="px-4 py-2 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            value={selectedPropertyId || ''}
            onChange={(e) => setSelectedPropertyId(e.target.value || null)}
          >
            <option value="">All Properties</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-stone-200 overflow-x-auto pb-px">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-stone-900 text-stone-900' 
                : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <SocialOverview 
            accounts={socialAccounts} 
            posts={socialPosts} 
            attributions={socialAttributions} 
            selectedPropertyId={selectedPropertyId}
            properties={properties}
          />
        )}
        {activeTab === 'accounts' && (
          <SocialAccounts 
            accounts={socialAccounts} 
            selectedPropertyId={selectedPropertyId}
          />
        )}
        {activeTab === 'posts' && (
          <SocialPosts 
            posts={socialPosts} 
            selectedPropertyId={selectedPropertyId}
          />
        )}
        {activeTab === 'inbox' && (
          <SocialInbox 
            leads={socialLeads} 
            selectedPropertyId={selectedPropertyId}
            properties={properties}
          />
        )}
        {activeTab === 'calendar' && (
          <SocialCalendar 
            posts={socialPosts} 
            selectedPropertyId={selectedPropertyId}
          />
        )}
        {activeTab === 'studio' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-1">
            <ContentStudioView />
          </div>
        )}
      </div>
    </div>
  );
};
export default SocialMediaView;
