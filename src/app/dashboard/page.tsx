import type { Metadata } from "next";
import MapWrapper from "@/components/MapWrapper";

export const metadata: Metadata = {
  title: "Dashboard Peta - TITIK",
  description: "Lihat peta interaktif laporan sampah ilegal. Monitor lokasi dan tingkat keparahan secara real-time.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            Dashboard Peta
          </h1>
          <p className="text-slate-400 text-sm">
            Monitor seluruh laporan sampah ilegal secara real-time. Peta diperbarui otomatis setiap 30 detik.
          </p>
        </div>

        {/* Map */}
        <div className="animate-slide-up">
          <MapWrapper />
        </div>
      </div>
    </div>
  );
}
