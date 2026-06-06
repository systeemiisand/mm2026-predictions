import { supabase } from "@/lib/supabase";
import AutoRefresh from "./AutoRefresh";
import MatchesClient from "./MatchesClient";
import TournamentCountdown from "@/components/TournamentCountdown";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Matches page
 *
 * Server component that loads all matches from Supabase.
 *
 * User-specific data like:
 * - predictions
 * - powers
 * - earned points
 *
 * is loaded inside MatchesClient on the client side.
 */
export default async function MatchesPage() {
  /**
   * Load all tournament matches ordered by kickoff time.
   */
  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .order("kickoff_at", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Refreshes server data periodically for updated scores/status */}
      <AutoRefresh />

      {/* Page hero/header */}
      <section className="mb-10 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-600 p-8 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
          Jalgpalli MM 2026 ennustus liiga
        </p>

        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
          MM2026 Mängud
        </h1>

        <p className="mt-3 max-w-2xl text-white/80">
          Ennusta tulemusi enne avavilet, kogu punkte ja tõuse edetabelis.
        </p>
        <TournamentCountdown />
      </section>

      {/* Client component renders match cards and user-specific prediction data */}
      <MatchesClient matches={matches ?? []} />
    </div>
  );
}
