import { supabase } from "@/lib/supabase";
import PredictionForm from "./PredictionForm";
import AutoRefresh from "./AutoRefresh";
import PowerButtons from "./PowerButtons";
import SpyPower from "./SpyPower";

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
  UZB: "uz",
  COD: "cd",
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

export default async function MatchesPage() {
  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .order("kickoff_at", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <AutoRefresh />
      <section className="mb-10 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-600 p-8 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
          Jalgpalli MM 2026 ennustus liiga
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">MM2026 Mängud</h1>
        <p className="mt-3 max-w-2xl text-white/80">
          Ennusta tulemusi enne avavilet, kogu punkte ja tõuse edetabelis.
        </p>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {matches?.map((match) => (
          <div
            key={match.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-slate-950">
                Mäng {match.match_number ?? match.id}
              </span>

              <span className="text-xs  text-cyan-300">
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

              <div className="text-xl font-black text-slate-500">VS</div>

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
                <div className="text-xs text-cyan-300">
                  {match.away_team_code}
                </div>
              </div>
            </div>
            <PredictionForm
              matchId={match.id}
              kickoffAt={match.kickoff_at}
              matchMinute={match.match_minute}
            />
            <PowerButtons matchId={match.id} kickoffAt={match.kickoff_at} />
            <SpyPower matchId={match.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
