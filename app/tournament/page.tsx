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
  const tournamentStarted = new Date() >= new Date("2026-06-11T00:00:00Z");

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
      {/* Page title */}
      <h1 className="mb-6 text-4xl font-black">Turniiri boonus</h1>

      {/* Main prediction card */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        {/* Short explanation */}
        <p className="mb-6 text-slate-300">
          Ennusta MM 2026 võitja ja finalist enne turniiri algust.
        </p>

        {/* Live countdown until tournament start */}
        <TournamentCountdown />

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
