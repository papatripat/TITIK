'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import type { Report } from '@/lib/supabase';
import type { FeatureCollection, Feature, Polygon } from 'geojson';
import {
  countReportsPerDistrict,
  getZoneColor,
  getZoneOpacity,
  getZoneLabel,
  getZoneLabelColor,
  type DistrictProperties,
} from '@/lib/geo-helpers';

// Custom colored markers
function createColoredIcon(color: string) {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="#fff"/>
    </svg>`;
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -42],
  });
}

const markerIcons = {
  1: createColoredIcon('#22c55e'),
  2: createColoredIcon('#eab308'),
  3: createColoredIcon('#ef4444'),
};

// Auto-fit map bounds to markers
function FitBounds({ reports }: { reports: Report[] }) {
  const map = useMap();
  useEffect(() => {
    if (reports.length > 0) {
      const bounds = L.latLngBounds(reports.map((r) => [r.latitude, r.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [reports, map]);
  return null;
}

// Choropleth Layer
function ChoroplethLayer({
  reports,
  geoData,
}: {
  reports: Report[];
  geoData: FeatureCollection<Polygon, DistrictProperties>;
}) {
  const districtCounts = useMemo(
    () => countReportsPerDistrict(reports, geoData),
    [reports, geoData]
  );

  const styleFeature = useCallback(
    (feature: Feature<Polygon, DistrictProperties> | undefined) => {
      if (!feature) return {};
      const count = districtCounts[feature.properties.id] || 0;
      return {
        fillColor: getZoneColor(count),
        weight: 1.5,
        opacity: 0.8,
        color: '#475569',
        dashArray: count === 0 ? '3' : '',
        fillOpacity: getZoneOpacity(count),
      };
    },
    [districtCounts]
  );

  const onEachFeature = useCallback(
    (feature: Feature<Polygon, DistrictProperties>, layer: L.Layer) => {
      const count = districtCounts[feature.properties.id] || 0;
      const label = getZoneLabel(count);
      const labelColor = getZoneLabelColor(count);

      const rawName = feature.properties.name || '';
      const displayName = rawName.replace(/^(Kab\.|Kabupaten)\s+(Kota\s+.*)/i, '$2');

      (layer as L.Path).bindPopup(`
        <div style="font-family:system-ui;font-size:13px;min-width:160px;">
          <div style="font-weight:700;font-size:15px;margin-bottom:6px;color:#1e293b;">
            ${displayName}
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span style="width:10px;height:10px;border-radius:50%;background:${labelColor};display:inline-block;"></span>
            <span style="font-weight:600;color:${labelColor};">${label}</span>
          </div>
          <div style="color:#64748b;font-size:12px;">
            Jumlah laporan: <strong style="color:#1e293b;">${count}</strong>
          </div>
        </div>
      `);

      (layer as L.Path).on({
        mouseover: (e: L.LeafletMouseEvent) => {
          const target = e.target as L.Path;
          target.setStyle({ weight: 3, color: '#fff', fillOpacity: getZoneOpacity(count) + 0.15 });
          target.bringToFront();
        },
        mouseout: (e: L.LeafletMouseEvent) => {
          const target = e.target as L.Path;
          target.setStyle(styleFeature(feature));
        },
      });
    },
    [districtCounts, styleFeature]
  );

  return (
    <GeoJSON
      key={JSON.stringify(districtCounts)}
      data={geoData}
      style={styleFeature as L.StyleFunction}
      onEachFeature={onEachFeature as (feature: Feature, layer: L.Layer) => void}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function MapDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showChoropleth, setShowChoropleth] = useState(true);
  const [geoData, setGeoData] = useState<FeatureCollection<Polygon, DistrictProperties> | null>(null);

  // Load GeoJSON data for seluruh Jawa
  useEffect(() => {
    fetch('/data/jawa-kabkota.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error('Failed to load GeoJSON:', err));
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const response = await fetch(`/api/reports?_t=${Date.now()}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch');
      const rawReports = data.reports || [];
      
      // Process data to add jitter (offset) to overlapping reports
      const processedReports = rawReports.map((report: Report, _: any, array: Report[]) => {
        const identical = array.filter(
          r => r.latitude === report.latitude && r.longitude === report.longitude
        );
        
        if (identical.length > 1) {
          const identicalIndex = identical.findIndex(r => r.id === report.id);
          // If it's the first one, keep it in the center. Offset the rest in a circle.
          if (identicalIndex > 0) {
            const angle = (identicalIndex / (identical.length - 1)) * Math.PI * 2;
            const radius = 0.00015; // approx 15 meters
            return {
              ...report,
              latitude: report.latitude + Math.cos(angle) * radius,
              longitude: report.longitude + Math.sin(angle) * radius
            };
          }
        }
        return report;
      });

      setReports(processedReports);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, [fetchReports]);

  const severityLabels: Record<number, { label: string; color: string }> = {
    1: { label: 'Ringan', color: '#22c55e' },
    2: { label: 'Sedang', color: '#eab308' },
    3: { label: 'Berat', color: '#ef4444' },
  };

  const wasteTypeLabels: Record<string, string> = {
    plastic: 'Plastik',
    organic: 'Organik',
    mixed: 'Campuran',
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

  const stats = {
    total: reports.length,
    severity1: reports.filter((r) => r.severity === 1).length,
    severity2: reports.filter((r) => r.severity === 2).length,
    severity3: reports.filter((r) => r.severity === 3).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400">Memuat peta Pulau Jawa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-slate-400">Total</p>
        </div>
        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.severity1}</p>
          <p className="text-xs text-slate-400">Ringan</p>
        </div>
        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-center">
          <p className="text-2xl font-bold text-amber-400">{stats.severity2}</p>
          <p className="text-xs text-slate-400">Sedang</p>
        </div>
        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-center">
          <p className="text-2xl font-bold text-red-400">{stats.severity3}</p>
          <p className="text-xs text-slate-400">Berat</p>
        </div>
      </div>

      {/* Choropleth Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChoropleth(!showChoropleth)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${showChoropleth
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
              }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            Zona Wilayah Pulau Jawa
          </button>
          <span className="text-xs text-slate-600">
            {geoData ? `${geoData.features.length} kabupaten/kota` : 'Memuat...'}
          </span>
        </div>
        {showChoropleth && (
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block opacity-60" /> Aman</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500 inline-block opacity-60" /> Waspada</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-orange-500 inline-block opacity-60" /> Siaga</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block opacity-60" /> Kritis</span>
          </div>
        )}
      </div>

      {/* Map — centered on Pulau Jawa */}
      <div className="rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
        <MapContainer
          center={[-7.15, 110.14]}
          zoom={7}
          style={{ height: '65vh', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Choropleth zones for all Pulau Jawa */}
          {showChoropleth && geoData && <ChoroplethLayer reports={reports} geoData={geoData} />}
          {reports.length > 0 && <FitBounds reports={reports} />}
          {reports.map((report) => (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={markerIcons[report.severity as 1 | 2 | 3] || markerIcons[2]}
            >
              <Popup maxWidth={280} minWidth={200}>
                <div style={{ fontFamily: 'system-ui', fontSize: '13px' }}>
                  {report.image_url && (
                    <img src={report.image_url} alt="Foto sampah" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
                  )}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, color: '#fff', backgroundColor: severityLabels[report.severity]?.color || '#888' }}>
                      Severity {report.severity} — {severityLabels[report.severity]?.label}
                    </span>
                    <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, color: '#fff', backgroundColor: '#6366f1' }}>
                      {wasteTypeLabels[report.waste_type] || report.waste_type}
                    </span>
                  </div>
                  {(report.location_detail || report.description) && (
                    <div style={{ marginBottom: '8px', padding: '6px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>
                      {report.location_detail && (
                        <div style={{ marginBottom: report.description ? '4px' : '0' }}>
                          <strong style={{ color: '#334155', display: 'block' }}>Lokasi Detail:</strong>
                          <span style={{ color: '#475569' }}>{report.location_detail}</span>
                        </div>
                      )}
                      {report.description && (
                        <div>
                          <strong style={{ color: '#334155', display: 'block' }}>Kronologi:</strong>
                          <span style={{ color: '#475569', fontStyle: 'italic' }}>"{report.description}"</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ color: '#64748b', fontSize: '11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                      Confidence: {report.confidence}%
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      {formatDate(report.created_at)}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          {error}
        </div>
      )}

      {/* Legend & Last Updated */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Ringan</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Sedang</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Berat</span>
        </div>
        {lastUpdated && <span>Update: {lastUpdated.toLocaleTimeString('id-ID')}</span>}
      </div>
    </div>
  );
}
