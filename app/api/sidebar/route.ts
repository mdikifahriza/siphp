// app/api/sidebar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Verifikasi token JWT dengan struktur yang benar
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { 
      user_id: string; 
      email: string;
    };

    // Query user dari Supabase menggunakan user_id
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("nama, role")
      .eq("id", payload.user_id)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      nama: user.nama,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}