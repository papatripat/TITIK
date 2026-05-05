'use client';

import { useState, useEffect } from 'react';
import CameraCapture from './CameraCapture';
import { useAuth } from '@/lib/auth-context';

type ClassificationResult = {
  severity: 1 | 2 | 3;
  waste_type: string;
  confidence: number;
};

export default function ReportForm() {
  const { email } = useAuth();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Mendeteksi lokasi...');
  const [locationDetail, setLocationDetail] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'capture' | 'submitting' | 'result'>('capture');

  // Auto-detect GPS location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation tidak didukung browser ini');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus('Lokasi terdeteksi');
      },
      (err) => {
        console.error('GPS error:', err);
        setLocationStatus('Gagal mendapatkan lokasi. Izinkan akses GPS.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  const handleSubmit = async () => {
    if (!capturedImage) {
      setError('Silakan ambil foto terlebih dahulu');
      return;
    }

    if (!location) {
      setError('Lokasi GPS belum terdeteksi. Mohon izinkan akses lokasi.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStep('submitting');

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: capturedImage,
          latitude: location.lat,
          longitude: location.lng,
          location_detail: locationDetail,
          description: description,
          user_email: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim laporan');
      }

      setResult(data.classification);
      setStep('result');
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setStep('capture');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setLocationDetail('');
    setDescription('');
    setResult(null);
    setError(null);
    setStep('capture');
  };

  const severityLabels: Record<number, { label: string; color: string; bg: string }> = {
    1: { label: 'Ringan', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
    2: { label: 'Sedang', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
    3: { label: 'Berat', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' },
  };

  const wasteTypeLabels: Record<string, string> = {
    plastic: 'Plastik',
    organic: 'Organik',
    mixed: 'Campuran',
  };

  // Waste type icons as SVG
  const wasteTypeIcon = (type: string) => {
    if (type === 'plastic') {
      return (
        <svg className="w-8 h-8 text-blue-400 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.5 7.5l4.5-5 4.5 5" />
          <path d="M12 2.5v10" />
          <path d="M18.5 14l1.5 5.5-5.5 1.5" />
          <path d="M20 19.5l-8-5" />
          <path d="M5.5 14L4 19.5 9.5 21" />
          <path d="M4 19.5l8-5" />
        </svg>
      );
    }
    if (type === 'organic') {
      return (
        <svg className="w-8 h-8 text-green-400 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 019.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-3.8 10-10 10z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-slate-400 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    );
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 text-sm">
        {['Foto', 'Analisis AI', 'Hasil'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i === 0 && step === 'capture'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : i === 1 && step === 'submitting'
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 animate-pulse'
                  : i === 2 && step === 'result'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-700 text-slate-400'
                }`}
            >
              {i + 1}
            </div>
            <span className={`hidden sm:inline ${(i === 0 && step === 'capture') || (i === 1 && step === 'submitting') || (i === 2 && step === 'result')
              ? 'text-white'
              : 'text-slate-500'
              }`}>
              {label}
            </span>
            {i < 2 && <div className="w-8 h-px bg-slate-700" />}
          </div>
        ))}
      </div>

      {/* Capture / Result View */}
      {step !== 'result' ? (
        <>
          <CameraCapture
            onCapture={setCapturedImage}
            onClear={() => setCapturedImage(null)}
            capturedImage={capturedImage}
          />

          {/* Location Status */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${location
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
            {location ? (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
            )}
            <div>
              <p className="text-sm font-medium">{locationStatus}</p>
              {location && (
                <p className="text-xs opacity-70">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-3">
            <div>
              <label htmlFor="locationDetail" className="block text-sm font-medium text-slate-300 mb-1">
                Detail Lokasi <span className="text-slate-500 font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                id="locationDetail"
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
                placeholder="Cth: Depan Indomaret, dekat tiang listrik"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
                Kronologi / Keterangan <span className="text-slate-500 font-normal">(Opsional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cth: Sudah seminggu tidak diangkut, bau menyengat"
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!capturedImage || !location || isSubmitting}
            className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all ${capturedImage && location && !isSubmitting
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99]'
              : 'bg-slate-700 cursor-not-allowed opacity-60'
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menganalisis dengan AI...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
                  <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                </svg>
                Kirim Laporan
              </span>
            )}
          </button>
        </>
      ) : (
        /* Result View */
        result && (
          <div className="space-y-4 animate-fade-in">
            {/* Success Header */}
            <div className="text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Laporan Terkirim!</h3>
              <p className="text-slate-400 text-sm mt-1">AI telah menganalisis sampah yang dilaporkan</p>
            </div>

            {/* Classification Result */}
            <div className="grid grid-cols-3 gap-3">
              <div className={`p-4 rounded-xl border text-center ${severityLabels[result.severity].bg}`}>
                <p className="text-xs text-slate-400 mb-1">Severity</p>
                <p className={`text-2xl font-bold ${severityLabels[result.severity].color}`}>
                  {result.severity}
                </p>
                <p className={`text-xs font-medium ${severityLabels[result.severity].color}`}>
                  {severityLabels[result.severity].label}
                </p>
              </div>
              <div className="p-4 rounded-xl border bg-slate-800/50 border-slate-700/50 text-center">
                <p className="text-xs text-slate-400 mb-1">Jenis</p>
                <div className="py-1">
                  {wasteTypeIcon(result.waste_type)}
                </div>
                <p className="text-xs font-medium text-white">
                  {wasteTypeLabels[result.waste_type] || result.waste_type}
                </p>
              </div>
              <div className="p-4 rounded-xl border bg-cyan-500/10 border-cyan-500/20 text-center">
                <p className="text-xs text-slate-400 mb-1">Confidence</p>
                <p className="text-2xl font-bold text-cyan-400">{result.confidence}%</p>
                <p className="text-xs font-medium text-cyan-400">AI Score</p>
              </div>
            </div>

            {/* Preview */}
            {capturedImage && (
              <div className="rounded-xl overflow-hidden border border-slate-700/50">
                <img src={capturedImage} alt="Foto laporan" className="w-full aspect-video object-cover" />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                Lapor Lagi
              </button>
              <a
                href="/dashboard"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-slate-700 text-white font-semibold rounded-xl text-center hover:bg-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                  <line x1="8" y1="2" x2="8" y2="18" />
                  <line x1="16" y1="6" x2="16" y2="22" />
                </svg>
                Lihat Peta
              </a>
            </div>
          </div>
        )
      )}
    </div>
  );
}
