import React, { useState, useMemo } from "react";
import { scenarioVariables, simulateScenario } from "@/lib/scenario-models";
import { assets } from "@/lib/mock-data";
import { Slider } from "@/components/ui/slider";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FlaskConical, TrendingDown, TrendingUp } from "lucide-react";

interface ScenarioState {
  label: string;
  variables: Record<string, number>;
}

const ROICalculator: React.FC = () => {
  const baselineHealth = assets[0].healthScore; // Use first asset as reference
  const [scenarios, setScenarios] = useState<ScenarioState[]>([
    { label: "Baseline", variables: Object.fromEntries(scenarioVariables.map((v) => [v.id, v.baseline])) },
    { label: "Scenario A", variables: Object.fromEntries(scenarioVariables.map((v) => [v.id, v.baseline])) },
    { label: "Scenario B", variables: Object.fromEntries(scenarioVariables.map((v) => [v.id, v.baseline])) },
  ]);
  const [activeTab, setActiveTab] = useState(0);

  const results = useMemo(
    () => scenarios.map((s) => simulateScenario(baselineHealth, s.variables)),
    [scenarios, baselineHealth]
  );

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    week: `W${i + 1}`,
    Baseline: results[0].healthProjection[i],
    "Scenario A": results[1].healthProjection[i],
    "Scenario B": results[2].healthProjection[i],
  }));

  const updateVariable = (varId: string, value: number) => {
    setScenarios((prev) => {
      const next = [...prev];
      next[activeTab] = {
        ...next[activeTab],
        variables: { ...next[activeTab].variables, [varId]: value },
      };
      return next;
    });
  };

  const riskColors: Record<string, string> = {
    low: "text-status-good",
    moderate: "text-status-warn",
    high: "text-status-critical",
    critical: "text-status-critical",
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Scenario Tabs */}
      <div className="border-b border-border px-6 flex items-center gap-1 flex-shrink-0">
        {scenarios.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === i
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 inline mr-1.5" />
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Variable Controls */}
        <div className="w-72 border-r border-border bg-card flex-shrink-0 overflow-auto p-6">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-4">
            {scenarios[activeTab].label} — Variables
          </span>

          {scenarioVariables.map((v) => (
            <div key={v.id} className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{v.label}</label>
                <span className="font-mono text-sm font-medium">
                  {scenarios[activeTab].variables[v.id]}{v.unit}
                </span>
              </div>
              <Slider
                value={[scenarios[activeTab].variables[v.id]]}
                onValueChange={(val) => updateVariable(v.id, val[0])}
                min={v.min}
                max={v.max}
                step={v.step}
              />
              <div className="flex justify-between mt-1">
                <span className="font-mono text-[10px] text-muted-foreground">{v.min}{v.unit}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{v.max}{v.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Results */}
        <div className="flex-1 overflow-auto p-6">
          {/* Comparison Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {results.map((r, i) => (
              <div key={i} className={`border p-4 ${activeTab === i ? "border-primary" : "border-border"}`}>
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2">
                  {scenarios[i].label}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-semibold">
                    {Math.round(r.healthProjection[11])}
                  </span>
                  <span className="font-mono text-lg text-muted-foreground">/100</span>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Yield Delta</span>
                    <span className={`font-mono text-sm font-medium ${r.yieldDelta >= 0 ? "text-status-good" : "text-status-critical"}`}>
                      {r.yieldDelta >= 0 ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
                      ${Math.abs(r.yieldDelta).toLocaleString()}/HA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Financial Impact</span>
                    <span className={`font-mono text-sm font-medium ${r.financialImpact >= 0 ? "text-status-good" : "text-status-critical"}`}>
                      ${Math.abs(r.financialImpact).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Risk Level</span>
                    <span className={`font-mono text-xs uppercase font-medium ${riskColors[r.riskLevel]}`}>
                      {r.riskLevel}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trajectory Chart */}
          <div className="border border-border p-4">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-4">
              12-Week Health Score Projection
            </span>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontFamily: "JetBrains Mono", fontSize: 12, border: "1px solid hsl(var(--border))", borderRadius: 2 }} />
                <Area type="monotone" dataKey="Baseline" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={2} />
                <Area type="monotone" dataKey="Scenario A" stroke="hsl(var(--status-warn))" fill="hsl(var(--status-warn) / 0.1)" strokeWidth={2} />
                <Area type="monotone" dataKey="Scenario B" stroke="hsl(var(--status-critical))" fill="hsl(var(--status-critical) / 0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-3 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-primary" />
                <span className="font-mono text-[10px] text-muted-foreground">Baseline</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-status-warn" />
                <span className="font-mono text-[10px] text-muted-foreground">Scenario A</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-status-critical" />
                <span className="font-mono text-[10px] text-muted-foreground">Scenario B</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;
