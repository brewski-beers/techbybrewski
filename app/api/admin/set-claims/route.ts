import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const idToken = authHeader.replace("Bearer ", "");

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    if (!decoded.admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 401 });
    }

    const { uid, claims } = await req.json();
    if (!uid || !claims) {
      return NextResponse.json({ error: "Missing uid or claims" }, { status: 400 });
    }

    await adminAuth.setCustomUserClaims(uid, claims);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("set-claims error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
