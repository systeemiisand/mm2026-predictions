import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: liveMatches } = await supabase
    .from("matches")
    .select("id")
    .in("phase", ["LIVE", "IN_PLAY", "HT"])
    .limit(1);

  const hasLiveMatch = Boolean(liveMatches?.length);

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

  const shouldSync = hasLiveMatch || minutesSinceLastSync >= 60;

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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const response = await fetch(
    `${baseUrl}/api/sync-matches?secret=${process.env.IMPORT_SECRET}`,
    { method: "POST" },
  );

  const data = await response.json();

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
