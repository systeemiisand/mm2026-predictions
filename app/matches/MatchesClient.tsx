"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PredictionForm from "./PredictionForm";
import PowerButtons from "./PowerButtons";
import SpyPower from "./SpyPower";

type Match = any;

type Prediction = {
  predicted_home_score: number;
  predicted_away_score: number;
};

type Power = {
  power_type: string;
  match_id: number | null;
  used_at: string | null;
};

const countryCodeMap: Record<string, string> = {
  ALG: "dz",
  ARG: "ar",
  AUS: "au",
  AUT: "at",
  BEL: "be",
  BIH: "ba",
  BRA: "br",
  CAN: "ca",
  CHI: "cl",
  CIV: "ci",
  CMR: "cm",
  COL: "co",
  CPV: "cv",
  CRO: "hr",
  CUW: "cw",
  CZE: "cz",
  DEN: "dk",
  ECU: "ec",
  EGY: "eg",
  ENG: "gb-eng",
  ESP: "es",
  FRA: "fr",
  GER: "de",
  GHA: "gh",
  HAI: "ht",
  IRN: "ir",
  IRQ: "iq",
  ITA: "it",
  JOR: "jo",
  JPN: "jp",
  KOR: "kr",
  KSA: "sa",
  MAR: "ma",
  MEX: "mx",
  NED: "nl",
  NGA: "ng",
  NOR: "no",
  NZL: "nz",
  PAN: "pa",
  PAR: "py",
  POL: "pl",
  POR: "pt",
  QAT: "qa",
  RSA: "za",
  SCO: "gb-sct",
  SEN: "sn",
  SRB: "rs",
  SUI: "ch",
  SWE: "se",
  TUN: "tn",
  TUR: "tr",
  URU: "uy",
  USA: "us",
  WAL: "gb-wls",
};

function getFlagUrl(flag?: string | null, teamCode?: string | null) {
  if (flag && flag !== "string") return flag;
  if (!teamCode) return null;

  const mapped = countryCodeMap[teamCode.toUpperCase()];
  if (!mapped) return null;

  return `https://flagcdn.com/w80/${mapped}.png`;
}

export default function MatchesClient({ matches }: { matches: Match[] }) {
  const [predictions, setPredictions] = useState<Record<number, Prediction>>(
    {},
  );
  const [powers, setPowers] = useState<Record<string, Power | undefined>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const [{ data: predictionRows }, { data: powerRows }] = await Promise.all(
        [
          supabase
            .from("predictions")
            .select("match_id, predicted_home_score, predicted_away_score")
            .eq("user_id", user.id),

          supabase
            .from("powers")
            .select("power_type, match_id, used_at")
            .eq("user_id", user.id),
        ],
      );

      const predictionMap: Record<number, Prediction> = {};
      predictionRows?.forEach((prediction: any) => {
        predictionMap[prediction.match_id] = {
          predicted_home_score: prediction.predicted_home_score,
          predicted_away_score: prediction.predicted_away_score,
        };
      });

      const powerMap: Record<string, Power> = {};
      powerRows?.forEach((power: Power) => {
        powerMap[power.power_type] = power;
      });

      setPredictions(predictionMap);
      setPowers(powerMap);
      setLoading(false);
    }

    loadUserData();
  }, []);

  return (
    <>
      {loading && (
        <p className="mb-4 text-sm font-bold text-cyan-300">
          Laen sinu salvestatud ennustusi...
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {matches.map((match) => (
          <div
            key={match.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-slate-950">
                Mäng {match.match_number ?? match.id}
              </span>

              <span className="text-xs text-slate-950">
                {new Date(match.kickoff_at).toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-3 items-center gap-4 text-center">
              <div className="text-left">
                {getFlagUrl(match.home_team_flag, match.home_team_code) ? (
                  <img
                    src={
                      getFlagUrl(match.home_team_flag, match.home_team_code)!
                    }
                    alt={match.home_team}
                    className="mb-2 h-8 w-12 rounded object-cover"
                  />
                ) : (
                  <div className="mb-2 text-2xl">🏳️</div>
                )}

                <div className="font-black">{match.home_team}</div>
                <div className="text-xs text-slate-400">
                  {match.home_team_code}
                </div>
              </div>

              <div className="text-center">
                {match.home_score != null && match.away_score != null ? (
                  <>
                    <div className="text-3xl font-black text-white">
                      {match.home_score} - {match.away_score}
                    </div>

                    <div className="mt-1 text-xs font-bold text-emerald-300">
                      Tulemus
                    </div>

                    {match.home_pen != null && match.away_pen != null && (
                      <div className="mt-1 text-xs text-purple-300">
                        Pen {match.home_pen} - {match.away_pen}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xl font-black text-slate-500">VS</div>
                )}
              </div>

              <div className="text-right">
                {getFlagUrl(match.away_team_flag, match.away_team_code) ? (
                  <img
                    src={
                      getFlagUrl(match.away_team_flag, match.away_team_code)!
                    }
                    alt={match.away_team}
                    className="ml-auto mb-2 h-8 w-12 rounded object-cover"
                  />
                ) : (
                  <div className="mb-2 text-2xl">🏳️</div>
                )}

                <div className="font-black">{match.away_team}</div>
                <div className="text-xs text-slate-950">
                  {match.away_team_code}
                </div>
              </div>
            </div>

            <PredictionForm
              matchId={match.id}
              kickoffAt={match.kickoff_at}
              matchMinute={match.match_minute}
              initialPrediction={predictions[match.id]}
              initialLatePower={powers.late_change}
            />

            <PowerButtons
              matchId={match.id}
              kickoffAt={match.kickoff_at}
              initialPower={powers.double_points}
              onPowerUsed={(power) =>
                setPowers((current) => ({
                  ...current,
                  double_points: power,
                }))
              }
            />

            <SpyPower
              matchId={match.id}
              initialPower={powers.spy}
              onPowerUsed={(power) =>
                setPowers((current) => ({
                  ...current,
                  spy: power,
                }))
              }
            />
          </div>
        ))}
      </div>
    </>
  );
}
