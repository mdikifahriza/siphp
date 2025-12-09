// app/api/alasan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import jwt from "jsonwebtoken";

// GET - Ambil semua data alasan
export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);

    const { data, error } = await supabaseAdmin
      .from("alasan")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET alasan error:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// POST - Tambah alasan baru
export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);

    const { nama } = await req.json();

    if (!nama || nama.trim() === "") {
      return NextResponse.json(
        { error: "Nama alasan wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("alasan")
      .insert([{ nama: nama.trim() }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST alasan error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update alasan
export async function PUT(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);

    const { id, nama } = await req.json();

    if (!id || !nama || nama.trim() === "") {
      return NextResponse.json(
        { error: "ID dan nama alasan wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("alasan")
      .update({ nama: nama.trim() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("PUT alasan error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus alasan
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
        { error: "ID alasan wajib diisi" },
        { status: 400 }
      );
    }

    // Cek apakah alasan masih digunakan di tabel sarpras
    const { data: usedData, error: checkError } = await supabaseAdmin
      .from("sarpras")
      .select("id")
      .eq("alasan", id)
      .limit(1);

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (usedData && usedData.length > 0) {
      return NextResponse.json(
        { error: "Alasan masih digunakan di data barang, tidak dapat dihapus" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("alasan")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Alasan berhasil dihapus" });
  } catch (err) {
    console.error("DELETE alasan error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}