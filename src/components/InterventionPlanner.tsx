import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { contractors, type RecommendedAction } from "@/lib/mock-data";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface InterventionPlannerProps {
  action: RecommendedAction;
  assetName: string;
  onDeploy: (actionId: string) => void;
  onClose: () => void;
}

export const InterventionPlanner: React.FC<InterventionPlannerProps> = ({
  action,
  assetName,
  onDeploy,
  onClose,
}) => {
  const [contractor, setContractor] = useState("");
  const [budget, setBudget] = useState(action.estimatedCost.toFixed(2));
  const [date, setDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = contractor && budget && date && !deploying;

  const priorityColor =
    action.priority === "urgent"
      ? "text-status-critical"
      : action.priority === "high"
        ? "text-status-warn"
        : "text-muted-foreground";
  const priorityLabel =
    action.priority === "urgent"
      ? "Immediate"
      : action.priority === "high"
        ? "This Week"
        : "Scheduled";

  const handleDeploy = () => {
    const budgetNum = parseFloat(budget);
    if (budgetNum > 5000) {
      setError(
        "Exceeds remaining Q3 maintenance budget. Reduce to $5,000 or less.",
      );
      return;
    }
    setError("");
    setDeploying(true);
    setTimeout(() => {
      onDeploy(action.id);
      toast.success("Intervention deployed successfully. Contractor notified.");
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intervention-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background border border-border w-full max-w-[600px] z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border flex-shrink-0">
          <h2 id="intervention-title" className="text-xl font-semibold">
            Deploy Intervention
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl leading-none w-6 h-6 flex items-center justify-center"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div
          className="p-6 overflow-y-auto"
          style={{ overscrollBehavior: "contain" }}
        >
          {/* Risk Forecast */}
          <div className="flex items-center justify-between p-3 bg-status-critical/5 border border-status-critical/20 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-status-critical animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-status-critical">
                Critical Fault Detected
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold text-status-critical">
              Risk: 88%
            </span>
          </div>

          {/* Intervention Summary */}
          <div className="bg-card border border-border p-4 mb-6">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Intervention Summary
            </span>
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 mt-2 text-sm">
              <span className="font-medium">Action</span>
              <span>{action.title}</span>
              <span className="font-medium">Target</span>
              <span>
                {assetName} — {action.target}
              </span>
              <span className="font-medium">Priority</span>
              <span className={`font-mono text-sm ${priorityColor}`}>
                {priorityLabel}
              </span>
            </div>
          </div>

          {/* Financial Recovery Preview */}
          <div className="bg-primary text-primary-foreground p-4 mb-6">
            <span className="font-mono text-[9px] uppercase tracking-wider opacity-60 block mb-3">
              Financial Recovery
            </span>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="font-mono text-[9px] uppercase opacity-50">
                  Projected ROI
                </span>
                <div className="font-mono text-lg font-bold text-status-good mt-1">
                  +
                  {Math.round(
                    ((action.estimatedCost * 4.12 - action.estimatedCost) /
                      action.estimatedCost) *
                      100,
                  )}
                  %
                </div>
              </div>
              <div>
                <span className="font-mono text-[9px] uppercase opacity-50">
                  Avoided Loss
                </span>
                <div className="font-mono text-lg font-bold mt-1">
                  $
                  {(action.estimatedCost * 4.12).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </div>
              </div>
              <div>
                <span className="font-mono text-[9px] uppercase opacity-50">
                  Cost
                </span>
                <div className="font-mono text-lg font-bold text-status-critical mt-1">
                  ${action.estimatedCost.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Contractor */}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5 font-medium">
                Assign Contractor
              </label>
              <select
                value={contractor}
                onChange={(e) => setContractor(e.target.value)}
                className="w-full h-10 px-3 border border-border bg-background text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              >
                <option value="">Select contractor...</option>
                {contractors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget Cap */}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5 font-medium">
                Budget Cap
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={budget}
                  onChange={(e) => {
                    setBudget(e.target.value);
                    setError("");
                  }}
                  className="w-full h-10 pl-7 pr-3 border border-border bg-background font-mono text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              {error && (
                <p className="text-xs text-status-critical mt-1">{error}</p>
              )}
            </div>

            {/* Execute By */}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5 font-medium">
                Execute By
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full h-10 px-3 border border-border bg-background text-sm text-left rounded-sm flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-ring",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="w-4 h-4" aria-hidden="true" />
                    {date ? format(date, "PPP") : "Select deadline..."}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Notes */}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5 font-medium">
                Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional instructions..."
                className="w-full border border-border px-3 py-2 text-sm bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>

            {/* Logistic Readiness */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Logistic Readiness
                </label>
                <span className="font-mono text-[10px] text-status-good font-bold">
                  Optimized
                </span>
              </div>
              <div className="w-full bg-muted h-1.5">
                <div
                  className="bg-status-good h-1.5 transition-all duration-500"
                  style={{ width: "92%" }}
                />
              </div>
            </div>
          </div>

          {/* Executive Protocol Notice */}
          <div className="border border-dashed border-border p-3 mt-4 flex items-start gap-3">
            <svg
              className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <div>
              <p className="text-xs font-bold">Executive Protocol Required</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Deploying this intervention requires Level 4 authorization
                signature.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex-shrink-0">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-12 flex-1"
              onClick={() => {
                toast.info("Team notification sent.");
              }}
            >
              Notify Team
            </Button>
            <Button
              variant="action"
              className="h-12 flex-[2]"
              onClick={handleDeploy}
              disabled={!canSubmit}
            >
              {deploying ? (
                <>
                  <Loader2
                    className="w-4 h-4 animate-spin mr-2"
                    aria-hidden="true"
                  />
                  Deploying...
                </>
              ) : (
                "Deploy Intervention"
              )}
            </Button>
          </div>
          <button
            onClick={onClose}
            className="w-full mt-2 text-muted-foreground text-sm py-2 hover:text-foreground transition-colors"
          >
            Cancel
          </button>

          {/* Footer Status */}
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between font-mono text-[9px] text-muted-foreground">
            <div className="flex gap-4">
              <span className="uppercase tracking-wider">
                Est. completion: 14 days
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-status-good" />
                <span className="uppercase tracking-wider">
                  Satellite Sync: Live
                </span>
              </span>
            </div>
            <span className="uppercase tracking-wider">Asset: {assetName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
