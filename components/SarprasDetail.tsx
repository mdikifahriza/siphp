import React from "react";
import { SarprasWithAlasan } from "@/lib/types";

interface SarprasDetailProps {
  sarpras: SarprasWithAlasan | null;
  onClose: () => void;
}

export default function SarprasDetail({ sarpras, onClose }: SarprasDetailProps) {
  if (!sarpras) {
    return (
      <div className="text-center text-gray-500">
        Data sarpras tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Detail Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Spesifikasi</label>
          <p className="mt-1 text-sm text-gray-900">{sarpras.spesifikasi || "Tidak ada spesifikasi"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tahun</label>
          <p className="mt-1 text-sm text-gray-900">{sarpras.tahun || "-"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Umur</label>
          <p className="mt-1 text-sm text-gray-900">
            {sarpras.umur ? `${sarpras.umur} tahun` : "-"}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Sumber Dana</label>
          <p className="mt-1 text-sm text-gray-900">{sarpras.sumber_dana || "-"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Alasan Penghapusan</label>
          <p className="mt-1 text-sm text-gray-900">
            {sarpras.alasan?.nama || "-"}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Jumlah</label>
          <p className="mt-1 text-sm text-gray-900">{sarpras.jumlah}</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Dibuat Pada</label>
          <p className="mt-1 text-sm text-gray-900">
            {new Date(sarpras.created_at).toLocaleString("id-ID", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      {/* Close Button */}
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}