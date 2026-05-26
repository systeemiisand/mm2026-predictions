import { supabase } from "@/lib/supabase";

/**
 * Leaderboard page
 *
 * Shows all users ordered by total tournament points.
 *
 * Data comes from Supabase `leaderboard` view.
 * The view already calculates:
 * - total points
 * - user display name
 * - rankings data
 */
export const dynamic = "force-dynamic";
export default async function LeaderboardPage() {
  /**
   * Load leaderboard data ordered by highest points first
   */
  const { data: leaderboard, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("total_points", { ascending: false });

  /**
   * Error screen if Supabase query fails
   */
  if (error) {
    return <div className="p-8">Error: {error.message}</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 text-4xl font-black">Edetabel</h1>

      {/* Leaderboard rows */}
      <div className="space-y-4">
        {leaderboard?.map((row, index) => (
          <div
            key={row.user_id}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl"
          >
            {/* Left side: ranking position + player name */}
            <div className="flex items-center gap-4">
              {/* Ranking circle */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-black text-slate-950">
                {index + 1}
              </div>

              {/* User display name */}
              <div className="font-bold">{row.display_name}</div>
            </div>

            {/* Right side: total tournament points */}
            <div className="text-2xl font-black text-emerald-300">
              {row.total_points} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
