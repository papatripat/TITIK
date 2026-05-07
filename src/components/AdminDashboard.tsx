'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { Report } from '@/lib/supabase';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  IconLogout,
  IconTrash,
  IconEye,
  IconChart,
  IconSearch,
  IconFilter,
  IconWarning,
  IconCheckCircle,
  IconRefresh,
  IconCalendar,
  IconTarget,
  IconLocationPin,
} from '@/lib/icons';

type SortField = 'created_at' | 'severity' | 'confidence' | 'waste_type';
type SortDir = 'asc' | 'desc';

export default function AdminDashboard() {
  const { role, email, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ─── Auth Guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && role !== 'admin') {
      router.replace('/login');
    }
  }, [role, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // ─── Data Fetching ───────────────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReports(data.reports || []);
    } catch (err) {
      console.error('Fetch error:', err);
      showNotification('error', 'Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === 'admin') {
      fetchReports();
    }
  }, [role, fetchReports]);

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReports((prev) => prev.filter((r) => r.id !== id));
      setDeleteId(null);
      showNotification('success', 'Laporan berhasil dihapus');
      router.refresh(); // Force Next.js router to clear client cache
    } catch (err) {
      console.error('Delete error:', err);
      showNotification('error', 'Gagal menghapus laporan');
    } finally {
      setDeleteLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // ─── Filtering & Sorting ────────────────────────────────────────────────────
  const filteredReports = reports
    .filter((r) => {
      if (filterSeverity !== null && r.severity !== filterSeverity) return false;
      if (filterType !== null && r.waste_type !== filterType) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          r.id.toLowerCase().includes(s) ||
          r.waste_type.toLowerCase().includes(s) ||
          r.latitude.toString().includes(s) ||
          r.longitude.toString().includes(s)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'created_at') {
        return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      }
      if (sortField === 'severity') return (a.severity - b.severity) * dir;
      if (sortField === 'confidence') return (a.confidence - b.confidence) * dir;
      if (sortField === 'waste_type') return a.waste_type.localeCompare(b.waste_type) * dir;
      return 0;
    });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const severityConfig: Record<number, { label: string; bg: string; text: string }> = {
    1: { label: 'Ringan', bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-400' },
    2: { label: 'Sedang', bg: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-400' },
    3: { label: 'Berat', bg: 'bg-red-500/15 border-red-500/30', text: 'text-red-400' },
  };

  const wasteTypeLabels: Record<string, string> = {
    plastic: 'Plastik',
    organic: 'Organik',
    mixed: 'Campuran',
  };

  const stats = {
    total: reports.length,
    severity1: reports.filter((r) => r.severity === 1).length,
    severity2: reports.filter((r) => r.severity === 2).length,
    severity3: reports.filter((r) => r.severity === 3).length,
  };

  // ─── Loading / Guard ─────────────────────────────────────────────────────────
  if (authLoading || role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium animate-slide-up ${
            notification.type === 'success'
              ? 'bg-emerald-500/90 text-white'
              : 'bg-red-500/90 text-white'
          }`}
        >
          {notification.type === 'success' ? <IconCheckCircle size={18} /> : <IconWarning size={18} />}
          {notification.message}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl max-h-[85vh] animate-fade-in">
            <img src={previewImage} alt="Preview laporan" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
            <button onClick={() => setPreviewImage(null)} className="absolute -top-3 -right-3 w-8 h-8 bg-slate-800 border border-slate-600 rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full animate-fade-in shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-red-500/15 flex items-center justify-center">
                <IconTrash size={28} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Hapus Laporan?</h3>
              <p className="text-slate-400 text-sm mt-1">Data yang dihapus tidak bisa dikembalikan</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} disabled={deleteLoading} className="flex-1 py-2.5 bg-slate-800 border border-slate-700 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors">
                Batal
              </button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleteLoading} className="flex-1 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                {deleteLoading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : <IconTrash size={16} />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Profile Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl" style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl uppercase">
            {email ? email.charAt(0) : 'A'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Profil Admin
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              <span className="text-emerald-400 font-medium">{email}</span> <span className="mx-1">•</span> <span className="capitalize">{role}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchReports} disabled={loading} className="p-2.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-slate-400 hover:text-white hover:border-emerald-500/50 transition-all" title="Refresh data">
            <IconRefresh size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all text-sm font-medium">
            <IconLogout size={16} />
            Keluar
          </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}>
        {/* Chart 1: Severity */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-6">
            Tingkat Keparahan Laporan
          </h3>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Ringan', value: stats.severity1, color: '#10b981' },
                    { name: 'Sedang', value: stats.severity2, color: '#eab308' },
                    { name: 'Berat', value: stats.severity3, color: '#ef4444' },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {[
                    { name: 'Ringan', value: stats.severity1, color: '#10b981' },
                    { name: 'Sedang', value: stats.severity2, color: '#eab308' },
                    { name: 'Berat', value: stats.severity3, color: '#ef4444' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0b1120', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Waste Type */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-6">
            Sebaran Jenis Sampah
          </h3>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart 
                data={[
                  { name: 'Plastik', value: reports.filter((r) => r.waste_type === 'plastic').length },
                  { name: 'Organik', value: reports.filter((r) => r.waste_type === 'organic').length },
                  { name: 'Campuran', value: reports.filter((r) => r.waste_type === 'mixed').length },
                ]} 
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  allowDecimals={false}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0b1120', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '8px', color: '#fff' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#06b6d4" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari berdasarkan ID, tipe, koordinat..." className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all" />
          </div>
          <div className="relative">
            <IconFilter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <select value={filterSeverity ?? ''} onChange={(e) => setFilterSeverity(e.target.value ? Number(e.target.value) : null)} className="pl-8 pr-8 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-emerald-500/50 transition-all">
              <option value="">Semua Severity</option>
              <option value="1">Ringan (1)</option>
              <option value="2">Sedang (2)</option>
              <option value="3">Berat (3)</option>
            </select>
          </div>
          <select value={filterType ?? ''} onChange={(e) => setFilterType(e.target.value || null)} className="px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-emerald-500/50 transition-all">
            <option value="">Semua Tipe</option>
            <option value="plastic">Plastik</option>
            <option value="organic">Organik</option>
            <option value="mixed">Campuran</option>
          </select>
          <select value={`${sortField}-${sortDir}`} onChange={(e) => { const [f, d] = e.target.value.split('-'); setSortField(f as SortField); setSortDir(d as SortDir); }} className="px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-emerald-500/50 transition-all">
            <option value="created_at-desc">Terbaru</option>
            <option value="created_at-asc">Terlama</option>
            <option value="severity-desc">Severity Tinggi</option>
            <option value="severity-asc">Severity Rendah</option>
            <option value="confidence-desc">Confidence Tinggi</option>
            <option value="confidence-asc">Confidence Rendah</option>
          </select>
        </div>
        <div className="mt-3 text-xs text-slate-500">Menampilkan {filteredReports.length} dari {reports.length} laporan</div>
      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-slate-400">Memuat data...</p>
          </div>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <IconSearch size={28} className="text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium">Tidak ada data ditemukan</p>
          <p className="text-slate-600 text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <div key={report.id} className="glass-card rounded-xl p-4 hover:border-slate-600 transition-all group">
              <div className="flex gap-4">
                {report.image_url && (
                  <button onClick={() => setPreviewImage(report.image_url)} className="shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-slate-700/50 hover:border-emerald-500/30 transition-all relative group/img">
                    <img src={report.image_url} alt="Foto sampah" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <IconEye size={18} className="text-white" />
                    </div>
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${severityConfig[report.severity]?.bg} ${severityConfig[report.severity]?.text}`}>
                        Lvl {report.severity} — {severityConfig[report.severity]?.label}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                        {wasteTypeLabels[report.waste_type] || report.waste_type}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                        <IconTarget size={11} className="mr-1" />{report.confidence}%
                      </span>
                    </div>
                    <button onClick={() => setDeleteId(report.id)} className="shrink-0 p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100" title="Hapus laporan">
                      <IconTrash size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1"><IconLocationPin size={12} />{report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}</span>
                    <span className="flex items-center gap-1"><IconCalendar size={12} />{formatDate(report.created_at)}</span>
                    <span className="font-mono text-slate-600 text-[10px]">ID: {report.id.slice(0, 8)}...</span>
                  </div>
                  {(report.location_detail || report.description) && (
                    <div className="bg-slate-800/80 rounded-lg p-3 text-sm border border-slate-700/50">
                      {report.location_detail && (
                        <div className="mb-2">
                          <strong className="text-slate-300 block text-xs uppercase tracking-wider mb-0.5">Detail Lokasi</strong>
                          <p className="text-slate-400">{report.location_detail}</p>
                        </div>
                      )}
                      {report.description && (
                        <div>
                          <strong className="text-slate-300 block text-xs uppercase tracking-wider mb-0.5">Kronologi</strong>
                          <p className="text-slate-400 italic">"{report.description}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
