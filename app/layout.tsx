import "./globals.css";

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
        <nav className="border-b border-white/10 bg-slate-900/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <a href="/matches" className="text-xl font-bold">
              MM2026
            </a>

            <div className="flex gap-4 text-sm text-slate-300">
              <a href="/matches" className="hover:text-white">
                Mängud
              </a>
              <a href="/leaderboard" className="hover:text-white">
                Edekabel
              </a>
              <a href="/login" className="hover:text-white">
                Logi sisse
              </a>
            </div>
          </div>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}
