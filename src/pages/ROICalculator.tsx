import React, { useState, useMemo } from "react";
import { interventionTypes, benchmarks, calculateROI, type InterventionType } from "@/lib/roi-models";
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Calculator, TrendingUp, DollarSign, Clock } from "lucide-react";

const ROICalculator: React.FC = () => {
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionType>(interventionTypes[0]);
  const [areaHA, setAreaHA] = useState(500);
  const [currentHealth, setCurrentHealth] = useState(45);
  const [yieldValue, setYieldValue] = useState(1200);

  const result = useMemo(
    () => calculateROI(selectedIntervention, areaHA, currentHealth, yieldValue),
    [selectedIntervention, areaHA, currentHealth, yieldValue]
  );

  const chartData = [
    { name: "Total Cost", value: result.totalCost, color: "hsl(var(--status-critical))" },
    { name: "Projected Recovery", value: result.projectedRecovery, color: "hsl(var(--status-good))" },
    { name: "Net Benefit", value: Math.max(0, result.netBenefit), color: "hsl(var(--primary))" },
  ];

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: Inputs */}
      <div className="w-80 border-r border-border bg-card flex-shrink-0 overflow-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">ROI Parameters</span>
        </div>

        {/* Intervention Type */}
        <div className="mb-6">
          <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
            Intervention Type
          </label>
          <div className="space-y-1">
            {interventionTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedIntervention(t)}
                className={`block w-full text-left px-3 py-2 text-sm rounded-sm transition-colors ${
                  selectedIntervention.id === t.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <span className="block font-medium">{t.name}</span>
                <span className="block font-mono text-xs opacity-70">{t.category} · ${t.baseCostPerHA}/HA</span>
              </button>
            ))}
          </div>
        </div>

        {/* Area Slider */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Area (HA)</label>
            <span className="font-mono text-sm font-medium">{areaHA.toLocaleString()}</span>
          </div>
          <Slider value={[areaHA]} onValueChange={(v) => setAreaHA(v[0])} min={50} max={5000} step={50} />
        </div>

        {/* Health Slider */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Current Health</label>
            <span className="font-mono text-sm font-medium">{currentHealth}/100</span>
          </div>
          <Slider value={[currentHealth]} onValueChange={(v) => setCurrentHealth(v[0])} min={5} max={95} step={1} />
        </div>

        {/* Yield Value */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Yield Value ($/HA)</label>
            <span className="font-mono text-sm font-medium">${yieldValue.toLocaleString()}</span>
          </div>
          <Slider value={[yieldValue]} onValueChange={(v) => setYieldValue(v[0])} min={200} max={5000} step={100} />
        </div>
      </div>

      {/* Right: Results */}
      <div className="flex-1 overflow-auto p-6">
        {/* ROI Header */}
        <div className="mb-8">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Projected Return on Investment</span>
          <div className="flex items-baseline gap-4 mt-2">
            <span className={`font-mono text-5xl font-semibold ${result.roiPercent >= 0 ? "text-status-good" : "text-status-critical"}`}>
              {result.roiPercent}%
            </span>
            <span className="font-mono text-lg text-muted-foreground">ROI</span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="border border-border p-4">
            <DollarSign className="w-4 h-4 text-muted-foreground mb-2" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">Total Cost</span>
            <span className="font-mono text-xl font-semibold block mt-1">${result.totalCost.toLocaleString()}</span>
          </div>
          <div className="border border-border p-4">
            <TrendingUp className="w-4 h-4 text-muted-foreground mb-2" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">Recovery</span>
            <span className="font-mono text-xl font-semibold text-status-good block mt-1">${result.projectedRecovery.toLocaleString()}</span>
          </div>
          <div className="border border-border p-4">
            <DollarSign className="w-4 h-4 text-muted-foreground mb-2" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">Net Benefit</span>
            <span className={`font-mono text-xl font-semibold block mt-1 ${result.netBenefit >= 0 ? "text-status-good" : "text-status-critical"}`}>
              ${result.netBenefit.toLocaleString()}
            </span>
          </div>
          <div className="border border-border p-4">
            <Clock className="w-4 h-4 text-muted-foreground mb-2" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">Payback</span>
            <span className="font-mono text-xl font-semibold block mt-1">{result.paybackWeeks} wks</span>
          </div>
        </div>

        {/* Chart */}
        <div className="border border-border p-4 mb-8">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-4">Cost vs. Benefit Analysis</span>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barSize={60}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, ""]} contentStyle={{ fontFamily: "JetBrains Mono", fontSize: 12, border: "1px solid hsl(var(--border))", borderRadius: 2 }} />
              <Bar dataKey="value">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Benchmarks Table */}
        <div className="border border-border">
          <div className="px-4 py-3 border-b border-border">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Industry Benchmarks</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-mono text-xs uppercase tracking-wider text-muted-foreground px-4 py-2">Segment</th>
                <th className="text-right font-mono text-xs uppercase tracking-wider text-muted-foreground px-4 py-2">Avg ROI</th>
                <th className="text-right font-mono text-xs uppercase tracking-wider text-muted-foreground px-4 py-2">Avg Cost/HA</th>
                <th className="text-right font-mono text-xs uppercase tracking-wider text-muted-foreground px-4 py-2">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((b) => (
                <tr key={b.label} className="border-b border-border last:border-b-0 hover:bg-accent/50">
                  <td className="px-4 py-2.5 text-sm">{b.label}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm text-status-good">{b.avgROI}%</td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm">${b.avgCostPerHA}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm">{b.successRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;
