# 📘 README — Panduan Menjalankan Proyek Web

Dokumen ini menjelaskan langkah lengkap untuk menyiapkan dan menjalankan aplikasi web menggunakan Supabase + Next.js secara lokal.


# 🚀 1. Download & Ekstrak Proyek

1. Buka repository GitHub.
2. Klik tombol **Code → Download ZIP**.
3. Ekstrak ZIP ke folder mana pun.

Contoh:

```
C:\project-saya\
```

---

# 🗄️ 2. Membuat Database Baru di Supabase

1. Masuk ke [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Klik **New Project**
3. Pilih organisasi → buat project baru
4. Tunggu proses provisioning selesai

---

# 📑 3. Menyalin Struktur Database (`skema.txt`)

1. Buka file:

```
/skema.txt
```

2. Copy seluruh isi file.
3. Masuk ke **Supabase Dashboard → SQL Editor**.
4. Klik **New Query**.
5. Paste isi schema.
6. Klik **Run**.

Hasilnya:

* Tabel terbentuk
* Relasi siap
* Data awal (jika ada) masuk

---

# 🗂️ 4. Membuat Storage Bucket

Masuk ke **Storage → Buckets**, lalu buat dua bucket berikut:

### Bucket 1: `ttd`

* Klik **New Bucket**
* Nama bucket: `ttd`
* Public: **Yes**

### Bucket 2: `logo`

* Klik **New Bucket**
* Nama bucket: `logo`
* Public: **Yes**

Upload file tanda tangan dan logo bila diperlukan.

---

# 🔐 5. Mengatur Environment (`.env.local`)

1. Buat file `.env.local` di root project.
2. Isi dengan:

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
JWT_SECRET=your_random_secret_key
```

### Cara mendapatkan value:

* Masuk **Project Settings → API**

  * `Project URL` → untuk `NEXT_PUBLIC_SUPABASE_URL`
  * `anon` key → untuk `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  * `service_role` → untuk `SUPABASE_SERVICE_ROLE_KEY`

Jika salah satu value keliru, fitur login/CRUD akan gagal.

---

# 👥 6. Default Akun Login

### Admin

```
Email: mdikifahriza3@gmail.com
Password: 123
```

### User

```
Email: zainur@gmail.com
Password: 123456
```

---

# ▶️ 7. Menjalankan Aplikasi

Buka terminal di folder project.

### Install dependencies

```
npm install
```

### Jalankan development server

```
npm run dev
```

Akses melalui:

```
http://localhost:3000
```

---

# 🎯 8. Aplikasi Siap Digunakan

Jika langkah-langkah di atas benar:

* Login admin dan user berjalan
* CRUD berfungsi
* Upload bucket bekerja
* PDF generator aktif

Jika ada error, periksa kembali environment atau beri tahu bagian yang bermasalah.
