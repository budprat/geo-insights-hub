import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "@/lib/mock-data";
import { HealthBadge } from "@/components/HealthBadge";
import { StatusLabel } from "@/components/StatusLabel";
import { Sparkline } from "@/components/Sparkline";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  RefreshCw,
  X,
} from "lucide-react";
import { AlertSubscriptions } from "@/components/AlertSubscriptions";

type ViewState = "loading" | "data" | "error" | "empty";

const regions = [
  "All Regions",
  "Northern Valley",
  "Central Plain",
  "Southern Basin",
  "Eastern Ridge",
];
const crops = ["All Crops", "Corn", "Wheat", "Soybean", "Rice", "Barley"];

const PortfolioCommand: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedCrop, setSelectedCrop] = useState("All Crops");
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  // Simulate initial data load
  useEffect(() => {
    const timer = setTimeout(() => setViewState("data"), 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = assets
    .filter(
      (a) => selectedRegion === "All Regions" || a.region === selectedRegion,
    )
    .filter((a) => selectedCrop === "All Crops" || a.crop === selectedCrop)
    .sort((a, b) => a.healthScore - b.healthScore);

  const avgHealth = Math.round(
    filtered.reduce((s, a) => s + a.healthScore, 0) / (filtered.length || 1),
  );
  const criticalAssets = filtered.filter(
    (a) => a.status === "critical" || a.status === "at-risk",
  );
  const criticalCount = criticalAssets.length;
  const estimatedExposure = criticalAssets.reduce(
    (sum, a) => sum + (100 - a.healthScore) * 600,
    0,
  );

  return (
    <div className="flex h-full">
      {/* Sidebar Filters */}
      <aside className="w-60 border-r border-border bg-card flex-shrink-0 p-4">
        <div className="flex items-center gap-2 mb-6">
          <Filter
            className="w-4 h-4 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Filters
          </span>
        </div>

        <div className="mb-6">
          <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
            Region
          </label>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`block w-full text-left px-3 py-1.5 text-sm rounded-sm transition-colors ${
                selectedRegion === r
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
            Crop Type
          </label>
          {crops.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCrop(c)}
              className={`block w-full text-left px-3 py-1.5 text-sm rounded-sm transition-colors ${
                selectedCrop === c
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto screen-enter">
        {/* Critical Alert Banner */}
        {criticalCount > 0 && !bannerDismissed && (
          <div className="bg-status-critical text-primary-foreground px-6 py-2.5 flex items-center justify-between text-sm font-medium">
            <div className="flex items-center gap-3">
              <AlertTriangle
                className="w-4 h-4 flex-shrink-0"
                aria-hidden="true"
              />
              <span>
                CRITICAL: {criticalCount} asset{criticalCount > 1 ? "s" : ""} at
                risk across Northern sectors. Estimated exposure:{" "}
                <span className="font-mono">
                  ${estimatedExposure.toLocaleString()}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAlertsOpen(true)}
                className="font-mono text-[10px] uppercase tracking-wider px-3 py-1 border border-white/40 text-white hover:bg-white/10 transition-colors"
              >
                Set Up Monitoring
              </button>
              <button
                onClick={() => setBannerDismissed(true)}
                className="text-white/70 hover:text-white ml-2"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Portfolio Summary */}
        <div className="border-b border-border px-6 py-5">
          <div className="flex items-baseline gap-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Portfolio Health
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-mono text-4xl font-semibold">
                  {avgHealth}
                </span>
                <span className="font-mono text-lg text-muted-foreground">
                  /100
                </span>
                <span className="flex items-center gap-1 font-mono text-sm text-status-critical">
                  <ArrowDownRight className="w-3 h-3" aria-hidden="true" />
                  2.4% YoY
                </span>
              </div>
            </div>
            <div className="border-l border-border pl-6">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Assets
              </span>
              <div className="font-mono text-2xl font-semibold mt-1">
                {filtered.length}
              </div>
            </div>
            <div className="border-l border-border pl-6">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Total Area
              </span>
              <div className="font-mono text-2xl font-semibold mt-1">
                {filtered.reduce((s, a) => s + a.sizeHA, 0).toLocaleString()} HA
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {viewState === "loading" && (
          <div className="px-6 py-4">
            <div className="border border-border">
              <div className="border-b border-border bg-card py-2.5 px-4">
                <div className="h-3 w-full bg-muted animate-pulse rounded-sm" />
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="py-3.5 px-4 flex items-center gap-6 border-b border-border last:border-0"
                >
                  <div className="h-4 w-40 bg-muted animate-pulse rounded-sm" />
                  <div className="h-4 w-16 bg-muted animate-pulse rounded-sm ml-auto" />
                  <div className="h-5 w-10 bg-muted animate-pulse rounded-sm" />
                  <div className="h-4 w-16 bg-muted animate-pulse rounded-sm" />
                  <div className="h-4 w-28 bg-muted animate-pulse rounded-sm" />
                  <div className="h-4 w-6 bg-muted animate-pulse rounded-sm" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {viewState === "error" && (
          <div className="px-6 py-4">
            <div className="border border-border p-6 bg-card">
              <div className="flex items-center gap-3">
                <AlertTriangle
                  className="w-5 h-5 text-status-critical flex-shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <div className="text-sm font-medium">
                    Telemetry sync failed.
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    Last updated: 4 hours ago.{" "}
                    <button
                      onClick={() => {
                        setViewState("loading");
                        setTimeout(() => setViewState("data"), 800);
                      }}
                      className="text-primary underline ml-1 font-medium"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {viewState === "empty" && (
          <div className="px-6 py-4">
            <div className="border border-border p-12 text-center">
              <div className="text-sm text-muted-foreground mb-3">
                No assets connected.
              </div>
              <div className="text-sm text-muted-foreground">
                Click{" "}
                <button className="text-primary font-medium underline">
                  Import GeoJSON
                </button>{" "}
                to begin.
              </div>
            </div>
          </div>
        )}

        {/* Asset Table */}
        {viewState === "data" && (
          <div className="px-6 py-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-mono text-xs uppercase tracking-wider text-muted-foreground pb-3 pr-4">
                    Asset Name
                  </th>
                  <th className="text-left font-mono text-xs uppercase tracking-wider text-muted-foreground pb-3 pr-4">
                    Region
                  </th>
                  <th className="text-right font-mono text-xs uppercase tracking-wider text-muted-foreground pb-3 pr-4">
                    Size (HA)
                  </th>
                  <th className="text-center font-mono text-xs uppercase tracking-wider text-muted-foreground pb-3 pr-4">
                    Health
                  </th>
                  <th className="text-left font-mono text-xs uppercase tracking-wider text-muted-foreground pb-3 pr-4">
                    Status
                  </th>
                  <th className="text-center font-mono text-xs uppercase tracking-wider text-muted-foreground pb-3 pr-4">
                    30D Trend
                  </th>
                  <th className="text-right font-mono text-xs uppercase tracking-wider text-muted-foreground pb-3 pr-4">
                    YoY
                  </th>
                  <th className="text-right font-mono text-xs uppercase tracking-wider text-muted-foreground pb-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => navigate(`/asset/${asset.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/asset/${asset.id}`);
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    className="border-b border-border cursor-pointer row-hover animate-fade-in-up"
                    style={{
                      animationDelay: `${0.05 * filtered.indexOf(asset)}s`,
                    }}
                  >
                    <td className="py-3 pr-4">
                      <span className="text-sm font-medium">{asset.name}</span>
                      <span className="block font-mono text-xs text-muted-foreground">
                        {asset.crop}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-sm text-muted-foreground">
                      {asset.region}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-sm">
                      {asset.sizeHA.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <HealthBadge score={asset.healthScore} />
                    </td>
                    <td className="py-3 pr-4">
                      <StatusLabel status={asset.status} />
                    </td>
                    <td className="py-3 pr-4 flex justify-center">
                      <Sparkline data={asset.trend} />
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span
                        className={`font-mono text-sm flex items-center justify-end gap-1 ${asset.yoyChange >= 0 ? "text-status-good" : "text-status-critical"}`}
                      >
                        {asset.yoyChange >= 0 ? (
                          <ArrowUpRight
                            className="w-3 h-3"
                            aria-hidden="true"
                          />
                        ) : (
                          <ArrowDownRight
                            className="w-3 h-3"
                            aria-hidden="true"
                          />
                        )}
                        {Math.abs(asset.yoyChange)}%
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-sm">
                      {asset.pendingActions > 0 ? (
                        <span className="inline-flex items-center justify-center h-6 w-6 bg-status-critical text-primary-foreground rounded-sm text-xs">
                          {asset.pendingActions}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table Footer */}
            <div className="mt-3 flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>
                Showing {filtered.length} of {assets.length} assets
              </span>
              <span>Sorted by health score (ascending)</span>
            </div>
          </div>
        )}
      </main>

      {/* Alert Subscriptions Modal (from banner CTA) */}
      <AlertSubscriptions
        open={alertsOpen}
        onOpenChange={setAlertsOpen}
        prefillCritical
      />
    </div>
  );
};

export default PortfolioCommand;
