'use client';

import { useState, useEffect } from 'react';
import CameraCapture from './CameraCapture';

type ClassificationResult = {
  severity: 1 | 2 | 3;
  waste_type: string;
  confidence: number;
};

export default function ReportForm() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Mendeteksi lokasi...');
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
        setLocationStatus('Lokasi terdeteksi ✓');
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

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 text-sm">
        {['Foto', 'Analisis AI', 'Hasil'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i === 0 && step === 'capture'
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
            <span className={`hidden sm:inline ${
              (i === 0 && step === 'capture') || (i === 1 && step === 'submitting') || (i === 2 && step === 'result')
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
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${
            location
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <span className="text-lg">{location ? '📍' : '⏳'}</span>
            <div>
              <p className="text-sm font-medium">{locationStatus}</p>
              {location && (
                <p className="text-xs opacity-70">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!capturedImage || !location || isSubmitting}
            className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all ${
              capturedImage && location && !isSubmitting
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
              '🚀 Kirim Laporan'
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
                <span className="text-3xl">✅</span>
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
                <p className="text-2xl">
                  {result.waste_type === 'plastic' ? '♻️' : result.waste_type === 'organic' ? '🍂' : '🗑️'}
                </p>
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
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                📸 Lapor Lagi
              </button>
              <a
                href="/dashboard"
                className="flex-1 py-3 bg-slate-700 text-white font-semibold rounded-xl text-center hover:bg-slate-600 transition-colors"
              >
                🗺️ Lihat Peta
              </a>
            </div>
          </div>
        )
      )}
    </div>
  );
}
