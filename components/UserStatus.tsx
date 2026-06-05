"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Shows clear login status in navigation.
 */
export default function UserStatus() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setName(null);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();

      setName(data?.display_name ?? user.email ?? "Kasutaja");
    }

    loadUser();
  }, []);

  if (!name) {
    return (
      <span className="rounded-xl bg-red-500/20 px-3 py-2 text-xs font-bold text-red-300">
        Pole sisse logitud
      </span>
    );
  }

  return (
    <span className="rounded-xl bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-300">
      ✅ Sisse logitud: {name}
    </span>
  );
}
