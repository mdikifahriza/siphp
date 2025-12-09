// lib/types.ts

export type Alasan = {
  id: number;
  nama: string;
};

export type Sarpras = {
  id: bigint;
  spesifikasi: string | null;
  tahun: string | null;
  umur: bigint | null;
  sumber_dana: string | null;
  alasan_id: number | null; // ✅ PERBAIKAN: Ubah dari "alasan" ke "alasan_id" untuk menghindari konflik
  created_at: string;
  jumlah: number;
};

// ✨ Sarpras dengan relasi Alasan
export type SarprasWithAlasan = Sarpras & {
  alasan?: Alasan | null; // Sekarang tidak konflik dengan alasan_id
};

export type Ttd = {
  id: number;
  jabatan: string;
  nama: string;
  foto_ttd: string | null;
};

export type BeritaAcara = {
  id: number;
  hari: string;
  tanggal: number;
  bulan: string;
  tahun: number;
  tempat: string;
};

export type BeritaAcaraBarang = {
  id: number;
  berita_acara_id: number;
  sarpras_id: bigint;
};

export type BeritaAcaraTtd = {
  id: number;
  berita_acara_id: number;
  ttd_id: number;
};

// ✨ Extended types dengan relasi untuk berita acara
export type BeritaAcaraBarangWithSarpras = BeritaAcaraBarang & {
  sarpras?: SarprasWithAlasan | null;
};

export type BeritaAcaraTtdWithDetail = BeritaAcaraTtd & {
  ttd?: Ttd | null;
};

// ✅ PERBAIKAN UTAMA: BeritaAcara dengan relasi lengkap
export type BeritaAcaraWithRelations = BeritaAcara & {
  berita_acara_barang?: BeritaAcaraBarangWithSarpras[];
  berita_acara_ttd?: BeritaAcaraTtdWithDetail[];
};

export type UserRole = "admin" | "user";

export type User = {
  id: string;
  nama: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: string | null;
  updated_at: string | null;
};