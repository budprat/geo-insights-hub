import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { contractors, type RecommendedAction } from "@/lib/mock-data";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  const [budget, setBudget] = useState(action.estimatedCost.toString());
  const [date, setDate] = useState<Date>();
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = contractor && budget && date && !deploying;

  const handleDeploy = () => {
    const budgetNum = parseFloat(budget);
    if (budgetNum > 10000) {
      setError("Exceeds remaining Q3 maintenance budget.");
      return;
    }
    setError("");
    setDeploying(true);
    setTimeout(() => {
      onDeploy(action.id);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background border border-border w-full max-w-[600px] p-6 z-10">
        <button onClick={onClose} className="absolute top-4 right-4 hover:bg-accent p-1.5 rounded-sm transition-colors">
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-semibold mb-1">Intervention Planner</h2>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-6">Deploy Resource Allocation</p>

        {/* Summary */}
        <div className="border border-border p-4 mb-6 bg-card">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Action</span>
              <p className="text-sm mt-1">{action.title}</p>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Target</span>
              <p className="text-sm mt-1">{assetName}, {action.target}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Contractor */}
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2">
              Assign Contractor
            </label>
            <select
              value={contractor}
              onChange={(e) => setContractor(e.target.value)}
              className="w-full h-10 px-3 border border-border bg-background text-sm font-sans rounded-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select contractor...</option>
              {contractors.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2">
              Budget Cap (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">$</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => { setBudget(e.target.value); setError(""); }}
                className="w-full h-10 pl-7 pr-3 border border-border bg-background font-mono text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            {error && <p className="text-sm text-status-critical mt-1">{error}</p>}
          </div>

          {/* Date Picker */}
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2">
              Execution Deadline
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "w-full h-10 px-3 border border-border bg-background text-sm text-left rounded-sm flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-ring",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="w-4 h-4" />
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
        </div>

        {/* Submit */}
        <div className="mt-6">
          <Button
            variant="action"
            onClick={handleDeploy}
            disabled={!canSubmit}
          >
            {deploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Deploying...
              </>
            ) : (
              "Deploy Intervention"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
