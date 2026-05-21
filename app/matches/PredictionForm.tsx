"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  matchId: number;
  kickoffAt: string;
};

export default function PredictionForm({ matchId, kickoffAt }: Props) {
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [message, setMessage] = useState("");
  const [savedPrediction, setSavedPrediction] = useState("");

  const isLocked = new Date() >= new Date(kickoffAt);

  useEffect(() => {
    async function loadPrediction() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", user.id)
        .eq("match_id", matchId)
        .single();

      if (data) {
        setHomeScore(String(data.predicted_home_score));
        setAwayScore(String(data.predicted_away_score));
        setSavedPrediction(
          `${data.predicted_home_score} - ${data.predicted_away_score}`,
        );
      }
    }

    loadPrediction();
  }, [matchId]);

  async function savePrediction() {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    if (isLocked) {
      setMessage("Prediction is locked.");
      return;
    }

    const { error } = await supabase.from("predictions").upsert({
      user_id: user.id,
      match_id: matchId,
      predicted_home_score: Number(homeScore),
      predicted_away_score: Number(awayScore),
    });

    if (error) setMessage(error.message);
    else {
      setSavedPrediction(`${homeScore} - ${awayScore}`);
      setMessage("Prediction saved ✅");
    }
  }

  return (
    <div className="mt-5 rounded-2xl bg-white/5 p-4">
      {savedPrediction && (
        <p className="mb-3 text-sm text-emerald-300">
          Your prediction: <b>{savedPrediction}</b>
        </p>
      )}

      <div className="flex items-center gap-2">
        <input
          type="number"
          className="w-16 rounded-2xl bg-slate-100 p-3 text-center text-xl font-black text-slate-900 shadow-lg focus:outline-none"
          value={homeScore}
          disabled={isLocked}
          onChange={(e) => setHomeScore(e.target.value)}
        />

        <span className="font-bold text-slate-400">-</span>

        <input
          type="number"
          className="w-16 rounded-2xl bg-slate-100 p-3 text-center text-xl font-black text-slate-900 shadow-lg focus:outline-none"
          value={awayScore}
          disabled={isLocked}
          onChange={(e) => setAwayScore(e.target.value)}
        />

        <button
          onClick={savePrediction}
          disabled={isLocked}
          className="rounded-xl bg-emerald-500 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-400 disabled:bg-slate-600 disabled:text-slate-300"
        >
          Save
        </button>
      </div>

      {isLocked && <p className="mt-2 text-red-400">Locked</p>}
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
