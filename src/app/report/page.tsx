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
          <h1 className="text-3xl font-bold text-white mb-2 inline-flex items-center gap-3">
            <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Laporkan Sampah
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
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6M10 22h4" />
              <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
            </svg>
            Tips foto yang baik:
          </h3>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Pastikan tumpukan sampah terlihat jelas
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Ambil foto di pencahayaan yang cukup
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Sertakan area sekitar untuk konteks ukuran
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Izinkan akses kamera dan lokasi di browser
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
