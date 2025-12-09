// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verifikasi token JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { 
      user_id: string; 
      email: string;
    };

    // Query total counts dari Supabase
    const [usersCount, baCount, sarprasCount] = await Promise.all([
      supabaseAdmin.from("users").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("berita_acara").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("sarpras").select("id", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      totalUsers: usersCount.count ?? 0,
      totalBeritaAcara: baCount.count ?? 0,
      totalSarpras: sarprasCount.count ?? 0,
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json({ error: "Invalid token or server error" }, { status: 401 });
  }
}