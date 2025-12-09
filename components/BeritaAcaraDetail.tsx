// components/BeritaAcaraDetail.tsx
"use client";

import { useRef } from "react";
import { BeritaAcaraWithRelations } from "@/lib/types";

interface BeritaAcaraDetailProps {
  beritaAcara: BeritaAcaraWithRelations | null;
  onClose: () => void;
}

export default function BeritaAcaraDetail({ beritaAcara, onClose }: BeritaAcaraDetailProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!beritaAcara) return;
    
    try {
      const res = await fetch(`/api/berita-acara/${beritaAcara.id}/pdf`);
      if (!res.ok) throw new Error("Failed to fetch PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `berita-acara-${beritaAcara.id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Gagal mengunduh PDF. Coba lagi.");
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft -= 200;
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += 200;
    }
  };

  const scrollUp = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop -= 200;
    }
  };

  const scrollDown = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop += 200;
    }
  };

  if (!beritaAcara) return null;

  return (
    <div className="space-y-6">
      {/* Container dengan scroll horizontal dan vertikal serta tombol panah */}
      <div className="relative">
        {/* Tombol Scroll Atas */}
        <button
          onClick={scrollUp}
          className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          style={{ zIndex: 10 }}
        >
          ↑
        </button>

        {/* Tombol Scroll Kiri */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          style={{ zIndex: 10 }}
        >
          ←
        </button>

        {/* Container Scrollable */}
        <div
          ref={scrollContainerRef}
          className="overflow-auto scrollbar-hide max-h-[80vh]"
        >
          {/* Container dengan lebar tetap untuk menjaga bentuk dokumen (seperti A4) */}
          <div className="w-[794px] mx-auto bg-white p-8 shadow-lg rounded-lg font-serif text-sm leading-relaxed print:shadow-none print:p-0 print:w-auto">
            {/* Judul */}
            <h3 className="text-xl font-bold text-center text-gray-800 mb-6 uppercase">
              Berita Acara Penghapusan Barang
            </h3>

            {/* Informasi Umum */}
            <div className="mb-6">
              <p className="mb-2">
                <strong>Hari/Tanggal:</strong> {beritaAcara.hari}, {beritaAcara.tanggal} {beritaAcara.bulan} {beritaAcara.tahun}
              </p>
              <p>
                <strong>Tempat:</strong> {beritaAcara.tempat}
              </p>
            </div>

            {/* Paragraf Sebelum Tabel */}
            <p className="mb-4 text-justify">
              Telah melaksanakan penghapusan (pemusnahan) barang berupa:
            </p>

            {/* Tabel Barang */}
            <div className="mb-6 overflow-x-auto">
              {beritaAcara.berita_acara_barang && beritaAcara.berita_acara_barang.length > 0 ? (
                <table className="w-full border-collapse border border-gray-400 text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-400 px-3 py-2 text-center">No</th>
                      <th className="border border-gray-400 px-3 py-2">Spesifikasi</th>
                      <th className="border border-gray-400 px-3 py-2 text-center">Tahun</th>
                      <th className="border border-gray-400 px-3 py-2 text-center">Umur</th>
                      <th className="border border-gray-400 px-3 py-2 text-center">Sumber Dana</th>
                      <th className="border border-gray-400 px-3 py-2 text-center">Alasan</th>
                      <th className="border border-gray-400 px-3 py-2 text-center">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beritaAcara.berita_acara_barang.map((item, idx) => (
                      <tr key={item.id} className="even:bg-gray-50">
                        <td className="border border-gray-400 px-3 py-2 text-center">{idx + 1}</td>
                        <td className="border border-gray-400 px-3 py-2">{item.sarpras?.spesifikasi || "-"}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center">{item.sarpras?.tahun || "-"}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center">{item.sarpras?.umur?.toString() || "-"}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center">{item.sarpras?.sumber_dana || "-"}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center">{item.sarpras?.alasan?.nama || "-"}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center">{item.sarpras?.jumlah || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500">Tidak ada barang.</p>
              )}
            </div>

            {/* Paragraf Sesudah Tabel */}
            <p className="mb-8 text-justify">
              Barang-barang tersebut telah diperiksa dan terdapat kerusakan dan tidak memungkinkan untuk digunakan lagi. 
              Demikian berita acara ini dibuat berdasarkan keadaan yang sebenarnya untuk dapat diketahui.
            </p>

            {/* Tanda Tangan - Layout Baru: TTD 1 dan 2 sejajar di atas, TTD 3 di bawah tengah */}
            <div className="mt-12">
              {/* Baris Atas: TTD 1 dan 2 sejajar */}
              <div className="flex justify-between mb-8">
                {beritaAcara.berita_acara_ttd?.[0] && (
                  <div className="text-center flex-1">
                    <p className="font-medium text-sm">{beritaAcara.berita_acara_ttd[0].ttd?.jabatan}</p>
                    {beritaAcara.berita_acara_ttd[0].ttd?.foto_ttd && (
                      <img
                        src={beritaAcara.berita_acara_ttd[0].ttd.foto_ttd}
                        alt="Tanda Tangan"
                        className="max-h-20 mx-auto mb-3"
                      />
                    )}
                    <p className="underline text-sm">{beritaAcara.berita_acara_ttd[0].ttd?.nama}</p>
                  </div>
                )}

                {beritaAcara.berita_acara_ttd?.[1] && (
                  <div className="text-center flex-1">
                    <p className="font-medium text-sm">{beritaAcara.berita_acara_ttd[1].ttd?.jabatan}</p>
                    {beritaAcara.berita_acara_ttd[1].ttd?.foto_ttd && (
                      <img
                        src={beritaAcara.berita_acara_ttd[1].ttd.foto_ttd}
                        alt="Tanda Tangan"
                        className="max-h-20 mx-auto mb-2"
                      />
                    )}
                    <p className="underline text-sm">{beritaAcara.berita_acara_ttd[1].ttd?.nama}</p>
                  </div>
                )}
              </div>

              {/* Baris Bawah: TTD 3 di tengah */}
              {beritaAcara.berita_acara_ttd?.[2] && (
                <div className="text-center">
                  <p className="font-semibold text-xs uppercase mb-2">Mengetahui,</p>
                  <p className="font-medium text-sm">{beritaAcara.berita_acara_ttd[2].ttd?.jabatan}</p>
                  {beritaAcara.berita_acara_ttd[2].ttd?.foto_ttd && (
                    <img
                      src={beritaAcara.berita_acara_ttd[2].ttd.foto_ttd}
                      alt="Tanda Tangan"
                      className="max-h-16 mx-auto mb-2"
                    />
                  )}
                  <p className="underline text-sm">{beritaAcara.berita_acara_ttd[2].ttd?.nama}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tombol Scroll Kanan */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          style={{ zIndex: 10 }}
        >
          →
        </button>

        {/* Tombol Scroll Bawah */}
        <button
          onClick={scrollDown}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          style={{ zIndex: 10 }}
        >
          ↓
        </button>
      </div>

      {/* Buttons (di luar container dokumen) */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
        >
          Tutup
        </button>
        <button
          onClick={handleDownloadPdf}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}