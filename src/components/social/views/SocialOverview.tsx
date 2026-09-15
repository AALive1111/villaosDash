import React, { useMemo } from 'react';
import { SocialAccount, SocialAttribution, SocialPost } from '../../../types';
import { formatIDR } from '../../../context/AppContext';
import { TrendingUp, Users, Share2, MousePointerClick, CalendarCheck, CreditCard, Sparkles, Filter } from 'lucide-react';

interface SocialOverviewProps {
  accounts: SocialAccount[];
  attributions: SocialAttribution[];
  posts: SocialPost[];
  selectedPropertyId: string | null;
  properties: any[];
}

export const SocialOverview: React.FC<SocialOverviewProps> = ({ accounts, attributions, posts, selectedPropertyId, properties }) => {
  const filteredAccounts = useMemo(() => {
    if (!selectedPropertyId) return accounts;
    return accounts.filter(a => a.propertyId === selectedPropertyId);
  }, [accounts, selectedPropertyId]);

  const filteredAttributions = useMemo(() => {
    // If we have a specific property, we filter metrics accordingly. For MVP, we roughly divide or show exact.
    // In a real app, attributions would be tied to property. Here we use platform breakdown.
    if (!selectedPropertyId) return attributions;
    const platforms = filteredAccounts.map(a => a.platform);
    return attributions.filter(a => platforms.includes(a.platform));
  }, [attributions, filteredAccounts, selectedPropertyId]);

  const filteredPosts = useMemo(() => {
    if (!selectedPropertyId) return posts;
    return posts.filter(p => p.propertyId === selectedPropertyId);
  }, [posts, selectedPropertyId]);

  const totalFollowers = filteredAccounts.reduce((sum, acc) => sum + acc.followers, 0);
  const totalReach = filteredPosts.reduce((sum, p) => sum + (p.metrics?.reach || 0), 0);
  const avgEngagement = filteredAccounts.length > 0 
    ? (filteredAccounts.reduce((sum, acc) => sum + acc.engagementRate, 0) / filteredAccounts.length).toFixed(1)
    : 0;
  const totalLeads = filteredAttributions.reduce((sum, attr) => sum + attr.leads, 0);
  const totalBookings = filteredAttributions.reduce((sum, attr) => sum + attr.bookings, 0);
  const totalRevenue = filteredAttributions.reduce((sum, attr) => sum + attr.revenue, 0);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard icon={<Users className="w-5 h-5 text-blue-600" />} label="Total Audience" value={totalFollowers.toLocaleString()} />
        <MetricCard icon={<Share2 className="w-5 h-5 text-indigo-600" />} label="Total Reach" value={totalReach.toLocaleString()} />
        <MetricCard icon={<MousePointerClick className="w-5 h-5 text-amber-600" />} label="Avg Engagement" value={`${avgEngagement}%`} />
        <MetricCard icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} label="Total Leads" value={totalLeads} />
        <MetricCard icon={<CalendarCheck className="w-5 h-5 text-purple-600" />} label="Bookings" value={totalBookings} />
        <MetricCard icon={<CreditCard className="w-5 h-5 text-emerald-600" />} label="Revenue" value={formatIDR(totalRevenue, true)} highlight />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Attribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-stone-900 font-serif text-lg">Social Attribution</h3>
          </div>
          <div className="space-y-4">
            {filteredAttributions.map((attr, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-stone-100 bg-stone-50/50">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                    attr.platform === 'Instagram' ? 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600' :
                    attr.platform === 'TikTok' ? 'bg-stone-900' :
                    attr.platform === 'Facebook' ? 'bg-blue-600' : 'bg-red-500'
                  }`}>
                    {attr.platform.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{attr.platform}</h4>
                    <p className="text-xs text-stone-500">{attr.leads} leads • {attr.bookings} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-700 text-sm">{formatIDR(attr.revenue, true)}</div>
                  <div className="text-[10px] text-stone-400 uppercase tracking-wide">Generated</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-gradient-to-br from-amber-50 to-stone-50 rounded-2xl border border-amber-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-amber-700 mb-4">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold font-serif">AI Strategy Insight</h3>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              Instagram generated the highest-value leads this week. Your pool and sunset content is outperforming room-focused content by <strong>2.8x</strong>.
            </p>
            {!selectedPropertyId && (
              <p className="text-sm text-stone-700 leading-relaxed mt-2">
                <strong>Villa Canggu 08</strong> is your best-performing property on social media.
              </p>
            )}
          </div>
          <button className="mt-6 w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors">
            Create 3 More Pool Reels
          </button>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, highlight = false }: { icon: React.ReactNode, label: string, value: string | number, highlight?: boolean }) => (
  <div className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between ${highlight ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-stone-200'}`}>
    <div className="flex justify-between items-start mb-2">
      <div className={`p-2 rounded-xl ${highlight ? 'bg-emerald-100' : 'bg-stone-100'}`}>{icon}</div>
    </div>
    <div>
      <h4 className={`text-xl font-bold ${highlight ? 'text-emerald-900' : 'text-stone-900'}`}>{value}</h4>
      <p className={`text-xs mt-1 ${highlight ? 'text-emerald-700' : 'text-stone-500'}`}>{label}</p>
    </div>
  </div>
);
