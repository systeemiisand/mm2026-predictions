"use client";

// React state for login/register form fields and messages
import { useState } from "react";

// Shared Supabase client for authentication
import { supabase } from "@/lib/supabase";

/**
 * Login and registration page
 *
 * Handles:
 * - user login
 * - new account registration
 * - password reset email request
 */
export default function LoginPage() {
  // Switches between login form and register form
  const [mode, setMode] = useState<"login" | "register">("login");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Display name is only used during registration
  const [displayName, setDisplayName] = useState("");

  // User-facing success/error message
  const [message, setMessage] = useState("");

  /**
   * Converts Supabase auth errors into clearer Estonian messages.
   */
  function translateError(errorMessage: string) {
    const msg = errorMessage.toLowerCase();

    if (msg.includes("invalid login credentials")) {
      return "Vale email või parool";
    }

    if (msg.includes("password")) {
      return "Parool puudub või on liiga lühike";
    }

    return errorMessage;
  }

  /**
   * Creates a new Supabase Auth user.
   *
   * `display_name` is stored in auth metadata.
   * Profile row is usually created by database trigger or later profile save.
   */
  async function register() {
    setMessage("");

    if (!email) {
      setMessage("Puudub email");
      return;
    }

    if (!password) {
      setMessage("Puudub parool");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // After email confirmation, user returns to matches page
        emailRedirectTo: `${window.location.origin}/matches`,
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      setMessage(translateError(error.message));
      return;
    }

    setMessage("Kontrolli oma emaili konto kinnitamiseks.");
  }

  /**
   * Logs user in with email + password.
   */
  async function login() {
    setMessage("");

    if (!email) {
      setMessage("Puudub email");
      return;
    }

    if (!password) {
      setMessage("Puudub parool");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(translateError(error.message));
      return;
    }

    // After successful login, go to matches page
    window.location.href = "/matches";
  }

  /**
   * Sends Supabase password reset email.
   *
   * User must enter email first.
   * Supabase will send reset link to `/reset-password`.
   */
  async function resetPassword() {
    setMessage("");

    if (!email) {
      setMessage("Sisesta email");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage(translateError(error.message));
      return;
    }

    setMessage("Parooli muutmise link saadeti emailile.");
  }

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-6 text-4xl font-black">
        {mode === "login" ? "Logi sisse" : "Registreeru"}
      </h1>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        {/* Registration-only display name field */}
        {mode === "register" && (
          <input
            className="mb-4 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-950"
            placeholder="Sinu nimi"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        )}

        {/* Email input for both login and registration */}
        <input
          className="mb-4 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-950"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password input for both login and registration */}
        <input
          className="mb-4 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-950"
          placeholder="Parool"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Main submit button */}
        <button
          type="button"
          onClick={mode === "login" ? login : register}
          className="w-full rounded-2xl bg-emerald-500 px-6 py-3 font-black text-slate-950 hover:bg-emerald-400"
        >
          {mode === "login" ? "Logi sisse" : "Loo konto"}
        </button>

        {/* Switch between login and registration */}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setMessage("");
          }}
          className="mt-4 w-full text-sm text-cyan-300 underline"
        >
          {mode === "login"
            ? "Pole kontot? Registreeru"
            : "Konto olemas? Logi sisse"}
        </button>

        {/* Password reset action */}
        <button
          type="button"
          onClick={resetPassword}
          className="mt-4 w-full text-sm text-slate-300 underline hover:text-cyan-300"
        >
          Unustasid parooli?
        </button>

        {/* Success/error message */}
        {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
      </div>
    </div>
  );
}
