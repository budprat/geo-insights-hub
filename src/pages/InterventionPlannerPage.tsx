import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  assets,
  getAssetActions,
  contractors,
  type RecommendedAction,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { InterventionPlanner } from "@/components/InterventionPlanner";
import { ArrowLeft, Zap, MapPin, CheckCircle2 } from "lucide-react";

const InterventionPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState(assets[0].id);
  const [deployedActions, setDeployedActions] = useState<Set<string>>(
    new Set(),
  );
  const [plannerAction, setPlannerAction] = useState<RecommendedAction | null>(
    null,
  );

  const asset = assets.find((a) => a.id === selectedAsset) || assets[0];
  const actions = getAssetActions(selectedAsset);

  const handleDeploy = (actionId: string) => {
    setDeployedActions((prev) => new Set(prev).add(actionId));
    setPlannerAction(null);
  };

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
          <h1 className="text-2xl font-semibold">Intervention Planner</h1>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            Asset Management / Critical Intervention
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Asset Selector */}
          <div className="mb-6">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-2 font-medium">
              Select Asset
            </label>
            <select
              value={selectedAsset}
              onChange={(e) => {
                setSelectedAsset(e.target.value);
                setDeployedActions(new Set());
              }}
              className="w-full max-w-md h-10 border border-border px-3 text-sm bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.region} — Health: {a.healthScore}/100
                </option>
              ))}
            </select>
          </div>

          {/* Risk Summary */}
          <div className="flex items-center justify-between p-3 bg-status-critical/5 border border-status-critical/20 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-status-critical animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-status-critical">
                {asset.healthScore < 50
                  ? "Critical Fault Detected"
                  : asset.healthScore < 70
                    ? "Warning: Declining"
                    : "Stable — Monitoring"}
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold text-status-critical">
              Risk:{" "}
              {asset.healthScore < 50
                ? "88%"
                : asset.healthScore < 70
                  ? "54%"
                  : "12%"}
            </span>
          </div>

          {/* Actions Grid */}
          <div className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Recommended Actions for {asset.name}
            </span>

            {actions.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center border border-border">
                No interventions recommended for this asset.
              </p>
            )}

            {actions.map((action) => {
              const isDeployed = deployedActions.has(action.id);
              return (
                <div
                  key={action.id}
                  className="border border-border p-5 card-hover relative overflow-hidden"
                >
                  {/* Left accent bar */}
                  <div
                    className={`absolute top-0 left-0 w-1 h-full ${
                      action.priority === "urgent"
                        ? "bg-status-critical"
                        : action.priority === "high"
                          ? "bg-status-warn"
                          : "bg-border"
                    }`}
                  />

                  <div className="pl-4">
                    {/* Priority badge + cost */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm ${
                          action.priority === "urgent"
                            ? "bg-status-critical/10 text-status-critical"
                            : action.priority === "high"
                              ? "bg-status-warn/10 text-status-warn"
                              : "bg-accent text-muted-foreground"
                        }`}
                      >
                        {action.priority === "urgent"
                          ? "IMMEDIATE ROI"
                          : action.priority === "high"
                            ? "HIGH PRIORITY"
                            : "SCHEDULED"}
                      </span>
                      <span className="font-mono text-sm text-muted-foreground">
                        Est. ${action.estimatedCost.toLocaleString()}
                      </span>
                    </div>

                    {/* Title + target */}
                    <h3 className="text-sm font-medium mb-1">{action.title}</h3>
                    <p className="font-mono text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" aria-hidden="true" />
                      {action.target}
                    </p>

                    {/* Action button */}
                    <div className="flex items-center justify-end mt-3">
                      {isDeployed ? (
                        <Button variant="success" className="h-9 px-4" disabled>
                          <CheckCircle2
                            className="w-4 h-4 mr-1"
                            aria-hidden="true"
                          />
                          Deployed
                        </Button>
                      ) : (
                        <Button
                          variant={
                            action.priority === "urgent" ? "action" : "outline"
                          }
                          className="h-9 px-4"
                          onClick={() => setPlannerAction(action)}
                        >
                          {action.priority === "urgent"
                            ? "Approve & Deploy"
                            : "Schedule"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
    </div>
  );
};

export default InterventionPlannerPage;
