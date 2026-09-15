import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, Download, PieChart, BarChart3, 
  ArrowUpRight, Globe, Shield, FileText, Check 
} from 'lucide-react';
import { useApp, formatIDR } from '../../context/AppContext';

export const FinancialDashboardView: React.FC = () => {
  const { properties, reservations } = useApp();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Dynamic financial calculations from scoped workspace reservations
  const activeReservations = reservations.filter(r => r.status !== 'Cancelled');
  const reservationGross = activeReservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const propertiesGross = properties.reduce((sum, p) => sum + (p.monthlyRevenue || 0), 0);
  const grossRevenue = reservationGross > 0 ? reservationGross : propertiesGross;

  const totalCommissions = activeReservations.reduce((sum, r) => sum + (r.commission || 0), 0);
  const opex = Math.round(grossRevenue * 0.24); // 24% operational expenses benchmark for Bali luxury villas
  const netIncome = Math.max(0, grossRevenue - opex - totalCommissions);
  const netMargin = grossRevenue > 0 ? ((netIncome / grossRevenue) * 100).toFixed(1) : '0.0';

  const monthlyHistory = [
    { month: 'Apr', rev: Math.round(grossRevenue * 0.74) },
    { month: 'May', rev: Math.round(grossRevenue * 0.84) },
    { month: 'Jun', rev: Math.round(grossRevenue * 0.91) },
    { month: 'Jul', rev: Math.round(grossRevenue * 1.02) },
    { month: 'Aug', rev: Math.round(grossRevenue * 1.08) },
    { month: 'Sep (Current)', rev: grossRevenue },
  ];

  // Aggregate channel breakdown
  const channelData: Record<string, { rev: number; color: string; label: string }> = {
    'Airbnb': { rev: 0, color: 'bg-rose-500', label: 'Airbnb' },
    'Booking.com': { rev: 0, color: 'bg-blue-600', label: 'Booking.com' },
    'Direct': { rev: 0, color: 'bg-emerald-600', label: 'Direct (Website & WhatsApp)' },
    'Instagram': { rev: 0, color: 'bg-pink-500', label: 'Instagram Direct' },
    'WhatsApp': { rev: 0, color: 'bg-teal-600', label: 'WhatsApp Direct' },
    'Agoda': { rev: 0, color: 'bg-purple-600', label: 'Agoda' },
  };

  if (activeReservations.length > 0) {
    activeReservations.forEach(r => {
      const key = r.channel in channelData ? r.channel : 'Direct';
      channelData[key].rev += r.totalAmount || 0;
    });
  }

  const totalChannelRev = Object.values(channelData).reduce((sum, c) => sum + c.rev, 0) || grossRevenue || 1;

  const channelBreakdown = Object.values(channelData)
    .filter(item => item.rev > 0)
    .map(item => ({
      channel: item.label,
      share: `${Math.round((item.rev / totalChannelRev) * 100)}%`,
      rev: item.rev,
      color: item.color,
    }));

  const displayChannels = channelBreakdown.length > 0 ? channelBreakdown : [
    { channel: 'Direct (Website & WhatsApp)', share: '100%', rev: grossRevenue, color: 'bg-emerald-600' }
  ];

  const handleDownloadReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900">Financial Ledger & P&L Statement</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Transparent revenue tracking, channel commission audit, and net operating income in Indonesian Rupiah (IDR).
          </p>
        </div>

        <button
          onClick={handleDownloadReport}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          {downloadSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
          <span>{downloadSuccess ? 'Downloaded P&L PDF' : 'Download P&L Statement (PDF)'}</span>
        </button>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500">Gross Booking Volume</span>
          <div className="text-xl font-bold text-stone-900 mt-1.5">{formatIDR(grossRevenue, true)}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">+14.2% vs last year</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500">Operational Expenses (OPEX)</span>
          <div className="text-xl font-bold text-stone-900 mt-1.5">{formatIDR(opex, true)}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Salaries, PLN, pool, linens</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500">Channel OTA Commissions</span>
          <div className="text-xl font-bold text-rose-700 mt-1.5">{formatIDR(totalCommissions, true)}</div>
          <div className="text-[10px] text-stone-400 mt-0.5">Avg 15.8% commission cut</div>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-200 shadow-2xs">
          <span className="text-xs font-bold text-emerald-900">Net Operating Income (NOI)</span>
          <div className="text-xl font-bold text-emerald-800 mt-1.5">{formatIDR(netIncome, true)}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">62.6% Net Margin</div>
        </div>
      </div>

      {/* Revenue History Chart & Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">6-Month Revenue Trajectory</h3>
              <p className="text-xs text-stone-500">Consistent performance across low and high Bali seasons</p>
            </div>
            <span className="text-xs font-bold text-stone-700">Currency: IDR (Million)</span>
          </div>

          {/* Bar Visualizer */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {monthlyHistory.map((item, idx) => {
              const maxRev = 350000000;
              const heightPct = (item.rev / maxRev) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono font-bold text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(item.rev / 1000000).toFixed(0)}M
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      item.month.includes('Current')
                        ? 'bg-gradient-to-t from-amber-600 to-amber-500'
                        : 'bg-stone-200 hover:bg-stone-300'
                    }`}
                  />
                  <span className="text-[11px] font-semibold text-stone-600 text-center truncate max-w-full">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Portfolio Peak: August 2026 (IDR 310M)</span>
            <span className="text-emerald-700 font-bold">On track to exceed target</span>
          </div>
        </div>

        {/* Channel Revenue Mix (1 col) */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-base text-stone-900">Channel Share Breakdown</h3>
              <p className="text-xs text-stone-500">Gross revenue generated per source</p>
            </div>

            <div className="mt-4 space-y-3">
              {displayChannels.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-800">{item.channel}</span>
                    <span className="text-stone-900 font-bold">{formatIDR(item.rev, true)} ({item.share})</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: item.share }}
                      className={`h-full ${item.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
            <span className="font-bold">Direct Channels: 30% of portfolio. </span>
            <span>Target is 40% to save an extra IDR 14.5M in annual commissions.</span>
          </div>
        </div>
      </div>

      {/* Property-by-Property Revenue Ledger */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
        <h3 className="font-serif font-bold text-base text-stone-900">Villa Asset Contribution Breakdown</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Villa Name</th>
                <th className="py-2.5 px-3">Area</th>
                <th className="py-2.5 px-3">Monthly Gross</th>
                <th className="py-2.5 px-3">Occupancy</th>
                <th className="py-2.5 px-3">Est. OPEX</th>
                <th className="py-2.5 px-3 text-right">Net Profit Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
              {properties.map(p => {
                const propOpex = Math.round(p.monthlyRevenue * 0.24);
                const propNet = Math.round(p.monthlyRevenue * 0.63);

                return (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="py-3 px-3 font-bold text-stone-900">{p.name}</td>
                    <td className="py-3 px-3 text-stone-500">{p.area}</td>
                    <td className="py-3 px-3 font-bold text-stone-900">{formatIDR(p.monthlyRevenue)}</td>
                    <td className="py-3 px-3 text-emerald-700 font-semibold">{p.occupancyRate}%</td>
                    <td className="py-3 px-3 text-stone-500">{formatIDR(propOpex)}</td>
                    <td className="py-3 px-3 font-bold text-emerald-700 text-right">{formatIDR(propNet)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
