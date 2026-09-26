import { NextResponse } from "next/server";
import { PLUGIN_CATALOG } from "@/features/plugins/catalog";

export async function GET() {
  return NextResponse.json(PLUGIN_CATALOG);
}
