@AGENTS.md

# TITIK — Spatial Waste Mapping & Reporting System

> **T**emukan. **I**dentifikasi. **T**andai. **I**nformasikan. **K**irimkan.

Aplikasi web mobile-first untuk melaporkan dan memetakan sampah ilegal menggunakan AI. Dibangun untuk Hackathon 2026.

---

## Tech Stack

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Next.js** (App Router) | 16.2.4 | Framework full-stack (frontend + API routes) |
| **React** | 19.2.4 | UI library |
| **TypeScript** | ^5 | Type safety |
| **Tailwind CSS** | v4 (via `@tailwindcss/postcss`) | Styling (utility-first) |
| **Supabase** (`@supabase/supabase-js`) | ^2.105.1 | Database (PostgreSQL) + Storage (images) |
| **Google Gemini AI** (`@google/generative-ai`) | ^0.24.1 | Klasifikasi sampah dari foto (model: `gemini-2.0-flash`) |
| **Leaflet.js** (`react-leaflet`) | ^5.0.0 | Peta interaktif untuk dashboard |
| **Geist Font** | (via `next/font/google`) | Tipografi |

---

## Environment Variables

File: `.env.local` (lihat `.env.example` sebagai template)

```
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anonymous key
GEMINI_API_KEY=                 # Google AI Studio API key
ADMIN_PASSWORD=                 # Password admin panel (fallback: titik-admin-2026)
```

> **PENTING**: `NEXT_PUBLIC_*` = client-accessible. `GEMINI_API_KEY` dan `ADMIN_PASSWORD` = server-only.

---

## Struktur Project

```
titik/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (Geist font, Navbar, Providers)
│   │   ├── page.tsx                  # Home / landing page
│   │   ├── globals.css               # Global styles + custom animations
│   │   ├── report/page.tsx           # Halaman pelaporan sampah
│   │   ├── dashboard/page.tsx        # Halaman peta dashboard
│   │   ├── login/page.tsx            # Halaman login (client component)
│   │   ├── admin/page.tsx            # Halaman admin panel
│   │   └── api/
│   │       ├── reports/
│   │       │   ├── route.ts          # GET (list) + POST (create report + AI classify)
│   │       │   └── [id]/route.ts     # DELETE report by ID
│   │       ├── auth/login/route.ts   # POST login (hardcoded creds for demo)
│   │       └── admin/auth/route.ts   # POST admin auth (env-based password)
│   ├── components/
│   │   ├── AdminDashboard.tsx        # Panel admin: tabel data, hapus laporan
│   │   ├── CameraCapture.tsx         # Komponen kamera (getUserMedia API)
│   │   ├── MapDashboard.tsx          # Peta Leaflet + marker + choropleth
│   │   ├── MapWrapper.tsx            # Dynamic import wrapper (SSR-safe)
│   │   ├── Navbar.tsx                # Navigation bar (responsive, role-aware)
│   │   ├── Providers.tsx             # Client provider (AuthProvider)
│   │   └── ReportForm.tsx            # Form lengkap: kamera → GPS → submit → hasil AI
│   └── lib/
│       ├── auth-context.tsx          # React context untuk auth state (guest/user/admin)
│       ├── gemini.ts                 # Gemini AI client + classifyWaste()
│       ├── geo-helpers.ts            # Point-in-polygon, choropleth color utils
│       ├── icons.tsx                 # Custom SVG icon components
│       └── supabase.ts              # Supabase client + Report type
├── public/
│   ├── logo.png                      # Logo TITIK
│   └── data/
│       └── jatim-kabkota.geojson     # GeoJSON wilayah Jawa Timur (choropleth)
├── supabase-schema.sql               # Database schema + RLS policies
├── .env.example                      # Template environment variables
├── next.config.ts                    # Next.js config (minimal)
├── tsconfig.json                     # TypeScript config (path alias @/* → ./src/*)
├── postcss.config.mjs                # PostCSS config (Tailwind v4)
└── package.json
```

---

## Halaman & Routes

| Route | Tipe | Deskripsi |
|-------|------|-----------|
| `/` | Server Component | Landing page (hero, cara kerja, tech stack) |
| `/report` | Server + Client | Form pelaporan: buka kamera → ambil foto → auto GPS → submit |
| `/dashboard` | Server + Client | Peta Leaflet interaktif dengan marker berwarna per severity |
| `/login` | Client Component | Login form (email + password) |
| `/admin` | Server + Client | Admin panel: lihat semua laporan, hapus data |

---

