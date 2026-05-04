# 🗺️ TITIK — Spatial Waste Mapping & Reporting System

<p align="center">
  <strong>Temukan. Identifikasi. Tandai. Infomasikan. Kirimkan.</strong><br>
  Sistem pemetaan & pelaporan sampah ilegal berbasis AI
</p>

<p align="center">
  🌐 <strong>Live Demo:</strong> <a href="https://titik-demo.vercel.app">https://titik-demo.vercel.app</a>
</p>

---

## 📖 Deskripsi

**TITIK** adalah aplikasi web mobile-first untuk melaporkan tumpukan sampah ilegal di lingkungan sekitar. Pengguna cukup mengambil foto langsung dari kamera smartphone mereka, kemudian AI (Google Gemini) akan secara otomatis menganalisis tingkat keparahan (severity) dan jenis sampah. Laporan tersebut kemudian akan divisualisasikan pada dashboard peta interaktif untuk memudahkan pemantauan dan penindakan.

---

## ✨ Fitur Utama

- 📸 **Laporan Cerdas** — Ambil foto langsung dari kamera (mencegah upload foto palsu dari galeri).
- 🤖 **Analisis AI Terintegrasi** — Memanfaatkan Google Gemini Vision untuk membedakan jenis sampah dan mengukur tingkat keparahan tumpukan secara otomatis.
- 📍 **Deteksi Lokasi Akurat** — Mengambil koordinat GPS secara real-time via browser.
- 🗺️ **Dashboard Peta Interaktif** — Dibangun dengan Leaflet.js, menampilkan marker laporan dengan warna (Hijau/Kuning/Merah) berdasarkan keparahan.
- 🔄 **Sinkronisasi Real-time** — Peta dan daftar laporan otomatis diperbarui.
- 🛡️ **Panel Admin** — Halaman khusus pengelola untuk melihat dan menghapus laporan yang sudah tidak sesuai.

---

## 🏗️ Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| **Next.js 14** (App Router) | Framework Frontend & API Routes |
| **Tailwind CSS** | Styling modern & responsif |
| **Supabase** | Database PostgreSQL & File Storage |
| **Leaflet.js / React Leaflet** | Visualisasi Peta |
| **Google Gemini AI** | Analisis dan klasifikasi gambar |

---

## 🚀 Panduan Instalasi (Langkah demi Langkah)

