import type { Metadata } from "next";
import ReportForm from "@/components/ReportForm";

export const metadata: Metadata = {
  title: "Laporkan Sampah - TITIK",
  description: "Ambil foto dan laporkan sampah ilegal di sekitarmu. AI akan menganalisis jenis dan tingkat keparahan sampah.",
};

export default function ReportPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">
            📸 Laporkan Sampah
          </h1>
          <p className="text-slate-400 text-sm">
            Ambil foto langsung dari kamera. AI akan menganalisis secara otomatis.
          </p>
        </div>

        {/* Form */}
        <div className="animate-slide-up">
          <ReportForm />
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 glass-card rounded-2xl animate-fade-in">
          <h3 className="text-sm font-semibold text-white mb-3">💡 Tips foto yang baik:</h3>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              Pastikan tumpukan sampah terlihat jelas
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              Ambil foto di pencahayaan yang cukup
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              Sertakan area sekitar untuk konteks ukuran
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              Izinkan akses kamera dan lokasi di browser
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
