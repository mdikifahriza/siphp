// app/api/berita-acara/[id]/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import jwt from "jsonwebtoken";
import { generateBeritaAcaraPDF } from "@/lib/generatePDF";

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Validasi JWT_SECRET terlebih dahulu
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Verifikasi JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Await params untuk Next.js 15+
    const resolvedParams = await params;

    // Fetch data berita acara
    const { data: beritaAcara, error } = await supabaseAdmin
      .from("berita_acara")
      .select(`
        *,
        berita_acara_barang (
          id,
          sarpras (
            spesifikasi,
            tahun,
            umur,
            sumber_dana,
            alasan (
              nama
            ),
            jumlah
          )
        ),
        berita_acara_ttd (
          id,
          ttd (
            jabatan,
            nama,
            foto_ttd
          )
        )
      `)
      .eq("id", resolvedParams.id)
      .single();

    if (error || !beritaAcara) {
      console.error("Supabase error:", error);
      return NextResponse.json({ 
        error: "Berita acara tidak ditemukan",
        details: error?.message 
      }, { status: 404 });
    }

    // Generate PDF buffer
    const pdfBuffer = await generateBeritaAcaraPDF(beritaAcara);

    // 🔧 PERBAIKAN: Konversi Buffer ke Uint8Array
    const pdfUint8Array = new Uint8Array(pdfBuffer);

    // Return response dengan Uint8Array
    return new Response(pdfUint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="berita-acara-${resolvedParams.id}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("Error generating PDF:", err);
    
    if (err instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    if (err instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: "Internal server error",
      message: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}