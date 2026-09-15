import React, { useState } from 'react';
import { 
  TrendingUp, DollarSign, Sparkles, Check, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, Globe, Shield, RefreshCw, 
  BarChart2, Info 
} from 'lucide-react';
import { useApp, formatIDR } from '../../context/AppContext';

export const RevenuePricingView: React.FC = () => {
  const { properties, updatePropertyPrice, approveAiAction, selectedPropertyId: globalSelectedId } = useApp();
  const [selectedPropId, setSelectedPropId] = useState<string>('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Derive current property strictly from active workspace's scoped properties
  const currentProperty = React.useMemo(() => {
    if (selectedPropId) {
      const found = properties.find(p => p.id === selectedPropId);
      if (found) return found;
    }
    if (globalSelectedId) {
      const found = properties.find(p => p.id === globalSelectedId);
      if (found) return found;
    }
    return properties.find(p => !p.isArchived) || null;
  }, [properties, selectedPropId, globalSelectedId]);

  if (!currentProperty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-stone-500">
        <DollarSign className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-semibold text-stone-700">No properties found to manage pricing.</p>
        <p className="text-xs text-stone-400 mt-1">Add or select a villa in this workspace to configure dynamic rates.</p>
      </div>
    );
  }

  const marketBenchmarks = {
    'Seminyak': { marketAvg: 2450000, highSeasonPeak: 3600000, demandLevel: 'Surging High', compVillas: 142 },
    'Canggu': { marketAvg: 2750000, highSeasonPeak: 4200000, demandLevel: 'Peak High', compVillas: 218 },
    'Ubud': { marketAvg: 2100000, highSeasonPeak: 3100000, demandLevel: 'Moderate', compVillas: 96 },
    'Uluwatu': { marketAvg: 3800000, highSeasonPeak: 5800000, demandLevel: 'High Demand', compVillas: 74 },
    'Pererenan': { marketAvg: 2600000, highSeasonPeak: 3900000, demandLevel: 'Growing', compVillas: 110 },
  };

  const currentBenchmark = (marketBenchmarks as any)[currentProperty.area] || Object.values(marketBenchmarks)[0];

  // Calculate dynamic recommendation
  const recommendedRate = Math.round(currentProperty.dailyRate * 1.10);

  const handleApplyPricing = () => {
    updatePropertyPrice(currentProperty.id, recommendedRate);
    approveAiAction('ai-act-4');
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-serif font-bold text-stone-900">AI Revenue & Dynamic Yield Engine</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Multi-Channel Rate Push
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time algorithmic pricing balancing occupancy rates, competitor compsets, and regional Bali holiday surges.
          </p>
        </div>

        <button
          onClick={handleApplyPricing}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Apply AI Rate Push to OTAs</span>
        </button>
      </div>

      {appliedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Rates pushed to Airbnb, Booking.com, Agoda, and Direct booking engine!</span>
        </div>
      )}

      {/* Property Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b border-stone-200">
        {properties.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPropId(p.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-colors whitespace-nowrap border-b-2 -mb-px flex items-center space-x-2 ${
              selectedPropId === p.id
                ? 'border-amber-600 text-amber-800 bg-amber-50/40'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>{p.name}</span>
            <span className="text-[10px] text-stone-400 font-mono">({formatIDR(p.dailyRate, true)})</span>
          </button>
        ))}
      </div>

      {/* Main Yield Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendation & Rate Card (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Live Rate Analysis</span>
              <h3 className="font-serif font-bold text-lg text-stone-900 mt-0.5">{currentProperty.name}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-stone-500">Current Occupancy:</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {currentProperty.occupancyRate}%
              </span>
            </div>
          </div>

          {/* Current vs AI Recommended Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <span className="text-xs text-stone-500 font-medium">Current Baseline Rate</span>
              <div className="text-xl font-bold font-mono text-stone-900">
                {formatIDR(currentProperty.dailyRate)}
              </div>
              <span className="text-[11px] text-stone-400">Fixed rate without surge multipliers</span>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-50/80 to-emerald-50/40 rounded-xl border border-amber-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-900 font-bold flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>AI Optimal Rate (October Surge)</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  +10% Lift
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-stone-900">
                {formatIDR(recommendedRate)}
              </div>
              <span className="text-[11px] text-stone-600">
                Captures Australian school holiday surge with 0 drop in conversion.
              </span>
            </div>
          </div>

          {/* AI Yield Reasoning */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2 text-xs text-stone-700">
            <div className="font-bold text-stone-900 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>Yield Optimization Rationale</span>
            </div>
            <p className="leading-relaxed">
              Historical villa pacing data reveals an 88% search spike for {currentProperty.area} luxury pool villas for late September through October. Raising your rate from {formatIDR(currentProperty.dailyRate, true)} to {formatIDR(recommendedRate, true)} produces an estimated <strong>+IDR 8,550,000 net revenue lift</strong> this month.
            </p>
          </div>

          {/* Channel Multi-Push Status */}
          <div className="pt-2">
            <h4 className="font-bold text-xs text-stone-800 mb-2">Connected Channels Synchronized:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              {['Airbnb (Direct API)', 'Booking.com XML', 'Agoda YCS', 'Direct Website Engine'].map((ch, idx) => (
                <div key={idx} className="p-2 bg-stone-50 rounded-lg border border-stone-200 text-[11px] font-semibold text-stone-700">
                  {ch}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Competitor & Market Benchmark Panel (Right 1 col) */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Market Intelligence</span>
              <h3 className="font-serif font-bold text-base text-stone-900 mt-0.5">{currentProperty.area} Compset</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 font-bold uppercase">Area Average ADR</span>
                <div className="font-bold text-stone-900 text-sm mt-0.5">
                  {formatIDR(currentBenchmark.marketAvg)}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Sample size: {currentBenchmark.compVillas} villas</div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 font-bold uppercase">Peak Holiday Ceiling</span>
                <div className="font-bold text-stone-900 text-sm mt-0.5">
                  {formatIDR(currentBenchmark.highSeasonPeak)}
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">Dec 20 - Jan 5 Christmas/NYE</div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 font-bold uppercase">Market Demand Index</span>
                <div className="font-bold text-emerald-700 text-sm mt-0.5">
                  {currentBenchmark.demandLevel}
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">Flight arrivals to DPS up +12%</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100">
            <button
              onClick={handleApplyPricing}
              className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
            >
              Push Rate Update Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
