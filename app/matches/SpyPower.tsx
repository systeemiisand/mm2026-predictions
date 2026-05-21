"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  matchId: number;
};

type SpyPrediction = {
  predicted_home_score: number;
  predicted_away_score: number;
  profiles: {
    display_name: string;
  } | null;
};

export default function SpyPower({ matchId }: Props) {
  const [message, setMessage] = useState("");
  const [spyUsedForThisMatch, setSpyUsedForThisMatch] = useState(false);
  const [spyAlreadyUsed, setSpyAlreadyUsed] = useState(false);
  const [predictions, setPredictions] = useState<SpyPrediction[]>([]);

  useEffect(() => {
    async function loadSpy() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("powers")
        .select("*")
        .eq("user_id", user.id)
        .eq("power_type", "spy")
        .maybeSingle();

      if (data?.used_at) {
        setSpyAlreadyUsed(true);

        if (data.match_id === matchId) {
          setSpyUsedForThisMatch(true);
          loadPredictions();
        }
      }
    }

    loadSpy();
  }, [matchId]);

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
      setMessage("Please login first.");
      return;
    }

    const { data: existing } = await supabase
      .from("powers")
      .select("*")
      .eq("user_id", user.id)
      .eq("power_type", "spy")
      .maybeSingle();

    if (existing?.used_at) {
      setSpyAlreadyUsed(true);
      setMessage("Spy already used.");
      return;
    }

    const { error } = await supabase
      .from("powers")
      .update({
        match_id: matchId,
        used_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("power_type", "spy");

    if (error) {
      setMessage(error.message);
      return;
    }

    setSpyAlreadyUsed(true);
    setSpyUsedForThisMatch(true);
    setMessage("Spy activated 👁");
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
          👁 Spy Predictions
        </button>
      )}

      {spyAlreadyUsed && !spyUsedForThisMatch && (
        <p className="text-sm text-purple-300">👁 Spy already used</p>
      )}

      {spyUsedForThisMatch && (
        <div className="rounded-2xl border border-purple-300/40 bg-purple-300/10 p-3">
          <p className="mb-2 font-black text-purple-300">👁 Spy Results</p>

          {predictions.length === 0 ? (
            <p className="text-sm text-slate-400">No predictions yet.</p>
          ) : (
            <div className="space-y-2">
              {predictions.map((prediction, index) => (
                <div
                  key={index}
                  className="flex justify-between rounded-xl bg-white/5 px-3 py-2 text-sm"
                >
                  <span>{prediction.profiles?.display_name ?? "Unknown"}</span>
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
