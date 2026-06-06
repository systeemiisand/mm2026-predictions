"use client";

// React hooks for syncing initial power state and storing UI data
import { useEffect, useState } from "react";

// Supabase client for authentication and database operations
import { supabase } from "@/lib/supabase";

/**
 * Represents one power-up record from the database.
 */
type Power = {
  // Power type, for this component expected to be "spy"
  power_type: string;

  // Match where the spy power was used
  match_id: number | null;

  // Timestamp when the power was activated
  used_at: string | null;
};

/**
 * Props received by SpyPower component.
 */
type Props = {
  // Current match ID
  matchId: number;

  // Existing spy power data loaded from database, if available
  initialPower?: Power;

  // Optional callback triggered after spy power is successfully used
  onPowerUsed?: (power: Power) => void;
};

/**
 * Shape of prediction data loaded for spy results.
 */
type SpyPrediction = {
  // Predicted score for home team
  predicted_home_score: number;

  // Predicted score for away team
  predicted_away_score: number;

  /**
   * Related user profile data.
   *
   * Supabase relationship queries can sometimes return either
   * an object or an array, so this type supports both.
   */
  profiles:
    | {
        display_name: string;
      }
    | {
        display_name: string;
      }[]
    | null;
};

/**
 * SpyPower Component
 *
 * Handles:
 * - Activating the spy power
 * - Saving spy usage to Supabase
 * - Loading other users' predictions for the selected match
 * - Showing spy results only if spy was used for this match
 */
export default function SpyPower({
  matchId,
  initialPower,
  onPowerUsed,
}: Props) {
  // Status/error message shown to the user
  const [message, setMessage] = useState("");

  // Tracks whether spy was used specifically for the current match
  const [spyUsedForThisMatch, setSpyUsedForThisMatch] = useState(false);

  // Tracks whether spy has already been used at all
  const [spyAlreadyUsed, setSpyAlreadyUsed] = useState(false);

  // Predictions revealed by the spy power
  const [predictions, setPredictions] = useState<SpyPrediction[]>([]);

  /**
   * Sync component state with initial spy power data.
   *
   * If spy was already used:
   * - Hide activation button
   * - If it was used for this match, show and load spy results
   */
  useEffect(() => {
    if (initialPower?.used_at) {
      setSpyAlreadyUsed(true);

      if (initialPower.match_id === matchId) {
        setSpyUsedForThisMatch(true);
        loadPredictions();
      }
    }
  }, [matchId, initialPower]);

  /**
   * Loads all predictions for the current match.
   *
   * Also fetches profile display names so the UI can show
   * which user made each prediction.
   */
  async function loadPredictions() {
    const { data, error } = await supabase
      .from("predictions")
      .select(
        `
        predicted_home_score,
        predicted_away_score,
        profiles (
          display_name
        )
      `,
      )
      .eq("match_id", matchId);

    // Show Supabase error if query fails
    if (error) {
      setMessage(error.message);
      return;
    }

    // Store loaded predictions in component state
    setPredictions((data as SpyPrediction[]) ?? []);
  }

  /**
   * Activates the spy power for this match.
   *
   * Flow:
   * 1. Check logged-in user
   * 2. Prevent duplicate spy usage
   * 3. Save spy usage to Supabase
   * 4. Notify parent component
   * 5. Load and display predictions
   */
  async function useSpy() {
    // Clear old messages
    setMessage("");

    // Get currently authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // User must be logged in to use spy
    if (!user) {
      setMessage("Palun logi sisse.");
      return;
    }

    // Spy can only be used once
    if (initialPower?.used_at || spyAlreadyUsed) {
      setSpyAlreadyUsed(true);
      setMessage("Spioon on juba kasutatud.");
      return;
    }

    // ADD HERE
    const confirmed = window.confirm(
      "Kas oled kindel? Spiooni saab kasutada ainult ühe korra ja seda ei saa tagasi võtta.",
    );

    if (!confirmed) {
      setMessage("Spiooni kasutamine tühistatud.");
      setSpyAlreadyUsed(false);
      return;
    }

    // Save activation time
    const usedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from("powers")
      .update({
        match_id: matchId,
        used_at: usedAt,
      })
      .eq("user_id", user.id)
      .eq("power_type", "spy")
      .is("used_at", null)
      .select();

    if (error) {
      setMessage(error.message);
      return;
    }

    if (!data || data.length === 0) {
      setMessage("Spiooni pole saadaval või see on juba kasutatud.");
      setSpyAlreadyUsed(true);
      return;
    }
    // Show database error if activation fails
    if (error) {
      setMessage(error.message);
      return;
    }

    /**
     * Local power object passed back to parent component
     */
    const usedPower = {
      power_type: "spy",
      match_id: matchId,
      used_at: usedAt,
    };

    // Notify parent so it can update its own state
    onPowerUsed?.(usedPower);

    // Mark spy as used globally
    setSpyAlreadyUsed(true);

    // Mark spy as active for this match
    setSpyUsedForThisMatch(true);

    // Success message
    setMessage("Spioon aktiveeritud 👁");

    // Load revealed predictions
    loadPredictions();
  }

  return (
    <div className="mt-4">
      {/* Show activation button only if spy has not been used yet */}
      {!spyAlreadyUsed && (
        <button
          type="button"
          onClick={useSpy}
          className="rounded-xl bg-purple-300 px-4 py-2 text-sm font-black text-slate-950 hover:bg-purple-200"
        >
          👁 Vaata teiste ennustusi
        </button>
      )}

      {/* Show used message if spy was used on another match */}
      {spyAlreadyUsed && !spyUsedForThisMatch && (
        <p className="text-sm text-purple-300">👁 Spioon juba kasutatud</p>
      )}

      {/* Show prediction results if spy was used for this match */}
      {spyUsedForThisMatch && (
        <div className="rounded-2xl border border-purple-300/40 bg-purple-300/10 p-3">
          <p className="mb-2 font-black text-purple-300">
            👁 Spiooni tulemused
          </p>

          {/* Empty state when no predictions exist yet */}
          {predictions.length === 0 ? (
            <p className="text-sm text-slate-400">Ennustusi veel pole.</p>
          ) : (
            <div className="space-y-2">
              {/* Render each revealed prediction */}
              {predictions.map((prediction, index) => (
                <div
                  key={index}
                  className="flex justify-between rounded-xl bg-white/5 px-3 py-2 text-sm"
                >
                  {/* 
                    Show profile display name.
                    Supports both object and array relation formats.
                  */}
                  <span>
                    {Array.isArray(prediction.profiles)
                      ? (prediction.profiles[0]?.display_name ?? "Tundmatu")
                      : (prediction.profiles?.display_name ?? "Tundmatu")}
                  </span>

                  {/* Show predicted score */}
                  <b>
                    {prediction.predicted_home_score} -{" "}
                    {prediction.predicted_away_score}
                  </b>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* General status or error message */}
      {message && <p className="mt-2 text-sm text-purple-300">{message}</p>}
    </div>
  );
}
