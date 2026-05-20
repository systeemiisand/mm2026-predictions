import { supabase } from "@/lib/supabase";

export default async function MatchesPage() {
  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .order("kickoff_at", { ascending: true });

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">MM2026 Matches</h1>

      <div className="space-y-4">
        {matches?.map((match) => (
          <div key={match.id} className="border rounded-xl p-4 shadow">
            <div className="text-xl font-semibold mb-2">
              {match.home_team} vs {match.away_team}
            </div>

            <div className="text-gray-500 mb-4">
              {new Date(match.kickoff_at).toLocaleString()}
            </div>

            <div className="flex items-center gap-2">
              <input type="number" className="w-16 border rounded p-2" />
              <span>-</span>
              <input type="number" className="w-16 border rounded p-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
