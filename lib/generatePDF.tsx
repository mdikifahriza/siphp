// lib/generatePDF.ts
import { renderToBuffer } from "@react-pdf/renderer";
import BeritaAcaraPDF from "@/components/BeritaAcaraPDF";

/**
 * Fungsi untuk generate PDF buffer dari data berita acara.
 * Menggunakan @react-pdf/renderer untuk rendering komponen PDF.
 * @param beritaAcara - Data berita acara dari database (dengan join).
 * @returns Buffer PDF yang siap dikirim sebagai response.
 */
export async function generateBeritaAcaraPDF(beritaAcara: any): Promise<Buffer> {
  // Render komponen PDF ke buffer
  return await renderToBuffer(<BeritaAcaraPDF beritaAcara={beritaAcara} />);
}
