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
    return NextResponse.json(
      { error: "Missing environment variables" },
      { status: 500 },
    );
  }

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
      { error: "Failed to fetch World Cup matches" },
      { status: 500 },
    );
  }

  const matches = await response.json();

  const rows = matches.map((match: any) => ({
    api_match_id: match.id,
    match_number: match.match_number,
    round: match.round,
    group_name: match.group_name,
    home_team: match.home_team ?? "TBD",
    away_team: match.away_team ?? "TBD",
    stadium: match.stadium,
    kickoff_at: match.kickoff_utc,
    status: match.status,
    prediction_mode: "score",
  }));

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error } = await supabase
    .from("matches")
    .upsert(rows, { onConflict: "api_match_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    imported: rows.length,
  });
}
