"use client";

// React hooks for loading saved data and managing form state
import { useEffect, useState } from "react";

// Supabase client for authentication and database actions
import { supabase } from "@/lib/supabase";

// Reusable countdown component
import TournamentCountdown from "@/components/TournamentCountdown";

/**
 * List of teams available for tournament bonus predictions.
 */
const teams = [
  "Algeeria",
  "Argentiina",
  "Australia",
  "Austria",
  "Belgia",
  "Bosnia Hertsegoviina",
  "Brasiilia",
  "Canada",
  "Cabo Verde",
  "Kamerun",
  "Colombia",
  "Horvaatia",
  "Curaçao",
  "Tšehhi",
  "Taani",
  "Ecuador",
  "Egiptus",
  "Inglismaa",
  "Hispaania",
  "Prantsusmaa",
  "Saksamaa",
  "Ghana",
  "Haiti",
  "Iraan",
  "Iraak",
  "Itaalia",
  "Jordaania",
  "Jaapan",
  "Lõuna-Korea",
  "Saudi Araabia",
  "Maroko",
  "Mehhiko",
  "Holland",
  "Nigeeria",
  "Norra",
  "Uus-Meremaa",
  "Panama",
  "Paraguay",
  "Portugal",
  "Katar",
  "Lõuna-Aafrika",
  "Šotimaa",
  "Senegal",
  "Serbia",
  "Šveits",
  "Rootsi",
  "Tuneesia",
  "Türgi",
  "Uruguay",
  "USA",
];

/**
 * TournamentPage Component
 *
 * Handles:
 * - Tournament bonus prediction form
 * - Winner and runner-up selection
 * - Loading existing tournament prediction
 * - Saving prediction to Supabase
 * - Locking prediction after tournament start
 */
export default function TournamentPage() {
  // Selected tournament winner
  const [winner, setWinner] = useState("");

  // Selected runner-up/finalist
  const [runnerUp, setRunnerUp] = useState("");

  // Status or error message shown to the user
  const [message, setMessage] = useState("");

  /**
   * Locks tournament predictions after tournament start date.
   */
  const tournamentStarted = new Date() >= new Date("2026-06-11T22:00+03:00");

  /**
   * Loads user's saved tournament prediction from Supabase.
   */
  useEffect(() => {
    async function loadPrediction() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      // Do nothing if user is not logged in
      if (!user) return;

      /**
       * Load existing tournament prediction for this user.
       */
      const { data } = await supabase
        .from("tournament_predictions")
        .select("winner, runner_up")
        .eq("user_id", user.id)
        .maybeSingle();

      // Pre-fill form if saved prediction exists
      if (data) {
        setWinner(data.winner);
        setRunnerUp(data.runner_up);
      }
    }

    loadPrediction();
  }, []);

  /**
   * Saves or updates user's tournament bonus prediction.
   */
  async function savePrediction() {
    // Clear old message
    setMessage("");

    // Get current authenticated session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    // User must be logged in to save prediction
    if (!user) {
      setMessage("Palun logi sisse.");
      return;
    }

    // Prevent changes after tournament start
    if (tournamentStarted) {
      setMessage("Turniiri ennustus on lukus.");
      return;
    }

    // Both winner and finalist must be selected
    if (!winner || !runnerUp) {
      setMessage("Vali võitja ja finalist.");
      return;
    }

    // Winner and finalist cannot be the same team
    if (winner === runnerUp) {
      setMessage("Võitja ja finalist ei saa olla sama tiim.");
      return;
    }

    /**
     * Insert or update tournament prediction.
     */
    const { error } = await supabase.from("tournament_predictions").upsert(
      {
        user_id: user.id,
        winner,
        runner_up: runnerUp,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    // Show database error if save fails
    if (error) {
      setMessage(error.message);
      return;
    }

    // Success message
    setMessage("Turniiri ennustus salvestatud ✅");
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      {/* Page hero/header */}
      <section className="mb-10 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-600 p-8 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
          Jalgpalli MM 2026 ennustus liiga
        </p>

        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
          MM2026 Boonus
        </h1>
        {/* Live countdown until tournament start */}
        <TournamentCountdown />

        <p className="mt-3 max-w-2xl text-white">
          Ennusta maailmameister ja finalist enne turniiri algust ning teeni
          lisapunkte.
        </p>
      </section>

      {/* Main prediction card */}
      <div className="rounded-3xl border border-white bg-white p-6 shadow-xl">
        {/* Short explanation */}

        {/* Winner selection */}
        <label className="text-sm font-bold text-cyan-300">Võitja +10p</label>

        <select
          value={winner}
          disabled={tournamentStarted}
          onChange={(e) => setWinner(e.target.value)}
          className="mt-2 mb-5 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-950"
        >
          <option value="">Vali võitja</option>

          {/* Render all selectable teams */}
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>

        {/* Runner-up/finalist selection */}
        <label className="text-sm font-bold text-cyan-300">Finalist +7p</label>

        <select
          value={runnerUp}
          disabled={tournamentStarted}
          onChange={(e) => setRunnerUp(e.target.value)}
          className="mt-2 mb-5 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-950"
        >
          <option value="">Vali finalist</option>

          {/* Render all selectable teams */}
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>

        {/* Save tournament prediction */}
        <button
          onClick={savePrediction}
          disabled={tournamentStarted}
          className="w-full rounded-2xl bg-emerald-500 px-6 py-3 font-black text-slate-950 hover:bg-emerald-400 disabled:bg-slate-600"
        >
          Salvesta boonusennustus
        </button>

        {/* Status or error message */}
        {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
      </div>
    </div>
  );
}
