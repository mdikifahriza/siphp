import React, { useState, useEffect } from "react";
import { SarprasWithAlasan, Alasan } from "@/lib/types"; // ✅ Import SarprasWithAlasan

interface SarprasFormProps {
  mode: "add" | "edit";
  initialData: SarprasWithAlasan | null; // ✅ Ubah dari Sarpras ke SarprasWithAlasan
  alasanList: Alasan[];
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  submitting: boolean;
}

export default function SarprasForm({
  mode,
  initialData,
  alasanList,
  onSubmit,
  onCancel,
  submitting,
}: SarprasFormProps) {
  const [formData, setFormData] = useState({
    spesifikasi: "",
    tahun: "",
    umur: "",
    sumber_dana: "",
    alasan: "",
    jumlah: "",
  });
  const [error, setError] = useState("");

  // Isi form dengan initialData jika mode edit
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        spesifikasi: initialData.spesifikasi || "",
        tahun: initialData.tahun || "",
        umur: initialData.umur?.toString() || "",
        sumber_dana: initialData.sumber_dana || "",
        // ✅ PERBAIKAN: Gunakan alasan_id untuk fallback jika alasan tidak ada
        alasan: initialData.alasan?.id?.toString() || initialData.alasan_id?.toString() || "",
        jumlah: initialData.jumlah.toString(),
      });
    } else {
      // Reset untuk add
      setFormData({
        spesifikasi: "",
        tahun: "",
        umur: "",
        sumber_dana: "",
        alasan: "",
        jumlah: "",
      });
    }
  }, [mode, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi dasar
    const jumlah = parseInt(formData.jumlah);
    if (isNaN(jumlah) || jumlah < 0) {
      setError("Jumlah harus berupa angka positif.");
      return;
    }

    // Siapkan data untuk submit
    const submitData = {
      spesifikasi: formData.spesifikasi || null,
      tahun: formData.tahun || null,
      umur: formData.umur ? parseInt(formData.umur) : null,
      sumber_dana: formData.sumber_dana || null,
      alasan_id: formData.alasan ? parseInt(formData.alasan) : null, // ✅ Gunakan alasan_id untuk konsistensi dengan database
      jumlah,
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Spesifikasi */}
      <div>
        <label htmlFor="spesifikasi" className="block text-sm font-medium text-gray-700">
          Spesifikasi
        </label>
        <input
          type="text"
          id="spesifikasi"
          name="spesifikasi"
          value={formData.spesifikasi}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Masukkan spesifikasi barang"
        />
      </div>

      {/* Tahun */}
      <div>
        <label htmlFor="tahun" className="block text-sm font-medium text-gray-700">
          Tahun
        </label>
        <input
          type="text"
          id="tahun"
          name="tahun"
          value={formData.tahun}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Masukkan tahun"
        />
      </div>

      {/* Umur */}
      <div>
        <label htmlFor="umur" className="block text-sm font-medium text-gray-700">
          Umur (tahun)
        </label>
        <input
          type="number"
          id="umur"
          name="umur"
          value={formData.umur}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Masukkan umur"
          min="0"
        />
      </div>

      {/* Sumber Dana */}
      <div>
        <label htmlFor="sumber_dana" className="block text-sm font-medium text-gray-700">
          Sumber Dana
        </label>
        <input
          type="text"
          id="sumber_dana"
          name="sumber_dana"
          value={formData.sumber_dana}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Masukkan sumber dana"
        />
      </div>

      {/* Alasan */}
      <div>
        <label htmlFor="alasan" className="block text-sm font-medium text-gray-700">
          Alasan
        </label>
        <select
          id="alasan"
          name="alasan"
          value={formData.alasan}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Pilih alasan (opsional)</option>
          {alasanList.map((alasan) => (
            <option key={alasan.id} value={alasan.id}>
              {alasan.nama}
            </option>
          ))}
        </select>
      </div>

      {/* Jumlah */}
      <div>
        <label htmlFor="jumlah" className="block text-sm font-medium text-gray-700">
          Jumlah *
        </label>
        <input
          type="number"
          id="jumlah"
          name="jumlah"
          value={formData.jumlah}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Masukkan jumlah"
          min="0"
          required
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          {submitting ? "Menyimpan..." : mode === "add" ? "Tambah" : "Simpan"}
        </button>
      </div>
    </form>
  );
}