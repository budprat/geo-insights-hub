// Mock data for the application
export interface Asset {
  id: string;
  name: string;
  region: string;
  crop: string;
  sizeHA: number;
  healthScore: number;
  status: "healthy" | "watch" | "at-risk" | "critical";
  pendingActions: number;
  trend: number[]; // 30 day sparkline data
  yoyChange: number;
}

export interface Finding {
  id: string;
  text: string;
  severity: "critical" | "warning" | "info";
  zone: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  target: string;
  estimatedCost: number;
  priority: "urgent" | "high" | "medium";
  deployed: boolean;
}

export const assets: Asset[] = [
  {
    id: "northridge",
    name: "Northridge Tract",
    region: "Northern Valley",
    crop: "Corn",
    sizeHA: 1240,
    healthScore: 42,
    status: "at-risk",
    pendingActions: 3,
    trend: [72, 70, 68, 65, 63, 60, 58, 55, 53, 50, 52, 49, 47, 45, 44, 43, 42, 42, 43, 42, 41, 42, 43, 42, 41, 42, 43, 42, 42, 42],
    yoyChange: -8.2,
  },
  {
    id: "sunfield",
    name: "Sunfield Estate",
    region: "Central Plain",
    crop: "Wheat",
    sizeHA: 890,
    healthScore: 88,
    status: "healthy",
    pendingActions: 0,
    trend: [82, 83, 84, 85, 86, 86, 87, 87, 88, 88, 87, 88, 88, 89, 88, 88, 87, 88, 88, 89, 88, 88, 87, 88, 88, 89, 88, 88, 88, 88],
    yoyChange: 3.1,
  },
  {
    id: "blackrock",
    name: "Blackrock Fields",
    region: "Southern Basin",
    crop: "Soybean",
    sizeHA: 2100,
    healthScore: 61,
    status: "watch",
    pendingActions: 1,
    trend: [75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 64, 63, 63, 62, 62, 61, 61, 61, 62, 61, 61, 61, 62, 61, 61, 61, 61, 61],
    yoyChange: -4.7,
  },
  {
    id: "greendale",
    name: "Greendale Plots",
    region: "Northern Valley",
    crop: "Corn",
    sizeHA: 560,
    healthScore: 29,
    status: "critical",
    pendingActions: 5,
    trend: [65, 62, 58, 55, 50, 48, 45, 42, 40, 38, 36, 35, 34, 33, 32, 31, 30, 30, 29, 29, 30, 29, 29, 29, 30, 29, 29, 29, 29, 29],
    yoyChange: -18.4,
  },
  {
    id: "riverview",
    name: "Riverview Acres",
    region: "Eastern Ridge",
    crop: "Rice",
    sizeHA: 780,
    healthScore: 76,
    status: "healthy",
    pendingActions: 0,
    trend: [74, 74, 75, 75, 76, 76, 76, 76, 75, 76, 76, 76, 76, 77, 76, 76, 76, 76, 76, 77, 76, 76, 76, 76, 76, 77, 76, 76, 76, 76],
    yoyChange: 1.2,
  },
  {
    id: "crestwood",
    name: "Crestwood Farm",
    region: "Central Plain",
    crop: "Barley",
    sizeHA: 430,
    healthScore: 53,
    status: "watch",
    pendingActions: 2,
    trend: [68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 56, 55, 55, 54, 54, 53, 53, 54, 53, 53, 53, 54, 53, 53, 53, 53, 53],
    yoyChange: -6.1,
  },
];

export const findings: Record<string, Finding[]> = {
  northridge: [
    { id: "f1", text: "Eastern fields show 14% vegetation stress across 320 HA.", severity: "critical", zone: "east" },
    { id: "f2", text: "Root cause: suspected irrigation pump 4 failure since Oct 12.", severity: "critical", zone: "east" },
    { id: "f3", text: "Estimated yield impact at current trajectory: -$45,000.", severity: "warning", zone: "east" },
    { id: "f4", text: "Western sectors stable. NDVI within seasonal norms.", severity: "info", zone: "west" },
  ],
  greendale: [
    { id: "f5", text: "Severe nutrient depletion detected across 80% of monitored area.", severity: "critical", zone: "central" },
    { id: "f6", text: "Soil moisture 34% below threshold in Zones 1-4.", severity: "critical", zone: "north" },
    { id: "f7", text: "Pest activity (armyworm) confirmed via spectral anomaly.", severity: "warning", zone: "south" },
  ],
  blackrock: [
    { id: "f8", text: "Mild moisture stress in southern quadrant, 6% below optimal.", severity: "warning", zone: "south" },
    { id: "f9", text: "No structural anomalies detected. Monitoring continues.", severity: "info", zone: "central" },
  ],
};

export const recommendedActions: Record<string, RecommendedAction[]> = {
  northridge: [
    { id: "a1", title: "Dispatch maintenance crew to Pump Station 4", target: "Zone 3, Eastern Fields", estimatedCost: 450, priority: "urgent", deployed: false },
    { id: "a2", title: "Deploy supplemental drip irrigation", target: "Zone 2-3, Eastern Fields", estimatedCost: 2800, priority: "high", deployed: false },
    { id: "a3", title: "Schedule aerial nitrogen application", target: "Full tract", estimatedCost: 1200, priority: "medium", deployed: false },
  ],
  greendale: [
    { id: "a4", title: "Emergency soil remediation program", target: "Zones 1-4", estimatedCost: 8500, priority: "urgent", deployed: false },
    { id: "a5", title: "Deploy pest control measures", target: "Southern boundary", estimatedCost: 3200, priority: "urgent", deployed: false },
    { id: "a6", title: "Activate emergency irrigation reserves", target: "All zones", estimatedCost: 1800, priority: "high", deployed: false },
  ],
  blackrock: [
    { id: "a7", title: "Increase irrigation schedule by 15%", target: "Southern quadrant", estimatedCost: 600, priority: "medium", deployed: false },
  ],
};

export const contractors = [
  "Valley Ag Services",
  "PrecisionField Co.",
  "Greenline Maintenance",
  "AgriFix Solutions",
];
