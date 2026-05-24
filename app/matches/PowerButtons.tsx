"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  matchId: number;
  kickoffAt: string;
  initialPower?: {
    power_type: string;
    match_id: number | null;
    used_at: string | null;
  };
  onPowerUsed?: (power: {
    power_type: string;
    match_id: number | null;
    used_at: string | null;
  }) => void;
};

export default function PowerButtons({
  matchId,
  kickoffAt,
  initialPower,
  onPowerUsed,
}: Props) {
  const [message, setMessage] = useState("");
  const [doubleUsed, setDoubleUsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLocked = new Date() >= new Date(kickoffAt);

  useEffect(() => {
    if (initialPower?.used_at) {
      setDoubleUsed(true);

      if (initialPower.match_id === matchId) {
        setMessage("Sellel matšil aktiivsed topeltpunktid ⚡");
      }
    }
  }, [matchId, initialPower]);

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

    if (initialPower?.used_at) {
      setMessage("Topeltpunktid on juba kasutatud.");
      setDoubleUsed(true);
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("powers").upsert(
      {
        user_id: user.id,
        power_type: "double_points",
        match_id: matchId,
        used_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,power_type",
      },
    );
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    const usedPower = {
      power_type: "double_points",
      match_id: matchId,
      used_at: new Date().toISOString(),
    };

    onPowerUsed?.(usedPower);

    setDoubleUsed(true);
    setMessage("Sellel matšil aktiivsed topeltpunktid ⚡");
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
              ? initialPower?.match_id === matchId
                ? "⚡ Aktiivne siin"
                : "⚡ Kasutatud"
              : "⚡ Topelt punktid"}
        </button>
      )}

      {message && !message.includes("aktiivsed") && (
        <p className="mt-2 text-sm text-yellow-300">{message}</p>
      )}
    </div>
  );
}
