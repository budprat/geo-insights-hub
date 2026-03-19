import React, { useState, useEffect } from "react";
import { satellites, passWindows } from "@/lib/mock-satellites";
import { assets } from "@/lib/mock-data";
import { Satellite, Clock, CloudRain, ChevronRight } from "lucide-react";

const SatelliteTracker: React.FC = () => {
  const [selectedSat, setSelectedSat] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  const selectedPasses = selectedSat
    ? passWindows.filter((pw) => pw.satelliteId === selectedSat)
    : passWindows;

  return (
    <div className="h-full flex overflow-hidden">
      {/* Orbital View */}
      <div className="flex-1 relative bg-muted/10 overflow-hidden">
        {/* Grid lines simulating orbital projection */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border) / 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px",
        }} />

        {/* Simulated orbital tracks */}
        {satellites.map((sat, i) => {
          const yBase = 15 + i * 13;
          const xPos = ((tick * (3 + i * 0.7)) % 100);
          return (
            <React.Fragment key={sat.id}>
              {/* Track line */}
              <div
                className="absolute h-px opacity-20"
                style={{
                  top: `${yBase}%`,
                  left: "0",
                  right: "0",
                  background: `linear-gradient(to right, transparent, ${sat.color}, transparent)`,
                }}
              />
              {/* Satellite marker */}
              <div
                className={`absolute w-3 h-3 rounded-full transition-all duration-[3000ms] ease-linear cursor-pointer ${
                  selectedSat === sat.id ? "ring-2 ring-offset-2 ring-offset-background" : ""
                }`}
                style={{
                  top: `calc(${yBase}% - 6px)`,
                  left: `${xPos}%`,
                  backgroundColor: sat.color,
                  boxShadow: `0 0 8px ${sat.color}`,
                  ringColor: sat.color,
                }}
                onClick={() => setSelectedSat(sat.id === selectedSat ? null : sat.id)}
              >
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[9px] whitespace-nowrap text-muted-foreground">
                  {sat.name}
                </span>
              </div>
            </React.Fragment>
          );
        })}

        {/* Asset markers */}
        {assets.map((asset, i) => {
          const x = 20 + i * 12;
          const y = 55 + (i % 3) * 12;
          return (
            <div
              key={asset.id}
              className="absolute"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="w-4 h-4 border-2 border-foreground/30 bg-background rotate-45" />
              <span className="absolute top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] whitespace-nowrap text-muted-foreground">
                {asset.name}
              </span>
            </div>
          );
        })}

        {/* Coordinates overlay */}
        <div className="absolute bottom-3 left-3 bg-background/90 border border-border px-3 py-2">
          <span className="font-mono text-[10px] text-muted-foreground">
            Tracking {satellites.filter((s) => s.status === "active").length} active satellites ·
            {" "}{passWindows.length} upcoming passes
          </span>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l border-border bg-card flex-shrink-0 flex flex-col overflow-hidden">
        {/* Satellite List */}
        <div className="border-b border-border">
          <div className="px-4 py-3">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Constellation Status</span>
          </div>
          <div className="max-h-64 overflow-auto">
            {satellites.map((sat) => (
              <button
                key={sat.id}
                onClick={() => setSelectedSat(sat.id === selectedSat ? null : sat.id)}
                className={`w-full text-left px-4 py-2.5 border-b border-border flex items-center gap-3 transition-colors ${
                  selectedSat === sat.id ? "bg-accent" : "hover:bg-accent/50"
                }`}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sat.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{sat.name}</span>
                    <span className={`font-mono text-[10px] uppercase ${
                      sat.status === "active" ? "text-status-good" : "text-status-warn"
                    }`}>
                      {sat.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-mono text-[10px] text-muted-foreground">{sat.constellation}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{sat.altitude}km</span>
                    <span className="font-mono text-[10px] text-muted-foreground">Next: {sat.nextPass}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pass Windows */}
        <div className="flex-1 overflow-auto">
          <div className="px-4 py-3 border-b border-border">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {selectedSat ? `Passes — ${satellites.find((s) => s.id === selectedSat)?.name}` : "All Upcoming Passes"}
            </span>
          </div>
          {selectedPasses.map((pw) => {
            const sat = satellites.find((s) => s.id === pw.satelliteId);
            const asset = assets.find((a) => a.id === pw.assetId);
            return (
              <div key={pw.id} className="px-4 py-3 border-b border-border hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{asset?.name || pw.assetId}</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="font-mono text-[10px]">{pw.startTime}–{pw.endTime}</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">Elev: {pw.maxElevation}°</span>
                  <div className="flex items-center gap-1">
                    <CloudRain className="w-3 h-3 text-muted-foreground" />
                    <span className={`font-mono text-[10px] ${pw.cloudCover > 25 ? "text-status-warn" : "text-status-good"}`}>
                      {pw.cloudCover}%
                    </span>
                  </div>
                </div>
                {!selectedSat && (
                  <span className="font-mono text-[10px] text-muted-foreground block mt-1">{sat?.name}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SatelliteTracker;
