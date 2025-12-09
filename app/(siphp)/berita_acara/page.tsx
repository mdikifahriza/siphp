// app/dashboard/berita_acara/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BeritaAcaraWithRelations, SarprasWithAlasan, Ttd } from "@/lib/types";
import FormBeritaAcara from "@/components/FormBeritaAcara";
import BeritaAcaraDetail from "@/components/BeritaAcaraDetail";

type ModalMode = "add" | "view" | "delete" | null; // ✅ Hapus "edit"

export default function BeritaAcaraPage() {
  const [beritaAcaraList, setBeritaAcaraList] = useState<BeritaAcaraWithRelations[]>([]);
  const [sarprasList, setSarprasList] = useState<SarprasWithAlasan[]>([]);
  const [ttdList, setTtdList] = useState<Ttd[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedBeritaAcara, setSelectedBeritaAcara] = useState<BeritaAcaraWithRelations | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch data berita acara, sarpras, dan ttd
  const fetchData = async () => {
    try {
      const [beritaAcaraRes, sarprasRes, ttdRes] = await Promise.all([
        fetch("/api/berita_acara"),
        fetch("/api/sarpras"),
        fetch("/api/ttd"),
      ]);

      if (beritaAcaraRes.ok) {
        const beritaAcaraData = await beritaAcaraRes.json();
        setBeritaAcaraList(beritaAcaraData);
      }

      if (sarprasRes.ok) {
        const sarprasData = await sarprasRes.json();
        setSarprasList(sarprasData);
      }

      if (ttdRes.ok) {
        const ttdData = await ttdRes.json();
        setTtdList(ttdData);
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
  const openModal = (mode: ModalMode, beritaAcara?: BeritaAcaraWithRelations) => {
    setModalMode(mode);
    setSelectedBeritaAcara(beritaAcara || null);
    setError("");
  };

  // Handle modal close
  const closeModal = () => {
    setModalMode(null);
    setSelectedBeritaAcara(null);
    setError("");
  };

  // Handle submit (add only) ✅ Hapus logika edit
  const handleSubmit = async (formData: any) => {
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/berita_acara", {
        method: "POST", // ✅ Hanya POST untuk add
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan berita acara");
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
    if (!selectedBeritaAcara) return;
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/berita_acara?id=${selectedBeritaAcara.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus berita acara");
      }

      await fetchData();
      closeModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle download PDF
  const handleDownloadPdf = async (id: number) => {
    try {
      const res = await fetch(`/api/berita-acara/${id}/pdf`);
      if (!res.ok) throw new Error("Failed to fetch PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `berita-acara-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Gagal mengunduh PDF. Coba lagi.");
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
            Berita Acara
          </h1>
          <p className="text-gray-600">Kelola dokumen berita acara</p>
        </div>
        <button
          onClick={() => openModal("add")}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold"
        >
          + Buat Berita Acara
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
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                  Tempat
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                  Jumlah Barang
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {beritaAcaraList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Belum ada data berita acara
                  </td>
                </tr>
              ) : (
                beritaAcaraList.map((beritaAcara, index) => (
                  <tr
                    key={beritaAcara.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {beritaAcara.hari}, {beritaAcara.tanggal} {beritaAcara.bulan} {beritaAcara.tahun}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {beritaAcara.tempat}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">
                      {beritaAcara.berita_acara_barang?.length || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal("view", beritaAcara)}
                          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          Lihat
                        </button>
                        {/* ✅ Hapus tombol Edit */}
                        <button
                          onClick={() => handleDownloadPdf(beritaAcara.id)}
                          className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => openModal("delete", beritaAcara)}
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
        {beritaAcaraList.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
            Belum ada data berita acara
          </div>
        ) : (
          beritaAcaraList.map((beritaAcara, index) => (
            <motion.div
              key={beritaAcara.id}
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
                      {beritaAcara.hari}, {beritaAcara.tanggal} {beritaAcara.bulan} {beritaAcara.tahun}
                    </h3>
                    <p className="text-gray-600">{beritaAcara.tempat}</p>
                    <p className="text-sm text-gray-500">Barang: {beritaAcara.berita_acara_barang?.length || 0}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openModal("view", beritaAcara)}
                    className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    Lihat
                  </button>
                  {/* ✅ Hapus tombol Edit */}
                  <button
                    onClick={() => handleDownloadPdf(beritaAcara.id)}
                    className="flex-1 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => openModal("delete", beritaAcara)}
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
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">
                  {modalMode === "add" && "Buat Berita Acara Baru"}
                  {/* ✅ Hapus kondisi edit */}
                  {modalMode === "view" && "Detail Berita Acara"}
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
                      Apakah Anda yakin ingin menghapus berita acara pada{" "}
                      <span className="font-bold">
                        {selectedBeritaAcara?.hari}, {selectedBeritaAcara?.tanggal} {selectedBeritaAcara?.bulan} {selectedBeritaAcara?.tahun}
                      </span>?
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
                  <BeritaAcaraDetail
                    beritaAcara={selectedBeritaAcara}
                    onClose={closeModal}
                  />
                ) : (
                  <FormBeritaAcara
                    mode={modalMode}
                    initialData={selectedBeritaAcara}
                    sarprasList={sarprasList}
                    ttdList={ttdList}
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