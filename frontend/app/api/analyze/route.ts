// app/api/analyze/route.ts
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL!; // set in Vercel

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const r = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Proxy error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const r = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/health`);
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
