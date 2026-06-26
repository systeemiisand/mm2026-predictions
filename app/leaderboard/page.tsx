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

  const uniquePointTotals = [...new Set(leaderboard.map(r => r.total_points))].sort((a, b) => b - a);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 text-4xl font-black">Edetabel</h1>

      {/* Leaderboard rows */}
      <div className="space-y-4">
        {leaderboard?.map((row, index, arr) => {
          const rank = uniquePointTotals.indexOf(row.total_points) + 1;
          return (
            <div
              key={row.user_id}
              className="flex items-center justify-between rounded-2xl border border-white bg-white p-5 shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-black text-slate-950">
                  {rank}
                </div>
                <div className="font-bold">{row.display_name.slice(0, 10)}</div>
              </div>
              <div className="text-2xl font-black text-emerald-300">
                {row.total_points} pts
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
