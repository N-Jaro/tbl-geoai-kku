# GeoAI Team-Based Learning (TBL) Platform — Khon Kaen University

Interactive web platform implementing the 6-step **Team-Based Learning (TBL)** methodology (inspired by InteDashboard) tailored for **GEOAI-402: GeoAI & Spatial Deep Learning** at Khon Kaen University (KKU).

## Features

1. **Step 1: Pre-work & Interactive Spectral Sandbox**
   - Learning outcomes, pre-class readings, and an interactive Sentinel-1 SAR / Sentinel-2 multispectral band simulator (computing live `MNDWI`, `NDVI`, and `NBR`).
2. **Step 2: iRAT (Individual Readiness Assurance Test)**
   - Supports both **Single Choice Mode (4 pts)** and authentic **TBL Confidence Point Allocation Mode** (splitting 4 points across options A–D).
3. **Step 3: tRAT (Team Readiness Assurance Test — IF-AT Scratch Card)**
   - Interactive foil scratch boxes with immediate feedback (`4 pts` on 1st try, `2 pts` on 2nd, `1 pt` on 3rd, `0 pts` on 4th) and instant GeoAI rationale reveals upon uncovering the `★ STAR`.
4. **Step 4: Clarification & Evidence-Based Team Appeals**
   - Teams submit technical appeals citing pre-work formulas; highlights auto-flagged low-iRAT questions (`<60%`) for focused instructor mini-lectures.
5. **Step 5: 4S GeoAI Application Cases with Interactive Leaflet Map**
   - Built around the **4S Framework** (*Significant Problem, Same Problem, Specific Choice, Simultaneous Report*).
   - Interactive **Leaflet Map** over Khon Kaen / Chi-Nam Phong basin / Kranuan with Sentinel-1 SAR & LiDAR HAND telemetry zones, Street/DEM Topo/Dark SAR basemaps, and simultaneous class choice reveal.
6. **Step 6: Peer Evaluation (Koles Method)**
   - Enforces a 100-point quantitative distribution across teammates plus structured qualitative feedback (*Appreciate* & *Request*).
7. **Instructor Dashboard & Bilingual (TH/EN) Toggle**
   - Lock/unlock individual TBL phases, inspect iRAT vs. tRAT team synergy gains, review item-level analytics, and export grades to CSV.

## Quick Start

```bash
npm install
npm run dev
```
