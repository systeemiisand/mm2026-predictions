import "./globals.css";
import HamburgerMenu from "@/components/HamburgerMenu";

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
        <nav className="sticky top-0 z-50 flex items-center justify-between bg-slate-950 px-4 py-3 text-white shadow-lg">
          <a
            href="/matches"
            className="text-2xl font-black tracking-wide text-cyan-400"
          >
            MM2026
          </a>

          <HamburgerMenu />
        </nav>
        <main className="pb-10">{children}</main>
      </body>
    </html>
  );
}
