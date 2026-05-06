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
| **Supabase** (`@supabase/supabase-js`) | ^2.105.1 | Database (PostgreSQL) + Storage (images) + Auth |
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
│   │   ├── signin/page.tsx           # Halaman login utama (Supabase Auth + Admin)
│   │   ├── signup/page.tsx           # Halaman registrasi akun baru (Supabase Auth)
│   │   ├── forgot-password/page.tsx  # Halaman lupa password (kirim email reset)
│   │   ├── reset-password/page.tsx   # Halaman reset password (buat password baru)
│   │   ├── profile/page.tsx          # Halaman profil user + riwayat laporan
│   │   ├── login/page.tsx            # [Legacy] Halaman login lama
│   │   ├── admin/page.tsx            # Halaman admin panel
│   │   └── api/
│   │       ├── reports/
│   │       │   ├── route.ts          # GET (list) + POST (create report + AI classify)
│   │       │   ├── [id]/route.ts     # DELETE report by ID
│   │       │   └── user/route.ts     # GET laporan berdasarkan user_email
│   │       ├── auth/login/route.ts   # POST admin login (hardcoded creds, admin-only)
│   │       └── admin/auth/route.ts   # POST admin auth (env-based password)
│   ├── components/
│   │   ├── AdminDashboard.tsx        # Panel admin: tabel data, hapus laporan
│   │   ├── CameraCapture.tsx         # Komponen kamera (getUserMedia API)
│   │   ├── LoadingScreen.tsx         # Global loading screen (animasi truk + progress bar)
│   │   ├── MapDashboard.tsx          # Peta Leaflet + marker + choropleth
│   │   ├── MapWrapper.tsx            # Dynamic import wrapper (SSR-safe)
│   │   ├── Navbar.tsx                # Navigation bar (responsive, role-aware, profile link)
│   │   ├── Providers.tsx             # Client provider (AuthProvider + LoadingScreen)
│   │   └── ReportForm.tsx            # Form lengkap: kamera → GPS → submit → hasil AI
│   └── lib/
│       ├── auth-context.tsx          # React context + Supabase Auth sync (guest/user/admin)
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
| `/` | Server Component | Landing page (hero, cara kerja, tech stack, marquee) |
| `/report` | Server + Client | Form pelaporan: buka kamera → ambil foto → auto GPS → submit |
| `/dashboard` | Server + Client | Peta Leaflet interaktif dengan marker berwarna per severity |
| `/signin` | Client Component | Login utama — cek admin hardcoded dulu, lalu fallback ke Supabase Auth |
| `/signup` | Client Component | Registrasi akun baru via Supabase Auth |
| `/forgot-password` | Client Component | Input email untuk kirim link reset password |
| `/reset-password` | Client Component | Form password baru setelah klik link dari email |
| `/profile` | Client Component | Profil user: info akun, statistik, riwayat laporan pribadi |
| `/login` | Client Component | [Legacy] Login form lama, masih berfungsi |
| `/admin` | Server + Client | Admin panel: lihat semua laporan, hapus data |

---

