'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

type Report = {
  id: string;
  image_url: string;
  location_detail: string;
  severity: 1 | 2 | 3;
  waste_type: string;
  created_at: string;
  status?: string; // Optional if we add it later
};

const severityLabels: Record<number, { label: string; bg: string; text: string }> = {
  1: { label: 'Ringan', bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-400' },
  2: { label: 'Sedang', bg: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-400' },
  3: { label: 'Berat', bg: 'bg-red-500/15 border-red-500/30', text: 'text-red-400' },
};

const wasteTypeLabels: Record<string, string> = {
  plastic: 'Plastik',
  organic: 'Organik',
  mixed: 'Campuran',
};

export default function ProfilePage() {
  const router = useRouter();
  const { email, role, isLoading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [fullName, setFullName] = useState<string>('Pengguna');

  // Protect route & Fetch user metadata
  useEffect(() => {
    if (!authLoading && !email) {
      router.push('/signin');
      return;
    }

    if (email) {
      // Get user metadata for full name
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.user_metadata?.full_name) {
          setFullName(data.user.user_metadata.full_name);
        }
      });
    }
  }, [email, authLoading, router]);

  // Fetch user reports via API (server-side, bypasses RLS)
  useEffect(() => {
    if (!email) return;

    const fetchReports = async () => {
      try {
        const res = await fetch(`/api/reports/user?email=${encodeURIComponent(email)}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);
        setReports(data.reports || []);
      } catch (err) {
        console.error('Failed to fetch user reports:', err);
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReports();
  }, [email]);

  if (authLoading || (email && loadingReports)) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <svg className="animate-spin h-8 w-8 text-emerald-400" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!email) return null; // Will redirect

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="glass-card rounded-3xl p-8 md:p-10 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-1 shrink-0 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-3xl font-bold text-white">
                {fullName.charAt(0).toUpperCase()}
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="text-3xl font-bold text-white">{fullName}</h1>
              <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {email}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-medium text-slate-300">
                  Role: <span className={role === 'admin' ? 'text-amber-400' : 'text-emerald-400'}>{role.toUpperCase()}</span>
                </span>
                <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-medium text-slate-300">
                  Bergabung: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-4 mt-6 md:mt-0">
              <div className="text-center bg-slate-800/50 border border-slate-700 rounded-2xl p-4 min-w-[100px]">
                <div className="text-3xl font-bold text-emerald-400 mb-1">{reports.length}</div>
                <div className="text-xs text-slate-500">Laporan<br/>Terkirim</div>
              </div>
            </div>
          </div>
        </div>

        {/* Report History */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Riwayat Laporan Saya
          </h2>

          {reports.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Belum ada laporan</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                Kamu belum pernah mengirimkan laporan sampah. Yuk, mulai berkontribusi menjaga kebersihan lingkungan!
              </p>
              <button
                onClick={() => router.push('/report')}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-white font-medium hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Buat Laporan Baru
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div key={report.id} className="glass-card rounded-2xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
                  {/* Image */}
                  <div className="aspect-[4/3] w-full relative overflow-hidden bg-slate-800">
                    <img 
                      src={report.image_url} 
                      alt="Laporan" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                    
                    {/* Date Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg text-xs font-medium text-slate-300 border border-slate-700/50">
                      {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-slate-300 line-clamp-2" title={report.location_detail || 'Lokasi tidak ada detail'}>
                          <svg className="w-4 h-4 inline-block mr-1 text-slate-500 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {report.location_detail || 'Lokasi tidak diketahui'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700/50">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${severityLabels[report.severity]?.bg} ${severityLabels[report.severity]?.text}`}>
                        {severityLabels[report.severity]?.label || 'Unknown'}
                      </span>
                      <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                        {wasteTypeLabels[report.waste_type] || report.waste_type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
