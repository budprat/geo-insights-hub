import React, { useState, useMemo } from "react";
import {
  interventionTypes,
  benchmarks,
  calculateROI,
  computeScenarioROI,
  scenarioConfigs,
  presets,
  type InterventionType,
  type ScenarioKey,
} from "@/lib/roi-models";
import { Slider } from "@/components/ui/slider";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Calculator, TrendingUp, DollarSign, Clock } from "lucide-react";

const ROICalculator: React.FC = () => {
  const [selectedIntervention, setSelectedIntervention] =
    useState<InterventionType>(interventionTypes[0]);
  const [areaHA, setAreaHA] = useState(500);
  const [currentHealth, setCurrentHealth] = useState(45);
  const [yieldValue, setYieldValue] = useState(1200);

  // Scenario modeling (ported from JonaAI-Intel)
  const [scenario, setScenario] = useState<ScenarioKey>("normal");
  const [investment, setInvestment] = useState(2500);
  const [delay, setDelay] = useState(7);
  const [effectiveness, setEffectiveness] = useState(70);

  const result = useMemo(
    () => calculateROI(selectedIntervention, areaHA, currentHealth, yieldValue),
    [selectedIntervention, areaHA, currentHealth, yieldValue],
  );

  // Yield impact derived from health deficit
  const yieldImpact = currentHealth > 70 ? 0 : -(100 - currentHealth) * 600;

  const scenarioResult = useMemo(
    () =>
      computeScenarioROI(
        currentHealth,
        yieldImpact,
        investment,
        delay,
        effectiveness,
        scenario,
      ),
    [currentHealth, yieldImpact, investment, delay, effectiveness, scenario],
  );

  // All 4 scenarios for comparison table
  const allScenarios = useMemo(
    () =>
      (Object.keys(scenarioConfigs) as ScenarioKey[]).map((key) => ({
        key,
        ...computeScenarioROI(
          currentHealth,
          yieldImpact,
          investment,
          delay,
          effectiveness,
          key,
        ),
      })),
    [currentHealth, yieldImpact, investment, delay, effectiveness],
  );

  const chartData = [
    {
      name: "Total Cost",
      value: result.totalCost,
      color: "hsl(var(--status-critical))",
    },
    {
      name: "Projected Recovery",
      value: result.projectedRecovery,
      color: "hsl(var(--status-good))",
    },
    {
      name: "Net Benefit",
      value: Math.max(0, result.netBenefit),
      color: "hsl(var(--primary))",
    },
  ];

  const applyPreset = (name: string) => {
    const p = presets[name];
    if (!p) return;
    setInvestment(p.investment);
    setDelay(p.delay);
    setEffectiveness(p.effectiveness);
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: Inputs */}
      <div className="w-80 border-r border-border bg-card flex-shrink-0 overflow-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            ROI Parameters
          </span>
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
                <span className="block font-mono text-xs opacity-70">
                  {t.category} · ${t.baseCostPerHA}/HA
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Area Slider */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Area (HA)
            </label>
            <span className="font-mono text-sm font-medium">
              {areaHA.toLocaleString()}
            </span>
          </div>
          <Slider
            value={[areaHA]}
            onValueChange={(v) => setAreaHA(v[0])}
            min={50}
            max={5000}
            step={50}
          />
        </div>

        {/* Health Slider */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Current Health
            </label>
            <span className="font-mono text-sm font-medium">
              {currentHealth}/100
            </span>
          </div>
          <Slider
            value={[currentHealth]}
            onValueChange={(v) => setCurrentHealth(v[0])}
            min={5}
            max={95}
            step={1}
          />
        </div>

        {/* Yield Value */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Yield Value ($/HA)
            </label>
            <span className="font-mono text-sm font-medium">
              ${yieldValue.toLocaleString()}
            </span>
          </div>
          <Slider
            value={[yieldValue]}
            onValueChange={(v) => setYieldValue(v[0])}
            min={200}
            max={5000}
            step={100}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-border my-6" />

        {/* Scenario Modeling Section */}
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Scenario Modeling
          </span>
        </div>

        {/* Climate Scenario */}
        <div className="mb-5">
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5 font-medium">
            Climate Scenario
          </label>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value as ScenarioKey)}
            className="w-full h-10 border border-border px-3 text-sm bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          >
            <option value="normal">Normal Conditions</option>
            <option value="drought">Drought Stress (+30% loss risk)</option>
            <option value="frost">Frost Event (+50% loss risk)</option>
            <option value="optimal">Optimal Season (-20% loss risk)</option>
          </select>
        </div>

        {/* Investment Slider */}
        <div className="mb-5">
          <div className="flex justify-between mb-2">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Investment
            </label>
            <span className="font-mono text-sm font-medium">
              ${investment.toLocaleString()}
            </span>
          </div>
          <Slider
            value={[investment]}
            onValueChange={(v) => setInvestment(v[0])}
            min={0}
            max={10000}
            step={100}
          />
        </div>

        {/* Time to Action */}
        <div className="mb-5">
          <div className="flex justify-between mb-2">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Time to Action
            </label>
            <span className="font-mono text-sm font-medium">
              {delay} day{delay !== 1 ? "s" : ""}
            </span>
          </div>
          <Slider
            value={[delay]}
            onValueChange={(v) => setDelay(v[0])}
            min={0}
            max={90}
            step={1}
          />
        </div>

        {/* Effectiveness */}
        <div className="mb-5">
          <div className="flex justify-between mb-2">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Effectiveness
            </label>
            <span className="font-mono text-sm font-medium">
              {effectiveness}%
            </span>
          </div>
          <Slider
            value={[effectiveness]}
            onValueChange={(v) => setEffectiveness(v[0])}
            min={0}
            max={100}
            step={5}
          />
        </div>

        {/* Presets */}
        <div className="flex gap-2">
          {Object.keys(presets).map((name) => (
            <button
              key={name}
              onClick={() => applyPreset(name)}
              className="flex-1 border border-border font-mono text-[10px] uppercase tracking-wider text-muted-foreground py-2 hover:text-foreground hover:border-primary transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Results */}
      <div className="flex-1 overflow-auto p-6">
        {/* ROI Header */}
        <div className="mb-8">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Projected Return on Investment
          </span>
          <div className="flex items-baseline gap-4 mt-2">
            <span
              className={`font-mono text-5xl font-semibold ${result.roiPercent >= 0 ? "text-status-good" : "text-status-critical"}`}
            >
              {result.roiPercent}%
            </span>
            <span className="font-mono text-lg text-muted-foreground">ROI</span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="border border-border p-4">
            <DollarSign className="w-4 h-4 text-muted-foreground mb-2" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">
              Total Cost
            </span>
            <span className="font-mono text-xl font-semibold block mt-1">
              ${result.totalCost.toLocaleString()}
            </span>
          </div>
          <div className="border border-border p-4">
            <TrendingUp className="w-4 h-4 text-muted-foreground mb-2" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">
              Recovery
            </span>
            <span className="font-mono text-xl font-semibold text-status-good block mt-1">
              ${result.projectedRecovery.toLocaleString()}
            </span>
          </div>
          <div className="border border-border p-4">
            <DollarSign className="w-4 h-4 text-muted-foreground mb-2" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">
              Net Benefit
            </span>
            <span
              className={`font-mono text-xl font-semibold block mt-1 ${result.netBenefit >= 0 ? "text-status-good" : "text-status-critical"}`}
            >
              ${result.netBenefit.toLocaleString()}
            </span>
          </div>
          <div className="border border-border p-4">
            <Clock className="w-4 h-4 text-muted-foreground mb-2" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">
              Payback
            </span>
            <span className="font-mono text-xl font-semibold block mt-1">
              {result.paybackWeeks} wks
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="border border-border p-4 mb-8">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-4">
            Cost vs. Benefit Analysis
          </span>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barSize={60}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fontFamily: "JetBrains Mono" }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tick={{ fontSize: 12, fontFamily: "JetBrains Mono" }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  "",
                ]}
                contentStyle={{
                  fontFamily: "JetBrains Mono",
                  fontSize: 12,
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 2,
                }}
              />
              <Bar dataKey="value">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scenario Results (ported from JonaAI-Intel) */}
        <div className="border border-border p-5 mb-8">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-4">
            Scenario Projected Outcomes
          </span>
          <div className="grid grid-cols-3 gap-4 text-center mb-5">
            <div>
              <div className="font-mono text-[10px] uppercase text-muted-foreground mb-1">
                Recovery
              </div>
              <div
                className={`font-mono text-xl font-medium ${scenarioResult.recovery > 0 ? "text-status-good" : "text-muted-foreground"}`}
              >
                ${scenarioResult.recovery.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-muted-foreground mb-1">
                ROI
              </div>
              <div
                className={`font-mono text-xl font-medium ${scenarioResult.roi > 0 ? "text-status-good" : scenarioResult.roi < 0 ? "text-status-critical" : "text-muted-foreground"}`}
              >
                {scenarioResult.roi >= 0 ? "+" : ""}
                {scenarioResult.roi}%
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-muted-foreground mb-1">
                Break-even
              </div>
              <div className="font-mono text-xl font-medium">
                {investment === 0
                  ? "0 days"
                  : scenarioResult.breakevenDays > 0 &&
                      scenarioResult.breakevenDays < 999
                    ? `${scenarioResult.breakevenDays} days`
                    : "-- days"}
              </div>
            </div>
          </div>

          {/* Health Projection Bars */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase text-muted-foreground w-20">
                Current
              </span>
              <div className="flex-1 h-6 bg-muted relative">
                <div
                  className={`h-full transition-all duration-500 ${currentHealth >= 70 ? "bg-status-good" : currentHealth >= 50 ? "bg-status-warn" : "bg-status-critical"}`}
                  style={{ width: `${currentHealth}%` }}
                />
              </div>
              <span className="font-mono text-sm w-8 text-right">
                {currentHealth}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase text-muted-foreground w-20">
                Projected
              </span>
              <div className="flex-1 h-6 bg-muted relative">
                <div
                  className={`h-full transition-all duration-500 ${scenarioResult.projectedHealth >= 70 ? "bg-status-good" : scenarioResult.projectedHealth >= 50 ? "bg-status-warn" : "bg-status-critical"}`}
                  style={{ width: `${scenarioResult.projectedHealth}%` }}
                />
              </div>
              <span className="font-mono text-sm w-8 text-right">
                {scenarioResult.projectedHealth}
              </span>
            </div>
          </div>

          {/* Scenario Comparison Table */}
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-2">
              All Scenarios Comparison
            </span>
            <div className="space-y-1 font-mono text-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase">
                <span className="w-3" />
                <span className="w-16">Scenario</span>
                <span className="w-20 text-right">Recovery</span>
                <span className="w-16 text-right">ROI</span>
                <span className="w-16 text-right">Break-even</span>
              </div>
              {allScenarios.map((s) => (
                <div
                  key={s.key}
                  className={`flex items-center gap-2 ${s.key === scenario ? "font-medium" : "text-muted-foreground"}`}
                >
                  <span className="w-3 text-center">
                    {s.key === scenario ? ">" : ""}
                  </span>
                  <span className={`w-16 ${scenarioConfigs[s.key].color}`}>
                    {s.label}
                  </span>
                  <span className="w-20 text-right">
                    ${s.recovery.toLocaleString()}
                  </span>
                  <span
                    className={`w-16 text-right ${s.roi > 0 ? "text-status-good" : s.roi < 0 ? "text-status-critical" : ""}`}
                  >
                    {s.roi >= 0 ? "+" : ""}
                    {s.roi}%
                  </span>
                  <span className="w-16 text-right">
                    {s.breakevenDays > 0 && s.breakevenDays < 999
                      ? `${s.breakevenDays}d`
                      : "--"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benchmarks Table */}
        <div className="border border-border">
          <div className="px-4 py-3 border-b border-border">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Industry Benchmarks
            </span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-mono text-xs uppercase tracking-wider text-muted-foreground px-4 py-2">
                  Segment
                </th>
                <th className="text-right font-mono text-xs uppercase tracking-wider text-muted-foreground px-4 py-2">
                  Avg ROI
                </th>
                <th className="text-right font-mono text-xs uppercase tracking-wider text-muted-foreground px-4 py-2">
                  Avg Cost/HA
                </th>
                <th className="text-right font-mono text-xs uppercase tracking-wider text-muted-foreground px-4 py-2">
                  Success Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((b) => (
                <tr
                  key={b.label}
                  className="border-b border-border last:border-b-0 hover:bg-accent/50"
                >
                  <td className="px-4 py-2.5 text-sm">{b.label}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm text-status-good">
                    {b.avgROI}%
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm">
                    ${b.avgCostPerHA}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm">
                    {b.successRate}%
                  </td>
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
