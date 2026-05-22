export default function RulesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 text-4xl font-black">Punktisüsteem</h1>

      <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <section>
          <h2 className="mb-3 text-2xl font-black text-emerald-300">
            Tavalised mängud
          </h2>

          <ul className="space-y-2 text-slate-200">
            <li>
              Õige täpne tulemus: <b>6 punkti</b>
            </li>
            <li>
              Õige võitja + ühe tiimi täpne väravate arv: <b>4 punkti</b>
            </li>
            <li>
              Õige võitja: <b>3 punkti</b>
            </li>
            <li>
              Ühe tiimi täpne väravate arv, aga vale võitja: <b>1 punkt</b>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-black text-cyan-300">Viigid</h2>

          <ul className="space-y-2 text-slate-200">
            <li>
              Täpne viik, näiteks 1-1: <b>6 punkti</b>
            </li>
            <li>
              Viik ilma täpse skoorita, näiteks ennustad 0-0 ja lõpeb 2-2:{" "}
              <b>3 punkti</b>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-black text-purple-300">
            Penaltitega mängud
          </h2>

          <ul className="space-y-2 text-slate-200">
            <li>
              Täpne viik + õige penaltite võitja: <b>9 punkti</b>
            </li>
            <li>
              Täpne viik + vale penaltite võitja: <b>6 punkti</b>
            </li>
            <li>
              Viik ilma täpse skoorita + õige penaltite võitja: <b>6 punkti</b>
            </li>
            <li>
              Viik ilma täpse skoorita ja vale penaltite võitja: <b>3 punkti</b>
            </li>
          </ul>

          <p className="mt-3 text-sm text-slate-400">
            NB! Kui ennustad ühe tiimi võitu, aga mäng lõpeb viigiga ja läheb
            penaltitele, siis penaltite võitja eest punkte ei saa.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-black text-yellow-300">
            Võimendid
          </h2>

          <ul className="space-y-2 text-slate-200">
            <li>
              <b>Double Points</b> — saad ühe mängu punktid kahekordseks.
            </li>
            <li>
              <b>Late Change</b> — saad ühe ennustuse muuta pärast mängu algust
              kuni 45. minutini.
            </li>
            <li>
              <b>Spy</b> — saad ühe mängu puhul näha teiste osalejate ennustusi.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-black text-orange-300">
            Turniiri boonus
          </h2>

          <ul className="space-y-2 text-slate-200">
            <li>
              Õige MM 2026 võitja: <b>10 punkti</b>
            </li>
            <li>
              Õige finalist: <b>7 punkti</b>
            </li>
          </ul>

          <p className="mt-3 text-sm text-slate-400">
            Turniiri boonusennustus tuleb teha enne turniiri algust.
          </p>
        </section>
      </div>
    </div>
  );
}
