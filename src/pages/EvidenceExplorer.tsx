import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assets } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";
import { EvidenceMap } from "@/components/EvidenceMap";

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
                    {pixelData ? pixelData.lat.toFixed(4) : "—"}
                  </span>
                  <span className="text-muted-foreground">Lng</span>
                  <span className="text-right">
                    {pixelData ? pixelData.lng.toFixed(4) : "—"}
                  </span>
                  <span className="text-muted-foreground">NDVI</span>
                  <span className="text-right">
                    {pixelData ? pixelData.ndvi.toFixed(2) : "—"}
                  </span>
                  <span className="text-muted-foreground">Moisture</span>
                  <span className="text-right">
                    {pixelData ? `${pixelData.moisture.toFixed(0)}%` : "—"}
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
            </div>
          )}
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="border-t border-border px-6 py-3 bg-background flex items-center gap-4">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground w-20">
          Timeline
        </span>
        <input
          type="range"
          min="0"
          max="11"
          value={timelineValue}
          onChange={(e) => setTimelineValue(parseInt(e.target.value))}
          className="flex-1 h-0.5 bg-border appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <span className="font-mono text-xs text-muted-foreground w-28 text-right">
          {SLIDER_DATES[timelineValue]}
        </span>
      </div>
    </div>
  );
};

export default EvidenceExplorer;
