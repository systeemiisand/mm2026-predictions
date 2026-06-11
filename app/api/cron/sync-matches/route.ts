import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Smart cron route for automatic match syncing.
 *
 * This route does NOT directly call the football API.
 * It first checks whether syncing is allowed.
 *
 * Rules:
 * - If a match is live, sync at most once every 10 minutes.
 * - If no match is live, sync at most once every 60 minutes.
 *
 * This protects the WC2026 API limit of 100 calls/day.
 */
export async function GET(request: Request) {
  /**
   * Security check.
   *
   * Vercel Cron, Supabase Cron, or an external scheduler
   * must send:
   *
   * Authorization: Bearer CRON_SECRET
   */
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /**
   * Server-side Supabase client.
   *
   * Service role key is needed because this route reads sync logs
   * and writes sync log records.
   */
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  /**
   * Check if any match is currently live.
   *
   * We check both `phase` and `status` because APIs sometimes
   * use different fields for live match state.
   */
  const { data: liveMatches } = await supabase
    .from("matches")
    .select("id")
    .or("phase.in.(LIVE,IN_PLAY,HT),status.in.(LIVE,IN_PLAY,HT)")
    .limit(1);

  const hasLiveMatch = Boolean(liveMatches?.length);

  /**
   * Find last real sync.
   *
   * skipped = false means the app really called the WC2026 API.
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

  const minutesSinceLastSync = (Date.now() - lastSyncTime) / 1000 / 60;

  /**
   * Smart sync limit.
   *
   * Live match:
   * - max one real WC2026 API call every 10 minutes
   *
   * No live match:
   * - max one real WC2026 API call every 60 minutes
   */
  const shouldSync =
    (hasLiveMatch && minutesSinceLastSync >= 10) ||
    (!hasLiveMatch && minutesSinceLastSync >= 60);

  /**
   * Skip sync if it is too soon.
   */
  if (!shouldSync) {
    await supabase.from("sync_logs").insert({
      sync_type: "matches",
      skipped: true,
      reason: hasLiveMatch
        ? "Skipped: live match, last real sync was less than 10 minutes ago"
        : "Skipped: no live match, last real sync was less than 60 minutes ago",
    });

    return NextResponse.json({
      success: true,
      skipped: true,
      hasLiveMatch,
      minutesSinceLastSync,
    });
  }

  /**
   * App base URL.
   *
   * Example:
   * https://your-app.vercel.app
   */
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_SITE_URL" },
      { status: 500 },
    );
  }

  /**
   * Call the real importer route.
   *
   * /api/sync-matches is the route that actually:
   * - calls WC2026 API
   * - updates Supabase matches table
   */
  const response = await fetch(
    `${baseUrl}/api/sync-matches?secret=${process.env.IMPORT_SECRET}`,
    { method: "POST" },
  );

  const data = await response.json();

  /**
   * If the importer failed, log it as skipped/error.
   */
  if (!response.ok) {
    await supabase.from("sync_logs").insert({
      sync_type: "matches",
      skipped: true,
      reason: "Sync endpoint failed",
    });

    return NextResponse.json(
      {
        success: false,
        skipped: true,
        error: "Sync endpoint failed",
        syncResult: data,
      },
      { status: 500 },
    );
  }

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
    skipped: false,
    hasLiveMatch,
    minutesSinceLastSync,
    syncResult: data,
  });
}
