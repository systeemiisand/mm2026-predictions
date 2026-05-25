// Global CSS styles used across the whole app
import "./globals.css";

// Logout button component shown in the main navigation
import LogoutButton from "@/components/LogoutButton";

/**
 * Metadata for the Next.js app.
 *
 * Used for browser title, SEO, and page description.
 */
export const metadata = {
  title: "MM2026 Predictions",
  description: "Football prediction competition",
};

/**
 * RootLayout Component
 *
 * This is the main layout wrapper for the whole app.
 * It provides:
 * - HTML/body structure
 * - Global background and text styling
 * - Main navigation bar
 * - Shared page layout for all routes
 */
export default function RootLayout({
  children,
}: {
  // Page content rendered inside this layout
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Global page body styling */}
      <body className="min-h-screen bg-slate-950 text-slate-100">
        {/* Main navigation bar */}
        <nav className="w-full border-b border-slate-700 bg-slate-950 text-white shadow-lg">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            {/* App logo / home link */}
            <a href="/matches" className="text-2xl font-black text-white">
              MM2026
            </a>

            {/* Navigation links */}
            <div className="flex flex-wrap items-center gap-5 text-sm font-semibold text-slate-100">
              <a href="/matches" className="transition hover:text-cyan-300">
                Mängud
              </a>

              <a href="/leaderboard" className="transition hover:text-cyan-300">
                Edetabel
              </a>

              <a href="/members" className="transition hover:text-cyan-300">
                Osalejad
              </a>

              <a href="/profile" className="transition hover:text-cyan-300">
                Profiil
              </a>

              <a href="/tournament" className="transition hover:text-cyan-300">
                Boonus
              </a>

              <a href="/rules" className="transition hover:text-cyan-300">
                Reeglid
              </a>

              {/* Login and logout controls */}
              <div className="flex items-center gap-3">
                <a
                  href="/login"
                  className="rounded-xl bg-emerald-500 px-4 py-2 font-bold text-slate-950 hover:bg-emerald-400"
                >
                  Logi sisse
                </a>

                {/* Handles signing the user out */}
                <LogoutButton />
              </div>
            </div>
          </div>
        </nav>

        {/* Current route/page content is rendered here */}
        <main>{children}</main>
      </body>
    </html>
  );
}
