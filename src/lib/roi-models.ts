export interface InterventionType {
  id: string;
  name: string;
  category: string;
  baseCostPerHA: number;
  expectedRecovery: number;
  paybackWeeks: number;
}

export interface ROIResult {
  totalCost: number;
  projectedRecovery: number;
  netBenefit: number;
  roiPercent: number;
  paybackWeeks: number;
  breakEvenHA: number;
}

export interface Benchmark {
  label: string;
  avgROI: number;
  avgCostPerHA: number;
  successRate: number;
}

export const interventionTypes: InterventionType[] = [
  { id: "irrigation_repair", name: "Irrigation System Repair", category: "Infrastructure", baseCostPerHA: 45, expectedRecovery: 0.82, paybackWeeks: 3 },
  { id: "pest_control", name: "Pest Control Application", category: "Chemical", baseCostPerHA: 32, expectedRecovery: 0.75, paybackWeeks: 2 },
  { id: "soil_remediation", name: "Soil Remediation Program", category: "Agronomic", baseCostPerHA: 85, expectedRecovery: 0.68, paybackWeeks: 8 },
  { id: "drainage_improvement", name: "Drainage Improvement", category: "Infrastructure", baseCostPerHA: 120, expectedRecovery: 0.91, paybackWeeks: 12 },
  { id: "nutrient_application", name: "Targeted Nutrient Application", category: "Chemical", baseCostPerHA: 28, expectedRecovery: 0.79, paybackWeeks: 4 },
  { id: "cover_crop", name: "Cover Crop Establishment", category: "Agronomic", baseCostPerHA: 55, expectedRecovery: 0.65, paybackWeeks: 16 },
];

export const benchmarks: Benchmark[] = [
  { label: "Corn — Midwest", avgROI: 245, avgCostPerHA: 52, successRate: 78 },
  { label: "Wheat — Plains", avgROI: 198, avgCostPerHA: 38, successRate: 82 },
  { label: "Soybean — South", avgROI: 312, avgCostPerHA: 41, successRate: 74 },
  { label: "Rice — Delta", avgROI: 176, avgCostPerHA: 67, successRate: 71 },
  { label: "Industry Average", avgROI: 232, avgCostPerHA: 49, successRate: 76 },
];

export function calculateROI(
  intervention: InterventionType,
  areaHA: number,
  currentHealth: number,
  yieldValuePerHA: number = 1200
): ROIResult {
  const healthDeficit = (100 - currentHealth) / 100;
  const totalCost = intervention.baseCostPerHA * areaHA;
  const projectedRecovery = yieldValuePerHA * areaHA * healthDeficit * intervention.expectedRecovery;
  const netBenefit = projectedRecovery - totalCost;
  const roiPercent = totalCost > 0 ? (netBenefit / totalCost) * 100 : 0;
  const breakEvenHA = intervention.baseCostPerHA > 0 ? totalCost / (yieldValuePerHA * healthDeficit * intervention.expectedRecovery) : 0;

  return {
    totalCost,
    projectedRecovery,
    netBenefit,
    roiPercent: Math.round(roiPercent),
    paybackWeeks: intervention.paybackWeeks,
    breakEvenHA: Math.round(breakEvenHA),
  };
}
