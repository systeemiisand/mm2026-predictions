"use client";

// React hooks for component state and lifecycle handling
import { useEffect, useState } from "react";

// Supabase client for authentication and database operations
import { supabase } from "@/lib/supabase";

/**
 * Represents a power-up record from the database.
 */
type Power = {
  // Type of power-up (currently only "double_points")
  power_type: string;

  // Match where the power-up was used
  match_id: number | null;

  // Timestamp when the power-up was activated
  used_at: string | null;
};

/**
 * Component props definition.
 */
type Props = {
  // Current match ID
  matchId: number;

  // Match kickoff datetime used for locking predictions/powers
  kickoffAt: string;

  // Existing power data loaded from database (if user already used it)
  initialPower?: Power;

  // Optional callback triggered after successful power activation
  onPowerUsed?: (power: Power) => void;
};

/**
 * PowerButtons Component
 *
 * Handles:
 * - Double points activation
 * - Match lock validation
 * - Database updates
 * - UI state for active/used powers
 */
export default function PowerButtons({
  matchId,
  kickoffAt,
  initialPower,
  onPowerUsed,
}: Props) {
  /**
   * UI message shown to user
   */
  const [message, setMessage] = useState("");

  /**
   * Tracks whether user has already used double points
   */
  const [doubleUsed, setDoubleUsed] = useState(false);

  /**
   * Loading state while request is processing
   */
  const [loading, setLoading] = useState(false);

  /**
   * Match becomes locked once kickoff time is reached.
   * Prevents activating powers after kickoff.
   */
  const isLocked = new Date() >= new Date(kickoffAt);

  /**
   * Sync local component state with initial power data.
   *
   * Runs whenever:
   * - match changes
   * - initialPower changes
   */
  useEffect(() => {
    // If power already exists in database
    if (initialPower?.used_at) {
      setDoubleUsed(true);

      // Show active message only for current match
      if (initialPower.match_id === matchId) {
        setMessage("Sellel matšil aktiivsed topeltpunktid ⚡");
      }
    } else {
      // Reset state if no power is used
      setDoubleUsed(false);
      setMessage("");
    }
  }, [matchId, initialPower]);

  /**
   * Activates double points for current match.
   *
   * Flow:
   * 1. Validate logged-in user
   * 2. Check kickoff lock
   * 3. Ensure power not already used
   * 4. Confirm user action
   * 5. Save to Supabase
   * 6. Update local UI state
   */
  async function useDoublePoints() {
    // Clear old messages
    setMessage("");

    // Enable loading UI
    setLoading(true);

    /**
     * Get authenticated user from Supabase
     */
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // User must be logged in
    if (!user) {
      setMessage("Palun logi sisse.");
      setLoading(false);
      return;
    }

    // Prevent usage after kickoff
    if (isLocked) {
      setMessage("Liiga hilja. Topeltpunktid tuleb aktiveerida enne avavilet.");
      setLoading(false);
      return;
    }

    // Prevent duplicate usage
    if (initialPower?.used_at || doubleUsed) {
      setMessage("Topeltpunktid on juba kasutatud.");
      setDoubleUsed(true);
      setLoading(false);
      return;
    }

    /**
     * Confirmation dialog because power usage is permanent
     */
    const confirmed = window.confirm(
      "Kas oled kindel? Topeltpunktid saab kasutada ainult ühe korra ja seda ei saa tagasi võtta.",
    );

    // User cancelled action
    if (!confirmed) {
      setMessage("Topeltpunktide kasutamine tühistatud.");
      setLoading(false);
      return;
    }

    /**
     * Generate ISO timestamp for database storage
     */
    const usedAt = new Date().toISOString();

    /**
     * Save/update power usage in Supabase.
     *
     * onConflict:
     * Ensures one unique power per user + power type.
     */
    const { error } = await supabase
      .from("powers")
      .update({
        match_id: matchId,
        used_at: usedAt,
      })
      .eq("user_id", user.id)
      .eq("power_type", "double_points")
      .is("used_at", null);

    // Handle database error
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    /**
     * Local power object used for callback/UI updates
     */
    const usedPower = {
      power_type: "double_points",
      match_id: matchId,
      used_at: usedAt,
    };

    /**
     * Notify parent component that power was used
     */
    onPowerUsed?.(usedPower);

    // Update local UI state
    setDoubleUsed(true);

    // Success message
    setMessage("Sellel matšil aktiivsed topeltpunktid ⚡");

    // Stop loading state
    setLoading(false);
  }

  return (
    <div className="mt-4">
      {/* 
        If double points are active for THIS match,
        show highlighted active state card.
      */}
      {doubleUsed && initialPower?.match_id === matchId ? (
        <div className="rounded-2xl border border-yellow-300/40 bg-yellow-300/10 p-3 shadow-lg shadow-yellow-300/10">
          <div className="flex items-center gap-2">
            {/* Lightning icon */}
            <span className="text-xl">⚡</span>

            <div>
              {/* Main active state title */}
              <p className="font-black text-yellow-300">
                TOPELT PUNKTID AKTIIVSED
              </p>

              {/* Additional explanation */}
              <p className="text-xs text-yellow-100/70">
                Selle mängu punktid duubeldatakse.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /**
         * Default activation button
         */
        <button
          type="button"
          // Trigger power activation flow
          onClick={useDoublePoints}
          // Disable if already used, locked, or loading
          disabled={doubleUsed || isLocked || loading}
          // Tailwind styling
          className="rounded-xl bg-yellow-300 px-4 py-2 text-sm font-black text-slate-950 hover:bg-yellow-200 disabled:bg-slate-600 disabled:text-slate-300"
        >
          {/* Dynamic button text based on state */}
          {loading
            ? "Aktiveerin..."
            : doubleUsed
              ? "⚡ Kasutatud"
              : "⚡ Topelt punktid"}
        </button>
      )}

      {/* 
        Show status/error message
        but hide duplicate active-state message
        because active card already displays it.
      */}
      {message && !message.includes("aktiivsed") && (
        <p className="mt-2 text-sm text-yellow-300">{message}</p>
      )}
    </div>
  );
}
