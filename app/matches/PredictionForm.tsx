"use client";

// React hooks for managing state and syncing initial data
import { useEffect, useState } from "react";

// Supabase client for authentication and database actions
import { supabase } from "@/lib/supabase";

/**
 * Props received by the PredictionForm component.
 */
type Props = {
  // Current match ID
  matchId: number;

  // Kickoff datetime used to lock predictions after match starts
  kickoffAt: string;

  // Current match minute, if available from match data
  matchMinute?: number | null;

  // Existing prediction loaded from database
  initialPrediction?: {
    predicted_home_score: number;
    predicted_away_score: number;
  };

  // User's late-change power status
  initialLatePower?: {
    power_type: string;
    match_id: number | null;
    used_at: string | null;
  };

  // Points earned for this match, if already calculated
  initialPoints?: number;
};

/**
 * PredictionForm Component
 *
 * Handles:
 * - Showing and editing score predictions
 * - Saving predictions to Supabase
 * - Locking predictions after kickoff
 * - Allowing one late change power until 45th minute
 * - Displaying saved prediction and points
 */
export default function PredictionForm({
  matchId,
  kickoffAt,
  matchMinute,
  initialPrediction,
  initialLatePower,
  initialPoints,
}: Props) {
  // Home team predicted score input value
  const [homeScore, setHomeScore] = useState("");

  // Away team predicted score input value
  const [awayScore, setAwayScore] = useState("");

  // Status/error message shown to user
  const [message, setMessage] = useState("");

  // Text version of saved prediction shown above form
  const [savedPrediction, setSavedPrediction] = useState("");

  // Whether user still has the late-change power available
  const [lateChangeAvailable, setLateChangeAvailable] = useState(false);

  // Whether late-change power is active for this match
  const [lateChangeActive, setLateChangeActive] = useState(false);

  // Match is considered started once current time is past kickoff
  const hasStarted = new Date() >= new Date(kickoffAt);

  // Fallback estimated match minute based on kickoff time
  const estimatedMinute = Math.floor(
    (Date.now() - new Date(kickoffAt).getTime()) / 60000,
  );

  // Use real match minute if available, otherwise fallback to estimated minute
  const safeMatchMinute = matchMinute ?? estimatedMinute;

  // Late changes are only allowed after kickoff, until minute 45, and only when power is active
  const canLateChange = hasStarted && safeMatchMinute <= 45 && lateChangeActive;

  // Prediction form is locked after kickoff unless late-change is active
  const isLocked = hasStarted && !canLateChange;

  /**
   * Load initial prediction and late-change state into local component state.
   *
   * Runs when:
   * - match changes
   * - initial prediction changes
   * - initial late power changes
   */
  useEffect(() => {
    // Pre-fill inputs if user already has a saved prediction
    if (initialPrediction) {
      setHomeScore(String(initialPrediction.predicted_home_score));
      setAwayScore(String(initialPrediction.predicted_away_score));

      setSavedPrediction(
        `${initialPrediction.predicted_home_score} - ${initialPrediction.predicted_away_score}`,
      );
    }

    // If late-change power exists but has not been used, show the activation button
    if (initialLatePower && !initialLatePower.used_at) {
      setLateChangeAvailable(true);
    }

    // If late-change power was used on this match, enable late editing
    if (initialLatePower?.match_id === matchId && initialLatePower.used_at) {
      setLateChangeActive(true);
    }
  }, [matchId, initialPrediction, initialLatePower]);

  /**
   * Saves or updates user's prediction in Supabase.
   *
   * Flow:
   * 1. Check logged-in user
   * 2. Check if prediction is locked
   * 3. Upsert prediction into database
   * 4. Update local saved prediction UI
   */
  async function savePrediction() {
    // Clear old messages
    setMessage("");

    // Get currently authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // User must be logged in to save prediction
    if (!user) {
      setMessage("Palun logi sisse.");
      return;
    }

    // Prevent saving if prediction is locked
    if (isLocked) {
      setMessage("Ennustus on lukus.");
      return;
    }

    /**
     * Insert or update prediction.
     *
     * onConflict makes sure each user can only have
     * one prediction per match.
     */
    const { error } = await supabase.from("predictions").upsert(
      {
        user_id: user.id,
        match_id: matchId,
        predicted_home_score: Number(homeScore),
        predicted_away_score: Number(awayScore),
      },
      {
        onConflict: "user_id,match_id",
      },
    );

    // Show database error if save fails
    if (error) {
      setMessage(error.message);
      return;
    }

    // Update local saved prediction display
    setSavedPrediction(`${homeScore} - ${awayScore}`);

    // Success message
    setMessage("Sinu ennustus salvestatud ✅");
  }

  /**
   * Activates late-change power for this match.
   *
   * This allows the user to edit prediction after kickoff,
   * but only until the 45th minute.
   */
  async function useLateChange() {
    // Clear old messages
    setMessage("");

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // User must be logged in
    if (!user) {
      setMessage("Palun logi sisse.");
      return;
    }

    // Late-change power can only be activated after kickoff
    if (!hasStarted) {
      setMessage("Hilisemat muutust saab kasutada ainult pärast avavilet.");
      return;
    }

    // Late-change power expires after minute 45
    if (safeMatchMinute > 45) {
      setMessage(
        "Liiga hilja. Hilisem muutus töötab ainult kuni 45. minutini.",
      );
      return;
    }

    /**
     * Save late-change usage to Supabase.
     *
     * onConflict makes sure each user can only use
     * one late_change power.
     */
    const { error } = await supabase.from("powers").upsert(
      {
        user_id: user.id,
        power_type: "late_change",
        match_id: matchId,
        used_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,power_type",
      },
    );

    // Show database error if activation fails
    if (error) {
      setMessage(error.message);
      return;
    }

    // Hide activation button
    setLateChangeAvailable(false);

    // Unlock prediction editing for this match
    setLateChangeActive(true);

    // Success message
    setMessage("Hilisem muutus aktiveeritud 🕒");
  }

  return (
    <div className="mt-5 rounded-2xl bg-white/5 p-4">
      {/* Show saved prediction if available */}
      {savedPrediction && (
        <p className="mb-3 text-sm text-emerald-300">
          Sinu ennustus: <b>{savedPrediction}</b>
        </p>
      )}

      {/* Show earned points if points have been calculated */}
      {initialPoints !== undefined && (
        <p className="mb-3 text-sm font-black text-yellow-300">
          Selle mängu punktid: {initialPoints}
        </p>
      )}

      {/* Score input row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Home score input */}
        <input
          type="number"
          className="w-16 rounded-2xl bg-slate-100 p-3 text-center text-xl font-black text-slate-900 shadow-lg focus:outline-none"
          value={homeScore}
          disabled={isLocked}
          onChange={(e) => setHomeScore(e.target.value)}
        />

        {/* Score separator */}
        <span className="font-bold text-slate-400">-</span>

        {/* Away score input */}
        <input
          type="number"
          className="w-16 rounded-2xl bg-slate-100 p-3 text-center text-xl font-black text-slate-900 shadow-lg focus:outline-none"
          value={awayScore}
          disabled={isLocked}
          onChange={(e) => setAwayScore(e.target.value)}
        />

        {/* Save prediction button */}
        <button
          onClick={savePrediction}
          disabled={isLocked}
          className="rounded-xl bg-emerald-500 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-400 disabled:bg-slate-600 disabled:text-slate-300"
        >
          Kinnita
        </button>
      </div>

      {/* Button for activating late-change power */}
      {lateChangeAvailable && !lateChangeActive && (
        <button
          type="button"
          onClick={useLateChange}
          className="mt-3 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 hover:bg-cyan-200"
        >
          🕒 Kasuta hilisemat muudatust
        </button>
      )}

      {/* Message shown when late-change power is active */}
      {lateChangeActive && safeMatchMinute <= 45 && (
        <p className="mt-3 text-sm font-bold text-cyan-300">
          🕒 Hilisem muudatus aktiivne — saad muuta kuni 45&apos;
        </p>
      )}

      {/* Locked state warning */}
      {isLocked && <p className="mt-2 text-red-400">Lukus</p>}

      {/* General status or error message */}
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
