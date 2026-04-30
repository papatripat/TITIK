# 🗺️ TITIK — Spatial Waste Mapping & Reporting System

<p align="center">
  <strong>Temukan. Identifikasi. Tandai.</strong><br>
  Sistem pemetaan & pelaporan sampah ilegal berbasis AI
</p>

---

## 📖 Deskripsi

**TITIK** adalah aplikasi web mobile-first untuk melaporkan sampah ilegal. Pengguna cukup mengambil foto langsung dari kamera, dan AI (Google Gemini) akan menganalisis jenis serta tingkat keparahan sampah. Semua laporan ditampilkan di dashboard peta interaktif dengan marker berwarna.

## ✨ Fitur Utama

- 📸 **Laporan Sampah** — Ambil foto langsung dari kamera (bukan upload gallery)
- 🤖 **Klasifikasi AI** — Google Gemini menganalisis severity dan jenis sampah
- 📍 **Auto GPS** — Lokasi terdeteksi otomatis via browser
- 🗺️ **Dashboard Peta** — Leaflet.js dengan marker berwarna (hijau/kuning/merah)
- 🔄 **Auto-refresh** — Peta diperbarui otomatis setiap 30 detik

## 🏗️ Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| **Next.js** (App Router) | Framework frontend & API |
| **Tailwind CSS** | Styling |
| **Supabase** | Database & Storage |
| **Leaflet.js** | Peta interaktif |
| **Google Gemini AI** | Klasifikasi sampah |

## 🚀 Setup & Jalankan

### Prerequisites

- Node.js 18+
- npm
- Akun [Supabase](https://supabase.com)
- API Key [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone & Install

```bash
git clone <repo-url>
cd titik
npm install
```

### 2. Setup Supabase

1. Buat project baru di [Supabase Dashboard](https://supabase.com/dashboard)
2. Buka **SQL Editor** dan jalankan isi file `supabase-schema.sql`
3. Buat Storage bucket:
   - Buka **Storage** → **New Bucket**
   - Nama: `report-images`
   - Set sebagai **Public**
4. Tambahkan Storage policies:
   - Allow **INSERT** untuk role `anon` → policy: `true`
   - Allow **SELECT** untuk role `anon` → policy: `true`
5. Copy **Project URL** dan **Anon Key** dari **Settings → API**

### 3. Konfigurasi Environment

Copy file `.env.example` ke `.env.local` dan isi:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
GEMINI_API_KEY=AIzaSy...
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📱 Demo Flow

1. Buka halaman **Lapor** (`/report`)
2. Klik "Buka Kamera" → izinkan akses kamera
3. Ambil foto tumpukan sampah
4. Lokasi GPS terdeteksi otomatis
5. Klik "Kirim Laporan"
6. AI menganalisis → hasil ditampilkan (severity, jenis, confidence)
7. Data tersimpan ke database
8. Buka **Dashboard** (`/dashboard`) → marker muncul di peta

## 📦 Struktur Project

```
titik/
├── src/
│   ├── app/
│   │   ├── api/reports/    # API route (POST & GET)
│   │   ├── dashboard/      # Halaman peta
│   │   ├── report/         # Halaman pelaporan
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/
│   │   ├── CameraCapture.tsx   # Komponen kamera
│   │   ├── MapDashboard.tsx    # Komponen peta
│   │   ├── Navbar.tsx          # Navigation bar
│   │   └── ReportForm.tsx      # Form pelaporan
│   └── lib/
│       ├── gemini.ts       # Gemini AI config
│       └── supabase.ts     # Supabase client
├── supabase-schema.sql     # Database schema
├── .env.example            # Template env variables
└── README.md
```

## 🎨 Severity Legend

| Level | Warna | Deskripsi |
|-------|-------|-----------|
| 1 | 🟢 Hijau | Kecil / minimal |
| 2 | 🟡 Kuning | Sedang |
| 3 | 🔴 Merah | Besar / kritis |

## 📊 Data Model

```sql
reports
├── id          UUID (primary key)
├── image_url   TEXT
├── latitude    DOUBLE PRECISION
├── longitude   DOUBLE PRECISION
├── severity    INTEGER (1-3)
├── waste_type  TEXT (plastic/organic/mixed)
├── confidence  INTEGER (0-100)
└── created_at  TIMESTAMPTZ
```

## ⚠️ Catatan

- Aplikasi ini adalah **MVP untuk hackathon**, bukan production system
- Kamera hanya bisa digunakan via HTTPS atau localhost
- Pastikan izin kamera dan GPS aktif di browser

---

<p align="center">
  Built with ❤️ for Hackathon 2026
</p>