## API Routes

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/reports` | `GET` | Ambil semua laporan, urut `created_at DESC` |
| `/api/reports` | `POST` | Buat laporan baru: upload image → Gemini AI classify → simpan ke DB (+ `user_email`) |
| `/api/reports/[id]` | `DELETE` | Hapus laporan berdasarkan ID |
| `/api/reports/user` | `GET` | Ambil laporan milik user tertentu (`?email=xxx`), server-side (bypass RLS) |
| `/api/auth/login` | `POST` | Cek kredensial admin hardcoded. Return `{ role: 'admin' }` jika cocok, 401 jika bukan |
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
| `location_detail` | TEXT | NULLABLE |
| `description` | TEXT | NULLABLE |
| `severity` | INTEGER | NOT NULL, CHECK (1, 2, 3) |
| `waste_type` | TEXT | NOT NULL, CHECK ('plastic', 'organic', 'mixed') |
| `confidence` | INTEGER | NOT NULL, DEFAULT 50, CHECK (0-100) |
| `user_email` | TEXT | NULLABLE — email user yang mengirim laporan |
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

Sistem autentikasi **hybrid** yang menggabungkan Supabase Auth untuk user publik dan hardcoded credentials untuk admin:

### Alur Login (Halaman `/signin`, satu pintu untuk semua)

1. User input email + password → klik Masuk
2. **Langkah 1**: Cek apakah kredensial cocok dengan admin hardcoded (`/api/auth/login`)
   - ✅ Cocok → set role `admin` via `sessionStorage`, redirect ke `/admin`
3. **Langkah 2**: Jika bukan admin → coba login via **Supabase Auth** (`signInWithPassword`)
   - ✅ Cocok → `onAuthStateChange` listener set role `user`, redirect ke `/`
   - ❌ Gagal → tampilkan error

### State Management (`auth-context.tsx`)

- **Provider**: `AuthProvider` wraps seluruh app via `Providers.tsx`
- **Sumber state**:
  - Admin → `sessionStorage` (`titik_role`, `titik_email`)
  - User → `supabase.auth.getSession()` + `onAuthStateChange` listener
- **Roles**: `guest` | `user` | `admin`
- **Logout**: Bersihkan `sessionStorage` + `supabase.auth.signOut()`

### Admin Credentials (hardcoded di `api/auth/login/route.ts`)

| Email | Password |
|-------|----------|
| `sipalingnanda@gmail.com` | `dickyganteng77` |
| `admintitik@gmail.com` | `akuadmin123` |

### Supabase Auth Configuration

- **Confirm Email**: Dimatikan (untuk kemudahan demo)
- **Custom SMTP**: Gmail (`sekawanpapat.umkm@gmail.com` / App Password: `twtd fbra mgem iaic`)
  - Digunakan untuk pengiriman email reset password agar menghindari rate limit Supabase
- **Site URL**: `https://titik-demo.vercel.app`
- **Redirect URLs**: `https://titik-demo.vercel.app/reset-password`

### Guest Access

- Tidak perlu login untuk mengakses `/`, `/report`, `/dashboard`
- Link "Lanjutkan tanpa login" tersedia di halaman `/signin`

---

## User Profile (`/profile`)

- **Route protection**: Redirect ke `/signin` jika belum login
- **Info yang ditampilkan**: Avatar (inisial nama), nama lengkap, email, role, tanggal bergabung
- **Riwayat laporan**: Fetch via `/api/reports/user?email=xxx` (server-side, bypass RLS)
  - Ditampilkan sebagai card gallery dengan foto, severity, jenis sampah, lokasi, tanggal
  - Jika belum ada laporan → tampilkan CTA "Buat Laporan Baru"
- **Navbar**: Saat user login, email di navbar menjadi link ke `/profile` (desktop + mobile)

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
   - Simpan hasil (severity, waste_type, confidence, **user_email**) ke tabel `reports`
7. Hasil AI ditampilkan ke user
8. Tombol aksi:
   - "Lapor Lagi" → reset form
   - "Lihat Profil" (jika login) / "Lihat Peta" (jika guest)

---

## Loading Screen

- **Komponen**: `LoadingScreen.tsx` (global, berjalan sekali per session)
- **Animasi**: Truk sampah bergerak sinkron dengan progress bar
- **Efek**: Shimmer pada bar, fade-out saat selesai
- **Integrasi**: Di-wrap melalui `Providers.tsx`

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
- **Custom animations**: `fade-in`, `slide-up`, `float`, `pulse-glow`, `loading-fade-out`, `shimmer`, stagger children
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
- **Auth context + Supabase sync**: `auth-context.tsx` mendengarkan `onAuthStateChange` untuk sinkronisasi state
- **Server-side data fetch**: Laporan user di-fetch via API route (bukan langsung dari client) untuk bypass RLS
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

## Deployment

- **Platform**: Vercel (live di `https://titik-demo.vercel.app`)
- **Environment variables**: Set semua env vars di Vercel dashboard
- **Supabase**: Pastikan bucket `report-images` public + RLS policies aktif
- **Supabase Auth SMTP**: Konfigurasi custom SMTP di Supabase Dashboard → Auth → SMTP Settings
- **HTTPS required**: Camera API (`getUserMedia`) dan Geolocation hanya jalan di HTTPS/localhost
- **GeoJSON**: File statis di `public/data/`, served langsung

---

## Known Limitations

- MVP untuk hackathon, **bukan production system**
- Admin credentials hardcoded (tidak aman untuk production)
- RLS policies terlalu permissive (anon bisa delete)
- Tidak ada rate limiting pada API
- Camera hanya bisa digunakan via HTTPS atau localhost
- Choropleth data hanya untuk wilayah Jawa Timur
- Laporan lama (sebelum fitur `user_email`) tidak terkait ke akun manapun
- Email reset password bergantung pada custom SMTP Gmail (App Password)
