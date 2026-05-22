"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");

  function translateError(errorMessage: string) {
    const msg = errorMessage.toLowerCase();

    if (msg.includes("email")) return "Puudub email";
    if (msg.includes("password")) return "Puudub parool";
    if (msg.includes("invalid login credentials")) {
      return "Vale email või parool";
    }

    return errorMessage;
  }

  async function register() {
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/matches`,
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      setMessage(translateError(error.message));
      return;
    }

    setMessage("Kontrolli oma emaili konto kinnitamiseks.");
  }

  async function login() {
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(translateError(error.message));
      return;
    }

    window.location.href = "/matches";
  }

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-6 text-4xl font-black">
        {mode === "login" ? "Logi sisse" : "Registreeru"}
      </h1>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        {mode === "register" && (
          <input
            className="mb-4 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-950"
            placeholder="Sinu nimi"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        )}

        <input
          className="mb-4 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-950"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="mb-4 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-950"
          placeholder="Parool"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={mode === "login" ? login : register}
          className="w-full rounded-2xl bg-emerald-500 px-6 py-3 font-black text-slate-950 hover:bg-emerald-400"
        >
          {mode === "login" ? "Logi sisse" : "Loo konto"}
        </button>

        <button
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setMessage("");
          }}
          className="mt-4 w-full text-sm text-cyan-300 underline"
        >
          {mode === "login"
            ? "Pole kontot? Registreeru"
            : "Konto olemas? Logi sisse"}
        </button>

        {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
      </div>
    </div>
  );
}
