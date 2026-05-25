"use client";

// React hooks for component state and lifecycle
import { useEffect, useState } from "react";

// Shared Supabase client
import { supabase } from "@/lib/supabase";

/**
 * Admin dashboard page
 *
 * Used for:
 * - importing fixtures from external API
 * - syncing live scores
 * - future admin tools
 */
export default function AdminPage() {
  // Stores API response or status messages shown to admin
  const [message, setMessage] = useState("");

  // Controls whether current user can access admin tools
  const [allowed, setAllowed] = useState(false);

  // Loading state while checking admin access
  const [loading, setLoading] = useState(true);

  /**
   * Check whether logged-in user is admin
   *
   * Runs once when page loads.
   * Reads `is_admin` flag from profiles table.
   */
  useEffect(() => {
    async function checkAdmin() {
      // Get currently logged in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // If no user logged in -> stop loading
      if (!user) {
        setLoading(false);
        return;
      }

      // Load profile information
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, is_admin")
        .eq("id", user.id)
        .maybeSingle();

      // Allow access only if user is marked as admin
      setAllowed(Boolean(data?.is_admin));

      setLoading(false);
    }

    checkAdmin();
  }, []);

  /**
   * Calls protected admin API routes
   *
   * Example routes:
   * - import-matches
   * - sync-matches
   */
  async function callApi(path: string) {
    setMessage("Working...");

    // Ask admin secret before executing action
    const secret = prompt("Admin secret?");

    if (!secret) {
      setMessage("Cancelled");
      return;
    }

    try {
      // Execute API request
      const res = await fetch(`/api/${path}?secret=${secret}`, {
        method: "POST",
      });

      // Read raw response text
      const text = await res.text();

      let data;

      // Try parsing JSON response
      try {
        data = JSON.parse(text);
      } catch {
        // Fallback if response is not valid JSON
        data = { raw: text };
      }

      // Pretty-print response to admin panel
      setMessage(JSON.stringify(data, null, 2));
    } catch (error: any) {
      // Network or request failure
      setMessage("Request failed: " + error.message);
    }
  }

  /**
   * Loading screen while checking permissions
   */
  if (loading) {
    return <div className="p-8">Checking access...</div>;
  }

  /**
   * Block access for non-admin users
   */
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

  /**
   * Main admin dashboard
   */
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-8 text-4xl font-black">Admin Dashboard</h1>

      {/* Admin action buttons */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Imports tournament fixtures from external API */}
        <button
          onClick={() => callApi("import-matches")}
          className="rounded-2xl bg-emerald-500 p-5 font-black text-slate-950"
        >
          Import Fixtures
        </button>

        {/* Syncs latest live scores and match data */}
        <button
          onClick={() => callApi("sync-matches")}
          className="rounded-2xl bg-cyan-500 p-5 font-black text-slate-950"
        >
          Sync Live Scores
        </button>
      </div>

      {/* Shows API responses/errors */}
      {message && (
        <pre className="mt-8 overflow-auto rounded-2xl bg-white/10 p-5 text-sm">
          {message}
        </pre>
      )}
    </div>
  );
}
