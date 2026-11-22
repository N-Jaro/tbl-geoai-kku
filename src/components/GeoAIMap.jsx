import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Compass, AlertTriangle, Radio, Mountain } from 'lucide-react';

export default function GeoAIMap({ zones, lang, activeZoneId, onSelectZone }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const [basemap, setBasemap] = useState('osm'); // 'osm' | 'topo' | 'dark'
  const [showSarOverlay, setShowSarOverlay] = useState(true);
  const tileLayerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [16.53, 102.83],
      zoom: 10,
      scrollWheelZoom: true
    });

    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors | KKU GeoAI Lab'
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch basemap
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const urls = {
      osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      topo: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    };
    tileLayerRef.current.setUrl(urls[basemap] || urls.osm);
  }, [basemap]);

  // Render spatial zones
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    const group = layerGroupRef.current;
    group.clearLayers();

    zones.forEach((zone) => {
      const isSelected = zone.id === activeZoneId;

      if (showSarOverlay) {
        const circle = L.circle(zone.coords, {
          radius: zone.radius,
          color: zone.color,
          weight: isSelected ? 4 : 2,
          fillColor: zone.color,
          fillOpacity: isSelected ? 0.38 : 0.18,
          dashArray: isSelected ? null : '6, 6'
        });

        circle.on('click', () => {
          onSelectZone(zone.id);
        });

        circle.bindTooltip(
          `<div style="font-weight:700;font-size:12px;">${zone.name[lang]}</div>
           <div style="font-size:11px;color:#475569;">${zone.sarVvDb}</div>`,
          { sticky: true }
        );

        circle.addTo(group);
      }

      // Center marker badge
      const badgeIcon = L.divIcon({
        className: 'custom-geoai-pin',
        html: `<div style="
          background:${isSelected ? '#A73B24' : '#0f172a'};
          color:white;
          padding:4px 8px;
          border-radius:9999px;
          font-size:11px;
          font-weight:700;
          white-space:nowrap;
          border:2px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,0.35);
          transform:translate(-50%, -50%);
          cursor:pointer;
        ">${zone.name[lang].split(':')[0]}</div>`,
        iconSize: [60, 24]
      });

      const marker = L.marker(zone.coords, { icon: badgeIcon });
      marker.on('click', () => onSelectZone(zone.id));
      marker.addTo(group);
    });
  }, [zones, lang, activeZoneId, showSarOverlay, onSelectZone]);

  // Pan to active zone when selected
  useEffect(() => {
    if (!mapInstanceRef.current || !activeZoneId) return;
    const target = zones.find((z) => z.id === activeZoneId);
    if (target) {
      mapInstanceRef.current.flyTo(target.coords, 11, { duration: 0.8 });
    }
  }, [activeZoneId, zones]);

  const activeZone = zones.find((z) => z.id === activeZoneId) || zones[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Map Toolbar */}
      <div className="px-4 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          <span className="font-semibold text-sm">
            {lang === 'en'
              ? 'Khon Kaen / Chi-Nam Phong GeoAI Spatial Telemetry'
              : 'ระบบแผนที่วิเคราะห์ข้อมูลดาวเทียม GeoAI (จ.ขอนแก่น)'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setShowSarOverlay(!showSarOverlay)}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition ${
              showSarOverlay
                ? 'bg-kku-terracotta text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {lang === 'en' ? 'SAR / Anomaly Polygons' : 'ขอบเขตเรดาร์ SAR'}
          </button>

          <div className="flex rounded-lg overflow-hidden border border-slate-700">
            {[
              { id: 'osm', label: 'Street' },
              { id: 'topo', label: 'DEM Topo' },
              { id: 'dark', label: 'Dark SAR' }
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBasemap(b.id)}
                className={`px-2.5 py-1 font-medium transition ${
                  basemap === b.id
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12">
        {/* Map Canvas */}
        <div className="md:col-span-7 lg:col-span-8 relative min-h-[340px] md:min-h-[380px]">
          <div ref={mapContainerRef} className="w-full h-[340px] md:h-full min-h-[340px] md:min-h-[380px]" />
        </div>

        {/* Zone Telemetry Inspector */}
        <div className="md:col-span-5 lg:col-span-4 p-4 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {lang === 'en' ? 'Click a Zone to Inspect Telemetry' : 'คลิกเลือกโซนเพื่อตรวจค่าสัญญาณดาวเทียม'}
            </div>

            <div className="space-y-1.5 mb-4">
              {zones.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => onSelectZone(z.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between border ${
                    activeZone?.id === z.id
                      ? 'bg-kku-terracotta text-white border-kku-terracotta shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate">{z.name[lang]}</span>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                      activeZone?.id === z.id
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {z.risk}
                  </span>
                </button>
              ))}
            </div>

            {activeZone && (
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {activeZone.name[lang]}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {activeZone.coords[0].toFixed(3)}°N, {activeZone.coords[1].toFixed(3)}°E
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Radio className="w-3 h-3 text-sky-600" />
                      {lang === 'en' ? 'Sensor Signature' : 'สัญญาณดาวเทียม'}
                    </div>
                    <div className="font-semibold text-slate-800 mt-0.5">
                      {activeZone.sarVvDb}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Mountain className="w-3 h-3 text-emerald-600" />
                      {lang === 'en' ? 'Auxiliary / DEM' : 'ข้อมูลภูมิประเทศ'}
                    </div>
                    <div className="font-semibold text-slate-800 mt-0.5">
                      {activeZone.handMeters}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-xs text-amber-950 flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[11px] uppercase tracking-wide text-amber-800">
                      {lang === 'en'
                        ? `Cloud Cover: ${activeZone.cloudPct} — Field Diagnostic`
                        : `เมฆปกคลุม: ${activeZone.cloudPct} — ข้อสังเกตเชิงพื้นที่`}
                    </div>
                    <p className="mt-0.5 leading-relaxed text-amber-900">
                      {activeZone.notes[lang]}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
