import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  // Verify caller is an admin
  const authHeader = req.headers.get("authorization") ?? "";
  const idToken = authHeader.replace("Bearer ", "");

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    if (!decoded.admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, companyName, contactName, services, notes } = await req.json();

  if (!email || !companyName || !contactName) {
    return NextResponse.json(
      { error: "email, companyName, and contactName are required" },
      { status: 400 }
    );
  }

  try {
    // Create Auth account (passwordless — client uses email link)
    const userRecord = await adminAuth.createUser({ email, displayName: contactName });
    const uid = userRecord.uid;

    // Set client claim
    await adminAuth.setCustomUserClaims(uid, { client: true });

    // Create Firestore profile doc (id = uid)
    await adminDb.doc(`clients/${uid}`).set({
      email,
      companyName,
      contactName,
      status: "active",
      services: services ?? [],
      notes: notes ?? "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ uid, email }, { status: 201 });
  } catch (err: unknown) {
    console.error("create-client error:", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
