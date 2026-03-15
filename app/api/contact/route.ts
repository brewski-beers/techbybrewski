import { NextRequest, NextResponse } from "next/server";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function str(value: string) {
  return { stringValue: value };
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const name = (data.get("name") as string | null)?.trim() ?? "";
    const businessName = (data.get("businessName") as string | null)?.trim() ?? "";
    const email = (data.get("email") as string | null)?.trim() ?? "";
    const whatBuilding = (data.get("whatBuilding") as string | null)?.trim() ?? "";
    const problem = (data.get("problem") as string | null)?.trim() ?? "";

    if (!name || !email || !problem) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const res = await fetch(`${BASE}/contactSubmissions?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          name: str(name),
          businessName: str(businessName),
          email: str(email),
          whatBuilding: str(whatBuilding),
          problem: str(problem),
          submittedAt: { timestampValue: new Date().toISOString() },
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Firestore write failed:", res.status, body);
      return NextResponse.json({ error: "Failed to save submission." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
