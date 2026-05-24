import { supabase } from "@/lib/supabase";

export default async function LeaderboardPage() {
  const { data: leaderboard, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("total_points", { ascending: false });

  if (error) return <div className="p-8">Error: {error.message}</div>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 text-4xl font-black">Edetabel</h1>

      <div className="space-y-4">
        {leaderboard?.map((row, index) => (
          <div
            key={row.user_id}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-black text-slate-950">
                {index + 1}
              </div>

              <div className="font-bold">{row.display_name}</div>
            </div>

            <div className="text-2xl font-black text-emerald-300">
              {row.total_points} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
