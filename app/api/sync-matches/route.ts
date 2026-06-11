import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Smart sync route
 *
 * Purpose:
 * - Protect FIFA API daily limit (100 calls/day)
 * - Sync more frequently while matches are live
 * - Sync rarely when nothing is happening
 *
 * Can be called by:
 * - Supabase Cron
 * - Vercel Cron
 * - External scheduler (cron-job.org)
 */
export async function GET(request: Request) {
  /**
   * Security check
   *
   * Only allow requests that include the correct CRON_SECRET.
   * Prevents random users from triggering syncs.
   */
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /**
   * Create server-side Supabase client.
   *
   * Uses service role key so it can:
   * - read all tables
   * - insert sync logs
   * - bypass RLS
   */
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  /**
   * Check whether any match appears to be live.
   *
   * Some APIs store live state in:
   * - phase
   * Others store it in:
   * - status
   *
   * We check both to be safe.
   */
  const { data: liveMatches } = await supabase
    .from("matches")
    .select("id")
    .or("phase.in.(LIVE,IN_PLAY,HT),status.in.(LIVE,IN_PLAY,HT)")
    .limit(1);

  const hasLiveMatch = Boolean(liveMatches?.length);

  /**
   * Find the last successful sync.
   *
   * skipped = false means:
   * - FIFA API was actually called
   * - database was actually updated
   */
  const { data: lastSync } = await supabase
    .from("sync_logs")
    .select("created_at")
    .eq("sync_type", "matches")
    .eq("skipped", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  /**
   * Convert last sync timestamp into milliseconds.
   */
  const lastSyncTime = lastSync?.created_at
    ? new Date(lastSync.created_at).getTime()
    : 0;

  /**
   * How many minutes have passed since last real sync.
   */
  const minutesSinceLastSync = (Date.now() - lastSyncTime) / 1000 / 60;

  /**
   * Smart sync rules
   *
   * LIVE MATCH:
   * - allow sync every 10 minutes
   *
   * NO LIVE MATCH:
   * - allow sync every 60 minutes
   *
   * This keeps FIFA API usage low.
   */
  const shouldSync =
    (hasLiveMatch && minutesSinceLastSync >= 10) ||
    (!hasLiveMatch && minutesSinceLastSync >= 60);

  /**
   * Skip unnecessary sync.
   *
   * We still save a log entry so we can
   * inspect cron behaviour later.
   */
  if (!shouldSync) {
    await supabase.from("sync_logs").insert({
      sync_type: "matches",
      skipped: true,
      reason: hasLiveMatch
        ? "Live match, but last sync was less than 10 minutes ago"
        : "No live match and last sync was less than 60 minutes ago",
    });

    return NextResponse.json({
      success: true,
      skipped: true,
      hasLiveMatch,
      minutesSinceLastSync,
    });
  }

  /**
   * Production website URL.
   *
   * Example:
   * https://mm2026-predictions.vercel.app
   */
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SITE_URL is missing" },
      { status: 500 },
    );
  }

  /**
   * Call internal sync endpoint.
   *
   * This endpoint:
   * - calls FIFA API
   * - updates matches table
   * - updates scores
   * - updates status/phase
   */
  const response = await fetch(
    `${baseUrl}/api/sync-matches?secret=${process.env.IMPORT_SECRET}`,
    {
      method: "POST",
    },
  );

  const data = await response.json();

  /**
   * If internal sync failed,
   * save error log and return failure.
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
        error: "Sync endpoint failed",
        syncResult: data,
      },
      { status: 500 },
    );
  }

  /**
   * Save successful sync log.
   */
  await supabase.from("sync_logs").insert({
    sync_type: "matches",
    skipped: false,
    reason: hasLiveMatch ? "Live match sync" : "Hourly sync",
  });

  /**
   * Return success response.
   */
  return NextResponse.json({
    success: true,
    skipped: false,
    hasLiveMatch,
    minutesSinceLastSync,
    syncResult: data,
  });
}
