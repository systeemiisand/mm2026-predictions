import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Admin API route for importing World Cup 2026 fixtures
 *
 * Used by:
 * - Admin dashboard "Import Fixtures" button
 *
 * This route:
 * 1. checks admin secret
 * 2. calls WC2026 API
 * 3. logs API usage
 * 4. converts API data into our matches table shape
 * 5. upserts matches into Supabase
 */
export async function POST(request: Request) {
  // Read secret from URL query: /api/import-matches?secret=...
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // Protect this route from public use
  if (secret !== process.env.IMPORT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Required environment variables
  const apiKey = process.env.WC2026_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Stop if server configuration is missing
  if (!apiKey || !supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Missing environment variables" },
      { status: 500 },
    );
  }

  // Service role client is used because this server route must write to DB
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch all matches from external WC2026 API
  const response = await fetch("https://api.wc2026api.com/matches", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  // Log every external API call so we can monitor free-tier usage
  await supabase.from("api_usage_logs").insert({
    endpoint: "/matches",
    status: response.status,
  });

  // Stop if external API failed
  if (!response.ok) {
    return NextResponse.json(
      {
        error: "Failed to fetch World Cup matches",
        status: response.status,
      },
      { status: 500 },
    );
  }

  // API can return either array or single object, normalize to array
  const matches = await response.json();
  const list = Array.isArray(matches) ? matches : [matches];

  /**
   * Convert external API match format into our Supabase `matches` table format
   */
  const rows = list.map((match: any) => ({
    api_match_id: match.id,
    match_number: match.match_number,
    round: match.round,
    group_name: match.group_name,

    home_team: match.home_team ?? "TBD",
    away_team: match.away_team ?? "TBD",
    home_team_code: match.home_team_code ?? null,
    away_team_code: match.away_team_code ?? null,
    home_team_flag: match.home_team_flag ?? null,
    away_team_flag: match.away_team_flag ?? null,

    stadium: match.stadium ?? null,
    stadium_city: match.stadium_city ?? null,
    stadium_country: match.stadium_country ?? null,
    kickoff_at: match.kickoff_utc,

    status: match.status,
    phase: match.phase,
    match_minute: match.match_minute ?? null,

    home_score: match.home_score ?? null,
    away_score: match.away_score ?? null,
    home_pen: match.home_pen ?? null,
    away_pen: match.away_pen ?? null,

    next_phase_in_seconds:
      typeof match.next_phase_in_seconds === "number"
        ? match.next_phase_in_seconds
        : null,

    is_sandbox: match._sandbox ?? false,

    // Calculate penalty winner from penalty scores
    penalty_winner:
      typeof match.home_pen === "number" && typeof match.away_pen === "number"
        ? match.home_pen > match.away_pen
          ? "home"
          : match.away_pen > match.home_pen
            ? "away"
            : null
        : null,

    // Current app prediction mode
    prediction_mode: "score",
  }));

  // Insert new matches or update existing ones using API match id
  const { error } = await supabase
    .from("matches")
    .upsert(rows, { onConflict: "api_match_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Response shown in admin dashboard
  return NextResponse.json({
    success: true,
    imported: rows.length,
  });
}
