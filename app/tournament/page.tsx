"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import TournamentCountdown from "@/components/TournamentCountdown";

const TOURNAMENT_START = "2026-06-11T22:00:00+03:00";

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

export default function TournamentPage() {
  const [winner, setWinner] = useState("");
  const [runnerUp, setRunnerUp] = useState("");
  const [message, setMessage] = useState("");

  const tournamentStarted = new Date() >= new Date(TOURNAMENT_START);

  useEffect(() => {
    async function loadPrediction() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (!user) return;

      const { data, error } = await supabase
        .from("tournament_predictions")
        .select("winner, runner_up")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data) {
        setWinner(data.winner ?? "");
        setRunnerUp(data.runner_up ?? "");
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
      setMessage("LUKUS! Turniiri ennustust ei saa enam muuta.");
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
      if (error.message.includes("row-level security")) {
        setMessage("LUKUS! Turniiri ennustust ei saa enam muuta.");
      } else {
        setMessage(error.message);
      }
      return;
    }

    setMessage("Turniiri ennustus salvestatud ✅");
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <section className="mb-10 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-600 p-8 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
          Jalgpalli MM 2026 ennustus liiga
        </p>

        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
          MM2026 Boonus
        </h1>

        <TournamentCountdown />

        <p className="mt-3 max-w-2xl text-white">
          Ennusta maailmameister ja finalist enne turniiri algust ning teeni
          lisapunkte.
        </p>
      </section>

      <div className="rounded-3xl border border-white bg-white p-6 shadow-xl">
        {tournamentStarted && (
          <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-700">
            🔒 LUKUS — boonusennustust ei saa enam muuta.
          </div>
        )}

        <label className="text-sm font-bold text-cyan-700">Võitja +10p</label>

        <select
          value={winner}
          disabled={tournamentStarted}
          onChange={(e) => setWinner(e.target.value)}
          className="mb-5 mt-2 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-950 disabled:bg-slate-300 disabled:text-slate-500"
        >
          <option value="">Vali võitja</option>
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>

        <label className="text-sm font-bold text-cyan-700">Finalist +7p</label>

        <select
          value={runnerUp}
          disabled={tournamentStarted}
          onChange={(e) => setRunnerUp(e.target.value)}
          className="mb-5 mt-2 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-950 disabled:bg-slate-300 disabled:text-slate-500"
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
          className="w-full rounded-2xl bg-emerald-500 px-6 py-3 font-black text-slate-950 hover:bg-emerald-400 disabled:bg-slate-600 disabled:text-slate-300"
        >
          {tournamentStarted ? "LUKUS" : "Salvesta boonusennustus"}
        </button>

        {message && (
          <p className="mt-4 text-sm font-bold text-emerald-700">{message}</p>
        )}
      </div>
    </div>
  );
}
