"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [message, setMessage] = useState("");
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, is_admin")
        .eq("id", user.id)
        .maybeSingle();

      setAllowed(Boolean(data?.is_admin));
      setLoading(false);
    }

    checkAdmin();
  }, []);

  async function callApi(path: string) {
    setMessage("Working...");

    const secret = prompt("Admin secret?");
    if (!secret) {
      setMessage("Cancelled");
      return;
    }

    try {
      const res = await fetch(`/api/${path}?secret=${secret}`, {
        method: "POST",
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      setMessage(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setMessage("Request failed: " + error.message);
    }
  }

  if (loading) return <div className="p-8">Checking access...</div>;

  if (!allowed) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-3xl font-black">Access denied</h1>
        <p className="mt-3 text-slate-400">You must be logged in as admin.</p>
        <a href="/login" className="mt-6 inline-block underline">
          Login
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-8 text-4xl font-black">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          onClick={() => callApi("import-matches")}
          className="rounded-2xl bg-emerald-500 p-5 font-black text-slate-950"
        >
          Import Fixtures
        </button>

        <button
          onClick={() => callApi("sync-matches")}
          className="rounded-2xl bg-cyan-500 p-5 font-black text-slate-950"
        >
          Sync Live Scores
        </button>
      </div>

      {message && (
        <pre className="mt-8 overflow-auto rounded-2xl bg-white/10 p-5 text-sm">
          {message}
        </pre>
      )}
    </div>
  );
}
