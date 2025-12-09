// app/api/berita_acara/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import jwt from "jsonwebtoken";
import { BeritaAcara, BeritaAcaraBarang, BeritaAcaraTtd } from "@/lib/types";

// GET - Ambil semua data berita acara dengan relasi barang dan ttd
export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);

    // Ambil berita_acara dengan join ke barang dan ttd
    const { data: beritaAcaraData, error: beritaAcaraError } = await supabaseAdmin
      .from("berita_acara")
      .select(`
        *,
        berita_acara_barang (
          id,
          sarpras_id,
          sarpras (
            id,
            spesifikasi,
            tahun,
            umur,
            sumber_dana,
            alasan,
            jumlah
          )
        ),
        berita_acara_ttd (
          id,
          ttd_id,
          ttd (
            id,
            jabatan,
            nama,
            foto_ttd
          )
        )
      `)
      .order("id", { ascending: true });

    if (beritaAcaraError) {
      return NextResponse.json({ error: beritaAcaraError.message }, { status: 500 });
    }

    return NextResponse.json(beritaAcaraData);
  } catch (err) {
    console.error("GET berita_acara error:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// POST - Tambah berita acara baru dengan relasi barang dan ttd
export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);

    const { hari, tanggal, bulan, tahun, tempat, barangIds, ttdIds } = await req.json();

    // Validasi input dasar
    if (!hari || !tanggal || !bulan || !tahun || !tempat) {
      return NextResponse.json(
        { error: "Hari, tanggal, bulan, tahun, dan tempat wajib diisi" },
        { status: 400 }
      );
    }

    if (!Array.isArray(barangIds) || barangIds.length === 0) {
      return NextResponse.json(
        { error: "Minimal satu barang harus dipilih" },
        { status: 400 }
      );
    }

    if (!Array.isArray(ttdIds) || ttdIds.length !== 3) {
      return NextResponse.json(
        { error: "Harus ada tepat 3 tanda tangan (Kepala Sekolah, Wakil Kepala Sarpras, Pelaksana)" },
        { status: 400 }
      );
    }

    // Insert berita_acara
    const { data: beritaAcaraData, error: beritaAcaraError } = await supabaseAdmin
      .from("berita_acara")
      .insert([{ hari, tanggal, bulan, tahun, tempat }])
      .select()
      .single();

    if (beritaAcaraError) {
      return NextResponse.json({ error: beritaAcaraError.message }, { status: 500 });
    }

    const beritaAcaraId = beritaAcaraData.id;

    // Insert berita_acara_barang
    const barangInserts = barangIds.map((sarprasId: bigint) => ({
      berita_acara_id: beritaAcaraId,
      sarpras_id: sarprasId,
    }));

    const { error: barangError } = await supabaseAdmin
      .from("berita_acara_barang")
      .insert(barangInserts);

    if (barangError) {
      // Rollback jika gagal
      await supabaseAdmin.from("berita_acara").delete().eq("id", beritaAcaraId);
      return NextResponse.json({ error: barangError.message }, { status: 500 });
    }

    // Insert berita_acara_ttd
    const ttdInserts = ttdIds.map((ttdId: number) => ({
      berita_acara_id: beritaAcaraId,
      ttd_id: ttdId,
    }));

    const { error: ttdError } = await supabaseAdmin
      .from("berita_acara_ttd")
      .insert(ttdInserts);

    if (ttdError) {
      // Rollback jika gagal
      await supabaseAdmin.from("berita_acara").delete().eq("id", beritaAcaraId);
      await supabaseAdmin.from("berita_acara_barang").delete().eq("berita_acara_id", beritaAcaraId);
      return NextResponse.json({ error: ttdError.message }, { status: 500 });
    }

    return NextResponse.json(beritaAcaraData, { status: 201 });
  } catch (err) {
    console.error("POST berita_acara error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update berita acara dengan relasi
export async function PUT(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);

    const { id, hari, tanggal, bulan, tahun, tempat, barangIds, ttdIds } = await req.json();

    // Validasi input dasar
    if (!id || !hari || !tanggal || !bulan || !tahun || !tempat) {
      return NextResponse.json(
        { error: "ID, hari, tanggal, bulan, tahun, dan tempat wajib diisi" },
        { status: 400 }
      );
    }

    if (!Array.isArray(barangIds) || barangIds.length === 0) {
      return NextResponse.json(
        { error: "Minimal satu barang harus dipilih" },
        { status: 400 }
      );
    }

    if (!Array.isArray(ttdIds) || ttdIds.length !== 3) {
      return NextResponse.json(
        { error: "Harus ada tepat 3 tanda tangan" },
        { status: 400 }
      );
    }

    // Update berita_acara
    const { data: beritaAcaraData, error: beritaAcaraError } = await supabaseAdmin
      .from("berita_acara")
      .update({ hari, tanggal, bulan, tahun, tempat })
      .eq("id", id)
      .select()
      .single();

    if (beritaAcaraError) {
      return NextResponse.json({ error: beritaAcaraError.message }, { status: 500 });
    }

    // Delete existing relasi dan re-insert
    await supabaseAdmin.from("berita_acara_barang").delete().eq("berita_acara_id", id);
    await supabaseAdmin.from("berita_acara_ttd").delete().eq("berita_acara_id", id);

    // Insert berita_acara_barang
    const barangInserts = barangIds.map((sarprasId: bigint) => ({
      berita_acara_id: id,
      sarpras_id: sarprasId,
    }));

    const { error: barangError } = await supabaseAdmin
      .from("berita_acara_barang")
      .insert(barangInserts);

    if (barangError) {
      return NextResponse.json({ error: barangError.message }, { status: 500 });
    }

    // Insert berita_acara_ttd
    const ttdInserts = ttdIds.map((ttdId: number) => ({
      berita_acara_id: id,
      ttd_id: ttdId,
    }));

    const { error: ttdError } = await supabaseAdmin
      .from("berita_acara_ttd")
      .insert(ttdInserts);

    if (ttdError) {
      return NextResponse.json({ error: ttdError.message }, { status: 500 });
    }

    return NextResponse.json(beritaAcaraData);
  } catch (err) {
    console.error("PUT berita_acara error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus berita acara (relasi akan dihapus otomatis jika cascade diaktifkan, atau manual)
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID berita acara wajib diisi" },
        { status: 400 }
      );
    }

    // Delete berita_acara (relasi barang dan ttd akan dihapus otomatis jika cascade, atau manual delete di sini)
    const { error } = await supabaseAdmin
      .from("berita_acara")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Berita acara berhasil dihapus" });
  } catch (err) {
    console.error("DELETE berita_acara error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
