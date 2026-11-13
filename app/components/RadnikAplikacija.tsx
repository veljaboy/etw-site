"use client";

import { useState } from 'react';
import AuftragsscheinModal from './AuftragsscheinModal';

export default function RadnikAplikacija({ radnici, poslovi }: { radnici: any[]; poslovi: any[] }) {
  const [izabraniRadnikId, setIzabraniRadnikId] = useState<string | null>(null);
  const [listaPoslova, setListaPoslova] = useState<any[]>(poslovi);
  const [aktivniPosaoZaPdf, setAktivniPosaoZaPdf] = useState<any | null>(null);
  // Podrazumevani jezik je Nemački ('de'), a radnik jednim klikom može da prebaci na Srpski ('sr')!
  const [lang, setLang] = useState<'de' | 'sr'>('de');
  const isDe = lang === 'de';

  const LanguageSwitcher = () => (
    <div className="inline-flex items-center bg-white rounded-xl p-1 border border-gray-200 shadow-xs">
      <button
        type="button"
        onClick={() => setLang('de')}
        className={`px-3 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
          isDe ? 'bg-[#e60000] text-white' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        🇩🇪 DE
      </button>
      <button
        type="button"
        onClick={() => setLang('sr')}
        className={`px-3 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
          !isDe ? 'bg-[#e60000] text-white' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        🇷🇸 SR
      </button>
    </div>
  );

  // EKRAN 1: Izbor radnika (Login)
  if (!izabraniRadnikId) {
    return (
      <div className="p-6 max-w-md mx-auto mt-6">
        <div className="flex justify-end mb-6">
          <LanguageSwitcher />
        </div>

        <h1 className="text-3xl font-extrabold text-center mb-2 text-[#1a202c]">
          {isDe ? 'Willkommen! 👋' : 'Dobrodošli! 👋'}
        </h1>
        <p className="text-center mb-8 text-gray-500">
          {isDe
            ? 'Wählen Sie Ihren Namen, um Ihre heutigen Aufträge zu sehen'
            : 'Izaberite svoje ime da vidite današnje zadatke'}
        </p>

        <div className="grid gap-4">
          {radnici.map((radnik) => (
            <button
              key={radnik.id}
              onClick={() => setIzabraniRadnikId(radnik.id)}
              className="p-5 rounded-2xl text-white font-bold text-xl shadow-md transition-transform active:scale-95 cursor-pointer"
              style={{ backgroundColor: radnik.boja }}
            >
              👷 {radnik.ime}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // EKRAN 2: Prikaz poslova za izabranog radnika
  const mojRadnik = radnici.find((r) => r.id === izabraniRadnikId);
  const mojiPoslovi = listaPoslova.filter((p) => p.radnikId === izabraniRadnikId);

  return (
    <>
      <div className="p-6 max-w-md mx-auto print:hidden">
        <div className="flex justify-between items-center mb-6 gap-2">
          <h1 className="text-2xl font-bold" style={{ color: mojRadnik?.boja }}>
            👤 {mojRadnik?.ime}
          </h1>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => setIzabraniRadnikId(null)}
              className="text-xs font-bold text-gray-500 hover:text-gray-800 underline cursor-pointer"
            >
              {isDe ? 'Abmelden' : 'Odjavi se'}
            </button>
          </div>
        </div>

        <h2 className="font-bold text-gray-700 mb-4 uppercase tracking-wider text-xs">
          {isDe ? 'Ihre zugewiesenen Aufträge:' : 'Vaši dodeljeni zadaci:'}
        </h2>

        {mojiPoslovi.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-200">
            <span className="text-5xl block mb-4">🎉</span>
            <p className="text-gray-500 font-medium">
              {isDe ? 'Keine Aufträge für heute! Zeit für eine Pause.' : 'Nemate poslova! Vreme je za pauzu.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {mojiPoslovi.map((posao) => (
              <div
                key={posao.id}
                className="bg-white p-5 rounded-2xl shadow-md border-l-8"
                style={{ borderLeftColor: mojRadnik?.boja }}
              >
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">
                      {posao.vorname} {posao.nachname}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">📍 {posao.adresse}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-bold block">
                      {posao.wunschtermin || (isDe ? 'Kein Datum' : 'Nema datuma')}
                    </span>
                    {posao.vremeOd && posao.vremeDo && (
                      <span className="text-xs font-bold text-[#e60000] mt-1 block">
                        🕒 {posao.vremeOd} – {posao.vremeDo}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-700 mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {posao.beschreibung}
                </p>

                {/* Status slika Pre/Posle ako su već uslikane */}
                {(posao.slikaPre || posao.slikaPosle) && (
                  <div className="flex items-center gap-2 mb-4 bg-green-50 border border-green-200 px-3 py-2 rounded-xl text-xs font-semibold text-green-800">
                    <span>📸 {isDe ? 'Fotos gespeichert:' : 'Slike sačuvane:'}</span>
                    {posao.slikaPre && (
                      <span className="bg-white px-2 py-0.5 rounded border">
                        ✓ {isDe ? 'Vorher' : 'Pre'}
                      </span>
                    )}
                    {posao.slikaPosle && (
                      <span className="bg-white px-2 py-0.5 rounded border">
                        ✓ {isDe ? 'Nachher' : 'Posle'}
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(posao.adresse)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-gray-900 text-white p-3.5 rounded-xl font-semibold active:scale-95 transition-transform"
                  >
                    📍 {isDe ? 'Navigation öffnen (Google Maps)' : 'Otvori Navigaciju (Mape)'}
                  </a>

                  <button
                    type="button"
                    onClick={() => setAktivniPosaoZaPdf(posao)}
                    className="w-full flex items-center justify-center bg-[#e60000] hover:bg-red-700 text-white p-3.5 rounded-xl font-bold active:scale-95 transition-transform shadow-sm cursor-pointer"
                  >
                    📄 {isDe ? 'Auftragsschein (Fotos & PDF)' : 'Auftragsschein (Slike Pre/Posle & PDF)'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {aktivniPosaoZaPdf && (
        <AuftragsscheinModal
          posao={aktivniPosaoZaPdf}
          radnikIme={mojRadnik?.ime || ''}
          lang={lang}
          onClose={() => setAktivniPosaoZaPdf(null)}
          onSaved={(updated) => {
            setListaPoslova((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setAktivniPosaoZaPdf(updated);
          }}
        />
      )}
    </>
  );
}
