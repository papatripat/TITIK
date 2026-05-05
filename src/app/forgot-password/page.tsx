'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { IconWarning, IconCheckCircle } from '@/lib/icons';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://titik-demo.vercel.app/reset-password',
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(true);
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
            <h1 className="text-2xl font-bold text-white">Lupa Password</h1>
            <p className="text-slate-400 text-sm mt-1">
              Masukkan email untuk menerima link reset password
            </p>
          </div>

          {success ? (
            /* Success State */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <IconCheckCircle size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Email Terkirim!</h2>
              <p className="text-slate-400 text-sm">
                Kami telah mengirimkan link reset password ke <span className="text-emerald-400 font-medium">{email}</span>. Silakan cek inbox atau folder spam kamu.
              </p>
              <Link
                href="/signin"
                className="inline-block w-full py-3 text-center bg-slate-800/80 border border-slate-700 rounded-xl text-slate-300 font-medium text-sm hover:bg-slate-700/80 hover:text-white transition-all mt-4"
              >
                Kembali ke halaman masuk
              </Link>
            </div>
          ) : (
            /* Forgot Password Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Alamat email yang terdaftar"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  autoFocus
                  required
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
                disabled={loading || !email}
                className={`w-full py-3.5 rounded-xl text-white font-semibold transition-all ${
                  loading || !email
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
                    Mengirim...
                  </span>
                ) : (
                  'Kirim Link Reset'
                )}
              </button>
            </form>
          )}

          {/* Back to Sign In */}
          {!success && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-xs text-slate-500">atau</span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>

              <Link
                href="/signin"
                className="block w-full py-3 text-center bg-slate-800/80 border border-slate-700 rounded-xl text-slate-300 font-medium text-sm hover:bg-slate-700/80 hover:text-white transition-all"
              >
                Kembali ke halaman masuk
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
