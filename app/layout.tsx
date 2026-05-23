import "./globals.css";
import LogoutButton from "@/components/LogoutButton";

export const metadata = {
  title: "MM2026 Predictions",
  description: "Football prediction competition",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <nav className="w-full border-b border-slate-700 bg-slate-950 text-white shadow-lg">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <a href="/matches" className="text-2xl font-black text-white">
              MM2026
            </a>

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

              <LogoutButton />
            </div>
          </div>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}
