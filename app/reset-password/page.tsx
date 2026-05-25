"use client";

// React hook for managing form state
import { useState } from "react";

// Supabase client for authentication actions
import { supabase } from "@/lib/supabase";

/**
 * LoginPage Component
 *
 * Handles:
 * - User login
 * - User registration
 * - Password reset email
 * - Basic Supabase error translation
 */
export default function LoginPage() {
  // Controls whether the form is in login or register mode
  const [mode, setMode] = useState<"login" | "register">("login");

  // Email input value
  const [email, setEmail] = useState("");

  // Password input value
  const [password, setPassword] = useState("");

  // Display name input value, used only during registration
  const [displayName, setDisplayName] = useState("");

  // Status or error message shown to the user
  const [message, setMessage] = useState("");

  /**
   * Converts Supabase authentication error messages
   * into simpler Estonian messages for users.
   */
  function translateError(errorMessage: string) {
    // Normalize message for easier matching
    const msg = errorMessage.toLowerCase();

    // Missing or invalid email-related error
    if (msg.includes("email")) return "Puudub email";

    // Missing or invalid password-related error
    if (msg.includes("password")) return "Puudub parool";

    // Wrong email/password combination
    if (msg.includes("invalid login credentials")) {
      return "Vale email või parool";
    }

    // Fallback: show original Supabase message
    return errorMessage;
  }

  /**
   * Registers a new user with Supabase Auth.
   *
   * Also stores display_name inside user metadata,
   * so it can later be used for profile creation/display.
   */
  async function register() {
    // Clear old messages
    setMessage("");

    /**
     * Create new Supabase auth user.
     *
     * emailRedirectTo decides where user lands
     * after confirming their email.
     */
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/matches`,
        data: {
          display_name: displayName,
        },
      },
    });

    // Show translated error if registration fails
    if (error) {
      setMessage(translateError(error.message));
      return;
    }

    // Inform user to confirm account by email
    setMessage("Kontrolli oma emaili konto kinnitamiseks.");
  }

  /**
   * Logs user in with email and password.
   */
  async function login() {
    // Clear old messages
    setMessage("");

    /**
     * Authenticate user with Supabase Auth.
     */
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Show translated error if login fails
    if (error) {
      setMessage(translateError(error.message));
      return;
    }

    // Redirect successful login to matches page
    window.location.href = "/matches";
  }

  /**
   * Sends password reset link to user's email.
   *
   * User must enter their email first.
   */
  async function resetPassword() {
    // Clear old messages
    setMessage("");

    // Email is required so Supabase knows where to send reset link
    if (!email) {
      setMessage("Sisesta esmalt email üleval olevasse emaili lahtrisse.");
      return;
    }

    /**
     * Send password reset email.
     *
     * redirectTo decides where the reset email link opens.
     */
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    // Show translated error if request fails
    if (error) {
      setMessage(translateError(error.message));
      return;
    }

    // Inform user reset email was sent
    setMessage("Parooli muutmise link saadeti emailile.");
  }

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      {/* Page title changes depending on login/register mode */}
      <h1 className="mb-6 text-4xl font-black">
        {mode === "login" ? "Logi sisse" : "Registreeru"}
      </h1>

      {/* Main form card */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        {/* Display name field appears only during registration */}
        {mode === "register" && (
          <input
            className="mb-4 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-950"
            placeholder="Sinu nimi"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        )}

        {/* Email field used for login, registration, and password reset */}
        <input
          className="mb-4 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-950"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password field used for login and registration */}
        <input
          className="mb-4 w-full rounded-2xl bg-slate-100 p-3 font-bold text-slate-950"
          placeholder="Parool"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Main submit button changes action based on current mode */}
        <button
          onClick={mode === "login" ? login : register}
          className="w-full rounded-2xl bg-emerald-500 px-6 py-3 font-black text-slate-950 hover:bg-emerald-400"
        >
          {mode === "login" ? "Logi sisse" : "Loo konto"}
        </button>

        {/* Switch between login and registration modes */}
        <button
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

        {/* Sends password reset email to entered email address */}
        <button
          onClick={resetPassword}
          className="mt-4 w-full text-sm text-slate-300 underline hover:text-cyan-300"
        >
          Saada parooli taastamise link
        </button>

        {/* Status/error message */}
        {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
      </div>
    </div>
  );
}
