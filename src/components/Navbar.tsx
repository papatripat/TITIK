'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { IconHome, IconCamera, IconMap, IconLogout } from '@/lib/icons';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, email, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: '/', label: 'Beranda', icon: <IconHome size={16} /> },
    { href: '/report', label: 'Lapor', icon: <IconCamera size={16} /> },
    { href: '/dashboard', label: 'Dashboard', icon: <IconMap size={16} /> },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logo.png" alt="TITIK Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              TITIK
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-emerald-500/15 text-emerald-400 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {/* Auth section */}
            {!isLoading && (
              <>
                {role === 'guest' ? (
                  <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-700">
                    <Link
                      href="/signin"
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        pathname === '/signin'
                          ? 'bg-emerald-500/15 text-emerald-400 shadow-inner'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      Masuk
                    </Link>
                    <Link
                      href="/signup"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                      Daftar
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-700">
                    {role === 'admin' && (
                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-400 cursor-default"
                        title="Status: Admin"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Admin
                      </div>
                    )}
                    <Link
                      href="/profile"
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        pathname === '/profile'
                          ? 'bg-slate-800 text-white shadow-inner'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span className="truncate max-w-[120px] hidden lg:inline">{email}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Keluar"
                    >
                      <IconLogout size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1 animate-fade-in">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  pathname === link.href
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {/* Mobile Auth */}
            {!isLoading && (
              <>
                {role === 'guest' ? (
                  <>
                    <Link
                      href="/signin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-emerald-400 bg-emerald-500/10"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      Masuk
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Daftar
                    </Link>
                  </>
                ) : (
                  <>
                    {role === 'admin' && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-amber-500/15 text-amber-400 cursor-default">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Status: Admin
                      </div>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                        pathname === '/profile'
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Profil Saya <span className="text-xs text-slate-500 truncate max-w-[150px]">({email})</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 w-full text-left"
                    >
                      <IconLogout size={16} />
                      Keluar
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
