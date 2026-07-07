import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Daily cron route for automatic match syncing.
 * Scheduled once per day at 9:00 AM UTC via vercel.json.
 * Protects the WC2026 API limit of 100 calls/day.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_SITE_URL" },
      { status: 500 },
    );
  }

  const response = await fetch(
    `${baseUrl}/api/sync-matches?secret=${process.env.IMPORT_SECRET}`,
    { method: "POST" },
  );

  const data = await response.json();

  if (!response.ok) {
    await supabase.from("sync_logs").insert({
      sync_type: "matches",
      skipped: false,
      reason: "Sync endpoint failed",
    });

    return NextResponse.json(
      { success: false, error: "Sync endpoint failed", syncResult: data },
      { status: 500 },
    );
  }

  await supabase.from("sync_logs").insert({
    sync_type: "matches",
    skipped: false,
    reason: "Daily sync",
  });

  return NextResponse.json({ success: true, syncResult: data });
}