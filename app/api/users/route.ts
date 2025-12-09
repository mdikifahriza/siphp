// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// GET - Ambil semua data users
export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      user_id: string;
      email: string;
    };

    // Cek role user yang login
    const { data: currentUser } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", payload.user_id)
      .single();

    // Hanya ADMIN yang bisa melihat semua users
    if (currentUser?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, nama, email, role, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET users error:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// POST - Tambah user baru
export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      user_id: string;
      email: string;
    };

    // Cek role user yang login
    const { data: currentUser } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", payload.user_id)
      .single();

    if (currentUser?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { nama, email, password, role } = await req.json();

    // Validasi input
    if (!nama || !email || !password || !role) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi role
    if (!["admin", "user"].includes(role)) {
      return NextResponse.json(
        { error: "Role tidak valid. Gunakan ADMIN atau USER" },
        { status: 400 }
      );
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Validasi password minimal 6 karakter
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Cek email sudah digunakan
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("email")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah digunakan" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user baru
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert([
        {
          nama: nama.trim(),
          email: email.toLowerCase().trim(),
          password_hash: passwordHash,
          role: role,
        },
      ])
      .select("id, nama, email, role, created_at, updated_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST users error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      user_id: string;
      email: string;
    };

    // Cek role user yang login
    const { data: currentUser } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", payload.user_id)
      .single();

    if (currentUser?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { id, nama, email, password, role } = await req.json();

    if (!id || !nama || !email || !role) {
      return NextResponse.json(
        { error: "ID, nama, email, dan role wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi role
    if (!["admin", "user"].includes(role)) {
      return NextResponse.json(
        { error: "Role tidak valid. Gunakan ADMIN atau USER" },
        { status: 400 }
      );
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Cek email sudah digunakan oleh user lain
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .neq("id", id)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah digunakan oleh user lain" },
        { status: 400 }
      );
    }

    const updateData: any = {
      nama: nama.trim(),
      email: email.toLowerCase().trim(),
      role: role,
      updated_at: new Date().toISOString(),
    };

    // Update password jika diisi
    if (password && password.trim() !== "") {
      if (password.length < 3) {
        return NextResponse.json(
          { error: "Password minimal 3 karakter" },
          { status: 400 }
        );
      }
      updateData.password_hash = await bcrypt.hash(password, 12);
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select("id, nama, email, role, created_at, updated_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("PUT users error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus user
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      user_id: string;
      email: string;
    };

    // Cek role user yang login
    const { data: currentUser } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", payload.user_id)
      .single();

    if (currentUser?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID user wajib diisi" },
        { status: 400 }
      );
    }

    // Cegah user menghapus diri sendiri
    if (id === payload.user_id) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus akun sendiri" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("users").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (err) {
    console.error("DELETE users error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}