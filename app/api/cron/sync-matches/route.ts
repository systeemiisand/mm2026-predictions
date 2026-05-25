import { NextResponse } from "next/server";

/**
 * Cron route for automatic match syncing
 *
 * This endpoint is called by Vercel Cron Jobs.
 *
 * Flow:
 * Vercel Cron
 * -> /api/cron-sync
 * -> /api/sync-matches
 * -> external football API
 * -> Supabase database update
 */
export async function GET(request: Request) {
  /**
   * Security check
   *
   * Only allow requests that contain correct CRON_SECRET.
   * Prevents public users from triggering cron manually.
   */
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /**
   * Base production URL
   *
   * Used for internal API call to sync endpoint.
   */
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // Stop execution if URL missing
  if (!baseUrl) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_SITE_URL" },
      { status: 500 },
    );
  }

  /**
   * Trigger sync-matches API route
   *
   * IMPORT_SECRET protects internal admin endpoints.
   */
  const response = await fetch(
    `${baseUrl}/api/sync-matches?secret=${process.env.IMPORT_SECRET}`,
    {
      method: "POST",
    },
  );

  /**
   * Read sync API response
   */
  const data = await response.json();

  /**
   * Return cron execution result
   */
  return NextResponse.json({
    success: true,
    syncResult: data,
  });
}
