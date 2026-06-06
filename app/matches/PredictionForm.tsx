"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type Props = {
  matchId: number;
  kickoffAt: string;
  matchNumber?: number | null;
  matchMinute?: number | null;

  initialPrediction?: {
    predicted_home_score: number;
    predicted_away_score: number;
    predicted_penalty_winner?: "home" | "away" | null;
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
  matchNumber,
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
  const [penaltyWinner, setPenaltyWinner] = useState<"home" | "away" | "">("");

  const hasStarted = new Date() >= new Date(kickoffAt);

  const estimatedMinute = Math.floor(
    (Date.now() - new Date(kickoffAt).getTime()) / 60000,
  );

  const safeMatchMinute = matchMinute ?? estimatedMinute;

  const canLateChange = hasStarted && safeMatchMinute <= 45 && lateChangeActive;

  const isLocked = hasStarted && !canLateChange;

  useEffect(() => {
    if (initialPrediction) {
      setHomeScore(String(initialPrediction.predicted_home_score));
      setAwayScore(String(initialPrediction.predicted_away_score));
      setPenaltyWinner(initialPrediction.predicted_penalty_winner ?? "");
      setSavedPrediction(
        `${initialPrediction.predicted_home_score} - ${initialPrediction.predicted_away_score}`,
      );
    } else {
      setHomeScore("");
      setAwayScore("");
      setPenaltyWinner("");
      setSavedPrediction("");
    }

    if (initialLatePower && !initialLatePower.used_at) {
      setLateChangeAvailable(true);
    } else {
      setLateChangeAvailable(false);
    }

    if (initialLatePower?.match_id === matchId && initialLatePower.used_at) {
      setLateChangeActive(true);
    } else {
      setLateChangeActive(false);
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
      setMessage("LUKUS! Ennustust ei saa pärast mängu algust muuta.");
      return;
    }

    if (homeScore === "" || awayScore === "") {
      setMessage("Palun sisesta mõlema tiimi skoor.");
      return;
    }

    if (Number(homeScore) < 0 || Number(awayScore) < 0) {
      setMessage("Skoor ei saa olla negatiivne.");
      return;
    }

    if (
      (matchNumber ?? 0) >= 73 &&
      Number(homeScore) === Number(awayScore) &&
      !penaltyWinner
    ) {
      setMessage("Palun vali penaltite võitja.");
      return;
    }

    const { error } = await supabase.from("predictions").upsert(
      {
        user_id: user.id,
        match_id: matchId,
        predicted_home_score: Number(homeScore),
        predicted_away_score: Number(awayScore),
        predicted_penalty_winner:
          Number(homeScore) === Number(awayScore)
            ? penaltyWinner || null
            : null,
      },
      {
        onConflict: "user_id,match_id",
      },
    );

    if (error) {
      if (error.message.includes("row-level security")) {
        setMessage("LUKUS! Ennustust ei saa pärast mängu algust muuta.");
      } else {
        setMessage(error.message);
      }
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

    if (safeMatchMinute > 45) {
      setMessage(
        "Liiga hilja. Hilisem muutus töötab ainult kuni 45. minutini.",
      );
      return;
    }

    const usedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from("powers")
      .update({
        match_id: matchId,
        used_at: usedAt,
      })
      .eq("user_id", user.id)
      .eq("power_type", "late_change")
      .is("used_at", null)
      .select();

    if (error) {
      if (error.message.includes("row-level security")) {
        setMessage("Hilisemat muutust ei saa kasutada.");
      } else {
        setMessage(error.message);
      }
      return;
    }

    if (!data || data.length === 0) {
      setMessage("Hilisem muutus pole saadaval või on juba kasutatud.");
      setLateChangeAvailable(false);
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

      {isLocked && (
        <div className="mb-3 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm font-bold text-red-300">
          🔒 LUKUS — ennustust ei saa enam muuta.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          min="0"
          className="w-16 rounded-2xl bg-slate-100 p-3 text-center text-xl font-black text-slate-900 shadow-lg focus:outline-none disabled:bg-slate-700 disabled:text-slate-400"
          value={homeScore}
          disabled={isLocked}
          onChange={(e) => {
            setHomeScore(e.target.value);

            if (Number(e.target.value) !== Number(awayScore)) {
              setPenaltyWinner("");
            }
          }}
        />

        <span className="font-bold text-slate-400">-</span>

        <input
          type="number"
          min="0"
          className="w-16 rounded-2xl bg-slate-100 p-3 text-center text-xl font-black text-slate-900 shadow-lg focus:outline-none disabled:bg-slate-700 disabled:text-slate-400"
          value={awayScore}
          disabled={isLocked}
          onChange={(e) => {
            setAwayScore(e.target.value);

            if (Number(homeScore) !== Number(e.target.value)) {
              setPenaltyWinner("");
            }
          }}
        />

        <button
          onClick={savePrediction}
          disabled={isLocked}
          className="rounded-xl bg-emerald-500 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-400 disabled:bg-slate-600 disabled:text-slate-300"
        >
          {isLocked ? "LUKUS" : "Kinnita"}
        </button>

        {((matchNumber ?? 0) >= 73 ||
          (matchNumber ?? 0) === 3 ||
          (matchNumber ?? 0) === 8) &&
          homeScore !== "" &&
          awayScore !== "" &&
          Number(homeScore) === Number(awayScore) && (
            <div className="mt-3 w-full rounded-2xl bg-purple-300/10 p-3">
              <p className="mb-2 text-sm font-bold text-purple-300">
                Kui mäng läheb penaltitele, kes võidab?
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setPenaltyWinner("home")}
                  className={`min-w-[120px] rounded-xl border px-4 py-2 text-sm font-black transition disabled:opacity-50 ${
                    penaltyWinner === "home"
                      ? "border-purple-300 bg-purple-300 text-slate-950 shadow-lg shadow-purple-300/30"
                      : "border-purple-300/30 bg-slate-800 text-purple-200 hover:border-purple-300 hover:bg-slate-700"
                  }`}
                >
                  🏠 Kodutiim
                </button>

                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setPenaltyWinner("away")}
                  className={`min-w-[120px] rounded-xl border px-4 py-2 text-sm font-black transition disabled:opacity-50 ${
                    penaltyWinner === "away"
                      ? "border-purple-300 bg-purple-300 text-slate-950 shadow-lg shadow-purple-300/30"
                      : "border-purple-300/30 bg-slate-800 text-purple-200 hover:border-purple-300 hover:bg-slate-700"
                  }`}
                >
                  ✈️ Võõrsil
                </button>
              </div>

              {penaltyWinner && (
                <p className="mt-2 text-xs font-bold text-purple-300">
                  Valitud penaltite võitja:{" "}
                  {penaltyWinner === "home" ? "Kodutiim" : "Võõrsil"}
                </p>
              )}
            </div>
          )}
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

      {lateChangeActive && safeMatchMinute <= 45 && (
        <p className="mt-3 text-sm font-bold text-cyan-300">
          🕒 Hilisem muudatus aktiivne — saad muuta kuni 45&apos;
        </p>
      )}

      {message && <p className="mt-2 text-sm text-slate-200">{message}</p>}
    </div>
  );
}
