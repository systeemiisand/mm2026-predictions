import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Smart cron route for match syncing
 *
 * Purpose:
 * - avoids unnecessary external API calls
 * - respects free API limits
 * - syncs more aggressively only when a match appears live
 *
 * Called by:
 * - Vercel Cron
 */
export async function GET(request: Request) {
  // Vercel Cron should send Authorization header with CRON_SECRET
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Server-side Supabase client with service role key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  /**
   * Check whether any match is currently marked live in our database.
   *
   * If live, we allow sync immediately.
   */
  const { data: liveMatches } = await supabase
    .from("matches")
    .select("id")
    .in("phase", ["LIVE", "IN_PLAY", "HT"])
    .limit(1);

  const hasLiveMatch = Boolean(liveMatches?.length);

  /**
   * Read latest successful sync time.
   *
   * skipped = false means the route actually called the external API.
   */
  const { data: lastSync } = await supabase
    .from("sync_logs")
    .select("created_at")
    .eq("sync_type", "matches")
    .eq("skipped", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastSyncTime = lastSync?.created_at
    ? new Date(lastSync.created_at).getTime()
    : 0;

  // How many minutes passed since last real sync
  const minutesSinceLastSync = (Date.now() - lastSyncTime) / 1000 / 60;

  /**
   * Sync rules:
   * - if a match is live -> sync
   * - otherwise sync once per 60 minutes
   */
  const shouldSync = hasLiveMatch || minutesSinceLastSync >= 60;

  /**
   * If no sync is needed, save skipped log and return.
   * This helps us understand cron behavior later.
   */
  if (!shouldSync) {
    await supabase.from("sync_logs").insert({
      sync_type: "matches",
      skipped: true,
      reason: "No live match and last sync was less than 60 minutes ago",
    });

    return NextResponse.json({
      success: true,
      skipped: true,
      reason: "No live match and last sync was less than 60 minutes ago",
    });
  }

  /**
   * Production app URL.
   *
   * Used to call our own sync endpoint.
   */
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  /**
   * Call internal sync endpoint.
   *
   * This endpoint then calls the external WC2026 API and updates Supabase.
   */
  const response = await fetch(
    `${baseUrl}/api/sync-matches?secret=${process.env.IMPORT_SECRET}`,
    { method: "POST" },
  );

  const data = await response.json();

  /**
   * Log successful real sync.
   */
  await supabase.from("sync_logs").insert({
    sync_type: "matches",
    skipped: false,
    reason: hasLiveMatch ? "Live match sync" : "Hourly sync",
  });

  return NextResponse.json({
    success: true,
    syncResult: data,
  });
}
