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
          <h1 className="text-3xl font-bold text-white mb-2">
            🗺️ Dashboard Peta
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
