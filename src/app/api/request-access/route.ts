import { NextResponse } from "next/server";

// ponytail: stub — wire to email service / DB / webhook before launch
export async function POST() {
  return NextResponse.json({ ok: true });
}
