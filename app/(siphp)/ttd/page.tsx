"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ttd } from "@/lib/types";
import Image from "next/image";

type ModalMode = "add" | "edit" | "view" | "delete" | null;

export default function TtdPage() {
  const [ttdList, setTtdList] = useState<Ttd[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedTtd, setSelectedTtd] = useState<Ttd | null>(null);
  const [formData, setFormData] = useState({
    jabatan: "",
    nama: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch data ttd
  const fetchTtd = async () => {
    try {
      const res = await fetch("/api/ttd");
      if (res.ok) {
        const data = await res.json();
        setTtdList(data);
      }
    } catch (err) {
      console.error("Error fetching ttd:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTtd();
  }, []);

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        setError("File harus berupa gambar");
        return;
      }

      // Validasi ukuran file (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Ukuran file maksimal 2MB");
        return;
      }

      setSelectedFile(file);
      setError("");

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle modal open
  const openModal = (mode: ModalMode, ttd?: Ttd) => {
    setModalMode(mode);
    setSelectedTtd(ttd || null);
    setFormData({
      jabatan: ttd?.jabatan || "",
      nama: ttd?.nama || "",
    });
    setSelectedFile(null);
    setPreviewUrl(ttd?.foto_ttd || null);
    setError("");
  };

  // Handle modal close
  const closeModal = () => {
    setModalMode(null);
    setSelectedTtd(null);
    setFormData({ jabatan: "", nama: "" });
    setSelectedFile(null);
    setPreviewUrl(null);
    setError("");
  };

  // Handle submit (add/edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("jabatan", formData.jabatan);
      formDataToSend.append("nama", formData.nama);

      if (modalMode === "add") {
        if (selectedFile) {
          formDataToSend.append("foto_ttd", selectedFile);
        }

        const res = await fetch("/api/ttd", {
          method: "POST",
          body: formDataToSend,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Gagal menambah TTD");
        }
      } else if (modalMode === "edit" && selectedTtd) {
        formDataToSend.append("id", selectedTtd.id.toString());
        formDataToSend.append("old_foto_ttd", selectedTtd.foto_ttd || "");

        if (selectedFile) {
          formDataToSend.append("foto_ttd", selectedFile);
        }

        const res = await fetch("/api/ttd", {
          method: "PUT",
          body: formDataToSend,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Gagal mengupdate TTD");
        }
      }

      await fetchTtd();
      closeModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedTtd) return;
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/ttd?id=${selectedTtd.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus TTD");
      }

      await fetchTtd();
      closeModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Tanda Tangan Digital
          </h1>
          <p className="text-gray-600">
            Kelola data tanda tangan untuk berita acara
          </p>
        </div>
        <button
          onClick={() => openModal("add")}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold"
        >
          + Tambah TTD
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                  Foto TTD
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                  Jabatan
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ttdList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Belum ada data tanda tangan
                  </td>
                </tr>
              ) : (
                ttdList.map((ttd, index) => (
                  <tr
                    key={ttd.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      {ttd.foto_ttd ? (
                        <div className="relative w-24 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={ttd.foto_ttd}
                            alt={ttd.nama}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {ttd.jabatan}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ttd.nama}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal("view", ttd)}
                          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          Lihat
                        </button>
                        <button
                          onClick={() => openModal("edit", ttd)}
                          className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openModal("delete", ttd)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {ttdList.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
            Belum ada data tanda tangan
          </div>
        ) : (
          ttdList.map((ttd, index) => (
            <motion.div
              key={ttd.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  {ttd.foto_ttd ? (
                    <div className="relative w-20 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={ttd.foto_ttd}
                        alt={ttd.nama}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                      No Image
                    </div>
                  )}
                  <div className="flex-1">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                      #{index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-gray-800 mt-2">
                      {ttd.nama}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{ttd.jabatan}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openModal("view", ttd)}
                    className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    Lihat
                  </button>
                  <button
                    onClick={() => openModal("edit", ttd)}
                    className="flex-1 px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openModal("delete", ttd)}
                    className="flex-1 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">
                  {modalMode === "add" && "Tambah Tanda Tangan Baru"}
                  {modalMode === "edit" && "Edit Tanda Tangan"}
                  {modalMode === "view" && "Detail Tanda Tangan"}
                  {modalMode === "delete" && "Konfirmasi Hapus"}
                </h2>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {modalMode === "delete" ? (
                  <div>
                    <p className="text-gray-700 mb-6">
                      Apakah Anda yakin ingin menghapus tanda tangan{" "}
                      <span className="font-bold">
                        "{selectedTtd?.nama}" ({selectedTtd?.jabatan})
                      </span>
                      ?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={closeModal}
                        disabled={submitting}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={submitting}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                      >
                        {submitting ? "Menghapus..." : "Hapus"}
                      </button>
                    </div>
                  </div>
                ) : modalMode === "view" ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          ID
                        </label>
                        <p className="text-gray-900 text-lg">
                          {selectedTtd?.id}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Jabatan
                        </label>
                        <p className="text-gray-900 text-lg">
                          {selectedTtd?.jabatan}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nama
                        </label>
                        <p className="text-gray-900 text-lg">
                          {selectedTtd?.nama}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Foto Tanda Tangan
                        </label>
                        {selectedTtd?.foto_ttd ? (
                          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={selectedTtd.foto_ttd}
                              alt={selectedTtd.nama}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                            Tidak ada foto
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Tutup
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Jabatan <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.jabatan}
                          onChange={(e) =>
                            setFormData({ ...formData, jabatan: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Contoh: Kepala Sekolah"
                          required
                          disabled={submitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nama <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.nama}
                          onChange={(e) =>
                            setFormData({ ...formData, nama: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Contoh: Dr. Ahmad Suryadi, M.Pd"
                          required
                          disabled={submitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Foto Tanda Tangan{" "}
                          {modalMode === "add" && (
                            <span className="text-gray-500 font-normal">
                              (Opsional)
                            </span>
                          )}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          disabled={submitting}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Format: JPG, PNG, GIF. Maksimal 2MB
                        </p>
                      </div>

                      {/* Preview */}
                      {previewUrl && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Preview
                          </label>
                          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={previewUrl}
                              alt="Preview"
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={closeModal}
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
                        {submitting
                          ? "Menyimpan..."
                          : modalMode === "add"
                          ? "Tambah"
                          : "Simpan"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}