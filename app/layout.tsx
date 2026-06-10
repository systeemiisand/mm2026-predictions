import UserStatus from "@/components/UserStatus";
import "./globals.css";
import HamburgerMenu from "@/components/HamburgerMenu";
import AuthButton from "@/components/AuthButton";
import NavLink from "@/components/NavLink";

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
        <nav className="sticky top-0 z-50 bg-black backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <a
              href="/matches"
              className="text-xl font-bold text-white"
            >
              MM2026
            </a>

            <div className="flex items-center gap-4">

              <div className="hidden md:block">
                <UserStatus />
              </div>

              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-1 rounded-full bg-slate-900/40 p-1 border border-slate-800">
                <NavLink href="/matches">Mängud</NavLink>
                <NavLink href="/leaderboard">Edetabel</NavLink>
                <NavLink href="/members">Osalejad</NavLink>
                <NavLink href="/profile">Profiil</NavLink>
                <NavLink href="/tournament">Boonus</NavLink>
                <NavLink href="/rules">Reeglid</NavLink>
              </div>

              <div className="hidden md:flex">
                <AuthButton />
              </div>

              {/* Mobile */}
              <div className="md:hidden"> 
                <HamburgerMenu />
              </div>
            </div>
          </div>
        </nav>
        <main className="pb-10 bg-slate-100">{children}</main>
      </body>
    </html>
  );
}
