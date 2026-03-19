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
      <div className="relative bg-background border border-border w-full max-w-[600px] z-10">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
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
        <div className="p-6" style={{ overscrollBehavior: "contain" }}>
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
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <Button
            variant="action"
            className="w-full h-12"
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
          <button
            onClick={onClose}
            className="w-full mt-2 text-muted-foreground text-sm py-2 hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
