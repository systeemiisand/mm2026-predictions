"use client";

// React hooks for component state and lifecycle
import { useEffect, useState } from "react";

// Shared Supabase client
import { supabase } from "@/lib/supabase";

// Match prediction form component
import PredictionForm from "./PredictionForm";

// Double points power component
import PowerButtons from "./PowerButtons";

// Spy power component
import SpyPower from "./SpyPower";

/**
 * Generic match type from Supabase
 *
 * Could later be replaced with stricter typing.
 */
type Match = any;

/**
 * User prediction shape
 */
type Prediction = {
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_penalty_winner?: "home" | "away" | null;
};

/**
 * User power status
 */
type Power = {
  power_type: string;
  match_id: number | null;
  used_at: string | null;
};

/**
 * Country code map used for fallback flags.
 *
 * Converts FIFA-style team codes into flagcdn country codes.
 */
const countryCodeMap: Record<string, string> = {
  ALG: "dz",
  ARG: "ar",
  AUS: "au",
  AUT: "at",
  BEL: "be",
  BIH: "ba",
  BRA: "br",
  CAN: "ca",
  CPV: "cv",
  CMR: "cm",
  COL: "co",
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
  UZB: "uz",
  COD: "cd",
  CIV: "ci",
};

/**
 * Returns team flag image URL.
 *
 * Priority:
 * 1. use API-provided flag
 * 2. fallback to flagcdn using team code map
 * 3. return null if nothing available
 */
function getFlagUrl(flag?: string | null, teamCode?: string | null) {
  if (flag && flag !== "string") return flag;

  if (!teamCode) return null;

  const mapped = countryCodeMap[teamCode.toUpperCase()];

  if (!mapped) return null;

  return `https://flagcdn.com/w80/${mapped}.png`;
}

/**
 * Main matches page client component
 *
 * Handles:
 * - loading user predictions
 * - loading powers
 * - loading earned points
 * - rendering all match cards
 */
export default function MatchesClient({ matches }: { matches: Match[] }) {
  /**
   * User predictions keyed by match id
   */
  const [predictions, setPredictions] = useState<Record<number, Prediction>>(
    {},
  );

  /**
   * User powers keyed by power type
   *
   * Example:
   * {
   *   double_points: {...},
   *   spy: {...}
   * }
   */
  const [powers, setPowers] = useState<Record<string, Power | undefined>>({});

  /**
   * Earned points keyed by match id
   */
  const [points, setPoints] = useState<Record<number, number>>({});

  /**
   * Loading state while fetching user-related data
   */
  const [loading, setLoading] = useState(true);

  /**
   * Load all user-specific data when page opens
   *
   * Fetches:
   * - predictions
   * - powers
   * - earned points
   */
  useEffect(() => {
    async function loadUserData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      // If user is not logged in, stop loading
      if (!user) {
        setLoading(false);
        return;
      }

      /**
       * Load all user data in parallel for better performance
       */
      const [
        { data: predictionRows },
        { data: powerRows },
        { data: pointRows },
      ] = await Promise.all([
        supabase
          .from("predictions")
          .select(
            "match_id, predicted_home_score, predicted_away_score, predicted_penalty_winner",
          )
          .eq("user_id", user.id),

        supabase
          .from("powers")
          .select("power_type, match_id, used_at")
          .eq("user_id", user.id),

        supabase
          .from("prediction_points")
          .select("match_id, points")
          .eq("user_id", user.id),
      ]);

      /**
       * Convert prediction rows into lookup object
       */
      const predictionMap: Record<number, Prediction> = {};

      predictionRows?.forEach((prediction: any) => {
        predictionMap[prediction.match_id] = {
          predicted_home_score: prediction.predicted_home_score,
          predicted_away_score: prediction.predicted_away_score,
          predicted_penalty_winner: prediction.predicted_penalty_winner,
        };
      });

      /**
       * Convert power rows into lookup object
       */
      const powerMap: Record<string, Power> = {};

      powerRows?.forEach((power: Power) => {
        powerMap[power.power_type] = power;
      });

      /**
       * Convert earned points into lookup object
       */
      const pointMap: Record<number, number> = {};

      pointRows?.forEach((row: any) => {
        pointMap[row.match_id] = row.points;
      });

      // Save all loaded user data into component state
      setPredictions(predictionMap);
      setPowers(powerMap);
      setPoints(pointMap);

      setLoading(false);
    }

    loadUserData();
  }, []);

  const [filter, setFilter] = useState<"all" | "ended" | "upcoming">("all");
  const filteredMatches = matches
    .filter((match) => {
      const isEnded =
        match.home_score != null && match.away_score != null;

      if (filter === "ended") return isEnded;
      if (filter === "upcoming") return !isEnded;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(a.kickoff_at).getTime() -
        new Date(b.kickoff_at).getTime()
    );

  return (
    <>
      {/* Loading indicator while user data is fetched */}
      {loading && (
        <p className="mb-4 text-sm font-bold text-cyan-300">
          Laen sinu salvestatud ennustusi...
        </p>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === "all"
              ? "bg-cyan-500 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
        >
          Kõik
        </button>

        <button
          onClick={() => setFilter("upcoming")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === "upcoming"
              ? "bg-cyan-500 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
        >
          Tulevased
        </button>

        <button
          onClick={() => setFilter("ended")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === "ended"
              ? "bg-cyan-500 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
        >
          Lõppenud
        </button>
      </div>

      {/* Match cards grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {filteredMatches.map((match) => (
          <div
            key={match.id}
            className="rounded-2xl border border-white bg-white p-5 shadow-xl"
          >
            {/* Match header */}
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-slate-700">
                Grupp {match.group_name}
              </span>
              <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white ring-1 ring-indigo-500/20">
                Mäng {match.match_number}
              </span>

              {/* Match kickoff time */}
              <span className="text-xs text-slate-950">
                {new Date(match.kickoff_at).toLocaleString("et-EE", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            </div>

            {/* Teams + score section */}
            <div className="grid grid-cols-3 items-center gap-4 text-center">
              {/* Home team */}
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

              {/* Match result */}
              <div className="text-center">
                {match.home_score != null && match.away_score != null ? (
                  <>
                    {/* Final score */}
                    <div className="text-3xl font-black ext-slate-950">
                      {match.home_score} - {match.away_score}
                    </div>

                    <div className="mt-1 text-xs font-bold text-emerald-700">
                      Tulemus
                    </div>

                    {/* Penalty score if penalties occurred */}
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

              {/* Away team */}
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

            {/* Prediction form */}
            <PredictionForm
              matchId={match.id}
              kickoffAt={match.kickoff_at}
              matchMinute={match.match_minute}
              matchNumber={match.match_number}
              initialPrediction={predictions[match.id]}
              initialLatePower={powers.late_change}
              initialPoints={points[match.id]}
            />

            {/* Double points power */}
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

            {/* Spy power */}
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
