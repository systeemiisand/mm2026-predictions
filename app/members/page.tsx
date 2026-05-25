"use client";

// React hooks for lifecycle handling and local component state
import { useEffect, useState } from "react";

// Supabase client for authentication and database queries
import { supabase } from "@/lib/supabase";

/**
 * Represents one member/profile from the database.
 */
type Member = {
  // Unique user ID
  id: string;

  // User's visible display name
  display_name: string;

  // Optional avatar emoji/icon
  avatar: string | null;

  // Account creation timestamp
  created_at: string;
};

/**
 * MembersPage Component
 *
 * Displays:
 * - All registered users/profiles
 * - Current logged-in user highlight
 * - Basic member profile info
 */
export default function MembersPage() {
  /**
   * Stores all loaded member profiles.
   */
  const [members, setMembers] = useState<Member[]>([]);

  /**
   * Stores current logged-in user's ID.
   *
   * Used to highlight "You" badge.
   */
  const [userId, setUserId] = useState<string | null>(null);

  /**
   * Load:
   * - current authenticated user
   * - all member profiles
   *
   * Runs once when page loads.
   */
  useEffect(() => {
    async function loadMembers() {
      /**
       * Get authenticated user from Supabase auth
       */
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Save current user ID for comparison in UI
      setUserId(user?.id ?? null);

      /**
       * Fetch all user profiles from database.
       *
       * Ordered by account creation date so earliest users appear first.
       */
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, avatar, created_at")
        .order("created_at", { ascending: true });

      // Save members into local component state
      setMembers(data ?? []);
    }

    // Execute async loading function
    loadMembers();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Page title */}
      <h1 className="mb-8 text-4xl font-black">Osalejad</h1>

      {/* Responsive member card grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Render one card for each member */}
        {members.map((member, index) => (
          <div
            key={member.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl"
          >
            {/* Card header */}
            <div className="flex items-center justify-between">
              {/* Member position/index */}
              <div className="text-sm font-bold text-cyan-300">
                Ennustaja {index + 1}
              </div>

              {/* 
                Show "You" badge if this profile belongs
                to currently logged-in user.
              */}
              {member.id === userId && (
                <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-slate-950">
                  You
                </span>
              )}
            </div>

            {/* Main member info section */}
            <div className="mt-4 flex items-center gap-4">
              {/* Avatar/Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                {/* 
                  Use user's avatar if available,
                  otherwise fallback to football emoji.
                */}
                {member.avatar ?? "⚽"}
              </div>

              {/* Display name */}
              <div className="text-xl font-black">{member.display_name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
