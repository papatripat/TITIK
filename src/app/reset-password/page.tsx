'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { IconWarning, IconCheckCircle, IconLock } from '@/lib/icons';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsReady(true);
      }
    });

    // Also check if there's already a session (user clicked the link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        // Sign out after password reset
        await supabase.auth.signOut();
      }
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="glass-card rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <img src="/logo.png" alt="TITIK Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <p className="text-slate-400 text-sm mt-1">
              Masukkan password baru untuk akunmu
            </p>
          </div>

          {success ? (
            /* Success State */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <IconCheckCircle size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Password Berhasil Diubah!</h2>
              <p className="text-slate-400 text-sm">
                Password kamu telah berhasil direset. Silakan masuk dengan password baru.
              </p>
              <Link
                href="/signin"
                className="inline-block w-full py-3.5 rounded-xl text-white font-semibold text-center bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Masuk Sekarang
              </Link>
            </div>
          ) : !isReady ? (
            /* Waiting for token / invalid access */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-amber-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white">Memverifikasi Link...</h2>
              <p className="text-slate-400 text-sm">
                Sedang memverifikasi link reset password. Jika halaman ini tidak berubah dalam beberapa detik, link mungkin sudah kedaluwarsa.
              </p>
              <Link
                href="/forgot-password"
                className="inline-block w-full py-3 text-center bg-slate-800/80 border border-slate-700 rounded-xl text-slate-300 font-medium text-sm hover:bg-slate-700/80 hover:text-white transition-all mt-4"
              >
                Kirim ulang link reset
              </Link>
            </div>
          ) : (
            /* Reset Password Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="relative">
                <IconLock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password baru (min. 6 karakter)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  autoFocus
                  required
                  minLength={6}
                />
              </div>

              {/* Confirm New Password */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password baru"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  required
                  minLength={6}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <IconWarning size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className={`w-full py-3.5 rounded-xl text-white font-semibold transition-all ${
                  loading || !password || !confirmPassword
                    ? 'bg-slate-700 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Menyimpan...
                  </span>
                ) : (
                  'Simpan Password Baru'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