### 0. Persyaratan Sistem (Prerequisites)
Pastikan Anda sudah menginstal:
- **Node.js** (Versi 18 atau lebih baru)
- **npm** atau **yarn**
- Akun [Supabase](https://supabase.com) (Gratis)
- API Key [Google AI Studio](https://aistudio.google.com/apikey) (Gratis)

### 1. Clone & Install Dependencies
Buka terminal Anda dan jalankan perintah berikut:
```bash
git clone <https://github.com/papatripat/TITIK>
cd titik
npm install
```

### 2. Setup Database & Storage di Supabase
1. Login ke [Supabase Dashboard](https://supabase.com/dashboard) dan buat project baru.
2. **Setup Database:**
   - Buka menu **SQL Editor**.
   - Copy dan paste isi file `supabase-schema.sql` (yang ada di dalam folder project ini) ke dalam SQL Editor dan jalankan (Run). Ini akan membuat tabel `reports`.
3. **Setup Storage (Penyimpanan Foto):**
   - Buka menu **Storage** → klik **New Bucket**.
   - Beri nama bucket: `report-images`
   - **PENTING:** Centang opsi **"Public Bucket"** agar gambar bisa diakses oleh aplikasi.
4. **Atur Kebijakan Keamanan (Storage Policies):**
   - Di dalam bucket `report-images`, buat policy baru:
     - **INSERT**: Izinkan (Allow) operasi Insert untuk role `anon` dan `authenticated`.
     - **SELECT**: Izinkan (Allow) operasi Select untuk semua orang.
5. **Dapatkan Kunci API:**
   - Masuk ke menu **Project Settings** → **API**.
   - Salin **Project URL** dan **anon / public key**.

### 3. Setup Google Gemini AI
1. Kunjungi [Google AI Studio](https://aistudio.google.com/apikey).
2. Login menggunakan akun Google Anda.
3. Klik **Create API Key** dan salin kuncinya.

### 4. Konfigurasi Environment Variables
Di root folder project (sejajar dengan `package.json`), duplikat atau copy file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Kemudian buka `.env.local` dan masukkan kunci yang sudah didapatkan:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_ID>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
GEMINI_API_KEY=AIzaSy...
```

### 5. Jalankan Aplikasi secara Lokal
```bash
npm run dev
```
Aplikasi kini berjalan di [http://localhost:3000](http://localhost:3000).

---

## 📱 Cara Testing di HP (Sangat Penting)

Karena fitur **Kamera** dan **GPS** mewajibkan koneksi **HTTPS** (atau localhost), Anda tidak bisa mengakses web dari HP via IP lokal jaringan WiFi biasa (seperti `192.168.x.x:3000`). Untuk mendemokan di HP, gunakan **localtunnel**:

1. Buka terminal baru (biarkan terminal `npm run dev` tetap menyala).
2. Jalankan perintah:
```bash
npx localtunnel --port 3000
```
3. Copy URL HTTPS yang diberikan (contoh: `https://rapid-foxes-jump.loca.lt`).
4. Buka URL tersebut di browser HP Anda.
5. Jika ada peringatan dari browser, pilih "Click to Continue" / setujui peringatannya.
6. Sekarang Anda bisa menggunakan fitur Kamera dan GPS langsung dari HP Anda.

---

## 📖 Panduan Penggunaan

### 👨‍💻 Sisi Pengguna (Pelapor)
1. Buka aplikasi di HP (atau browser laptop/PC).
2. Pilih menu **Lapor** di navigasi bawah atau melalui tombol utama.
3. Klik area **"Buka Kamera"**. (Izinkan akses Kamera & Lokasi jika diminta oleh browser).
4. Arahkan kamera ke tumpukan sampah dan ambil foto.
5. Koordinat Anda akan otomatis diambil. Pastikan akurasinya memadai.
6. Klik **"Kirim Laporan"**.
7. AI Gemini akan segera menganalisis tingkat keparahan, memberikan skor, dan menebak jenis sampah. Setelah selesai, laporan langsung muncul di Peta!

### 👮‍♂️ Sisi Admin (Pengelola)
Aplikasi ini memiliki Dashboard Admin untuk mengelola data (seperti menghapus data sampah yang sudah dibersihkan).
1. Buka menu **Login** atau akses `/login`.
2. Gunakan salah satu kredensial berikut untuk masuk:
   - **Admin 1:** `sipalingnanda@gmail.com` | Password: `dickyganteng77`
   - **Admin 2:** `admintitik@gmail.com` | Password: `akuadmin123`
3. Setelah masuk, Anda akan diarahkan ke **Admin Panel**.
4. Di sini Anda bisa melihat daftar laporan dalam bentuk tabel dan menghapusnya jika perlu. Penghapusan ini akan otomatis menghilangkan marker dari Peta Publik.

---

## 🎨 Penjelasan Level Keparahan (Severity)

AI Gemini akan memberikan nilai 1 sampai 3 berdasarkan keparahan tumpukan sampah:

| Level | Warna Marker | Indikator | Deskripsi |
|-------|--------------|-----------|-----------|
| **1** | 🟢 Hijau | Rendah | Sampah berserakan dalam jumlah kecil / ringan. |
| **2** | 🟡 Kuning | Sedang | Tumpukan sampah menengah yang mulai mengganggu. |
| **3** | 🔴 Merah | Kritis | Tumpukan sampah masif, menggunung, dan berpotensi mencemari lingkungan parah. |

---

## 📦 Struktur Direktori Utama

```
titik/
├── src/
│   ├── app/              # Halaman Next.js (App Router)
│   │   ├── admin/        # Dashboard Admin
│   │   ├── api/          # Route API (Auth, Reports, AI)
│   │   ├── dashboard/    # Halaman Peta Publik
│   │   ├── login/        # Halaman Login
│   │   ├── report/       # Halaman Form Pelaporan
│   │   └── page.tsx      # Landing Page
│   ├── components/       # Komponen UI (React)
│   │   ├── CameraCapture.tsx # Pengelola Kamera HP
│   │   ├── MapDashboard.tsx  # Peta Leaflet
│   │   ├── AdminDashboard.tsx# Tabel Admin
│   │   └── ...
│   └── lib/              # Konfigurasi Supabase, Auth Context, & Gemini
├── supabase-schema.sql   # Kode SQL Database
├── .env.example          # Contoh variabel environment
└── README.md             # Dokumentasi ini
```

---

<p align="center">
  Dibuat dengan ❤️ untuk <strong>IYREF Hackathon IYREF 2026</strong>
</p>
