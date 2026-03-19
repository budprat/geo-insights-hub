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
      setPixelData({ lat, lng, ndvi, moisture });
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
            <div className="absolute top-1/2 left-0 w-full h-px bg-primary/10" />
            <div className="absolute top-0 left-1/2 w-px h-full bg-primary/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border border-primary/20" />
          </div>
        </div>

        {/* Telemetry Data Strip */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] flex gap-4 px-4 py-2 bg-background/80 backdrop-blur-sm border border-border font-mono text-[10px]">
          <div className="flex flex-col">
            <span className="text-muted-foreground uppercase">Latitude</span>
            <span>
              {pixelData ? `${pixelData.lat.toFixed(4)}\u00b0 N` : "\u2014"}
            </span>
          </div>
          <div className="w-px bg-border self-stretch" />
          <div className="flex flex-col">
            <span className="text-muted-foreground uppercase">Longitude</span>
            <span>
              {pixelData
                ? `${Math.abs(pixelData.lng).toFixed(4)}\u00b0 W`
                : "\u2014"}
            </span>
          </div>
          <div className="w-px bg-border self-stretch" />
          <div className="flex flex-col">
            <span className="text-muted-foreground uppercase">NDVI</span>
            <span
              className={
                pixelData
                  ? pixelData.ndvi > 0.5
                    ? "text-status-good"
                    : "text-status-warn"
                  : ""
              }
            >
              {pixelData ? pixelData.ndvi.toFixed(2) : "\u2014"}
            </span>
          </div>
          <div className="w-px bg-border self-stretch" />
          <div className="flex flex-col">
            <span className="text-muted-foreground uppercase">Satellite</span>
            <span className="text-status-good">SENTINEL-2A</span>
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

              {/* Causal Narrative */}
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-3">
                  Causal Narrative
                </span>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-status-good flex-shrink-0" />
                      <div className="w-px flex-1 bg-border my-1" />
                    </div>
                    <div className="pb-2">
                      <span className="font-mono text-[10px] text-status-good uppercase">
                        T-Minus 12 Days
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Soil moisture dropped below 18% threshold.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-status-warn flex-shrink-0" />
                      <div className="w-px flex-1 bg-border my-1" />
                    </div>
                    <div className="pb-2">
                      <span className="font-mono text-[10px] text-status-warn uppercase">
                        T-Minus 4 Days
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        NDVI spectral signature shows thermal stress.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-status-critical flex-shrink-0" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-status-critical uppercase">
                        Current State
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Irreversible yield loss projected (3.2%).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Watch CTA */}
              <button
                onClick={() => setWatchOpen(true)}
                className="w-full py-2 bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-wider font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                Create Watch
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Timeline */}
      <div className="border-t border-border px-6 py-3 bg-background">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button
              className="text-foreground hover:text-status-good transition-colors"
              aria-label="Play timeline"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-medium">
                {SLIDER_DATES[timelineValue]}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                Historical Playback
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <button className="px-2 py-0.5 bg-card border border-border font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              1X
            </button>
            <button className="px-2 py-0.5 bg-card border border-border font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              2X
            </button>
            <button className="px-2 py-0.5 border border-status-good/50 font-mono text-[10px] text-status-good">
              Live
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
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
            className="flex-1 h-1 bg-border appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
            aria-label="Timeline"
          />
          <span className="font-mono text-[10px] text-muted-foreground w-28 text-right">
            12 satellite passes
          </span>
        </div>
      </div>

      <AlertSubscriptions open={watchOpen} onOpenChange={setWatchOpen} />
    </div>
  );
};

export default EvidenceExplorer;
