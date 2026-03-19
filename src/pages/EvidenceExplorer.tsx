import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assets } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";
import { EvidenceMap } from "@/components/EvidenceMap";
import { AlertSubscriptions } from "@/components/AlertSubscriptions";

const layers = ["True Color", "NDVI", "Moisture Index", "Thermal"] as const;
type Layer = (typeof layers)[number];

const layerToMapLayer: Record<
  Layer,
  "truecolor" | "ndvi" | "moisture" | "thermal"
> = {
  "True Color": "truecolor",
  NDVI: "ndvi",
  "Moisture Index": "moisture",
  Thermal: "thermal",
};

const SLIDER_DATES = [
  "Jan 15, 2024",
  "Feb 1, 2024",
  "Feb 15, 2024",
  "Mar 1, 2024",
  "Mar 15, 2024",
  "Apr 1, 2024",
  "Apr 15, 2024",
  "May 1, 2024",
  "May 15, 2024",
  "Jun 1, 2024",
  "Jun 15, 2024",
  "Jul 1, 2024",
];

const EvidenceExplorer: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState<Layer>("NDVI");
  const [timelineValue, setTimelineValue] = useState(11);
  const [pixelData, setPixelData] = useState<{
    lat: number;
    lng: number;
    ndvi: number;
    moisture: number;
    surfaceTemp: number;
    histogram: number[];
  } | null>(null);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [watchOpen, setWatchOpen] = useState(false);

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

  const asset = assets.find((a) => a.id === assetId) || demoAsset;

  const handleMouseMove = useCallback(
    (lat: number, lng: number, ndvi: number, moisture: number) => {
      const surfaceTemp = 22 + Math.abs(Math.sin(lat * 50)) * 12;
      // Generate 9-bar spectral histogram from position
      const histogram = Array.from(
        { length: 9 },
        (_, i) =>
          Math.abs(Math.sin((lat * 100 + i * 30) * (lng * 80 + i * 20))) * 0.8 +
          0.2,
      );
      setPixelData({ lat, lng, ndvi, moisture, surfaceTemp, histogram });
    },
    [],
  );

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <div className="border-b border-border px-6 py-3 flex items-center gap-4 bg-background z-10">
        <button
          onClick={() => navigate(`/asset/${asset.id}`)}
          className="hover:bg-accent p-1.5 rounded-sm transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-sm font-semibold">{asset.name}</h1>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            Evidence Explorer
          </span>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative overflow-hidden">
        <EvidenceMap
          activeLayer={layerToMapLayer[activeLayer]}
          onMouseMove={handleMouseMove}
        />

        {/* Crosshair Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[1000]">
          <div className="relative w-full h-full">
            <div className="absolute top-1/2 left-0 w-full h-px bg-status-good/20" />
            <div className="absolute top-0 left-1/2 w-px h-full bg-status-good/20" />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-status-good/40"
              style={{ boxShadow: "0 0 20px rgba(5, 150, 105, 0.15)" }}
            />
          </div>
        </div>

        {/* Bloomberg-Style Telemetry Bar */}
        <div className="absolute top-0 left-0 right-0 z-[1001] flex items-center h-10 bg-background/80 backdrop-blur border-b border-border font-mono text-[10px] px-6">
          <div className="flex gap-6 items-center">
            <div className="flex gap-2">
              <span className="text-muted-foreground uppercase">LAT:</span>
              <span className="text-status-good">
                {pixelData ? `${pixelData.lat.toFixed(4)}\u00b0 N` : "\u2014"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground uppercase">LON:</span>
              <span className="text-status-good">
                {pixelData
                  ? `${Math.abs(pixelData.lng).toFixed(4)}\u00b0 W`
                  : "\u2014"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground uppercase">NDVI:</span>
              <span
                className={
                  pixelData && pixelData.ndvi > 0.5
                    ? "text-status-good"
                    : "text-status-warn"
                }
              >
                {pixelData ? pixelData.ndvi.toFixed(2) : "\u2014"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground uppercase">TEMP:</span>
              <span>
                {pixelData ? `${pixelData.surfaceTemp.toFixed(1)}° C` : "—"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground uppercase">SAT:</span>
              <span className="text-status-good">SENTINEL-2A</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground uppercase">RES:</span>
              <span>10M/PX</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-status-good animate-pulse" />
              <span className="text-status-good">SIGNAL_STABLE</span>
            </div>
            <span className="text-muted-foreground">
              {new Date().toISOString().slice(0, 19).replace("T", " ")} UTC
            </span>
          </div>
        </div>

        {/* Technical Panel (matches JonaAI-Intel) */}
        <div
          className="absolute top-4 right-4 w-80 bg-background border border-border z-[1001] max-h-[calc(100%-6rem)] overflow-auto animate-fade-in"
          style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.06)" }}
        >
          {/* Panel header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-card">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Technical Panel
            </span>
            <button
              onClick={() => setPanelCollapsed(!panelCollapsed)}
              className="font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
            >
              {panelCollapsed ? "Expand" : "Collapse"}
            </button>
          </div>

          {!panelCollapsed && (
            <div className="p-4 space-y-5">
              {/* Layer Controls */}
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-2">
                  Layer
                </span>
                <div className="space-y-1.5">
                  {layers.map((layer) => (
                    <label
                      key={layer}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground transition-colors"
                    >
                      <input
                        type="radio"
                        name="layer"
                        checked={activeLayer === layer}
                        onChange={() => setActiveLayer(layer)}
                        className="accent-primary"
                      />
                      {layer}
                    </label>
                  ))}
                </div>
              </div>

              {/* Cursor Values */}
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-2">
                  Cursor Values
                </span>
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-sm">
                  <span className="text-muted-foreground">Lat</span>
                  <span className="text-right">
                    {pixelData ? pixelData.lat.toFixed(4) : "\u2014"}
                  </span>
                  <span className="text-muted-foreground">Lng</span>
                  <span className="text-right">
                    {pixelData ? pixelData.lng.toFixed(4) : "\u2014"}
                  </span>
                  <span className="text-muted-foreground">NDVI</span>
                  <span className="text-right">
                    {pixelData ? pixelData.ndvi.toFixed(2) : "\u2014"}
                  </span>
                  <span className="text-muted-foreground">Moisture</span>
                  <span className="text-right">
                    {pixelData ? `${pixelData.moisture.toFixed(0)}%` : "\u2014"}
                  </span>
                  <span className="text-muted-foreground">Temp</span>
                  <span className="text-right">
                    {pixelData ? `${pixelData.surfaceTemp.toFixed(1)}° C` : "—"}
                  </span>
                </div>

                {/* Spectral Histogram */}
                <div
                  className="mt-3 h-10 w-full bg-muted/50 flex items-end gap-px p-1 overflow-hidden"
                  aria-label="Spectral distribution"
                >
                  {(pixelData?.histogram || Array(9).fill(0.1)).map((v, i) => (
                    <div
                      key={i}
                      className="flex-1 transition-all duration-150"
                      style={{
                        height: `${v * 100}%`,
                        backgroundColor:
                          i < 5
                            ? `hsl(var(--status-good) / ${0.3 + v * 0.5})`
                            : i < 7
                              ? `hsl(var(--status-critical) / ${0.3 + v * 0.5})`
                              : `hsl(var(--muted-foreground) / 0.3)`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Active Asset Context */}
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-2">
                  Active Asset
                </span>
                <div className="text-sm font-medium">{asset.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {asset.sizeHA.toLocaleString()} HA &middot; {asset.crop}{" "}
                  &middot; {asset.region}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`font-mono text-[10px] uppercase px-1.5 py-0.5 text-primary-foreground ${
                      asset.healthScore < 50
                        ? "bg-status-critical"
                        : asset.healthScore < 70
                          ? "bg-status-warn"
                          : "bg-status-good"
                    }`}
                  >
                    {asset.status === "critical" || asset.status === "at-risk"
                      ? "Critical"
                      : asset.status === "watch"
                        ? "Warning"
                        : "Healthy"}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    Health: {asset.healthScore}
                  </span>
                </div>
              </div>

              {/* Satellite Pass Metadata */}
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-2">
                  Satellite Pass
                </span>
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-right">
                    {SLIDER_DATES[timelineValue]}
                  </span>
                  <span className="text-muted-foreground">Source</span>
                  <span className="text-right">Sentinel-2</span>
                  <span className="text-muted-foreground">Cloud</span>
                  <span className="text-right">4%</span>
                  <span className="text-muted-foreground">Res</span>
                  <span className="text-right">10m</span>
                </div>
              </div>

              {/* Causal Intelligence Narrative */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Causal Narrative
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground">
                    ID: NARR-{asset.id.charCodeAt(0)}
                    {asset.id.charCodeAt(1)}2
                  </span>
                </div>

                {/* Anomaly Badge */}
                <div className="mb-3">
                  <span className="inline-block px-2 py-0.5 bg-status-critical/10 text-status-critical text-[9px] font-mono font-bold uppercase tracking-wider border border-status-critical/20">
                    CRITICAL_ANOMALY
                  </span>
                </div>

                {/* Root Cause Analysis */}
                <p className="text-xs leading-relaxed mb-3">
                  Intelligence correlates the{" "}
                  <span className="font-bold">14% biomass decline</span> to a{" "}
                  <span className="text-status-critical font-bold">
                    sustained infrastructure failure
                  </span>
                  . Pump Station #4 inactive for 12 days during peak heat.
                </p>

                {/* Decision Context Box */}
                <div className="bg-card p-3 border-l-2 border-status-critical mb-4">
                  <p className="font-mono text-[9px] text-muted-foreground uppercase font-bold mb-1">
                    DECISION_CONTEXT / BUSINESS_RISK
                  </p>
                  <p className="text-xs font-bold">
                    Irreversible yield loss projected (3.2%). Immediate repair
                    mission required.
                  </p>
                </div>

                {/* Enhanced Timeline */}
                <div className="space-y-0 relative">
                  <div className="absolute left-1 top-2 bottom-2 w-px bg-border" />
                  <div className="relative pl-5 pb-4">
                    <div className="absolute left-0 top-1.5 w-2 h-2 bg-status-good border border-background" />
                    <span className="font-mono text-[9px] text-status-good uppercase block mb-0.5">
                      T-12 DAYS [INFRASTRUCTURE_FAULT]
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Soil moisture sensor 7G-02 drops below 18% threshold.
                    </p>
                  </div>
                  <div className="relative pl-5 pb-4">
                    <div className="absolute left-0 top-1.5 w-2 h-2 bg-status-warn border border-background" />
                    <span className="font-mono text-[9px] text-status-warn uppercase block mb-0.5">
                      T-4 DAYS [SPECTRAL_DEVIATION]
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      NDVI shifts from Optimal to Thermal_Stress. Biomass
                      stalls.
                    </p>
                  </div>
                  <div className="relative pl-5">
                    <div
                      className="absolute left-0 top-1.5 w-2 h-2 bg-status-critical border border-background"
                      style={{ boxShadow: "0 0 8px rgba(220, 38, 38, 0.5)" }}
                    />
                    <span className="font-mono text-[9px] text-status-critical uppercase block mb-0.5">
                      CURRENT_STATE [YIELD_IMPACT]
                    </span>
                    <p className="text-[11px] font-medium">
                      3.2% yield loss locked. Cellular wall collapse detected.
                    </p>
                  </div>
                </div>
              </div>

              {/* Create Watch CTA */}
              <button
                onClick={() => setWatchOpen(true)}
                className="w-full py-2.5 bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                INITIATE_CONTINUOUS_WATCH
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Timeline v2 */}
      <div className="border-t border-border px-6 py-3 bg-background">
        <div className="flex items-center gap-6">
          {/* Play Button + Date */}
          <div className="flex items-center gap-3 pr-4 border-r border-border">
            <button
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-status-good hover:text-status-good transition-all"
              aria-label="Play timeline"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <div>
              <div className="font-mono text-xs font-bold">
                {SLIDER_DATES[timelineValue]}
              </div>
              <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                HIST_PLAYBACK
              </div>
            </div>
          </div>

          {/* Slider */}
          <div className="flex-1">
            <label htmlFor="timeline-slider" className="sr-only">
              Timeline
            </label>
            <input
              id="timeline-slider"
              type="range"
              min="0"
              max="11"
              value={timelineValue}
              onChange={(e) => setTimelineValue(parseInt(e.target.value))}
              className="w-full h-0.5 bg-border appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-1 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-status-good [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(5,150,105,0.5)]"
              aria-label="Timeline"
            />
            <div className="flex justify-between font-mono text-[9px] text-muted-foreground mt-1">
              <span>JAN</span>
              <span>MAR</span>
              <span>MAY</span>
              <span className="text-status-good font-bold">
                {SLIDER_DATES[timelineValue].split(",")[0].toUpperCase()}
              </span>
              <span>SEP</span>
              <span>DEC</span>
            </div>
          </div>

          {/* Speed Controls */}
          <div className="flex gap-1 pl-4 border-l border-border">
            <button className="px-2 py-1 bg-card border border-border font-mono text-[9px] text-muted-foreground hover:text-foreground transition-colors">
              1X
            </button>
            <button className="px-2 py-1 bg-card border border-border font-mono text-[9px] text-muted-foreground hover:text-foreground transition-colors">
              4X
            </button>
            <button className="px-2 py-1 border border-status-good/50 font-mono text-[9px] text-status-good font-bold bg-status-good/5">
              LIVE
            </button>
          </div>
        </div>
      </div>

      <AlertSubscriptions open={watchOpen} onOpenChange={setWatchOpen} />
    </div>
  );
};

export default EvidenceExplorer;
