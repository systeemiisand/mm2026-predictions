"use client";

import { useEffect, useState } from "react";

/**
 * TournamentCountdown
 *
 * Shows live countdown until tournament start.
 * Used on matches page and tournament bonus page.
 */
export default function TournamentCountdown() {
  // First match / tournament start time in Estonia time.
  // 2026 World Cup starts June 11, 2026.
  const tournamentStart = new Date("2026-06-11T19:00:00+03:00").getTime();

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Update countdown every second.
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const diff = tournamentStart - now;

  if (diff <= 0) {
    return (
      <div className="mb-8 rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-5 shadow-xl">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-300">
          Turniir on alanud
        </p>
        <p className="mt-2 text-2xl font-black text-emerald-200">
          MM2026 on käimas ⚽
        </p>
      </div>
    );
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return (
    <div className="flex justify-end">
      <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 px-3 py-2">
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
            MM2026 alguseni
          </p>

          <div className="mt-1 text-sm font-black text-cyan-200">
            {days}p : {hours}h : {minutes}m : {seconds}s
          </div>
        </div>
      </div>
    </div>
  );
}
