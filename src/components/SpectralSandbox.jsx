import React, { useState } from 'react';
import { Sliders, Droplets, Trees, Flame, Building2 } from 'lucide-react';

const PRESETS = [
  {
    id: 'flood',
    icon: Droplets,
    name: { en: 'Chi River Turbid Floodwater', th: 'น้ำท่วมขุ่นลุ่มน้ำชี' },
    green: 0.14,
    red: 0.11,
    nir: 0.04,
    swir1: 0.02,
    swir2: 0.01,
    sarVv: -20.5
  },
  {
    id: 'rice',
    icon: Trees,
    name: { en: 'Healthy Irrigated Paddy Rice', th: 'นาข้าวเขียวชอุ่ม' },
    green: 0.08,
    red: 0.05,
    nir: 0.46,
    swir1: 0.18,
    swir2: 0.09,
    sarVv: -11.2
  },
  {
    id: 'burn',
    icon: Flame,
    name: { en: 'Fresh Sugarcane Burn Scar (Charcoal)', th: 'แปลงอ้อยเพิ่งเผา (เถ้าถ่าน)' },
    green: 0.06,
    red: 0.07,
    nir: 0.11,
    swir1: 0.24,
    swir2: 0.29,
    sarVv: -13.8
  },
  {
    id: 'urban',
    icon: Building2,
    name: { en: 'Mueang Khon Kaen Concrete Roof/Road', th: 'หลังคาคอนกรีต/ถนนในเขตเมือง' },
    green: 0.22,
    red: 0.25,
    nir: 0.28,
    swir1: 0.31,
    swir2: 0.27,
    sarVv: -6.4
  }
];

export default function SpectralSandbox({ lang }) {
  const [bands, setBands] = useState(PRESETS[0]);

  const calcIndex = (a, b) => {
    if (a + b === 0) return 0;
    return ((a - b) / (a + b)).toFixed(3);
  };

  const ndvi = Number(calcIndex(bands.nir, bands.red));
  const mndwi = Number(calcIndex(bands.green, bands.swir1));
  const nbr = Number(calcIndex(bands.nir, bands.swir2));

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-kku-terracotta/20 text-amber-400 border border-kku-terracotta/40">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-base">
              {lang === 'en'
                ? 'Interactive Sentinel-1 & Sentinel-2 Spectral Signature Sandbox'
                : 'ห้องทดลองจำลองค่าการสะท้อนแสงดาวเทียม Sentinel-1 และ Sentinel-2'}
            </h4>
            <p className="text-xs text-slate-400">
              {lang === 'en'
                ? 'Select an Isan land-cover preset or adjust reflectance sliders to see how GeoAI indices respond.'
                : 'เลือกประเภทพื้นผิวในภาคอีสานหรือเลื่อนปรับค่าแต่ละแบนด์เพื่อดูการเปลี่ยนแปลงของดัชนี'}
            </p>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {PRESETS.map((p) => {
          const Icon = p.icon;
          const active = bands.id === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setBands(p)}
              className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 text-xs font-medium ${
                active
                  ? 'bg-kku-terracotta border-amber-400 text-white shadow-sm'
                  : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0 text-amber-300" />
              <span className="line-clamp-2">{p.name[lang]}</span>
            </button>
          );
        })}
      </div>

      {/* Sliders & Live Indices */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <div className="md:col-span-7 space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          {[
            { key: 'green', label: 'B3 Green (560nm)', min: 0.01, max: 0.5, step: 0.01 },
            { key: 'red', label: 'B4 Red (665nm)', min: 0.01, max: 0.5, step: 0.01 },
            { key: 'nir', label: 'B8 NIR (842nm)', min: 0.01, max: 0.7, step: 0.01 },
            { key: 'swir1', label: 'B11 SWIR-1 (1610nm)', min: 0.01, max: 0.5, step: 0.01 },
            { key: 'swir2', label: 'B12 SWIR-2 (2190nm)', min: 0.01, max: 0.5, step: 0.01 },
            { key: 'sarVv', label: 'Sentinel-1 SAR VV (dB)', min: -25, max: 0, step: 0.5 }
          ].map((s) => (
            <div key={s.key} className="flex items-center gap-3 text-xs">
              <span className="w-36 text-slate-300 font-medium">{s.label}</span>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={bands[s.key]}
                onChange={(e) =>
                  setBands({ ...bands, id: 'custom', [s.key]: parseFloat(e.target.value) })
                }
                className="flex-1 accent-amber-500 cursor-pointer"
              />
              <span className="w-16 text-right font-mono text-amber-300">
                {s.key === 'sarVv' ? `${bands[s.key]} dB` : bands[s.key].toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Computed Indices Output */}
        <div className="md:col-span-5 space-y-2.5">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-sky-300">MNDWI (Water Index)</span>
              <span className="text-lg font-extrabold font-mono text-white">{mndwi}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              (Green - SWIR1) / (Green + SWIR1) →{' '}
              <strong className={mndwi > 0.2 ? 'text-sky-400' : 'text-slate-300'}>
                {mndwi > 0.2
                  ? lang === 'en'
                    ? 'Open Water Detected (> 0.20)'
                    : 'ตรวจพบผิวน้ำเปิด (> 0.20)'
                  : lang === 'en'
                  ? 'Non-water Surface'
                  : 'ไม่ใช่ผิวน้ำ'}
              </strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-emerald-300">NDVI (Vegetation Vigour)</span>
              <span className="text-lg font-extrabold font-mono text-white">{ndvi}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              (NIR - Red) / (NIR + Red) →{' '}
              <strong className={ndvi > 0.4 ? 'text-emerald-400' : 'text-slate-300'}>
                {ndvi > 0.4
                  ? lang === 'en'
                    ? 'Dense Green Canopy'
                    : 'พืชพรรณหนาแน่น'
                  : lang === 'en'
                  ? 'Sparse / Water / Bare'
                  : 'พืชพรรณต่ำ / น้ำ / ดินว่าง'}
              </strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-amber-300">NBR (Burn Scar Index)</span>
              <span className="text-lg font-extrabold font-mono text-white">{nbr}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              (NIR - SWIR2) / (NIR + SWIR2) →{' '}
              <strong className={nbr < -0.2 ? 'text-rose-400' : 'text-slate-300'}>
                {nbr < -0.2
                  ? lang === 'en'
                    ? 'Charcoal / Burn Scar Alert (< -0.20)'
                    : 'แจ้งเตือนรอยเผาไหม้/เถ้าถ่าน (< -0.20)'
                  : lang === 'en'
                  ? 'Unburned Surface'
                  : 'ไม่พบรอยเผาไหม้'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
