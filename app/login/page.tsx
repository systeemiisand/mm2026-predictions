"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function login() {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/matches`,
      },
    });

    if (error) setMessage(error.message);
    else setMessage("Kontrolli oma e-posti aadressi lingi olemasolu kohta.");
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Logi sisse</h1>

      <input
        className="border rounded p-2 w-full mb-4"
        placeholder="Sinu meiliaadress"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={login} className="bg-black text-white rounded px-4 py-2">
        Saada logimise link
      </button>

      <p className="mt-4">{message}</p>
    </div>
  );
}
