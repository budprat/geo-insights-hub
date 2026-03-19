import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assets, findings, recommendedActions, type RecommendedAction, type Finding } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { HealthBadge } from "@/components/HealthBadge";
import { Sparkline } from "@/components/Sparkline";
import { InterventionPlanner } from "@/components/InterventionPlanner";
import { ExportPanel } from "@/components/ExportPanel";
import { ArrowLeft, CheckCircle2, MapPin, Zap, FileDown } from "lucide-react";

const AssetBriefing: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const [deployedActions, setDeployedActions] = useState<Set<string>>(new Set());
  const [plannerAction, setPlannerAction] = useState<RecommendedAction | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const demoAsset: typeof assets[0] = {
    id: "demo",
    name: "Cascadia Demonstration Farm",
    region: "Pacific Northwest",
    crop: "Wheat / Canola Rotation",
    sizeHA: 1850,
    healthScore: 64,
    status: "watch",
    pendingActions: 4,
    trend: [78, 77, 75, 74, 72, 71, 70, 69, 68, 67, 66, 66, 65, 65, 64, 64, 64, 63, 63, 64, 64, 65, 64, 64, 64, 64, 63, 64, 64, 64],
    yoyChange: -5.3,
  };

  const demoFindings: typeof assetFindings = [
    { id: "df1", text: "Canola block B2 exhibits 18% chlorophyll decline over 21 days — likely nitrogen deficiency confirmed by Sentinel-2 Red-Edge analysis.", severity: "critical", zone: "B2-north" },
    { id: "df2", text: "Soil moisture in wheat blocks W1-W3 trending 12% below 5-year seasonal average. Subsurface probe at W2 shows water table drop of 0.4 m.", severity: "critical", zone: "W1-W3" },
    { id: "df3", text: "Early-stage fusarium risk flagged in W4 based on humidity + temperature model. Confidence: 72%.", severity: "warning", zone: "W4" },
    { id: "df4", text: "Cover crop establishment in fallow block F1 progressing normally. Biomass accumulation on track (+8% vs. plan).", severity: "info", zone: "F1" },
    { id: "df5", text: "Drone survey on Oct 15 detected 3 irrigation pivot misalignment events in B1. Auto-correction applied.", severity: "warning", zone: "B1" },
  ];

  const demoActions: RecommendedAction[] = [
    { id: "da1", title: "Apply variable-rate nitrogen (46-0-0) to canola block B2 at 35 kg/HA", target: "Block B2, Northern Sector", estimatedCost: 4200, priority: "urgent", deployed: false },
    { id: "da2", title: "Activate supplemental irrigation wells for wheat blocks W1-W3", target: "Wells 7, 9, 12 — Wheat Zone", estimatedCost: 1800, priority: "urgent", deployed: false },
    { id: "da3", title: "Schedule preventive fungicide application (Prosaro) for W4", target: "Block W4, Full Coverage", estimatedCost: 3100, priority: "high", deployed: false },
    { id: "da4", title: "Recalibrate pivot alignment sensors on Block B1 system", target: "Pivot #3, Block B1", estimatedCost: 650, priority: "medium", deployed: false },
  ];

  const asset = assets.find((a) => a.id === assetId) || demoAsset;
  const assetFindings = findings[assetId || ""] || (assetId && assets.find(a => a.id === assetId) ? [] : demoFindings);
  const assetActions = recommendedActions[assetId || ""] || (assetId && assets.find(a => a.id === assetId) ? [] : demoActions);

  const handleDeploy = (actionId: string) => {
    setDeployedActions((prev) => new Set(prev).add(actionId));
    setPlannerAction(null);
  };

  const scoreColor =
    asset.healthScore >= 70 ? "text-status-good" : asset.healthScore >= 50 ? "text-status-warn" : "text-status-critical";

  const statusLabel =
    asset.healthScore >= 70 ? "Stable" : asset.healthScore >= 50 ? "Declining" : "Critical";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate("/")} className="hover:bg-accent p-1.5 rounded-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-semibold">{asset.name}</h1>
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            {asset.region} · {asset.crop} · {asset.sizeHA.toLocaleString()} HA
          </span>
        </div>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => setExportOpen(true)}>
          <FileDown className="w-3.5 h-3.5 mr-1.5" />
          Export
        </Button>
      </div>

      {/* Three Column Grid */}
      <div className="flex-1 grid grid-cols-10 overflow-hidden">
        {/* Left: Score & Findings (30%) */}
        <div className="col-span-3 border-r border-border overflow-auto p-6">
          {/* Health Score */}
          <div className="mb-8">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Health Score</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`font-mono text-5xl font-semibold ${scoreColor}`}>{asset.healthScore}</span>
              <span className="font-mono text-xl text-muted-foreground">/100</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className={`font-mono text-sm ${scoreColor}`}>Status: {statusLabel}</span>
              <Sparkline data={asset.trend} width={80} height={24} />
            </div>
          </div>

          {/* Findings */}
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Executive Findings</span>
            <div className="mt-3 space-y-3">
              {assetFindings.map((finding, i) => {
                const borderColor =
                  finding.severity === "critical" ? "border-status-critical" : finding.severity === "warning" ? "border-status-warn" : "border-border";
                return (
                  <div key={finding.id} className={`border-l-2 ${borderColor} pl-4 py-1`}>
                    <p className="text-sm leading-relaxed">
                      <span className="font-mono text-xs text-muted-foreground mr-2">{i + 1}.</span>
                      {finding.text}
                    </p>
                  </div>
                );
              })}
              {assetFindings.length === 0 && (
                <p className="text-sm text-muted-foreground">No significant findings at this time.</p>
              )}
            </div>
          </div>
        </div>

        {/* Middle: Recommended Actions (30%) */}
        <div className="col-span-3 border-r border-border overflow-auto p-6">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Recommended Actions</span>
          <div className="mt-4 space-y-3">
            {assetActions.map((action) => {
              const isDeployed = deployedActions.has(action.id);
              return (
                <div key={action.id} className="border border-border p-4">
                  <div className="flex items-start gap-2 mb-2">
                    {action.priority === "urgent" && <Zap className="w-4 h-4 text-status-critical flex-shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-snug">{action.title}</p>
                      <p className="font-mono text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {action.target}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-mono text-sm font-medium">
                      Est. ${action.estimatedCost.toLocaleString()}
                    </span>
                    {isDeployed ? (
                      <Button variant="success" className="h-9 w-auto px-4" disabled>
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Deployed
                      </Button>
                    ) : (
                      <Button
                        variant="action"
                        className="h-9 w-auto px-4"
                        onClick={() => setPlannerAction(action)}
                      >
                        Approve Intervention
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {assetActions.length === 0 && (
              <p className="text-sm text-muted-foreground">No actions recommended at this time.</p>
            )}
          </div>
        </div>

        {/* Right: Map Evidence (40%) */}
        <div className="col-span-4 bg-card overflow-hidden relative">
          <div className="absolute inset-0 flex flex-col">
            <div className="p-4 border-b border-border">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Supporting Evidence</span>
            </div>
            <div className="flex-1 relative bg-muted/30">
              {/* Simulated NDVI map */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full relative overflow-hidden">
                  {/* Grid overlay to simulate map tiles */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: `
                      linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                      linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                    `,
                    backgroundSize: "60px 60px",
                  }} />
                  {/* Simulated field zones */}
                  <div className="absolute top-[15%] left-[10%] w-[35%] h-[40%] bg-status-good/20 border border-status-good/40" />
                  <div className="absolute top-[10%] right-[10%] w-[35%] h-[45%] bg-status-critical/20 border border-status-critical/40">
                    <span className="absolute top-2 left-2 font-mono text-[10px] uppercase text-status-critical">Stress Zone</span>
                  </div>
                  <div className="absolute bottom-[15%] left-[20%] w-[50%] h-[25%] bg-status-warn/15 border border-status-warn/30" />
                  {/* Coordinates */}
                  <div className="absolute bottom-3 right-3 bg-background/90 border border-border px-2 py-1">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      34.052°N, 118.243°W · NDVI Layer
                    </span>
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="absolute top-4 right-4 bg-background border border-border p-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-2">NDVI Index</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-status-good" />
                    <span className="font-mono text-[10px]">Healthy (0.7+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-status-warn" />
                    <span className="font-mono text-[10px]">Moderate (0.4-0.7)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-status-critical" />
                    <span className="font-mono text-[10px]">Stress (&lt;0.4)</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/evidence/${asset.id}`)}
              className="border-t border-border px-4 py-3 text-sm font-medium hover:bg-accent transition-colors text-left"
            >
              Open Evidence Explorer →
            </button>
          </div>
        </div>
      </div>

      {/* Intervention Planner Modal */}
      {plannerAction && (
        <InterventionPlanner
          action={plannerAction}
          assetName={asset.name}
          onDeploy={handleDeploy}
          onClose={() => setPlannerAction(null)}
        />
      )}

      {/* Export Panel */}
      <ExportPanel open={exportOpen} onOpenChange={setExportOpen} assetId={asset.id} />
    </div>
  );
};

export default AssetBriefing;
