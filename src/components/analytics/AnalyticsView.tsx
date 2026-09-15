import React from 'react';
import { 
  BarChart3, TrendingUp, Calendar, Users, Star, 
  Percent, ArrowUpRight, ArrowDownRight, ShieldCheck 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AnalyticsView: React.FC = () => {
  const metrics = [
    { label: 'RevPAR (Rev Per Available Room)', value: 'IDR 2,420,000', change: '+7.8%', positive: true },
    { label: 'ADR (Average Daily Rate)', value: 'IDR 3,100,000', change: '+4.5%', positive: true },
    { label: 'Average Length of Stay', value: '4.8 nights', change: '+0.6 nights', positive: true },
    { label: 'Booking Lead Time', value: '23 days', change: '-2 days', positive: false },
    { label: 'Cancellation Rate', value: '2.4%', change: '-0.8%', positive: true },
    { label: 'Guest Review Average', value: '4.94 / 5.0', change: '184 verified reviews', positive: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900">Hospitality Performance Analytics</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Key hospitality KPIs, guest satisfaction indexes, and pacing comparisons.
          </p>
        </div>

        <span className="text-xs font-bold text-stone-600 bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-2xs">
          Sept 2026 Trailing 30 Days
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m, idx) => (
          <div key={idx} className="p-3.5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-semibold text-stone-500 truncate block">{m.label}</span>
            <div className="text-base font-bold text-stone-900 tracking-tight">{m.value}</div>
            <div className={`text-[10px] font-semibold flex items-center space-x-0.5 ${
              m.positive ? 'text-emerald-700' : 'text-stone-500'
            }`}>
              {m.positive && <ArrowUpRight className="w-3 h-3" />}
              <span>{m.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Deep Dive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pacing vs Bali Market */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">Occupancy Pacing vs Bali Market</h3>
              <p className="text-xs text-stone-500">Your portfolio (78%) outperforming regional benchmark (71%)</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              +7.0% Edge
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-bold text-stone-800">VillaOS Portfolio</span>
                <span className="font-bold text-amber-700">78%</span>
              </div>
              <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-stone-600">Seminyak Luxury Segment</span>
                <span className="text-stone-600">74%</span>
              </div>
              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-stone-400 h-full rounded-full" style={{ width: '74%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-stone-600">Canggu Luxury Segment</span>
                <span className="text-stone-600">76%</span>
              </div>
              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-stone-400 h-full rounded-full" style={{ width: '76%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-stone-600">Ubud Luxury Segment</span>
                <span className="text-stone-600">68%</span>
              </div>
              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-stone-400 h-full rounded-full" style={{ width: '68%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Lead Source Distribution */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">Direct vs OTA Share</h3>
              <p className="text-xs text-stone-500">Long-term margin protection strategy</p>
            </div>
            <span className="text-xs font-bold text-stone-700">Goal: 40% Direct</span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-stone-800">Direct Bookings (Website + WhatsApp + IG)</span>
              <span className="font-bold text-emerald-700 text-sm">30.0%</span>
            </div>
            <div className="w-full bg-stone-200 h-3 rounded-full overflow-hidden flex">
              <div className="bg-emerald-600 h-full" style={{ width: '30%' }} title="Direct" />
              <div className="bg-rose-500 h-full" style={{ width: '46%' }} title="Airbnb" />
              <div className="bg-blue-600 h-full" style={{ width: '24%' }} title="Booking.com" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>Direct (30%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Airbnb (46%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>Booking.com (24%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
