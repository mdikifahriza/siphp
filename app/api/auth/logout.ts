import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Hanya menerima POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }


  res.setHeader("Set-Cookie", [
    `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure`,
  ]);

  return res.status(200).json({ message: "Logout berhasil" });
}
