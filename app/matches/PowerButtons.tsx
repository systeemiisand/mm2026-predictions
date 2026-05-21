"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  matchId: number;
  kickoffAt: string;
};

export default function PowerButtons({ matchId, kickoffAt }: Props) {
  const [message, setMessage] = useState("");
  const [doubleUsed, setDoubleUsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLocked = new Date() >= new Date(kickoffAt);

  useEffect(() => {
    async function loadPower() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("powers")
        .select("*")
        .eq("user_id", user.id)
        .eq("power_type", "double_points")
        .maybeSingle();

      if (data?.used_at) {
        setDoubleUsed(true);
        if (data.match_id === matchId) {
          setMessage("Double Points active on this match ⚡");
        }
      }
    }

    loadPower();
  }, [matchId]);

  async function useDoublePoints() {
    setMessage("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    if (isLocked) {
      setMessage("Too late. Double Points must be used before kickoff.");
      setLoading(false);
      return;
    }

    const { data: existing, error: loadError } = await supabase
      .from("powers")
      .select("*")
      .eq("user_id", user.id)
      .eq("power_type", "double_points")
      .maybeSingle();

    if (loadError) {
      setMessage(loadError.message);
      setLoading(false);
      return;
    }

    if (existing?.used_at) {
      setMessage("Double Points already used.");
      setDoubleUsed(true);
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("powers")
      .update({
        match_id: matchId,
        used_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("power_type", "double_points");

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setDoubleUsed(true);
    setMessage("Double Points activated on this match ⚡");
    setLoading(false);
  }

  return (
    <div className="mt-4">
      {doubleUsed && message.includes("this match") ? (
        <div className="rounded-2xl border border-yellow-300/40 bg-yellow-300/10 p-3 shadow-lg shadow-yellow-300/10">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>

            <div>
              <p className="font-black text-yellow-300">DOUBLE POINTS ACTIVE</p>

              <p className="text-xs text-yellow-100/70">
                Points from this match will be doubled.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={useDoublePoints}
          disabled={doubleUsed || isLocked || loading}
          className="rounded-xl bg-yellow-300 px-4 py-2 text-sm font-black text-slate-950 hover:bg-yellow-200 disabled:bg-slate-600 disabled:text-slate-300"
        >
          {loading
            ? "Activating..."
            : doubleUsed
              ? "⚡ Double Used"
              : "⚡ Double Points"}
        </button>
      )}

      {message && !message.includes("this match") && (
        <p className="mt-2 text-sm text-yellow-300">{message}</p>
      )}
    </div>
  );
}
