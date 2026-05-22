type RuleSectionProps = {
  icon: string;
  title: string;
  accent: string;
  children: React.ReactNode;
};

function RuleSection({ icon, title, accent, children }: RuleSectionProps) {
  return (
    <section className="rounded-3xl border border-slate-300 bg-white p-6 shadow-lg">
      <div className="grid gap-5 sm:grid-cols-[80px_1fr]">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${accent}`}
        >
          {icon}
        </div>

        <div>
          <h2 className="mb-4 break-words text-2xl font-black text-slate-950">
            {title}
          </h2>

          <div className="space-y-3 text-base font-medium text-slate-700">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function RuleItem({
  children,
  points,
}: {
  children: React.ReactNode;
  points?: string;
}) {
  return (
    <div className="flex items-start gap-3 overflow-hidden">
      <div className="mt-[10px] h-2 w-2 shrink-0 rounded-full bg-emerald-500" />

      <div className="min-w-0 flex-1 text-sm leading-relaxed text-slate-700 sm:text-base">
        {children}

        {points && (
          <span className="ml-2 inline-block rounded-full bg-emerald-100 px-2 py-1 text-xs font-black text-emerald-700 sm:text-sm">
            {points}
          </span>
        )}
      </div>
    </div>
  );
}

function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
      <p className="text-base font-black text-red-600">{children}</p>
    </div>
  );
}

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-slate-200 text-slate-950">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
        <header className="mb-8 rounded-3xl bg-slate-950 p-7 text-white shadow-xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            MM2026 Ennustusliiga
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Reeglid & punktisüsteem
          </h1>

          <p className="mt-3 max-w-3xl text-slate-300">
            Siit leiad kõik punktide arvestamise reeglid, võimendid ja turniiri
            boonuspunktid.
          </p>
        </header>

        <div className="space-y-5">
          <RuleSection
            icon="⚽"
            title="Tavalised mängud"
            accent="bg-emerald-100 text-emerald-700"
          >
            <RuleItem points="6 punkti">Õige täpne tulemus:</RuleItem>
            <RuleItem points="4 punkti">
              Õige võitja + ühe tiimi täpne väravate arv:
            </RuleItem>
            <RuleItem points="3 punkti">Õige võitja:</RuleItem>
            <RuleItem points="1 punkt">
              Ühe tiimi täpne väravate arv, aga vale võitja:
            </RuleItem>
          </RuleSection>

          <RuleSection
            icon="🤝"
            title="Viigid"
            accent="bg-cyan-100 text-cyan-700"
          >
            <RuleItem points="6 punkti">Täpne viik, näiteks 1-1:</RuleItem>

            <RuleItem points="3 punkti">
              Viik ilma täpse skoorita, näiteks ennustad 0-0 ja lõpeb 2-2:
            </RuleItem>
          </RuleSection>

          <RuleSection
            icon="🥅"
            title="Penaltitega mängud"
            accent="bg-purple-100 text-purple-700"
          >
            <RuleItem points="9 punkti">
              Täpne viik + õige penaltite võitja:
            </RuleItem>

            <RuleItem points="6 punkti">
              Täpne viik + vale penaltite võitja:
            </RuleItem>

            <RuleItem points="6 punkti">
              Viik ilma täpse skoorita + õige penaltite võitja:
            </RuleItem>

            <RuleItem points="3 punkti">
              Viik ilma täpse skoorita ja vale penaltite võitja:
            </RuleItem>

            <WarningBox>
              NB! Kui ennustad ühe tiimi võitu, aga mäng lõpeb viigiga ja läheb
              penaltitele, siis penaltite võitja eest punkte ei saa.
            </WarningBox>
          </RuleSection>

          <RuleSection
            icon="⚡"
            title="Võimendid"
            accent="bg-yellow-100 text-yellow-700"
          >
            <RuleItem>
              <b>Topelt punktid</b> — saad ühe mängu punktid kahekordseks.
            </RuleItem>

            <RuleItem>
              <b>Hilisem ennustus</b> — saad ühe ennustuse muuta pärast mängu
              algust kuni 45. minutini.
            </RuleItem>

            <RuleItem>
              <b>spioon</b> — saad ühe mängu puhul näha teiste osalejate
              ennustusi.
            </RuleItem>
          </RuleSection>

          <RuleSection
            icon="🏆"
            title="Turniiri boonus"
            accent="bg-orange-100 text-orange-700"
          >
            <RuleItem points="10 punkti">Õige MM 2026 võitja:</RuleItem>
            <RuleItem points="7 punkti">Õige finalist:</RuleItem>

            <WarningBox>
              Turniiri boonusennustus tuleb teha enne turniiri algust.
            </WarningBox>
          </RuleSection>

          <div className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-center font-semibold text-slate-600 shadow">
            Punktisüsteem võib mängu korraldaja poolt vajadusel muutuda. Jälgi
            alati värskeimat infot.
          </div>
        </div>
      </div>
    </div>
  );
}