## API Routes

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/reports` | `GET` | Ambil semua laporan, urut `created_at DESC` |
| `/api/reports` | `POST` | Buat laporan baru: upload image → Gemini AI classify → simpan ke DB |
| `/api/reports/[id]` | `DELETE` | Hapus laporan berdasarkan ID |
| `/api/auth/login` | `POST` | Login: cek kredensial, return role (`admin`/`user`) |
| `/api/admin/auth` | `POST` | Legacy admin auth (password-based, env variable) |

---

## Database (Supabase)

### Tabel: `reports`

| Kolom | Tipe | Constraint |
|-------|------|------------|
| `id` | UUID | PK, auto-generated |
| `image_url` | TEXT | NOT NULL |
| `latitude` | DOUBLE PRECISION | NOT NULL |
| `longitude` | DOUBLE PRECISION | NOT NULL |
| `severity` | INTEGER | NOT NULL, CHECK (1, 2, 3) |
| `waste_type` | TEXT | NOT NULL, CHECK ('plastic', 'organic', 'mixed') |
| `confidence` | INTEGER | NOT NULL, DEFAULT 50, CHECK (0-100) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

### RLS Policies (Hackathon Demo)
- **SELECT**: public (anon) → `true`
- **INSERT**: public (anon) → `true`
- **DELETE**: public (anon) → `true`

### Storage Bucket
- Nama: `report-images`
- Visibility: **Public**
- Policies: INSERT + SELECT untuk role `anon`

---

## Authentication System

Autentikasi **sederhana** untuk demo hackathon (bukan production-grade):

- **State management**: React Context (`auth-context.tsx`) + `sessionStorage`
- **Roles**: `guest` | `user` | `admin`
- **Admin credentials** (hardcoded di `api/auth/login/route.ts`):
  - Email: `sipalingnanda@gmail.com`
  - Password: `dickyganteng77`
- **User login**: Email valid + password ≥ 4 karakter → role `user`
- **Guest**: Tidak perlu login, bisa akses `/`, `/report`, `/dashboard`

> ⚠️ Ini bukan sistem auth yang aman. Untuk production, gunakan NextAuth.js atau Supabase Auth.

---

## Flow Pelaporan

1. User buka `/report`
2. Klik tombol kamera → `CameraCapture.tsx` buka `navigator.mediaDevices.getUserMedia()`
3. User ambil foto → base64 disimpan di state
4. GPS otomatis via `navigator.geolocation.getCurrentPosition()`
5. Klik "Kirim Laporan"
6. API `POST /api/reports`:
   - Upload base64 image ke Supabase Storage (`report-images`)
   - Kirim ke **Gemini AI** (`gemini-2.0-flash`) untuk klasifikasi
   - Simpan hasil (severity, waste_type, confidence) ke tabel `reports`
7. Hasil AI ditampilkan ke user

---

## Severity Legend

| Level | Warna | Deskripsi |
|-------|-------|-----------|
| 1 | 🟢 Hijau | Kecil / minimal |
| 2 | 🟡 Kuning | Sedang |
| 3 | 🔴 Merah | Besar / kritis |

---

## Styling & Design System

- **Dark theme**: Background `#0b1120`, text `#e2e8f0`
- **Color palette**: Emerald (`#10b981`) + Cyan (`#06b6d4`) gradient
- **Glass morphism**: `.glass-card` (frosted glass effect)
- **Custom animations**: `fade-in`, `slide-up`, `float`, `pulse-glow`, stagger children
- **Custom scrollbar**: Styled via `::-webkit-scrollbar`
- **Gradient text**: `.gradient-text` (emerald → cyan)

---

## Peta Dashboard

- **Library**: Leaflet.js via `react-leaflet`
- **MapWrapper**: Dynamic import (`next/dynamic`, `ssr: false`) untuk menghindari SSR error
- **Marker warna**: Hijau/Kuning/Merah berdasarkan severity
- **Choropleth**: GeoJSON Jawa Timur (`jatim-kabkota.geojson`) + point-in-polygon
- **Auto-refresh**: Data diperbarui otomatis setiap 30 detik
- **Geo helpers**: Ray casting algorithm untuk point-in-polygon

---

## Conventions & Patterns

- **Path alias**: `@/*` → `./src/*`
- **Server vs Client**: Halaman utama = Server Component, interaktif = `'use client'`
- **API route config**: `export const dynamic = 'force-dynamic'` pada route yang butuh fresh data
- **Supabase client**: Singleton di `lib/supabase.ts` dengan graceful fallback saat env belum diset
- **Gemini fallback**: Jika AI gagal, return klasifikasi default (severity: 2, mixed, confidence: 50)
- **Icons**: Custom SVG components di `lib/icons.tsx` (tidak pakai library icon)

---

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Deployment Notes

- **Platform recommended**: Vercel (native Next.js support)
- **Environment variables**: Set semua env vars di dashboard hosting
- **Supabase**: Pastikan bucket `report-images` public + RLS policies aktif
- **HTTPS required**: Camera API (`getUserMedia`) dan Geolocation hanya jalan di HTTPS/localhost
- **GeoJSON**: File statis di `public/data/`, served langsung

---

## Known Limitations

- MVP untuk hackathon, **bukan production system**
- Auth hardcoded (tidak aman untuk production)
- RLS policies terlalu permissive (anon bisa delete)
- Tidak ada rate limiting pada API
- Camera hanya bisa digunakan via HTTPS atau localhost
- Choropleth data hanya untuk wilayah Jawa Timur
