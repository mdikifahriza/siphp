// app/api/ttd/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import jwt from "jsonwebtoken";

// GET - Ambil semua data ttd
export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);

    const { data, error } = await supabaseAdmin
      .from("ttd")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET ttd error:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// POST - Tambah ttd baru
export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);

    const formData = await req.formData();
    const jabatan = formData.get("jabatan") as string;
    const nama = formData.get("nama") as string;
    const file = formData.get("foto_ttd") as File | null;

    if (!jabatan || !nama) {
      return NextResponse.json(
        { error: "Jabatan dan nama wajib diisi" },
        { status: 400 }
      );
    }

    let fotoTtdUrl: string | null = null;

    // Upload file jika ada
    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("ttd")
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: `Upload error: ${uploadError.message}` },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: publicUrlData } = supabaseAdmin.storage
        .from("ttd")
        .getPublicUrl(filePath);

      fotoTtdUrl = publicUrlData.publicUrl;
    }

    // Insert ke database
    const { data, error } = await supabaseAdmin
      .from("ttd")
      .insert([
        {
          jabatan: jabatan.trim(),
          nama: nama.trim(),
          foto_ttd: fotoTtdUrl,
        },
      ])
      .select()
      .single();

    if (error) {
      // Hapus file jika insert gagal
      if (fotoTtdUrl) {
        const fileName = fotoTtdUrl.split("/").pop();
        await supabaseAdmin.storage.from("ttd").remove([fileName!]);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST ttd error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update ttd
export async function PUT(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);

    const formData = await req.formData();
    const id = formData.get("id") as string;
    const jabatan = formData.get("jabatan") as string;
    const nama = formData.get("nama") as string;
    const file = formData.get("foto_ttd") as File | null;
    const oldFotoUrl = formData.get("old_foto_ttd") as string | null;

    if (!id || !jabatan || !nama) {
      return NextResponse.json(
        { error: "ID, jabatan, dan nama wajib diisi" },
        { status: 400 }
      );
    }

    let fotoTtdUrl: string | null = oldFotoUrl;

    // Upload file baru jika ada
    if (file && file.size > 0) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("ttd")
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: `Upload error: ${uploadError.message}` },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: publicUrlData } = supabaseAdmin.storage
        .from("ttd")
        .getPublicUrl(filePath);

      fotoTtdUrl = publicUrlData.publicUrl;

      // Hapus file lama jika ada
      if (oldFotoUrl) {
        try {
          const oldFileName = oldFotoUrl.split("/").pop();
          if (oldFileName) {
            await supabaseAdmin.storage.from("ttd").remove([oldFileName]);
          }
        } catch (err) {
          console.error("Error deleting old file:", err);
        }
      }
    }

    // Update database
    const { data, error } = await supabaseAdmin
      .from("ttd")
      .update({
        jabatan: jabatan.trim(),
        nama: nama.trim(),
        foto_ttd: fotoTtdUrl,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("PUT ttd error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus ttd
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
        { error: "ID ttd wajib diisi" },
        { status: 400 }
      );
    }

    // Cek apakah ttd masih digunakan di berita_acara_ttd
    const { data: usedData, error: checkError } = await supabaseAdmin
      .from("berita_acara_ttd")
      .select("id")
      .eq("ttd_id", id)
      .limit(1);

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (usedData && usedData.length > 0) {
      return NextResponse.json(
        { error: "TTD masih digunakan di berita acara, tidak dapat dihapus" },
        { status: 400 }
      );
    }

    // Ambil data ttd untuk mendapatkan foto_ttd
    const { data: ttdData, error: fetchError } = await supabaseAdmin
      .from("ttd")
      .select("foto_ttd")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Hapus dari database
    const { error: deleteError } = await supabaseAdmin
      .from("ttd")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Hapus file dari storage jika ada
    if (ttdData?.foto_ttd) {
      try {
        const fileName = ttdData.foto_ttd.split("/").pop();
        if (fileName) {
          await supabaseAdmin.storage.from("ttd").remove([fileName]);
        }
      } catch (err) {
        console.error("Error deleting file from storage:", err);
      }
    }

    return NextResponse.json({ message: "TTD berhasil dihapus" });
  } catch (err) {
    console.error("DELETE ttd error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}