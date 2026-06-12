"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function updatePassword() {
    setMessage("");

    if (!password) {
      setMessage("Sisesta uus parool.");
      return;
    }

    if (password.length < 6) {
      setMessage("Parool peab olema vähemalt 6 tähemärki.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Paroolid ei ühti.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Parool edukalt uuendatud. Võid nüüd sisse logida.");

    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  }

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-6 text-4xl font-black">
        Muuda parooli
      </h1>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <input
          className="mb-4 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-950"
          placeholder="Uus parool"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="mb-4 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-950"
          placeholder="Korda uut parooli"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          onClick={updatePassword}
          disabled={loading}
          className="w-full rounded-2xl bg-emerald-500 px-6 py-3 font-black text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "Salvestan..." : "Salvesta uus parool"}
        </button>

        {message && (
          <p className="mt-4 text-sm text-emerald-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}