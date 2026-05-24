"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  matchId: number;
  kickoffAt: string;
  matchMinute?: number | null;
  initialPrediction?: {
    predicted_home_score: number;
    predicted_away_score: number;
  };
  initialLatePower?: {
    power_type: string;
    match_id: number | null;
    used_at: string | null;
  };
  initialPoints?: number;
};

export default function PredictionForm({
  matchId,
  kickoffAt,
  matchMinute,
  initialPrediction,
  initialLatePower,
  initialPoints,
}: Props) {
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [message, setMessage] = useState("");
  const [savedPrediction, setSavedPrediction] = useState("");
  const [lateChangeAvailable, setLateChangeAvailable] = useState(false);
  const [lateChangeActive, setLateChangeActive] = useState(false);

  const hasStarted = new Date() >= new Date(kickoffAt);
  const canLateChange =
    hasStarted && (matchMinute ?? 999) <= 45 && lateChangeActive;
  const isLocked = hasStarted && !canLateChange;

  useEffect(() => {
    if (initialPrediction) {
      setHomeScore(String(initialPrediction.predicted_home_score));
      setAwayScore(String(initialPrediction.predicted_away_score));
      setSavedPrediction(
        `${initialPrediction.predicted_home_score} - ${initialPrediction.predicted_away_score}`,
      );
    }

    if (initialLatePower && !initialLatePower.used_at) {
      setLateChangeAvailable(true);
    }

    if (initialLatePower?.match_id === matchId && initialLatePower.used_at) {
      setLateChangeActive(true);
    }
  }, [matchId, initialPrediction, initialLatePower]);

  async function savePrediction() {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Palun logi sisse.");
      return;
    }

    if (isLocked) {
      setMessage("Ennustus on lukus.");
      return;
    }

    const { error } = await supabase.from("predictions").upsert(
      {
        user_id: user.id,
        match_id: matchId,
        predicted_home_score: Number(homeScore),
        predicted_away_score: Number(awayScore),
      },
      {
        onConflict: "user_id,match_id",
      },
    );

    if (error) {
      setMessage(error.message);
      return;
    }

    setSavedPrediction(`${homeScore} - ${awayScore}`);
    setMessage("Sinu ennustus salvestatud ✅");
  }

  async function useLateChange() {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Palun logi sisse.");
      return;
    }

    if (!hasStarted) {
      setMessage("Hilisemat muutust saab kasutada ainult pärast avavilet.");
      return;
    }

    if ((matchMinute ?? 999) > 45) {
      setMessage(
        "Liiga hilja. Hilisem muutus töötab ainult kuni 45. minutini.",
      );
      return;
    }

    const { error } = await supabase.from("powers").upsert(
      {
        user_id: user.id,
        power_type: "late_change",
        match_id: matchId,
        used_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,power_type",
      },
    );

    if (error) {
      setMessage(error.message);
      return;
    }

    setLateChangeAvailable(false);
    setLateChangeActive(true);
    setMessage("Hilisem muutus aktiveeritud 🕒");
  }

  return (
    <div className="mt-5 rounded-2xl bg-white/5 p-4">
      {savedPrediction && (
        <p className="mb-3 text-sm text-emerald-300">
          Sinu ennustus: <b>{savedPrediction}</b>
        </p>
      )}

      {initialPoints !== undefined && (
        <p className="mb-3 text-sm font-black text-yellow-300">
          Selle mängu punktid: {initialPoints}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
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
          Kinnita
        </button>
      </div>

      {lateChangeAvailable && !lateChangeActive && (
        <button
          type="button"
          onClick={useLateChange}
          className="mt-3 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 hover:bg-cyan-200"
        >
          🕒 Kasuta hilisemat muudatust
        </button>
      )}

      {lateChangeActive && (matchMinute ?? 999) <= 45 && (
        <p className="mt-3 text-sm font-bold text-cyan-300">
          🕒 Hilisem muudatus aktiivne — saad muuta kuni 45&apos;
        </p>
      )}

      {isLocked && <p className="mt-2 text-red-400">Lukus</p>}
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
