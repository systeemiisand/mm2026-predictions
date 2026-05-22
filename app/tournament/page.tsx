"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const teams = [
  "Argentina",
  "Brazil",
  "France",
  "Germany",
  "Spain",
  "England",
  "Netherlands",
  "Portugal",
  "USA",
  "Mexico",
];

export default function TournamentPage() {
  const [winner, setWinner] = useState("");
  const [runnerUp, setRunnerUp] = useState("");
  const [message, setMessage] = useState("");

  const tournamentStarted = new Date() >= new Date("2026-06-11T00:00:00Z");

  useEffect(() => {
    async function loadPrediction() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) return;

      const { data } = await supabase
        .from("tournament_predictions")
        .select("winner, runner_up")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setWinner(data.winner);
        setRunnerUp(data.runner_up);
      }
    }

    loadPrediction();
  }, []);

  async function savePrediction() {
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user) {
      setMessage("Palun logi sisse.");
      return;
    }

    if (tournamentStarted) {
      setMessage("Turniiri ennustus on lukus.");
      return;
    }

    if (!winner || !runnerUp) {
      setMessage("Vali võitja ja finalist.");
      return;
    }

    if (winner === runnerUp) {
      setMessage("Võitja ja finalist ei saa olla sama tiim.");
      return;
    }

    const { error } = await supabase.from("tournament_predictions").upsert(
      {
        user_id: user.id,
        winner,
        runner_up: runnerUp,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Turniiri ennustus salvestatud ✅");
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <h1 className="mb-6 text-4xl font-black">Turniiri boonus</h1>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <p className="mb-6 text-slate-300">
          Ennusta MM 2026 võitja ja finalist enne turniiri algust.
        </p>

        <label className="text-sm font-bold text-cyan-300">Võitja +10p</label>
        <select
          value={winner}
          disabled={tournamentStarted}
          onChange={(e) => setWinner(e.target.value)}
          className="mt-2 mb-5 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-950"
        >
          <option value="">Vali võitja</option>
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>

        <label className="text-sm font-bold text-cyan-300">Finalist +7p</label>
        <select
          value={runnerUp}
          disabled={tournamentStarted}
          onChange={(e) => setRunnerUp(e.target.value)}
          className="mt-2 mb-5 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-950"
        >
          <option value="">Vali finalist</option>
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>

        <button
          onClick={savePrediction}
          disabled={tournamentStarted}
          className="w-full rounded-2xl bg-emerald-500 px-6 py-3 font-black text-slate-950 hover:bg-emerald-400 disabled:bg-slate-600"
        >
          Salvesta boonusennustus
        </button>

        {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
      </div>
    </div>
  );
}
