import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  assets,
  getAssetFindings,
  getAssetActions,
  type RecommendedAction,
  type Finding,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { HealthBadge } from "@/components/HealthBadge";
import { Sparkline } from "@/components/Sparkline";
import { InterventionPlanner } from "@/components/InterventionPlanner";
import { ExportPanel } from "@/components/ExportPanel";
import { BriefingMap } from "@/components/BriefingMap";
import { ArrowLeft, CheckCircle2, MapPin, Zap, FileDown } from "lucide-react";

const AssetBriefing: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const [deployedActions, setDeployedActions] = useState<Set<string>>(
    new Set(),
  );
  const [plannerAction, setPlannerAction] = useState<RecommendedAction | null>(
    null,
  );
  const [exportOpen, setExportOpen] = useState(false);

  const demoAsset: (typeof assets)[0] = {
    id: "demo",
    name: "Cascadia Demonstration Farm",
    region: "Pacific Northwest",
    crop: "Wheat / Canola Rotation",
    sizeHA: 1850,
    healthScore: 64,
    status: "watch",
    pendingActions: 4,
    trend: [
      78, 77, 75, 74, 72, 71, 70, 69, 68, 67, 66, 66, 65, 65, 64, 64, 64, 63,
      63, 64, 64, 65, 64, 64, 64, 64, 63, 64, 64, 64,
    ],
    yoyChange: -5.3,
  };

  const demoFindings: Finding[] = [
    {
      id: "df1",
      text: "Canola block B2 exhibits 18% chlorophyll decline over 21 days — likely nitrogen deficiency confirmed by Sentinel-2 Red-Edge analysis.",
      severity: "critical",
      zone: "B2-north",
    },
    {
      id: "df2",
      text: "Soil moisture in wheat blocks W1-W3 trending 12% below 5-year seasonal average. Subsurface probe at W2 shows water table drop of 0.4 m.",
      severity: "critical",
      zone: "W1-W3",
    },
    {
      id: "df3",
      text: "Early-stage fusarium risk flagged in W4 based on humidity + temperature model. Confidence: 72%.",
      severity: "warning",
      zone: "W4",
    },
    {
      id: "df4",
      text: "Cover crop establishment in fallow block F1 progressing normally. Biomass accumulation on track (+8% vs. plan).",
      severity: "info",
      zone: "F1",
    },
    {
      id: "df5",
      text: "Drone survey on Oct 15 detected 3 irrigation pivot misalignment events in B1. Auto-correction applied.",
      severity: "warning",
      zone: "B1",
    },
  ];

  const demoActions: RecommendedAction[] = [
    {
      id: "da1",
      title:
        "Apply variable-rate nitrogen (46-0-0) to canola block B2 at 35 kg/HA",
      target: "Block B2, Northern Sector",
      estimatedCost: 4200,
      priority: "urgent",
      deployed: false,
    },
    {
      id: "da2",
      title: "Activate supplemental irrigation wells for wheat blocks W1-W3",
      target: "Wells 7, 9, 12 — Wheat Zone",
      estimatedCost: 1800,
      priority: "urgent",
      deployed: false,
    },
    {
      id: "da3",
      title: "Schedule preventive fungicide application (Prosaro) for W4",
      target: "Block W4, Full Coverage",
      estimatedCost: 3100,
      priority: "high",
      deployed: false,
    },
    {
      id: "da4",
      title: "Recalibrate pivot alignment sensors on Block B1 system",
      target: "Pivot #3, Block B1",
      estimatedCost: 650,
      priority: "medium",
      deployed: false,
    },
  ];

  const asset = assets.find((a) => a.id === assetId) || demoAsset;
  const isRealAsset = assetId && assets.find((a) => a.id === assetId);
  const assetFindings = isRealAsset ? getAssetFindings(assetId!) : demoFindings;
  const assetActions = isRealAsset ? getAssetActions(assetId!) : demoActions;

  const handleDeploy = (actionId: string) => {
    setDeployedActions((prev) => new Set(prev).add(actionId));
    setPlannerAction(null);
  };

  const scoreColor =
    asset.healthScore >= 70
      ? "text-status-good"
      : asset.healthScore >= 50
        ? "text-status-warn"
        : "text-status-critical";

  const statusLabel =
    asset.healthScore >= 70
      ? "Stable"
      : asset.healthScore >= 50
        ? "Declining"
        : "Critical";

  // Enhancement #2: 30-Day Trend and Confidence calculations
  const trendDelta =
    asset.trend.length >= 2
      ? ((asset.trend[asset.trend.length - 1] - asset.trend[0]) /
          asset.trend[0]) *
        100
      : 0;

  const confidence =
    asset.healthScore < 50
      ? "94% (High)"
      : asset.healthScore < 70
        ? "87% (Med)"
        : "92% (High)";

  // Enhancement #1: Asset ID generation
  const assetIdDisplay = `${asset.id.toUpperCase().slice(0, 2)}-${Math.abs(asset.id.charCodeAt(0) * 100 + asset.id.charCodeAt(1))}`;

  const statusBadgeLabel =
    asset.healthScore < 50
      ? "CRITICAL"
      : asset.healthScore < 70
        ? "DECLINING"
        : "STABLE";

  const statusBadgeClass =
    asset.healthScore < 50
      ? "bg-status-critical/10 text-status-critical"
      : asset.healthScore < 70
        ? "bg-status-warn/10 text-status-warn"
        : "bg-status-good/10 text-status-good";

  return (
    <div className="h-full flex flex-col screen-enter">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="hover:bg-accent p-1.5 rounded-sm transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          {/* Enhancement #1: Asset ID + Status Badge */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider">
              Asset ID: {assetIdDisplay}
            </span>
            <span
              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-sm ${statusBadgeClass}`}
            >
              STATUS: {statusBadgeLabel}
            </span>
          </div>
          <h1 className="text-2xl font-semibold">{asset.name}</h1>
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            {asset.region} · {asset.crop} · {asset.sizeHA.toLocaleString()} HA
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportOpen(true)}
          >
            <FileDown className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            Export
          </Button>
          {/* Enhancement #8: Share Briefing Button */}
          <Button
            variant="default"
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Share Briefing
          </Button>
        </div>
      </div>

      {/* Three Column Grid */}
      <div className="flex-1 grid grid-cols-10 overflow-hidden">
        {/* Left: Score & Findings (30%) */}
        <div className="col-span-3 border-r border-border overflow-auto p-6">
          {/* Health Score */}
          <div className="mb-8">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Health Score
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span
                className={`font-mono text-5xl font-semibold ${scoreColor}`}
              >
                {asset.healthScore}
              </span>
              <span className="font-mono text-xl text-muted-foreground">
                /100
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className={`font-mono text-sm ${scoreColor}`}>
                Status: {statusLabel}
              </span>
              <Sparkline data={asset.trend} width={80} height={24} />
            </div>

            {/* Enhancement #2: 30-Day Trend + Confidence */}
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                  30-Day Trend
                </span>
                <p
                  className={`font-mono text-sm font-bold mt-1 ${trendDelta < 0 ? "text-status-critical" : "text-status-good"}`}
                >
                  {trendDelta > 0 ? "+" : ""}
                  {trendDelta.toFixed(1)}%
                </p>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                  Confidence
                </span>
                <p className="font-mono text-sm font-bold mt-1">{confidence}</p>
              </div>
            </div>
          </div>

          {/* Yield Impact + Simulate ROI */}
          <div className="border border-border p-4 mb-8 bg-card hover-lift">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Est. Yield Impact
            </span>
            <div
              className={`font-mono text-2xl font-medium tracking-tight mt-1 ${asset.healthScore <= 70 ? "text-status-critical" : "text-muted-foreground"}`}
            >
              {asset.healthScore <= 70
                ? `-$${((100 - asset.healthScore) * 600).toLocaleString()}`
                : "$0"}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              At current trajectory, Q4 harvest
            </div>
            <button
              onClick={() => navigate("/roi")}
              className="mt-3 border border-border font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-1.5 hover:text-foreground hover:border-primary transition-colors w-full text-center"
            >
              Simulate ROI
            </button>
          </div>

          {/* Findings */}
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Executive Findings
            </span>
            <div className="mt-3 space-y-3">
              {assetFindings.map((finding, i) => {
                const borderColor =
                  finding.severity === "critical"
                    ? "border-status-critical"
                    : finding.severity === "warning"
                      ? "border-status-warn"
                      : "border-border";
                return (
                  // Enhancement #5: Finding Hover States
                  <div
                    key={finding.id}
                    className={`group border-l-2 ${borderColor} pl-4 py-1 hover:bg-accent/50 transition-colors cursor-pointer`}
                  >
                    <p className="text-sm leading-relaxed group-hover:text-foreground">
                      <span className="font-mono text-xs text-muted-foreground mr-2">
                        {i + 1}.
                      </span>
                      {finding.text}
                    </p>
                  </div>
                );
              })}
              {assetFindings.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No significant findings at this time.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Middle: Recommended Actions (30%) */}
        <div className="col-span-3 border-r border-border overflow-auto p-6">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Recommended Actions
          </span>
          <div className="mt-4 space-y-3">
            {assetActions.map((action) => {
              const isDeployed = deployedActions.has(action.id);

              // Enhancement #3: Accent bar color
              const accentBarColor =
                action.priority === "urgent"
                  ? "bg-status-critical"
                  : action.priority === "high"
                    ? "bg-status-warn"
                    : "bg-border";

              // Enhancement #4: ROI Priority badge
              const priorityBadgeLabel =
                action.priority === "urgent"
                  ? "IMMEDIATE ROI"
                  : action.priority === "high"
                    ? "HIGH PRIORITY"
                    : "SCHEDULED";

              const priorityBadgeClass =
                action.priority === "urgent"
                  ? "bg-status-critical/10 text-status-critical"
                  : action.priority === "high"
                    ? "bg-status-warn/10 text-status-warn"
                    : "bg-accent text-muted-foreground";

              return (
                <div
                  key={action.id}
                  className="border border-border relative overflow-hidden card-hover"
                >
                  {/* Enhancement #3: Colored Accent Bar */}
                  <div
                    className={`absolute top-0 left-0 w-1 h-full ${accentBarColor}`}
                  />
                  <div className="p-4 pl-5">
                    <div className="flex items-start gap-2 mb-2">
                      {action.priority === "urgent" && (
                        <Zap
                          className="w-4 h-4 text-status-critical flex-shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-snug">
                          {action.title}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground mt-1">
                          <MapPin
                            className="w-3 h-3 inline mr-1"
                            aria-hidden="true"
                          />
                          {action.target}
                        </p>
                      </div>
                    </div>
                    {/* Enhancement #4: ROI Priority Badge row */}
                    <div className="flex items-center justify-between mt-2 mb-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm ${priorityBadgeClass}`}
                      >
                        {priorityBadgeLabel}
                      </span>
                      <span className="font-mono text-sm font-medium">
                        Est. ${action.estimatedCost.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-end mt-2">
                      {isDeployed ? (
                        <Button
                          variant="success"
                          className="h-9 w-auto px-4"
                          disabled
                        >
                          <CheckCircle2
                            className="w-4 h-4 mr-1"
                            aria-hidden="true"
                          />
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
                </div>
              );
            })}
            {assetActions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No actions recommended at this time.
              </p>
            )}
          </div>

          {/* Recent Interventions */}
          <div className="mt-8 pt-6 border-t border-border">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Recent Interventions
            </span>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Soil sampling — Zone 1
                </span>
                <span className="font-mono text-xs text-status-good">
                  Completed
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Drone survey — Perimeter
                </span>
                <span className="font-mono text-xs text-status-good">
                  Completed
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Irrigation audit — Full
                </span>
                <span className="font-mono text-xs text-status-warn">
                  Scheduled
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Map Evidence (40%) */}
        <div className="col-span-4 bg-card overflow-hidden relative">
          <div className="absolute inset-0 flex flex-col">
            <div className="p-4 border-b border-border">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Supporting Evidence
              </span>
            </div>
            <div className="flex-1 relative">
              <BriefingMap
                center={[36.78, -119.42]}
                zoom={15}
                zones={[
                  {
                    name: "east",
                    coordinates: [
                      [36.783, -119.415],
                      [36.783, -119.41],
                      [36.776, -119.41],
                      [36.776, -119.415],
                    ],
                    color: "#DC2626",
                  },
                  {
                    name: "west",
                    coordinates: [
                      [36.782, -119.43],
                      [36.782, -119.426],
                      [36.776, -119.426],
                      [36.776, -119.43],
                    ],
                    color: "#059669",
                  },
                  {
                    name: "south",
                    coordinates: [
                      [36.778, -119.425],
                      [36.778, -119.42],
                      [36.776, -119.42],
                      [36.776, -119.425],
                    ],
                    color: "#D97706",
                  },
                ]}
              />

              {/* Enhancement #6a: LIVE TELEMETRY badge */}
              <div className="absolute top-4 left-4 bg-background/90 border border-border px-3 py-2 z-[1001] backdrop-blur-sm">
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-status-good animate-pulse" />
                  LIVE TELEMETRY
                </div>
                <div className="font-mono text-[9px] text-muted-foreground mt-0.5">
                  UPDATE: 12 MINS AGO
                </div>
              </div>

              {/* Enhancement #6b: NDVI gradient bar */}
              <div className="absolute bottom-4 left-4 bg-background/90 border border-border px-3 py-2 z-[1001] backdrop-blur-sm flex items-center gap-3">
                <span className="font-mono text-[10px] font-bold">
                  LAYER: NDVI
                </span>
                <div
                  className="w-20 h-2 rounded-sm"
                  style={{
                    background:
                      "linear-gradient(to right, hsl(var(--status-critical)), hsl(var(--status-warn)), hsl(var(--status-good)))",
                  }}
                />
              </div>

              {/* Legend */}
              <div className="absolute top-4 right-4 bg-background border border-border p-3 z-[1001]">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-2">
                  NDVI Index
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-status-good" />
                    <span className="font-mono text-[10px]">
                      Healthy (0.7+)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-status-warn" />
                    <span className="font-mono text-[10px]">
                      Moderate (0.4-0.7)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-status-critical" />
                    <span className="font-mono text-[10px]">
                      Stress (&lt;0.4)
                    </span>
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
      <ExportPanel
        open={exportOpen}
        onOpenChange={setExportOpen}
        assetId={asset.id}
      />
    </div>
  );
};

export default AssetBriefing;
