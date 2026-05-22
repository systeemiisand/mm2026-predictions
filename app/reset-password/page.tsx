"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function updatePassword() {
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Parool muudetud ✅");
  }

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-6 text-4xl font-black">Muuda parool</h1>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <input
          className="mb-4 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-950"
          placeholder="Uus parool"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={updatePassword}
          className="w-full rounded-2xl bg-emerald-500 px-6 py-3 font-black text-slate-950 hover:bg-emerald-400"
        >
          Salvesta uus parool
        </button>

        {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
      </div>
    </div>
  );
}
