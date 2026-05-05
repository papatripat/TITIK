'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { IconWarning, IconCheckCircle } from '@/lib/icons';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
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
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('Email ini sudah terdaftar. Silakan masuk.');
        } else {
          setError(signUpError.message);
        }
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="glass-card rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <img src="/logo.png" alt="TITIK Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white">Buat Akun Baru</h1>
            <p className="text-slate-400 text-sm mt-1">
              Bergabung untuk melaporkan &amp; memetakan sampah ilegal
            </p>
          </div>

          {success ? (
            /* Success State */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <IconCheckCircle size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Pendaftaran Berhasil!</h2>
              <p className="text-slate-400 text-sm">
                Akun kamu telah berhasil dibuat. Silakan masuk dengan email dan password yang sudah didaftarkan.
              </p>
              <Link
                href="/signin"
                className="inline-block w-full py-3.5 rounded-xl text-white font-semibold text-center bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Masuk Sekarang
              </Link>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  required
                />
              </div>

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
                  placeholder="Alamat email"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min. 6 karakter)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  required
                  minLength={6}
                />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password"
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
                disabled={loading || !email || !password || !name || !confirmPassword}
                className={`w-full py-3.5 rounded-xl text-white font-semibold transition-all ${
                  loading || !email || !password || !name || !confirmPassword
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
                    Mendaftarkan...
                  </span>
                ) : (
                  'Daftar'
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          {!success && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-xs text-slate-500">sudah punya akun?</span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>

              <Link
                href="/signin"
                className="block w-full py-3 text-center bg-slate-800/80 border border-slate-700 rounded-xl text-slate-300 font-medium text-sm hover:bg-slate-700/80 hover:text-white transition-all"
              >
                Masuk ke akun
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
