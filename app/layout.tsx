import "./globals.css";

import AuthButton from "@/components/AuthButton";
import UserStatus from "@/components/UserStatus";

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
        <nav className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-950/95 text-white shadow-lg backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <a href="/matches" className="text-2xl font-black text-white">
                MM2026
              </a>

              <div className="flex items-center gap-2">
                <UserStatus />
                <AuthButton />
              </div>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="flex min-w-max items-center gap-2 text-sm font-semibold text-slate-100">
                <a
                  href="/matches"
                  className="rounded-full bg-white/10 px-4 py-2 transition hover:bg-cyan-300/20 hover:text-cyan-200"
                >
                  Mängud
                </a>

                <a
                  href="/leaderboard"
                  className="rounded-full bg-white/10 px-4 py-2 transition hover:bg-cyan-300/20 hover:text-cyan-200"
                >
                  Edetabel
                </a>

                <a
                  href="/members"
                  className="rounded-full bg-white/10 px-4 py-2 transition hover:bg-cyan-300/20 hover:text-cyan-200"
                >
                  Osalejad
                </a>

                <a
                  href="/profile"
                  className="rounded-full bg-white/10 px-4 py-2 transition hover:bg-cyan-300/20 hover:text-cyan-200"
                >
                  Profiil
                </a>

                <a
                  href="/tournament"
                  className="rounded-full bg-white/10 px-4 py-2 transition hover:bg-cyan-300/20 hover:text-cyan-200"
                >
                  Boonus
                </a>

                <a
                  href="/rules"
                  className="rounded-full bg-white/10 px-4 py-2 transition hover:bg-cyan-300/20 hover:text-cyan-200"
                >
                  Reeglid
                </a>
              </div>
            </div>
          </div>
        </nav>

        <main className="pb-10">{children}</main>
      </body>
    </html>
  );
}
