"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const avatars = [
  "⚽",
  "🏆",
  "🔥",
  "🦊",
  "🐺",
  "🦁",
  "🐯",
  "🦅",
  "🚀",
  "👑",
  "🐻",
  "🐼",
  "🐸",
  "🐵",
  "🦄",
  "🐉",
  "🦖",
  "🦈",
  "🐙",
  "🦋",
  "⭐",
  "💎",
  "⚡",
  "🎯",
  "🥇",
];

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("⚽");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar")
        .eq("id", user.id)
        .maybeSingle();

      setDisplayName(data?.display_name ?? user.email ?? "");
      setAvatar(data?.avatar ?? "⚽");
    }

    loadProfile();
  }, []);

  async function saveProfile() {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Palun logi sisse.");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: displayName,
      avatar,
    });

    if (error) setMessage(error.message);
    else setMessage("Profiil salvestatud ✅");
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <h1 className="mb-8 text-4xl font-black">Minu profiil</h1>

      <div className="rounded-3xl border border-white bg-white p-6 shadow-xl">
        <label className="text-sm font-bold text-cyan-300">Nimi</label>

        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-2 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-900"
          placeholder="Sinu nimi"
        />

        <div className="mt-6">
          <p className="mb-3 text-sm font-bold text-cyan-300">Avatar</p>

          <div className="grid grid-cols-5 gap-3">
            {avatars.map((item) => (
              <button
                key={item}
                onClick={() => setAvatar(item)}
                className={`rounded-2xl p-4 text-3xl ${
                  avatar === item
                    ? "bg-emerald-400"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={saveProfile}
          className="mt-8 rounded-2xl bg-emerald-500 px-6 py-3 font-black text-slate-950 hover:bg-emerald-400"
        >
          Salvesta
        </button>

        {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
      </div>
    </div>
  );
}
