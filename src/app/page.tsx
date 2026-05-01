import Link from "next/link";
import { IconCamera, IconRobot, IconLocationPin, IconMap } from "@/lib/icons";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
          <div className="text-center stagger-children">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Hackathon Project 2026
            </div>

            {/* Logo and Title */}
            <div className="flex flex-col items-center justify-center mb-6">
              <img src="/logo.png" alt="TITIK Logo" className="w-32 h-32 md:w-40 md:h-40 object-contain mb-8 animate-float" />
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
                <span className="gradient-text">TITIK</span>
                <br />
                <span className="text-white text-3xl sm:text-5xl">
                  Temukan. Identifikasi. Tandai. Informasikan. Kirimkan.
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 mb-12 leading-relaxed">
              Sistem pemetaan &amp; pelaporan sampah ilegal berbasis AI.
              <br className="hidden sm:block" />
              Ambil foto, biarkan AI menganalisis, dan tandai di peta.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/report"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all animate-pulse-glow"
              >
                <IconCamera size={22} className="text-white" />
                Laporkan Sampah
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/80 border border-slate-700 text-white font-bold text-lg rounded-2xl hover:bg-slate-700/80 hover:border-slate-600 transition-all"
              >
                <IconMap size={22} className="text-white" />
                Lihat Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-4">
            Cara Kerja
          </h2>
          <p className="text-center text-slate-400 mb-16 max-w-xl mx-auto">
            Tiga langkah mudah untuk melaporkan sampah ilegal di sekitarmu
          </p>

          <div className="grid sm:grid-cols-3 gap-8 stagger-children">
            {[
              {
                step: "01",
                icon: <IconCamera size={40} className="text-emerald-400" />,
                title: "Ambil Foto",
                desc: "Buka kamera dan foto langsung tumpukan sampah yang kamu temukan.",
                color: "emerald",
              },
              {
                step: "02",
                icon: <IconRobot size={40} className="text-cyan-400" />,
                title: "Analisis AI",
                desc: "Google Gemini AI akan mengklasifikasi jenis dan tingkat keparahan sampah.",
                color: "cyan",
              },
              {
                step: "03",
                icon: <IconLocationPin size={40} className="text-indigo-400" />,
                title: "Tandai di Peta",
                desc: "Lokasi otomatis terdeteksi GPS dan ditampilkan di dashboard peta interaktif.",
                color: "indigo",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative group glass-card rounded-2xl p-8 hover:border-emerald-500/30 transition-all duration-300"
              >
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {item.step}
                </div>
                {/* Icon */}
                <div className="mb-5 group-hover:animate-float">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4 sm:px-6 border-t border-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-8">
            Dibangun dengan teknologi modern
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Next.js",
              "Tailwind CSS",
              "Supabase",
              "Leaflet.js",
              "Google Gemini AI",
            ].map((tech) => (
              <span
                key={tech}
                className="px-5 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm font-medium hover:border-emerald-500/30 hover:text-emerald-400 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800 text-center text-slate-500 text-sm">
        <p>
          &copy; 2026 TITIK — Spatial Waste Mapping System | Built for Hackathon
        </p>
      </footer>
    </div>
  );
}
