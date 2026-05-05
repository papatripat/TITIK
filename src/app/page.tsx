import Link from "next/link";
import { IconCamera, IconRobot, IconLocationPin, IconMap, IconTrashBin } from "@/lib/icons";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center stagger-children">

            {/* Logo Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm font-medium mb-10">
              <img src="/logo.png" alt="TITIK Logo" className="w-5 h-5 object-contain" />
              <span className="tracking-wide uppercase text-xs font-bold text-emerald-400">Project TITIK</span>
            </div>

            {/* Giant Typography Header */}
            <h1 className="text-[3rem] sm:text-[5rem] md:text-[6.5rem] font-black tracking-tighter leading-[1.05] text-white mb-10">
              Your Small
              <span className="inline-block align-middle mx-3 sm:mx-6 w-28 h-12 sm:w-48 sm:h-24 rounded-full overflow-hidden border-[3px] sm:border-[4px] border-slate-800/80 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80"
                  alt="Beautiful Nature"
                  className="w-full h-full object-cover scale-110"
                />
              </span>
              Actions<br />
              Can Keep <span className="text-emerald-400">Indonesia</span><br />
              Clean & Green
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 mb-12 font-medium">
              Dispose of your waste properly and help us protect the environment.
              Snap a photo, let AI identify it, and map it for a better future.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center mb-20">
              <Link
                href="/report"
                className="inline-flex items-center justify-center px-10 py-5 bg-emerald-500 text-slate-950 font-black text-lg rounded-full shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all duration-300 uppercase tracking-wide"
              >
                Start Reporting
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-5 text-white font-bold text-lg hover:text-emerald-400 transition-colors uppercase tracking-wide group"
              >
                See How It Works
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
            </div>

            {/* Checklist Features */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pt-10 border-t border-slate-800/80 w-full max-w-5xl">
              {[
                "Protect Nature",
                "Dispose Properly",
                "AI-Powered Tracking",
                "Save The Earth"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-2 text-sm sm:text-base font-medium text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  {text}
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Marquee Garbage Images Section */}
      <section className="py-12 border-y border-slate-800/50 bg-slate-900/30 overflow-hidden relative">
        {/* Gradient Masks */}
        <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#0b1120] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#0b1120] to-transparent z-10 pointer-events-none" />

        <div className="flex w-[200%] animate-marquee hover:[animation-play-state:paused]">
          {[...Array(2)].map((_, groupIdx) => (
            <div key={groupIdx} className="flex w-1/2 justify-around gap-4 px-2">
              {[
                "/waste/1.png",
                "/waste/2.png",
                "/waste/3.png",
                "/waste/4.png",
                "/waste/5.png",
                "/waste/6.png"
              ].map((src, idx) => (
                <div key={`${groupIdx}-${idx}`} className="w-48 sm:w-64 shrink-0 aspect-[4/3] rounded-2xl overflow-hidden border border-slate-700/50 relative group/marquee cursor-pointer">
                  <img
                    src={src}
                    alt="Illegal Waste Dump"
                    className="w-full h-full object-cover grayscale opacity-70 group-hover/marquee:grayscale-0 group-hover/marquee:opacity-100 group-hover/marquee:scale-110 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover/marquee:opacity-100 transition-opacity duration-300 mix-blend-overlay" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-4">
            Cara Kerja
          </h2>
          <p className="text-center text-slate-400 mb-16 max-w-xl mx-auto">
            Empat langkah mudah untuk melaporkan dan mengatasi sampah ilegal
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
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
              {
                step: "04",
                icon: <IconTrashBin size={40} className="text-amber-400" />,
                title: "Tindak Lanjut",
                desc: "Petugas kebersihan sekitar akan datang ke lokasi untuk membersihkan tumpukan sampah.",
                color: "amber",
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


      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800 text-center text-slate-500 text-sm">
        <p>
          &copy; 2026 TITIK — Spatial Waste Mapping System | Built for Hackathon
        </p>
      </footer>
    </div>
  );
}
