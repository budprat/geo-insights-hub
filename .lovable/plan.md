

# Implementation Plan: 8 New Feature Modules for JonaAI

## Overview

Adding 8 major features to the existing JonaAI geospatial intelligence platform. Each becomes a new page or component integrated into the existing AppLayout and navigation.

---

## Current State

- 3 pages exist: PortfolioCommand, AssetBriefing, EvidenceExplorer
- 1 modal: InterventionPlanner
- All data is mock (in `src/lib/mock-data.ts`)
- Design system: Bloomberg-style, Rethink Sans / JetBrains Mono, 2px radius, high contrast

---

## Feature 1: Automated Workflow Builder with Natural Language Templates

**New files:** `src/pages/WorkflowBuilder.tsx`, `src/components/WorkflowNode.tsx`, `src/lib/workflow-templates.ts`

**What it does:** Users type natural language (e.g., "Alert me when NDVI drops below 0.3 in northern sectors") and the system generates a visual workflow chain: Trigger → Condition → Action. Pre-built templates for common tasks (drought monitoring, pest detection, yield forecasting).

**UI:** Left panel with template library (cards), center canvas showing a vertical node chain (trigger → filter → action), right panel for node configuration. Top bar has a natural language input field.

**Mock behavior:** Typing a prompt parses keywords to auto-select a matching template and populates nodes. No real AI backend yet — pattern matching on keywords.

---

## Feature 2: Community Challenges and Crowdsourced Datasets

**New files:** `src/pages/CommunityChallenges.tsx`, `src/lib/mock-community.ts`

**What it does:** Lists active challenges (e.g., "Map deforestation in Amazon basin Q1 2026"), shows leaderboard, submission count, and dataset contributions. Users can browse and "join" challenges.

**UI:** Grid of challenge cards with progress bars, deadline countdowns, participant counts, prize/recognition info. Each card expandable to show description, rules, and a leaderboard table. Filter bar for category/status.

---

## Feature 3: Live Monitoring Dashboard with Community Integration

**New files:** `src/pages/LiveMonitoring.tsx`, `src/components/SatelliteTracker.tsx`, `src/components/ActivityFeed.tsx`

**What it does:** Real-time dashboard showing satellite pass schedule, active alerts feed, and a community activity sidebar (recent contributions, comments, shared insights).

**UI:** Two-column layout. Left (70%): auto-refreshing alert ticker at top, grid of monitored zones with live status indicators (pulsing dots), mini health cards. Right (30%): scrollable activity feed with timestamps, user avatars, and action types (shared insight, new dataset, comment).

**Mock behavior:** `setInterval` cycling through mock alerts and feed items to simulate real-time updates.

---

## Feature 4: ROI Calculator and Benchmark Simulator

**New files:** `src/pages/ROICalculator.tsx`, `src/lib/roi-models.ts`

**What it does:** Users select an intervention type, input parameters (area, crop, current health), and get a projected ROI breakdown: cost vs. estimated yield recovery, payback period, benchmark against portfolio averages.

**UI:** Left panel: input form with sliders for area, health score, intervention cost. Right panel: results dashboard with bar chart (cost vs. benefit), ROI percentage in large mono type, payback timeline, and a comparison table against industry benchmarks. Uses recharts for visualization.

---

## Feature 5: Community-Driven Insight Marketplace

**New files:** `src/pages/InsightMarketplace.tsx`, `src/lib/mock-marketplace.ts`

**What it does:** Browse, search, and "install" community-created workflow templates and analysis pipelines. Each listing shows author, rating, usage count, description, and a one-click "Add to My Workflows" button.

**UI:** Search bar at top, category tabs (Agriculture, Urban, Forestry, Climate), grid of cards with template previews. Detail modal on click showing full description, sample outputs, and install button.

---

## Feature 6: One-Click PDF/GeoJSON Export Pipeline

**New files:** `src/components/ExportPanel.tsx`, `src/lib/export-utils.ts`

**What it does:** From any Asset Briefing page, users click "Export Report" to generate a PDF executive summary or GeoJSON data file. The panel shows format options, content toggles (include findings, actions, map snapshot), and a download button.

**Integration point:** Added as a button in AssetBriefing header and as a floating action in PortfolioCommand. Uses browser-side PDF generation (jsPDF + html2canvas for mock, or structured reportlab-style layout). GeoJSON export serializes asset coordinates and zone boundaries.

**UI:** Slide-out sheet from right with checkboxes for content sections, format radio (PDF/GeoJSON/CSV), preview thumbnail, and "Generate & Download" button with progress indicator.

---

## Feature 7: Real-Time Satellite Tracking

**New files:** `src/pages/SatelliteTracker.tsx`, `src/lib/mock-satellites.ts`

**What it does:** Visualizes satellite positions and upcoming passes over monitored assets. Shows orbital paths, next pass countdown, and coverage windows.

**UI:** Full-width simulated orbital view (CSS grid globe projection), sidebar listing satellites with next-pass times, coverage percentage per asset, and a timeline bar showing observation windows. Animated satellite position markers moving along orbital tracks via CSS animation.

---

## Feature 8: What-If Scenario Simulations

**New files:** `src/pages/ScenarioSimulator.tsx`, `src/lib/scenario-models.ts`

**What it does:** Users adjust climate/operational variables (rainfall ±30%, temperature shift, delayed intervention) and see projected impact on health scores, yield, and financials. Compare up to 3 scenarios side by side.

**UI:** Top: scenario tabs (Baseline, Scenario A, Scenario B). Each tab has slider controls for variables. Below: comparison grid showing projected health score trajectories (sparklines), yield delta, and financial impact in large mono typography. Uses recharts area charts for trajectory visualization.

---

## Routing and Navigation Changes

**`src/App.tsx`:** Add 7 new routes under AppLayout:
- `/workflows` → WorkflowBuilder
- `/community` → CommunityChallenges
- `/monitoring` → LiveMonitoring
- `/roi` → ROICalculator
- `/marketplace` → InsightMarketplace
- `/satellites` → SatelliteTracker
- `/scenarios` → ScenarioSimulator

**`src/components/AppLayout.tsx`:** Expand nav bar with icon buttons for each new section. Group into "Operations" (Portfolio, Monitoring, Satellites) and "Tools" (Workflows, ROI, Scenarios, Marketplace, Community).

---

## Mock Data Additions

**`src/lib/mock-community.ts`:** Challenge objects, leaderboard entries, activity feed items.
**`src/lib/mock-marketplace.ts`:** Template listings with ratings, authors, categories.
**`src/lib/mock-satellites.ts`:** Satellite names, orbital parameters, pass schedules.
**`src/lib/workflow-templates.ts`:** Pre-built workflow definitions with node types.
**`src/lib/roi-models.ts`:** ROI calculation functions, benchmark data.
**`src/lib/scenario-models.ts`:** Scenario projection functions, variable ranges.
**`src/lib/export-utils.ts`:** PDF/GeoJSON generation helpers.

---

## Dependencies to Add

- `jspdf` + `html2canvas` — for PDF export
- No other new dependencies; recharts is already available via the chart component

---

## Build Order

1. Mock data files (all 6 new data modules)
2. ROI Calculator (self-contained, uses recharts)
3. What-If Scenario Simulator (similar pattern, recharts)
4. Export Pipeline (integrates into existing AssetBriefing)
5. Workflow Builder (most complex UI)
6. Community Challenges + Marketplace (related features)
7. Live Monitoring + Satellite Tracker (animation-heavy)
8. Navigation and routing updates (final integration)

