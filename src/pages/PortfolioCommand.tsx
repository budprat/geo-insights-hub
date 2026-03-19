import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "@/lib/mock-data";
import { HealthBadge } from "@/components/HealthBadge";
import { StatusLabel } from "@/components/StatusLabel";
import { Sparkline } from "@/components/Sparkline";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Filter } from "lucide-react";

const regions = ["All Regions", "Northern Valley", "Central Plain", "Southern Basin", "Eastern Ridge"];
const crops = ["All Crops", "Corn", "Wheat", "Soybean", "Rice", "Barley"];

const PortfolioCommand: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedCrop, setSelectedCrop] = useState("All Crops");

  const filtered = assets
    .filter((a) => selectedRegion === "All Regions" || a.region === selectedRegion)
    .filter((a) => selectedCrop === "All Crops" || a.crop === selectedCrop)
    .sort((a, b) => a.healthScore - b.healthScore);

  const avgHealth = Math.round(filtered.reduce((s, a) => s + a.healthScore, 0) / (filtered.length || 1));
  const criticalCount = filtered.filter((a) => a.status === "critical" || a.status === "at-risk").length;

  return (
    <div className="flex h-full">
      {/* Sidebar Filters */}
      <aside className="w-60 border-r border-border bg-card flex-shrink-0 p-4">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Filters</span>
        </div>

        <div className="mb-6">
          <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Region</label>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`block w-full text-left px-3 py-1.5 text-sm rounded-sm transition-colors ${
                selectedRegion === r ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Crop Type</label>
          {crops.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCrop(c)}
              className={`block w-full text-left px-3 py-1.5 text-sm rounded-sm transition-colors ${
                selectedCrop === c ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Critical Alert Banner */}
        {criticalCount > 0 && (
          <div className="bg-status-critical text-primary-foreground px-4 py-2.5 flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            CRITICAL: {criticalCount} asset{criticalCount > 1 ? "s" : ""} require immediate attention.
          </div>
        )}

        {/* Portfolio Summary */}
        <div className="border-b border-border px-6 py-5">
          <div className="flex items-baseline gap-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Portfolio Health</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-mono text-4xl font-semibold">{avgHealth}</span>
                <span className="font-mono text-lg text-muted-foreground">/100</span>
                <span className="flex items-center gap-1 font-mono text-sm text-status-critical">
                  <ArrowDownRight className="w-3 h-3" />
                  2.4% YoY
                </span>
              </div>
            </div>
            <div className="border-l border-border pl-6">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Assets</span>
              <div className="font-mono text-2xl font-semibold mt-1">{filtered.length}</div>
            </div>
            <div className="border-l border-border pl-6">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Total Area</span>
              <div className="font-mono text-2xl font-semibold mt-1">
                {filtered.reduce((s, a) => s + a.sizeHA, 0).toLocaleString()} HA
              </div>
            </div>
          </div>
        </div>

        {/* Asset Table */}
        <div className="px-6 py-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-mono text-xs uppercase tracking-wider text-muted-foreground pb-3 pr-4">Asset Name</th>
                <th className="text-left font-mono text-xs uppercase tracking-wider text-muted-foreground pb-3 pr-4">Region</th>
                <th className="text-right font-mono text-xs uppercase tracking-wider text-muted-foreground pb-3 pr-4">Size (HA)</th>
                <th className="text-center font-mono text-xs uppercase tracking-wider text-muted-foreground pb-3 pr-4">Health</th>
                <th className="text-left font-mono text-xs uppercase tracking-wider text-muted-foreground pb-3 pr-4">Status</th>
                <th className="text-center font-mono text-xs uppercase tracking-wider text-muted-foreground pb-3 pr-4">30D Trend</th>
                <th className="text-right font-mono text-xs uppercase tracking-wider text-muted-foreground pb-3 pr-4">YoY</th>
                <th className="text-right font-mono text-xs uppercase tracking-wider text-muted-foreground pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => (
                <tr
                  key={asset.id}
                  onClick={() => navigate(`/asset/${asset.id}`)}
                  className="border-b border-border cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <td className="py-3 pr-4">
                    <span className="text-sm font-medium">{asset.name}</span>
                    <span className="block font-mono text-xs text-muted-foreground">{asset.crop}</span>
                  </td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground">{asset.region}</td>
                  <td className="py-3 pr-4 text-right font-mono text-sm">{asset.sizeHA.toLocaleString()}</td>
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
                    <span className={`font-mono text-sm flex items-center justify-end gap-1 ${asset.yoyChange >= 0 ? "text-status-good" : "text-status-critical"}`}>
                      {asset.yoyChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
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
        </div>
      </main>
    </div>
  );
};

export default PortfolioCommand;
