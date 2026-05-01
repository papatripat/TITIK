'use client';

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import type { Report } from '@/lib/supabase';

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
  1: createColoredIcon('#22c55e'), // green
  2: createColoredIcon('#eab308'), // yellow
  3: createColoredIcon('#ef4444'), // red
};

// Component to auto-fit map bounds
function FitBounds({ reports }: { reports: Report[] }) {
  const map = useMap();

  useEffect(() => {
    if (reports.length > 0) {
      const bounds = L.latLngBounds(
        reports.map((r) => [r.latitude, r.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [reports, map]);

  return null;
}

export default function MapDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      const response = await fetch('/api/reports', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch');
      }

      setReports(data.reports || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling every 30s
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // Stats
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
          <p className="text-slate-400">Memuat peta...</p>
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

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
        <MapContainer
          center={[-6.2, 106.8]}
          zoom={11}
          style={{ height: '60vh', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
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
                    <img
                      src={report.image_url}
                      alt="Foto sampah"
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '8px',
                      }}
                    />
                  )}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#fff',
                        backgroundColor: severityLabels[report.severity]?.color || '#888',
                      }}
                    >
                      Severity {report.severity} — {severityLabels[report.severity]?.label}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#fff',
                        backgroundColor: '#6366f1',
                      }}
                    >
                      {wasteTypeLabels[report.waste_type] || report.waste_type}
                    </span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '11px' }}>
                    <div>🎯 Confidence: {report.confidence}%</div>
                    <div>📅 {formatDate(report.created_at)}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Error & Status */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
          ⚠️ {error}
        </div>
      )}

      {/* Legend & Last Updated */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Ringan</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Sedang</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Berat</span>
        </div>
        {lastUpdated && (
          <span>Update: {lastUpdated.toLocaleTimeString('id-ID')}</span>
        )}
      </div>
    </div>
  );
}
