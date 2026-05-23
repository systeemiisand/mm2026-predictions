import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.IMPORT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.WC2026_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const response = await fetch("https://api.wc2026api.com/matches", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  await supabase.from("api_usage_logs").insert({
    endpoint: "/matches",
    status: response.status,
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "WC2026 API failed",
        status: response.status,
      },
      { status: 500 },
    );
  }

  const matches = await response.json();
  const list = Array.isArray(matches) ? matches : [matches];

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

    penalty_winner:
      typeof match.home_pen === "number" && typeof match.away_pen === "number"
        ? match.home_pen > match.away_pen
          ? "home"
          : match.away_pen > match.home_pen
            ? "away"
            : null
        : null,

    prediction_mode: "score",
  }));

  const { error } = await supabase
    .from("matches")
    .upsert(rows, { onConflict: "api_match_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    synced: rows.length,
  });
}
