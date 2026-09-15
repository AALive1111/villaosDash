import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, ComposedChart, Bar, Line, Area, AreaChart, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { 
  TrendingUp, Sparkles, Wrench, CheckCircle2, Clock, 
  Calendar, Filter, BarChart3, Layers, ArrowUpRight, 
  ShieldCheck, AlertCircle, RefreshCw, Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

type TimeRange = '7d' | '30d' | '12w';
type ChartView = 'combined' | 'cleanings' | 'maintenance';

interface DailyTrendPoint {
  date: string;
  displayDate: string;
  cleaningsCompleted: number;
  cleaningsScheduled: number;
  maintenanceResolved: number;
  maintenanceReported: number;
  onTimeRate: number; // percentage
  avgTurnaroundHours: number;
  inspectionScore: number; // 0-100
}

const HISTORICAL_7D_DATA: DailyTrendPoint[] = [
  { date: '2026-09-08', displayDate: 'Mon 08', cleaningsCompleted: 6, cleaningsScheduled: 6, maintenanceResolved: 3, maintenanceReported: 4, onTimeRate: 100, avgTurnaroundHours: 2.1, inspectionScore: 98 },
  { date: '2026-09-09', displayDate: 'Tue 09', cleaningsCompleted: 5, cleaningsScheduled: 5, maintenanceResolved: 5, maintenanceReported: 5, onTimeRate: 97, avgTurnaroundHours: 2.3, inspectionScore: 99 },
  { date: '2026-09-10', displayDate: 'Wed 10', cleaningsCompleted: 7, cleaningsScheduled: 8, maintenanceResolved: 2, maintenanceReported: 3, onTimeRate: 96, avgTurnaroundHours: 2.4, inspectionScore: 96 },
  { date: '2026-09-11', displayDate: 'Thu 11', cleaningsCompleted: 8, cleaningsScheduled: 8, maintenanceResolved: 6, maintenanceReported: 6, onTimeRate: 99, avgTurnaroundHours: 1.9, inspectionScore: 100 },
  { date: '2026-09-12', displayDate: 'Fri 12', cleaningsCompleted: 9, cleaningsScheduled: 9, maintenanceResolved: 4, maintenanceReported: 4, onTimeRate: 98, avgTurnaroundHours: 2.2, inspectionScore: 97 },
  { date: '2026-09-13', displayDate: 'Sat 13', cleaningsCompleted: 13, cleaningsScheduled: 14, maintenanceResolved: 7, maintenanceReported: 8, onTimeRate: 95, avgTurnaroundHours: 2.7, inspectionScore: 96 },
  { date: '2026-09-14', displayDate: 'Sun 14 (Today)', cleaningsCompleted: 10, cleaningsScheduled: 11, maintenanceResolved: 5, maintenanceReported: 5, onTimeRate: 98, avgTurnaroundHours: 2.0, inspectionScore: 99 },
];

const HISTORICAL_30D_DATA: DailyTrendPoint[] = [
  { date: 'W34', displayDate: 'Aug 18-24', cleaningsCompleted: 48, cleaningsScheduled: 50, maintenanceResolved: 24, maintenanceReported: 26, onTimeRate: 96, avgTurnaroundHours: 2.4, inspectionScore: 97 },
  { date: 'W35', displayDate: 'Aug 25-31', cleaningsCompleted: 52, cleaningsScheduled: 53, maintenanceResolved: 28, maintenanceReported: 29, onTimeRate: 98, avgTurnaroundHours: 2.2, inspectionScore: 98 },
  { date: 'W36', displayDate: 'Sep 01-07', cleaningsCompleted: 56, cleaningsScheduled: 58, maintenanceResolved: 31, maintenanceReported: 33, onTimeRate: 97, avgTurnaroundHours: 2.1, inspectionScore: 99 },
  { date: 'W37', displayDate: 'Sep 08-14 (Current)', cleaningsCompleted: 58, cleaningsScheduled: 61, maintenanceResolved: 32, maintenanceReported: 35, onTimeRate: 98, avgTurnaroundHours: 2.1, inspectionScore: 98 },
];

const HISTORICAL_12W_DATA: DailyTrendPoint[] = [
  { date: 'Jul M1', displayDate: 'Jul W1-2', cleaningsCompleted: 94, cleaningsScheduled: 98, maintenanceResolved: 46, maintenanceReported: 50, onTimeRate: 95, avgTurnaroundHours: 2.5, inspectionScore: 96 },
  { date: 'Jul M2', displayDate: 'Jul W3-4', cleaningsCompleted: 106, cleaningsScheduled: 110, maintenanceResolved: 52, maintenanceReported: 55, onTimeRate: 97, avgTurnaroundHours: 2.3, inspectionScore: 97 },
  { date: 'Aug M1', displayDate: 'Aug W1-2', cleaningsCompleted: 114, cleaningsScheduled: 116, maintenanceResolved: 58, maintenanceReported: 60, onTimeRate: 98, avgTurnaroundHours: 2.2, inspectionScore: 98 },
  { date: 'Aug M2', displayDate: 'Aug W3-4', cleaningsCompleted: 118, cleaningsScheduled: 120, maintenanceResolved: 61, maintenanceReported: 63, onTimeRate: 98, avgTurnaroundHours: 2.1, inspectionScore: 99 },
  { date: 'Sep M1', displayDate: 'Sep W1-2', cleaningsCompleted: 115, cleaningsScheduled: 119, maintenanceResolved: 63, maintenanceReported: 68, onTimeRate: 97, avgTurnaroundHours: 2.1, inspectionScore: 98 },
];

// Custom Tooltip component for Recharts
const CustomOperationsTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-[#2D2926] text-white p-3.5 rounded-2xl shadow-xl border border-stone-700 text-xs min-w-[210px] space-y-2">
      <div className="flex items-center justify-between border-b border-stone-700 pb-1.5 font-bold">
        <span className="text-stone-200">{label}</span>
        <span className="text-[10px] text-[#DDA15E] uppercase tracking-wider font-mono">Operations</span>
      </div>

      <div className="space-y-1.5 pt-0.5">
        {payload.map((entry: any, index: number) => {
          let unit = '';
          if (entry.dataKey === 'onTimeRate' || entry.dataKey === 'inspectionScore') unit = '%';
          if (entry.dataKey === 'avgTurnaroundHours') unit = ' hrs';

          return (
            <div key={`item-${index}`} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-stone-300 text-[11px]">{entry.name}:</span>
              </div>
              <span className="font-bold font-mono text-white text-xs">
                {entry.value}{unit}
              </span>
            </div>
          );
        })}
      </div>

      {payload[0]?.payload?.cleaningsScheduled && (
        <div className="pt-1.5 border-t border-stone-800 text-[10px] text-stone-400 flex justify-between">
          <span>Scheduled Turnovers:</span>
          <span className="font-medium text-stone-300">{payload[0].payload.cleaningsScheduled}</span>
        </div>
      )}
    </div>
  );
};

