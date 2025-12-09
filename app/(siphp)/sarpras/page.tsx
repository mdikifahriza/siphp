// app/dashboard/sarpras/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sarpras, Alasan } from "@/lib/types";
import FormSarpras from "@/components/FormSarpras";
import SarprasDetail from "@/components/SarprasDetail";

type ModalMode = "add" | "edit" | "view" | "delete" | null;

export default function SarprasPage() {
  const [sarprasList, setSarprasList] = useState<Sarpras[]>([]);
  const [alasanList, setAlasanList] = useState<Alasan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedSarpras, setSelectedSarpras] = useState<Sarpras | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch data sarpras dan alasan
  const fetchData = async () => {
    try {
      const [sarprasRes, alasanRes] = await Promise.all([
        fetch("/api/sarpras"),
        fetch("/api/alasan"),
      ]);

      if (sarprasRes.ok) {
        const sarprasData = await sarprasRes.json();
        setSarprasList(sarprasData);
      }

      if (alasanRes.ok) {
        const alasanData = await alasanRes.json();
        setAlasanList(alasanData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle modal open
  const openModal = (mode: ModalMode, sarpras?: Sarpras) => {
    setModalMode(mode);
    setSelectedSarpras(sarpras || null);
    setError("");
  };

  // Handle modal close
  const closeModal = () => {
    setModalMode(null);
    setSelectedSarpras(null);
    setError("");
  };

  // Handle submit (add/edit)
  const handleSubmit = async (formData: any) => {
    setError("");
    setSubmitting(true);

    try {
      const method = modalMode === "add" ? "POST" : "PUT";
      const body = modalMode === "edit" ? { id: selectedSarpras?.id, ...formData } : formData;

      const res = await fetch("/api/sarpras", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan sarpras");
      }

      await fetchData();
      closeModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedSarpras) return;
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/sarpras?id=${selectedSarpras.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus sarpras");
      }

      await fetchData();
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
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
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
            Sarpras (Barang)
          </h1>
          <p className="text-gray-600">Kelola data sarana dan prasarana</p>
        </div>
        <button
          onClick={() => openModal("add")}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold"
        >
          + Tambah Barang
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
                  Spesifikasi
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                  Tahun
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sarprasList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Belum ada data sarpras
                  </td>
                </tr>
              ) : (
                sarprasList.map((sarpras, index) => (
                  <tr
                    key={sarpras.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {sarpras.spesifikasi || "Tidak ada spesifikasi"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {sarpras.tahun || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {sarpras.jumlah}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal("view", sarpras)}
                          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          Lihat
                        </button>
                        <button
                          onClick={() => openModal("edit", sarpras)}
                          className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openModal("delete", sarpras)}
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
        {sarprasList.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
            Belum ada data sarpras
          </div>
        ) : (
          sarprasList.map((sarpras, index) => (
            <motion.div
              key={sarpras.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                        #{index + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {sarpras.spesifikasi || "Tidak ada spesifikasi"}
                    </h3>
                    <p className="text-gray-600">Tahun: {sarpras.tahun || "-"}</p>
                    <p className="text-sm text-gray-500">Jumlah: {sarpras.jumlah}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openModal("view", sarpras)}
                    className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    Lihat
                  </button>
                  <button
                    onClick={() => openModal("edit", sarpras)}
                    className="flex-1 px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openModal("delete", sarpras)}
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">
                  {modalMode === "add" && "Tambah Barang Baru"}
                  {modalMode === "edit" && "Edit Barang"}
                  {modalMode === "view" && "Detail Barang"}
                  {modalMode === "delete" && "Konfirmasi Hapus"}
                </h2>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {modalMode === "delete" ? (
                  <div>
                    <p className="text-gray-700 mb-6">
                      Apakah Anda yakin ingin menghapus barang{" "}
                      <span className="font-bold">"{selectedSarpras?.spesifikasi || "Tanpa spesifikasi"}"</span>?
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
                  <SarprasDetail
                    sarpras={selectedSarpras}
                    onClose={closeModal}
                  />
                ) : (
                  <FormSarpras
                    mode={modalMode}
                    initialData={selectedSarpras}
                    alasanList={alasanList}
                    onSubmit={handleSubmit}
                    onCancel={closeModal}
                    submitting={submitting}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
