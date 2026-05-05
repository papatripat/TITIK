'use client';

import { useState, useEffect } from 'react';

export default function LoadingScreen({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if already loaded this session
    if (sessionStorage.getItem('titik_loaded')) {
      setIsVisible(false);
      setIsDone(true);
      return;
    }

    // Simulate loading progress 0 → 100
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 8 + 2; // increment 2-10 per tick
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        // Mark as loaded and begin fade-out
        sessionStorage.setItem('titik_loaded', '1');
        setTimeout(() => {
          setIsDone(true);
          setTimeout(() => setIsVisible(false), 500); // wait for fade-out animation
        }, 400);
      }
      setProgress(Math.min(current, 100));
    }, 80);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Loading Overlay */}
      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0b1120] ${
          isDone ? 'loading-fade-out' : ''
        }`}
      >
        {/* Background decorations (matching hero section) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-emerald-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-cyan-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
          {/* Logo */}
          <div className="mb-2 animate-fade-in">
            <img
              src="/logo.png"
              alt="TITIK Logo"
              className="w-20 h-20 object-contain animate-float"
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-1 animate-fade-in">
            TITIK
          </h1>
          <p className="text-slate-500 text-xs mb-10 animate-fade-in">
            Sistem Pemetaan Sampah Ilegal
          </p>

          {/* Animation Container */}
          <div className="w-full relative mb-4" style={{ height: '80px' }}>
            {/* Trash bin — static at the right end */}
            <div
              className="absolute bottom-1 right-0 z-20"
              style={{ width: '48px', height: '48px' }}
            >
              <img
                src="/sampah.webp"
                alt="Tong Sampah"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>

            {/* Truck — moves from left to right synced with progress */}
            <div
              className="absolute bottom-1 z-20 transition-all duration-200 ease-linear"
              style={{
                width: '72px',
                height: '48px',
                left: `calc(${Math.min(progress, 92)}% - ${progress > 50 ? 36 : 0}px)`,
              }}
            >
              <img
                src="/truck.webp"
                alt="Truk Sampah"
                className="w-full h-full object-contain drop-shadow-lg"
                style={{ transform: 'scaleX(-1)' }} // flip truck to face right
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
            <div
              className="h-full rounded-full loading-bar-shimmer transition-all duration-200 ease-linear relative"
              style={{ width: `${progress}%` }}
            >
              {/* Glow effect at the tip */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-400 rounded-full blur-md opacity-80" />
            </div>
          </div>

          {/* Percentage */}
          <div className="flex items-center justify-between w-full mt-3">
            <span className="text-xs text-slate-500">Memuat aplikasi...</span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Actual content (hidden behind loading screen) */}
      <div style={{ visibility: isDone ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </>
  );
}
