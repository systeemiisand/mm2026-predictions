"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Power = {
  power_type: string;
  match_id: number | null;
  used_at: string | null;
};

type Props = {
  matchId: number;
  initialPower?: Power;
  onPowerUsed?: (power: Power) => void;
};

type SpyPrediction = {
  predicted_home_score: number;
  predicted_away_score: number;
  profiles:
    | {
        display_name: string;
      }
    | {
        display_name: string;
      }[]
    | null;
};

export default function SpyPower({
  matchId,
  initialPower,
  onPowerUsed,
}: Props) {
  const [message, setMessage] = useState("");
  const [spyUsedForThisMatch, setSpyUsedForThisMatch] = useState(false);
  const [spyAlreadyUsed, setSpyAlreadyUsed] = useState(false);
  const [predictions, setPredictions] = useState<SpyPrediction[]>([]);

  useEffect(() => {
    if (initialPower?.used_at) {
      setSpyAlreadyUsed(true);

      if (initialPower.match_id === matchId) {
        setSpyUsedForThisMatch(true);
        loadPredictions();
      }
    }
  }, [matchId, initialPower]);

  async function loadPredictions() {
    const { data, error } = await supabase
      .from("predictions")
      .select(
        `
        predicted_home_score,
        predicted_away_score,
        profiles (
          display_name
        )
      `,
      )
      .eq("match_id", matchId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setPredictions((data as SpyPrediction[]) ?? []);
  }

  async function useSpy() {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Palun logi sisse.");
      return;
    }

    if (initialPower?.used_at || spyAlreadyUsed) {
      setSpyAlreadyUsed(true);
      setMessage("Spioon on juba kasutatud.");
      return;
    }

    const usedAt = new Date().toISOString();

    const { error } = await supabase.from("powers").upsert(
      {
        user_id: user.id,
        power_type: "spy",
        match_id: matchId,
        used_at: usedAt,
      },
      {
        onConflict: "user_id,power_type",
      },
    );

    if (error) {
      setMessage(error.message);
      return;
    }

    const usedPower = {
      power_type: "spy",
      match_id: matchId,
      used_at: usedAt,
    };

    onPowerUsed?.(usedPower);

    setSpyAlreadyUsed(true);
    setSpyUsedForThisMatch(true);
    setMessage("Spioon aktiveeritud 👁");
    loadPredictions();
  }

  return (
    <div className="mt-4">
      {!spyAlreadyUsed && (
        <button
          type="button"
          onClick={useSpy}
          className="rounded-xl bg-purple-300 px-4 py-2 text-sm font-black text-slate-950 hover:bg-purple-200"
        >
          👁 Vaata teiste ennustusi
        </button>
      )}

      {spyAlreadyUsed && !spyUsedForThisMatch && (
        <p className="text-sm text-purple-300">👁 Spioon juba kasutatud</p>
      )}

      {spyUsedForThisMatch && (
        <div className="rounded-2xl border border-purple-300/40 bg-purple-300/10 p-3">
          <p className="mb-2 font-black text-purple-300">
            👁 Spiooni tulemused
          </p>

          {predictions.length === 0 ? (
            <p className="text-sm text-slate-400">Ennustusi veel pole.</p>
          ) : (
            <div className="space-y-2">
              {predictions.map((prediction, index) => (
                <div
                  key={index}
                  className="flex justify-between rounded-xl bg-white/5 px-3 py-2 text-sm"
                >
                  <span>
                    {Array.isArray(prediction.profiles)
                      ? (prediction.profiles[0]?.display_name ?? "Tundmatu")
                      : (prediction.profiles?.display_name ?? "Tundmatu")}
                  </span>

                  <b>
                    {prediction.predicted_home_score} -{" "}
                    {prediction.predicted_away_score}
                  </b>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {message && <p className="mt-2 text-sm text-purple-300">{message}</p>}
    </div>
  );
}
