// components/FormBeritaAcara.tsx
"use client";

import { useState, useEffect } from "react";
import { BeritaAcaraWithRelations, SarprasWithAlasan, Ttd } from "@/lib/types";

interface FormBeritaAcaraProps {
  mode: "add" | "edit";
  initialData?: BeritaAcaraWithRelations | null;
  sarprasList: SarprasWithAlasan[];
  ttdList: Ttd[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  submitting: boolean;
}

export default function FormBeritaAcara({
  mode,
  initialData,
  sarprasList,
  ttdList,
  onSubmit,
  onCancel,
  submitting,
}: FormBeritaAcaraProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    hari: "",
    tanggal: "",
    bulan: "",
    tahun: "",
    tempat: "",
    barangIds: [] as bigint[],
    ttdIds: [0, 0, 0] as number[], // ✅ Inisialisasi dengan array [0, 0, 0] bukan []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        hari: initialData.hari,
        tanggal: initialData.tanggal.toString(),
        bulan: initialData.bulan,
        tahun: initialData.tahun.toString(),
        tempat: initialData.tempat,
        barangIds: initialData.berita_acara_barang?.map((b) => b.sarpras_id) || [],
        ttdIds: initialData.berita_acara_ttd?.map((t) => t.ttd_id) || [0, 0, 0],
      });
    }
  }, [initialData]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.hari || !formData.tanggal || !formData.bulan || !formData.tahun || !formData.tempat) {
      alert("Mohon lengkapi semua data pada step 1");
      return;
    }

    if (formData.barangIds.length === 0) {
      alert("Mohon pilih minimal satu barang");
      return;
    }

    // ✅ Validasi yang lebih ketat untuk TTD
    if (formData.ttdIds.length !== 3 || formData.ttdIds.some((id) => !id || id === 0)) {
      alert("Mohon pilih tanda tangan untuk semua posisi (3 tanda tangan wajib diisi)");
      return;
    }

    // Convert string values to numbers when submitting
    try {
      onSubmit({
        ...formData,
        tanggal: parseInt(formData.tanggal) || 0,
        tahun: parseInt(formData.tahun) || 0,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Terjadi kesalahan saat menyimpan data. Silakan coba lagi.");
    }
  };

  const toggleBarang = (id: bigint) => {
    setFormData((prev) => ({
      ...prev,
      barangIds: prev.barangIds.includes(id)
        ? prev.barangIds.filter((b) => b !== id)
        : [...prev.barangIds, id],
    }));
  };

  // ✅ Perbaikan fungsi selectTtd agar tidak trigger submit
  const selectTtd = (position: number, id: number) => {
    setFormData((prev) => {
      const newTtdIds = [...prev.ttdIds];
      newTtdIds[position] = id;
      return { ...prev, ttdIds: newTtdIds };
    });
  };

  // ✅ Fungsi untuk cek apakah semua TTD sudah dipilih
  const isAllTtdSelected = () => {
    return formData.ttdIds.length === 3 && formData.ttdIds.every((id) => id > 0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                s <= step
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-16 h-1 ${
                  s < step ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Data Berita Acara */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Data Berita Acara
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hari <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.hari}
                onChange={(e) =>
                  setFormData({ ...formData, hari: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih Hari</option>
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jumat">Jumat</option>
                <option value="Sabtu">Sabtu</option>
                <option value="Minggu">Minggu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bulan <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.bulan}
                onChange={(e) =>
                  setFormData({ ...formData, bulan: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih Bulan</option>
                <option value="Januari">Januari</option>
                <option value="Februari">Februari</option>
                <option value="Maret">Maret</option>
                <option value="April">April</option>
                <option value="Mei">Mei</option>
                <option value="Juni">Juni</option>
                <option value="Juli">Juli</option>
                <option value="Agustus">Agustus</option>
                <option value="September">September</option>
                <option value="Oktober">Oktober</option>
                <option value="November">November</option>
                <option value="Desember">Desember</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="2000"
                max="2100"
                value={formData.tahun}
                onChange={(e) =>
                  setFormData({ ...formData, tahun: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tempat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.tempat}
              onChange={(e) =>
                setFormData({ ...formData, tempat: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Ruang Kepala Sekolah"
              required
            />
          </div>
        </div>
      )}

      {/* Step 2: Pilih Barang */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Pilih Barang</h3>
          <p className="text-sm text-gray-600">
            Pilih minimal satu barang dari daftar berikut:
          </p>
          <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg">
            {sarprasList.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Belum ada data barang. Silakan tambah barang terlebih dahulu.
              </div>
            ) : (
              sarprasList.map((sarpras) => (
                <div
                  key={sarpras.id.toString()}
                  className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    formData.barangIds.includes(sarpras.id) ? "bg-blue-50" : ""
                  }`}
                  onClick={() => toggleBarang(sarpras.id)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.barangIds.includes(sarpras.id)}
                      onChange={() => toggleBarang(sarpras.id)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">
                        {sarpras.spesifikasi || "Tidak ada spesifikasi"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Tahun: {sarpras.tahun || "-"}, Jumlah: {sarpras.jumlah}
                      </p>
                      {sarpras.alasan && (
                        <p className="text-xs text-gray-500">
                          Alasan: {sarpras.alasan.nama}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {formData.barangIds.length === 0 && (
            <p className="text-red-500 text-sm">Pilih minimal satu barang.</p>
          )}
        </div>
      )}

      {/* Step 3: Pilih Tanda Tangan */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Pilih Tanda Tangan
          </h3>
          <p className="text-sm text-gray-600">
            Pilih tanda tangan untuk masing-masing posisi:
          </p>
          {["Wakil Kepala Sarpras", "Pelaksana", "Kepala Sekolah"].map(
            (position, index) => (
              <div key={position}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {position} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.ttdIds[index] || ""}
                  onChange={(e) => {
                    selectTtd(index, parseInt(e.target.value));
                    
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih {position}</option>
                  {ttdList.map((ttd) => (
                    <option key={ttd.id} value={ttd.id}>
                      {ttd.nama} - {ttd.jabatan}
                    </option>
                  ))}
                </select>
                {/* Preview foto TTD jika ada */}
                {formData.ttdIds[index] && formData.ttdIds[index] > 0 &&
                  (() => {
                    const selectedTtd = ttdList.find(
                      (t) => t.id === formData.ttdIds[index]
                    );
                    const fotoTtd = selectedTtd?.foto_ttd;

                    return fotoTtd ? (
                      <div className="mt-2">
                        <img
                          src={fotoTtd}
                          alt="Tanda Tangan"
                          className="max-w-32 max-h-16 border border-gray-300 rounded"
                        />
                      </div>
                    ) : null;
                  })()}
              </div>
            )
          )}
          {/* ✅ Indikator status TTD */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Status: {formData.ttdIds.filter(id => id > 0).length} dari 3 tanda tangan dipilih
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={handlePrev}
          disabled={step === 1}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Sebelumnya
        </button>
        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={
              (step === 1 &&
                (!formData.hari ||
                  !formData.tanggal ||
                  !formData.bulan ||
                  !formData.tahun ||
                  !formData.tempat)) ||
              (step === 2 && formData.barangIds.length === 0)
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Selanjutnya
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting || !isAllTtdSelected()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {submitting
              ? "Menyimpan..."
              : mode === "add"
              ? "Buat Berita Acara"
              : "Simpan Perubahan"}
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          Batal
        </button>
      </div>
    </form>
  );
}