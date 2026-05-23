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
          setMessage("Sellel matšil aktiivsed topeltpunktid ⚡");
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
      setMessage("Palun logi sisse.");
      setLoading(false);
      return;
    }

    if (isLocked) {
      setMessage("Liiga hilja. Topeltpunktid tuleb aktiveerida enne avavilet.");
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
      setMessage("Topeltpunktid on juba kasutatud.");
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
    setMessage("Sellel matšil aktiveeritud topeltpunktid ⚡");
    setLoading(false);
  }

  return (
    <div className="mt-4">
      {doubleUsed && message.includes("aktiivsed") ? (
        <div className="rounded-2xl border border-yellow-300/40 bg-yellow-300/10 p-3 shadow-lg shadow-yellow-300/10">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>

            <div>
              <p className="font-black text-yellow-300">
                TOPELT PUNKTID AKTIIVSED
              </p>

              <p className="text-xs text-yellow-100/70">
                Selle mängu punktid duubeldatakse.
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
            ? "Aktiveerin..."
            : doubleUsed
              ? "⚡ Kasutatud"
              : "⚡ Topelt punktid"}
        </button>
      )}

      {message && !message.includes("aktiivsed") && (
        <p className="mt-2 text-sm text-yellow-300">{message}</p>
      )}
    </div>
  );
}
