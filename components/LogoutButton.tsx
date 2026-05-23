"use client";

import { supabase } from "@/lib/supabase";

export default function LogoutButton() {
  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button
      onClick={logout}
      className="rounded-xl bg-red-500 px-4 py-2 text-sm font-black text-white hover:bg-red-400"
    >
      Logi välja
    </button>
  );
}
