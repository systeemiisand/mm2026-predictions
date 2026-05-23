"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PredictionForm from "./PredictionForm";
import PowerButtons from "./PowerButtons";
import SpyPower from "./SpyPower";

type Match = any;

type PredictionMap = Record<
  number,
  {
    predicted_home_score: number;
    predicted_away_score: number;
  }
>;

export default function MatchesClient({ matches }: { matches: Match[] }) {
  const [predictions, setPredictions] = useState<PredictionMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPredictions() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("predictions")
        .select("match_id, predicted_home_score, predicted_away_score")
        .eq("user_id", user.id);

      const map: PredictionMap = {};

      data?.forEach((prediction) => {
        map[prediction.match_id] = {
          predicted_home_score: prediction.predicted_home_score,
          predicted_away_score: prediction.predicted_away_score,
        };
      });

      setPredictions(map);
      setLoading(false);
    }

    loadPredictions();
  }, []);

  if (loading) {
    return <p className="text-center text-cyan-300">Laen sinu ennustusi...</p>;
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {matches.map((match) => (
        <div
          key={match.id}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl"
        >
          {/* keep your existing match card top/team UI here */}

          <PredictionForm
            matchId={match.id}
            kickoffAt={match.kickoff_at}
            matchMinute={match.match_minute}
            initialPrediction={predictions[match.id]}
          />

          <PowerButtons matchId={match.id} kickoffAt={match.kickoff_at} />
          <SpyPower matchId={match.id} />
        </div>
      ))}
    </div>
  );
}
