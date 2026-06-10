"use client";

import AuthButton from "@/components/AuthButton";
import UserStatus from "@/components/UserStatus";
import { useState } from "react";
import { useClickAway } from "@uidotdev/usehooks";

const HamburgerMenu = () => {
  const [toggled, setToggled] = useState(false);
    const ref = useClickAway<HTMLDivElement>(() => {
    setToggled(false);
    });

  return (
    <div className="relative">
      <button
        onClick={() => setToggled(!toggled)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-lg transition hover:bg-slate-800"
        aria-label="Toggle menu"
      >
        <span
          className={`h-0.5 w-6 bg-white transition ${
            toggled ? "translate-y-2 rotate-45" : ""
          }`}
        />
        <span
          className={`h-0.5 w-6 bg-white transition ${
            toggled ? "opacity-0" : ""
          }`}
        />
        <span
          className={`h-0.5 w-6 bg-white transition ${
            toggled ? "-translate-y-1 -rotate-45" : ""
          }`}
        />
      </button>

      {toggled && (
        <div ref={ref} className="absolute right-0 top-14 w-72 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
          <div className="border-b border-slate-700 p-4">
            <div className="flex items-center justify-between gap-2">
              <UserStatus />
              <AuthButton />
            </div>
          </div>

          <div className="flex flex-col p-2">
            <a
              href="/matches"
              className="rounded-lg px-4 py-3 text-slate-100 transition hover:bg-slate-800"
            >
              Mängud
            </a>

            <a
              href="/leaderboard"
              className="rounded-lg px-4 py-3 text-slate-100 transition hover:bg-slate-800"
            >
              Edetabel
            </a>

            <a
              href="/members"
              className="rounded-lg px-4 py-3 text-slate-100 transition hover:bg-slate-800"
            >
              Osalejad
            </a>

            <a
              href="/profile"
              className="rounded-lg px-4 py-3 text-slate-100 transition hover:bg-slate-800"
            >
              Profiil
            </a>

            <a
              href="/tournament"
              className="rounded-lg px-4 py-3 text-slate-100 transition hover:bg-slate-800"
            >
              Boonus
            </a>

            <a
              href="/rules"
              className="rounded-lg px-4 py-3 text-slate-100 transition hover:bg-slate-800"
            >
              Reeglid
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;