export const TaskCompletionTrends: React.FC = () => {
  const { properties } = useApp();

  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [chartView, setChartView] = useState<ChartView>('combined');
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>('all');

  // Multiplier if a specific villa is selected to simulate single villa data vs portfolio
  const propertyMultiplier = useMemo(() => {
    if (selectedPropertyFilter === 'all') return 1;
    return 0.32; // representative proportion for a single villa
  }, [selectedPropertyFilter]);

  // Selected dataset based on time range
  const rawData = useMemo(() => {
    switch (timeRange) {
      case '30d': return HISTORICAL_30D_DATA;
      case '12w': return HISTORICAL_12W_DATA;
      case '7d':
      default:
        return HISTORICAL_7D_DATA;
    }
  }, [timeRange]);

  // Scaled data based on property filter
  const chartData = useMemo(() => {
    if (propertyMultiplier === 1) return rawData;
    return rawData.map(d => ({
      ...d,
      cleaningsCompleted: Math.max(1, Math.round(d.cleaningsCompleted * propertyMultiplier)),
      cleaningsScheduled: Math.max(1, Math.round(d.cleaningsScheduled * propertyMultiplier)),
      maintenanceResolved: Math.max(0, Math.round(d.maintenanceResolved * propertyMultiplier)),
      maintenanceReported: Math.max(0, Math.round(d.maintenanceReported * propertyMultiplier)),
    }));
  }, [rawData, propertyMultiplier]);

  // Aggregated Summary Stats for the selected period
  const stats = useMemo(() => {
    const totalCleanings = chartData.reduce((acc, curr) => acc + curr.cleaningsCompleted, 0);
    const totalCleaningsSched = chartData.reduce((acc, curr) => acc + curr.cleaningsScheduled, 0);
    const totalMaintenance = chartData.reduce((acc, curr) => acc + curr.maintenanceResolved, 0);
    const totalMaintReported = chartData.reduce((acc, curr) => acc + curr.maintenanceReported, 0);
    const avgOnTime = Math.round(chartData.reduce((acc, curr) => acc + curr.onTimeRate, 0) / chartData.length);
    const avgInspection = (chartData.reduce((acc, curr) => acc + curr.inspectionScore, 0) / chartData.length).toFixed(1);
    const cleaningCompletionPct = Math.round((totalCleanings / (totalCleaningsSched || 1)) * 100);
    const maintResolutionPct = Math.round((totalMaintenance / (totalMaintReported || 1)) * 100);

    return {
      totalCleanings,
      cleaningCompletionPct,
      totalMaintenance,
      maintResolutionPct,
      avgOnTime,
      avgInspection
    };
  }, [chartData]);

  return (
    <div 
      id="operations-task-completion-trends"
      className="bg-white rounded-3xl border border-[#E8E6E1] p-5 sm:p-6 shadow-xs space-y-6"
    >
      {/* Component Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#F2F1ED] pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FEFAE0] border border-[#F1EDD4] flex items-center justify-center text-[#606C38] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-serif font-bold text-lg text-[#2D2926]">
                Operational Task Completion Trends
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEFAE0] text-[#606C38] border border-[#F1EDD4]">
                Recharts Analytics
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Historical turnaround volume, maintenance ticket resolutions, and on-time SLA velocity
            </p>
          </div>
        </div>

        {/* Action Filters: Villa selector, View toggle, Time range */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Villa Scope Filter */}
          <div className="relative">
            <select
              id="select-trend-property"
              value={selectedPropertyFilter}
              onChange={(e) => setSelectedPropertyFilter(e.target.value)}
              aria-label="Filter trends by property"
              className="bg-[#FAF9F6] border border-[#E8E6E1] text-xs font-bold text-[#2D2926] rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-[#606C38]/20 focus:border-[#606C38] cursor-pointer"
            >
              <option value="all">All Villas (Portfolio)</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Metric View Tabs */}
          <div className="flex bg-[#FAF9F6] p-0.5 rounded-xl border border-[#E8E6E1]">
            <button
              onClick={() => setChartView('combined')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                chartView === 'combined' 
                  ? 'bg-white text-[#2D2926] shadow-2xs' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setChartView('cleanings')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                chartView === 'cleanings' 
                  ? 'bg-white text-[#606C38] shadow-2xs' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#606C38]" />
              <span>Cleanings</span>
            </button>
            <button
              onClick={() => setChartView('maintenance')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                chartView === 'maintenance' 
                  ? 'bg-white text-[#BC6C25] shadow-2xs' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Wrench className="w-3 h-3 text-[#BC6C25]" />
              <span>Maintenance</span>
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex bg-[#FAF9F6] p-0.5 rounded-xl border border-[#E8E6E1]">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                timeRange === '7d' 
                  ? 'bg-white text-[#2D2926] shadow-2xs' 
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                timeRange === '30d' 
                  ? 'bg-white text-[#2D2926] shadow-2xs' 
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              4 Weeks
            </button>
            <button
              onClick={() => setTimeRange('12w')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                timeRange === '12w' 
                  ? 'bg-white text-[#2D2926] shadow-2xs' 
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              12 Weeks
            </button>
          </div>
        </div>
      </div>

      {/* KPI Performance Badges Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Cleaning Completions */}
        <div className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E1] space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-[11px] font-bold uppercase tracking-wider">
            <span>Cleanings Done</span>
            <Sparkles className="w-3.5 h-3.5 text-[#606C38]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-serif text-[#2D2926]">
              {stats.totalCleanings}
            </span>
            <span className="text-[11px] font-bold text-[#606C38]">
              {stats.cleaningCompletionPct}% Rate
            </span>
          </div>
          <p className="text-[10px] text-stone-400">
            Turnovers & sanitizations completed
          </p>
        </div>

        {/* Maintenance Fixes */}
        <div className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E1] space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-[11px] font-bold uppercase tracking-wider">
            <span>Repairs Resolved</span>
            <Wrench className="w-3.5 h-3.5 text-[#BC6C25]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-serif text-[#2D2926]">
              {stats.totalMaintenance}
            </span>
            <span className="text-[11px] font-bold text-[#BC6C25]">
              {stats.maintResolutionPct}% Fixed
            </span>
          </div>
          <p className="text-[10px] text-stone-400">
            HVAC, water pumps, Wi-Fi & pool fixes
          </p>
        </div>

        {/* On-Time Arrival SLA */}
        <div className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E1] space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-[11px] font-bold uppercase tracking-wider">
            <span>On-Time SLA</span>
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-serif text-[#2D2926]">
              {stats.avgOnTime}%
            </span>
            <span className="text-[11px] font-bold text-emerald-700">
              Target &gt;95%
            </span>
          </div>
          <p className="text-[10px] text-stone-400">
            Villas ready prior to 14:00 check-in
          </p>
        </div>

        {/* Quality Audit Score */}
        <div className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E1] space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-[11px] font-bold uppercase tracking-wider">
            <span>Audit Score</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#606C38]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-serif text-emerald-800">
              {stats.avgInspection}%
            </span>
            <span className="text-[11px] font-bold text-[#606C38]">
              AI Inspected
            </span>
          </div>
          <p className="text-[10px] text-stone-400">
            Linen, bath & pool quality checks
          </p>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="bg-[#FAF9F6] p-4 sm:p-5 rounded-2xl border border-[#E8E6E1] space-y-4">
        {/* Chart Header Legend & Dynamic Context */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-4">
            {(chartView === 'combined' || chartView === 'cleanings') && (
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-[#606C38]" />
                <span className="font-bold text-stone-700">Cleanings Completed</span>
              </div>
            )}
            {(chartView === 'combined' || chartView === 'maintenance') && (
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-[#BC6C25]" />
                <span className="font-bold text-stone-700">Maintenance Resolved</span>
              </div>
            )}
            {chartView === 'combined' && (
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 bg-[#2D2926] rounded-full" />
                <span className="font-bold text-stone-700">On-Time SLA (%)</span>
              </div>
            )}
          </div>

          <span className="text-[11px] text-stone-400">
            {timeRange === '7d' ? 'Daily villa operations trend' : 'Periodic aggregated performance'}
          </span>
        </div>

        {/* Recharts Render Canvas */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'combined' ? (
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" vertical={false} />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fill: '#78716C', fontSize: 11 }} 
                  axisLine={{ stroke: '#E8E6E1' }}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fill: '#78716C', fontSize: 11 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={[80, 100]} 
                  tick={{ fill: '#78716C', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip content={<CustomOperationsTooltip />} />
                <Bar 
                  yAxisId="left" 
                  dataKey="cleaningsCompleted" 
                  name="Cleanings Completed" 
                  fill="#606C38" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={36}
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="maintenanceResolved" 
                  name="Maintenance Resolved" 
                  fill="#BC6C25" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={36}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="onTimeRate" 
                  name="On-Time Rate" 
                  stroke="#2D2926" 
                  strokeWidth={2.5}
                  dot={{ fill: '#2D2926', r: 3.5, strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            ) : chartView === 'cleanings' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cleaningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#606C38" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#606C38" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" vertical={false} />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fill: '#78716C', fontSize: 11 }} 
                  axisLine={{ stroke: '#E8E6E1' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#78716C', fontSize: 11 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomOperationsTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="cleaningsCompleted" 
                  name="Cleanings Completed" 
                  stroke="#606C38" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#cleaningsGrad)" 
                  dot={{ fill: '#606C38', r: 3 }}
                />
              </AreaChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="maintGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#BC6C25" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#BC6C25" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" vertical={false} />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fill: '#78716C', fontSize: 11 }} 
                  axisLine={{ stroke: '#E8E6E1' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#78716C', fontSize: 11 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomOperationsTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="maintenanceResolved" 
                  name="Maintenance Resolved" 
                  stroke="#BC6C25" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#maintGrad)" 
                  dot={{ fill: '#BC6C25', r: 3 }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Bottom Context Footer Insights */}
        <div className="pt-2 border-t border-[#E8E6E1] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-500">
          <div className="flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-[#BC6C25]" />
            <span>
              <strong>Operations Insight:</strong> Saturday is peak turnover day across Bali villas. Staff scheduled with 1.5x buffer capacity.
            </span>
          </div>
          <span className="text-[11px] text-stone-400">
            Updated today at 19:30 WITA
          </span>
        </div>
      </div>
    </div>
  );
};
