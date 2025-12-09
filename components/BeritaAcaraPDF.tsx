import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// Define styles dengan spacing minimal
const styles = StyleSheet.create({
  page: {
    padding: 30, // Margin minimal
    fontSize: 10, // Font lebih kecil
    fontFamily: "Times-Roman",
    lineHeight: 1.3, // Line height minimal
  },
  // Header Section
  header: {
    marginBottom: 15,
    textAlign: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
    textDecoration: "underline",
  },
  
  // Info Section
  info: {
    marginBottom: 12,
    paddingLeft: 15,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  infoLabel: {
    width: 90,
  },
  infoValue: {
    flex: 1,
  },
  
  // Paragraph
  paragraph: {
    marginBottom: 10,
    textAlign: "justify",
    textIndent: 35,
    lineHeight: 1.4,
  },
  
  // Table
  table: {
    marginBottom: 12,
    marginTop: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    minHeight: 22,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#e0e0e0",
    fontWeight: "bold",
    borderTopWidth: 1,
    borderTopColor: "#000",
    borderTopStyle: "solid",
    minHeight: 25,
  },
  tableCell: {
    borderLeftWidth: 1,
    borderLeftColor: "#000",
    borderLeftStyle: "solid",
    padding: 4,
    textAlign: "center",
    fontSize: 9,
    justifyContent: "center",
  },
  tableCellFirst: {
    borderLeftWidth: 0,
  },
  tableCellLeft: {
    textAlign: "left",
    paddingLeft: 6,
  },
  // Kolom widths
  colNo: { width: "6%" },
  colSpesifikasi: { width: "30%" },
  colTahun: { width: "9%" },
  colUmur: { width: "11%" },
  colSumberDana: { width: "18%" },
  colAlasan: { width: "16%" },
  colJumlah: { width: "10%" },
  
  // Signature Section - spacing minimal
  signatureSection: {
    marginTop: 20,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10, // Jarak minimal antar baris TTD
    paddingHorizontal: 25,
  },
  signatureBox: {
    width: "45%",
    alignItems: "center",
  },
  signatureCenterBox: {
    width: "50%",
    alignItems: "center",
    marginHorizontal: "auto",
    marginTop: 5,
  },
  mengetahui: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  jabatan: {
    fontSize: 9,
    marginBottom: 5, // Jarak minimal antara jabatan dan foto TTD
  },
  signatureImage: {
    width: 80,
    height: 40,
    objectFit: "contain",
    marginVertical: 2, // Jarak minimal
  },
  nama: {
    fontSize: 9,
    fontWeight: "bold",
    textDecoration: "underline",
    marginTop: 2, // Jarak minimal antara foto TTD dan nama
  },
});

interface BeritaAcaraPDFProps {
  beritaAcara: any;
}

const BeritaAcaraPDF: React.FC<BeritaAcaraPDFProps> = ({ beritaAcara }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Berita Acara</Text>
        <Text style={styles.subtitle}>Penghapusan Barang</Text>
      </View>

      {/* Informasi Umum */}
      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Hari/Tanggal</Text>
          <Text style={styles.infoValue}>
            : {beritaAcara.hari}, {beritaAcara.tanggal} {beritaAcara.bulan} {beritaAcara.tahun}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tempat</Text>
          <Text style={styles.infoValue}>: {beritaAcara.tempat}</Text>
        </View>
      </View>

      {/* Paragraf Pembuka */}
      <Text style={styles.paragraph}>
        Pada hari ini telah dilaksanakan penghapusan (pemusnahan) barang milik sekolah berupa sarana dan 
        prasarana dengan rincian sebagai berikut:
      </Text>

      {/* Tabel Barang */}
      <View style={styles.table}>
        {/* Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.tableCellFirst, styles.colNo]}>No</Text>
          <Text style={[styles.tableCell, styles.tableCellLeft, styles.colSpesifikasi]}>Spesifikasi Barang</Text>
          <Text style={[styles.tableCell, styles.colTahun]}>Tahun</Text>
          <Text style={[styles.tableCell, styles.colUmur]}>Umur{"\n"}(Tahun)</Text>
          <Text style={[styles.tableCell, styles.colSumberDana]}>Sumber Dana</Text>
          <Text style={[styles.tableCell, styles.colAlasan]}>Alasan</Text>
          <Text style={[styles.tableCell, styles.colJumlah]}>Jumlah</Text>
        </View>
        
        {/* Data Rows */}
        {beritaAcara.berita_acara_barang?.map((item: any, idx: number) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.tableCellFirst, styles.colNo]}>{idx + 1}</Text>
            <Text style={[styles.tableCell, styles.tableCellLeft, styles.colSpesifikasi]}>
              {item.sarpras?.spesifikasi || "-"}
            </Text>
            <Text style={[styles.tableCell, styles.colTahun]}>{item.sarpras?.tahun || "-"}</Text>
            <Text style={[styles.tableCell, styles.colUmur]}>{item.sarpras?.umur || "-"}</Text>
            <Text style={[styles.tableCell, styles.colSumberDana]}>{item.sarpras?.sumber_dana || "-"}</Text>
            <Text style={[styles.tableCell, styles.colAlasan]}>{item.sarpras?.alasan?.nama || "-"}</Text>
            <Text style={[styles.tableCell, styles.colJumlah]}>{item.sarpras?.jumlah || 0}</Text>
          </View>
        ))}
      </View>

      {/* Paragraf Penutup */}
      <Text style={styles.paragraph}>
        Barang-barang tersebut di atas telah diperiksa dan dinyatakan mengalami kerusakan sehingga tidak dapat 
        digunakan lagi dan harus dihapus dari daftar inventaris barang milik sekolah.
      </Text>
      
      <Text style={styles.paragraph}>
        Demikian berita acara ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
      </Text>

      {/* Tanda Tangan */}
      <View style={styles.signatureSection}>
        {/* Baris Atas: TTD 1 dan 2 (Kiri-Kanan) */}
        <View style={styles.signatureRow}>
          {beritaAcara.berita_acara_ttd?.[0] && (
            <View style={styles.signatureBox}>
              <Text style={styles.jabatan}>{beritaAcara.berita_acara_ttd[0].ttd?.jabatan}</Text>
              {beritaAcara.berita_acara_ttd[0].ttd?.foto_ttd && (
                <Image 
                  src={beritaAcara.berita_acara_ttd[0].ttd.foto_ttd} 
                  style={styles.signatureImage} 
                />
              )}
              <Text style={styles.nama}>
                {beritaAcara.berita_acara_ttd[0].ttd?.nama}
              </Text>
            </View>
          )}
          
          {beritaAcara.berita_acara_ttd?.[1] && (
            <View style={styles.signatureBox}>
              <Text style={styles.jabatan}>{beritaAcara.berita_acara_ttd[1].ttd?.jabatan}</Text>
              {beritaAcara.berita_acara_ttd[1].ttd?.foto_ttd && (
                <Image 
                  src={beritaAcara.berita_acara_ttd[1].ttd.foto_ttd} 
                  style={styles.signatureImage} 
                />
              )}
              <Text style={styles.nama}>
                {beritaAcara.berita_acara_ttd[1].ttd?.nama}
              </Text>
            </View>
          )}
        </View>

        {/* Baris Bawah: TTD 3 (Tengah) - Mengetahui */}
        {beritaAcara.berita_acara_ttd?.[2] && (
          <View style={styles.signatureCenterBox}>
            <Text style={styles.mengetahui}>Mengetahui,</Text>
            <Text style={styles.jabatan}>{beritaAcara.berita_acara_ttd[2].ttd?.jabatan}</Text>
            {beritaAcara.berita_acara_ttd[2].ttd?.foto_ttd && (
              <Image 
                src={beritaAcara.berita_acara_ttd[2].ttd.foto_ttd} 
                style={styles.signatureImage} 
              />
            )}
            <Text style={styles.nama}>
              {beritaAcara.berita_acara_ttd[2].ttd?.nama}
            </Text>
          </View>
        )}
      </View>
    </Page>
  </Document>
);

export default BeritaAcaraPDF;