import React, { useState, useEffect } from "react";
import { assets } from "@/lib/mock-data";
import { activityFeed, type ActivityFeedItem } from "@/lib/mock-community";
import { HealthBadge } from "@/components/HealthBadge";
import { StatusLabel } from "@/components/StatusLabel";
import { AlertTriangle, Radio, MessageSquare, FileText, Users, Zap } from "lucide-react";

const mockAlerts = [
  { id: "la1", text: "NDVI anomaly detected in Northridge Tract, Eastern sector", severity: "critical" as const, time: "Just now" },
  { id: "la2", text: "Sentinel-2A pass completed over Sunfield Estate — imagery processing", severity: "info" as const, time: "3 min ago" },
  { id: "la3", text: "Soil moisture threshold breach in Greendale Plots, Zone 2", severity: "critical" as const, time: "7 min ago" },
  { id: "la4", text: "Blackrock Fields health score declined 2 points in 24h", severity: "warning" as const, time: "12 min ago" },
  { id: "la5", text: "Scheduled maintenance window: Pump Station 4 repair in progress", severity: "info" as const, time: "18 min ago" },
];

const feedIcons: Record<ActivityFeedItem["type"], React.ReactNode> = {
  insight: <Zap className="w-3 h-3" />,
  dataset: <FileText className="w-3 h-3" />,
  comment: <MessageSquare className="w-3 h-3" />,
  challenge_join: <Users className="w-3 h-3" />,
  workflow_shared: <Radio className="w-3 h-3" />,
};

const LiveMonitoring: React.FC = () => {
  const [alertIndex, setAlertIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAlertIndex((prev) => (prev + 1) % mockAlerts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentAlert = mockAlerts[alertIndex];

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Alert Ticker */}
        <div className={`px-6 py-2.5 flex items-center gap-2 text-sm font-medium flex-shrink-0 transition-colors ${
          currentAlert.severity === "critical"
            ? "bg-status-critical text-primary-foreground"
            : currentAlert.severity === "warning"
            ? "bg-status-warn text-primary-foreground"
            : "bg-muted text-foreground"
        }`}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{currentAlert.text}</span>
          <span className="font-mono text-xs opacity-70">{currentAlert.time}</span>
        </div>

        {/* Zone Grid */}
        <div className="flex-1 overflow-auto p-6">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-4">
            Monitored Zones — Live Status
          </span>
          <div className="grid grid-cols-3 gap-4">
            {assets.map((asset) => (
              <div key={asset.id} className="border border-border p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">{asset.name}</h3>
                  <div className="relative">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      asset.status === "healthy" ? "bg-status-good" :
                      asset.status === "watch" ? "bg-status-warn" :
                      "bg-status-critical"
                    }`} />
                    {(asset.status === "at-risk" || asset.status === "critical") && (
                      <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping ${
                        asset.status === "critical" ? "bg-status-critical" : "bg-status-warn"
                      }`} />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <HealthBadge score={asset.healthScore} />
                  <StatusLabel status={asset.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{asset.region}</span>
                  <span className="font-mono text-xs text-muted-foreground">{asset.sizeHA.toLocaleString()} HA</span>
                </div>
                {asset.pendingActions > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-status-critical">
                    <AlertTriangle className="w-3 h-3" />
                    {asset.pendingActions} pending action{asset.pendingActions > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Feed Sidebar */}
      <div className="w-80 border-l border-border bg-card flex-shrink-0 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex-shrink-0">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Community Activity</span>
        </div>
        <div className="flex-1 overflow-auto">
          {activityFeed.map((item) => (
            <div key={item.id} className="px-4 py-3 border-b border-border hover:bg-accent/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center font-mono text-[10px] font-semibold text-muted-foreground flex-shrink-0">
                  {item.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {feedIcons[item.type]}
                    <span className="text-xs font-medium truncate">{item.username}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                  <span className="font-mono text-[10px] text-muted-foreground mt-1 block">{item.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoring;
