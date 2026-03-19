import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assets } from "@/lib/mock-data";
import { ArrowLeft, Crosshair } from "lucide-react";

const layers = ["True Color", "NDVI", "Moisture Index", "Thermal"] as const;
type Layer = (typeof layers)[number];

const layerColors: Record<Layer, string> = {
  "True Color": "hsl(var(--status-good))",
  NDVI: "hsl(var(--status-good))",
  "Moisture Index": "hsl(210 80% 50%)",
  Thermal: "hsl(0 80% 55%)",
};

const EvidenceExplorer: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState<Layer>("NDVI");
  const [timelineValue, setTimelineValue] = useState(85);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  const demoAsset: typeof assets[0] = {
    id: "demo",
    name: "Cascadia Demonstration Farm",
    region: "Pacific Northwest",
    crop: "Wheat / Canola Rotation",
    sizeHA: 1850,
    healthScore: 64,
    status: "watch",
    pendingActions: 4,
    trend: [78, 77, 75, 74, 72, 71, 70, 69, 68, 67, 66, 66, 65, 65, 64, 64, 64, 63, 63, 64, 64, 65, 64, 64, 64, 64, 63, 64, 64, 64],
    yoyChange: -5.3,
  };

  const asset = assets.find((a) => a.id === assetId) || demoAsset;

  const timelineDate = new Date(2023, 6, 1);
  timelineDate.setDate(timelineDate.getDate() + Math.floor((timelineValue / 100) * 120));

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <div className="border-b border-border px-6 py-3 flex items-center gap-4 bg-background z-10">
        <button onClick={() => navigate(`/asset/${asset.id}`)} className="hover:bg-accent p-1.5 rounded-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-sm font-semibold">{asset.name}</h1>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Evidence Explorer</span>
        </div>
      </div>

      {/* Map Area */}
      <div
        className="flex-1 relative bg-muted/20 overflow-hidden"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onMouseLeave={() => setCursorPos(null)}
      >
        {/* Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }} />

        {/* Simulated field zones with layer-specific colors */}
        <div
          className="absolute top-[10%] left-[5%] w-[40%] h-[50%] border transition-colors duration-300"
          style={{
            backgroundColor: `${layerColors[activeLayer]}20`,
            borderColor: `${layerColors[activeLayer]}60`,
          }}
        />
        <div
          className="absolute top-[8%] right-[25%] w-[30%] h-[55%] border transition-colors duration-300"
          style={{
            backgroundColor: `hsl(var(--status-critical) / 0.15)`,
            borderColor: `hsl(var(--status-critical) / 0.4)`,
          }}
        >
          <span className="absolute top-2 left-2 font-mono text-[10px] uppercase text-status-critical">Anomaly Zone</span>
        </div>
        <div
          className="absolute bottom-[20%] left-[15%] w-[55%] h-[20%] border transition-colors duration-300"
          style={{
            backgroundColor: `${layerColors[activeLayer]}10`,
            borderColor: `${layerColors[activeLayer]}30`,
          }}
        />

        {/* Pixel Inspector */}
        {cursorPos && (
          <div
            className="absolute pointer-events-none z-20"
            style={{ left: cursorPos.x + 16, top: cursorPos.y + 16 }}
          >
            <div className="bg-background border border-border px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Crosshair className="w-3 h-3 text-muted-foreground" />
                <span className="font-mono text-[10px] text-muted-foreground uppercase">Pixel Inspector</span>
              </div>
              <div className="font-mono text-[11px] space-y-0.5">
                <div>Lat: {(34.05 + (cursorPos.y / 1000)).toFixed(4)}</div>
                <div>Lng: {(-118.24 + (cursorPos.x / 1000)).toFixed(4)}</div>
                <div>{activeLayer}: {(0.2 + Math.random() * 0.6).toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Panel */}
        <div className="absolute top-4 right-4 w-72 bg-background border border-border z-10">
          <div className="p-4 border-b border-border">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Layer Controls</span>
          </div>
          <div className="p-4 space-y-2">
            {layers.map((layer) => (
              <label
                key={layer}
                className={`flex items-center gap-3 px-3 py-2 rounded-sm cursor-pointer transition-colors ${
                  activeLayer === layer ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                <input
                  type="radio"
                  name="layer"
                  checked={activeLayer === layer}
                  onChange={() => setActiveLayer(layer)}
                  className="sr-only"
                />
                <div
                  className="w-3 h-3 border rounded-full flex items-center justify-center"
                  style={{
                    borderColor: activeLayer === layer ? "currentColor" : "hsl(var(--border))",
                  }}
                >
                  {activeLayer === layer && <div className="w-1.5 h-1.5 bg-current rounded-full" />}
                </div>
                <span className="text-sm">{layer}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="border-t border-border px-6 py-3 bg-background flex items-center gap-4">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground w-20">Timeline</span>
        <input
          type="range"
          min="0"
          max="100"
          value={timelineValue}
          onChange={(e) => setTimelineValue(parseInt(e.target.value))}
          className="flex-1 h-0.5 bg-border appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <span className="font-mono text-xs text-muted-foreground w-28 text-right">
          {timelineDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>
    </div>
  );
};

export default EvidenceExplorer;
