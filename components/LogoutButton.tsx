"use client";

// Supabase client used for authentication actions
import { supabase } from "@/lib/supabase";

/**
 * LogoutButton Component
 *
 * Handles:
 * - Signing the current user out
 * - Redirecting user to login page after logout
 */
export default function LogoutButton() {
  /**
   * Logs user out from Supabase Auth session.
   */
  async function logout() {
    // Remove authenticated session from Supabase
    await supabase.auth.signOut();

    // Redirect user to login page after logout
    window.location.href = "/login";
  }

  return (
    <button
      // Trigger logout flow when clicked
      onClick={logout}
      // Tailwind styling for logout button
      className="rounded-xl bg-red-500 px-4 py-2 text-sm font-black text-white hover:bg-red-400"
    >
      Logi välja
    </button>
  );
}
