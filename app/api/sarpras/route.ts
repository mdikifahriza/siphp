// app/api/sarpras/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import jwt from "jsonwebtoken";

// GET - Ambil semua data sarpras dengan join ke alasan
export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);

    const { data, error } = await supabaseAdmin
      .from("sarpras")
      .select(`
        *,
        alasan (
          id,
          nama
        )
      `)
      .order("id", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET sarpras error:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// POST - Tambah sarpras baru
export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);

    const { spesifikasi, tahun, umur, sumber_dana, alasan, jumlah } = await req.json();

    // Validasi input dasar
    if (jumlah === undefined || jumlah < 0) {
      return NextResponse.json(
        { error: "Jumlah wajib diisi dan tidak boleh negatif" },
        { status: 400 }
      );
    }

    // Jika alasan disediakan, pastikan ada di tabel alasan
    if (alasan) {
      const { data: alasanData, error: alasanError } = await supabaseAdmin
        .from("alasan")
        .select("id")
        .eq("id", alasan)
        .single();

      if (alasanError || !alasanData) {
        return NextResponse.json(
          { error: "Alasan tidak ditemukan" },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from("sarpras")
      .insert([{
        spesifikasi: spesifikasi || null,
        tahun: tahun || null,
        umur: umur || null,
        sumber_dana: sumber_dana || null,
        alasan: alasan || null,
        jumlah,
      }])
      .select(`
        *,
        alasan (
          id,
          nama
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST sarpras error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update sarpras
export async function PUT(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);

    const { id, spesifikasi, tahun, umur, sumber_dana, alasan, jumlah } = await req.json();

    // Validasi input dasar
    if (!id) {
      return NextResponse.json(
        { error: "ID sarpras wajib diisi" },
        { status: 400 }
      );
    }

    if (jumlah === undefined || jumlah < 0) {
      return NextResponse.json(
        { error: "Jumlah wajib diisi dan tidak boleh negatif" },
        { status: 400 }
      );
    }

    // Jika alasan disediakan, pastikan ada di tabel alasan
    if (alasan) {
      const { data: alasanData, error: alasanError } = await supabaseAdmin
        .from("alasan")
        .select("id")
        .eq("id", alasan)
        .single();

      if (alasanError || !alasanData) {
        return NextResponse.json(
          { error: "Alasan tidak ditemukan" },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from("sarpras")
      .update({
        spesifikasi: spesifikasi || null,
        tahun: tahun || null,
        umur: umur || null,
        sumber_dana: sumber_dana || null,
        alasan: alasan || null,
        jumlah,
      })
      .eq("id", id)
      .select(`
        *,
        alasan (
          id,
          nama
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("PUT sarpras error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus sarpras
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
        { error: "ID sarpras wajib diisi" },
        { status: 400 }
      );
    }

    // Cek apakah sarpras masih digunakan di tabel berita_acara_barang
    const { data: usedData, error: checkError } = await supabaseAdmin
      .from("berita_acara_barang")
      .select("id")
      .eq("sarpras_id", id)
      .limit(1);

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (usedData && usedData.length > 0) {
      return NextResponse.json(
        { error: "Sarpras masih digunakan di berita acara, tidak dapat dihapus" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("sarpras")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Sarpras berhasil dihapus" });
  } catch (err) {
    console.error("DELETE sarpras error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
