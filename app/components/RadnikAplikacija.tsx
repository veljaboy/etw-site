"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AuftragsscheinModal from './AuftragsscheinModal';

export default function RadnikAplikacija({ radnici, poslovi }: { radnici: any[]; poslovi: any[] }) {
  const [izabraniRadnikId, setIzabraniRadnikId] = useState<string | null>(null);
  const [radnikKojiSeLoguje, setRadnikKojiSeLoguje] = useState<any | null>(null);
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Modal za promenu sopstvene šifre od strane radnika
  const [changePassModal, setChangePassModal] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [changingPass, setChangingPass] = useState(false);

  const [listaPoslova, setListaPoslova] = useState<any[]>(poslovi);
  const [aktivniPosaoZaPdf, setAktivniPosaoZaPdf] = useState<any | null>(null);
  const [lang, setLang] = useState<'de' | 'sr'>('de');
  const isDe = lang === 'de';

  useEffect(() => {
    const savedId = sessionStorage.getItem('etw_logged_radnik_id');
    if (savedId && radnici.some((r) => r.id === savedId)) {
      setIzabraniRadnikId(savedId);
    }
  }, [radnici]);

  const handleWorkerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!radnikKojiSeLoguje) return;
    setLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/radnik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'LOGIN',
          radnikId: radnikKojiSeLoguje.id,
          password: loginPassword,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        sessionStorage.setItem('etw_logged_radnik_id', radnikKojiSeLoguje.id);
        setIzabraniRadnikId(radnikKojiSeLoguje.id);
        setRadnikKojiSeLoguje(null);
        setLoginPassword('');
      } else {
        setLoginError(
          json.error ||
            (isDe ? 'Falsches Passwort!' : 'Pogrešna šifra!')
        );
      }
    } catch {
      setLoginError(isDe ? 'Netzwerkfehler!' : 'Problem sa mrežom!');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleChangeOwnPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!izabraniRadnikId) return;
    setChangingPass(true);
    setPassMsg(null);

    try {
      const res = await fetch('/api/auth/radnik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHANGE_PASSWORD',
          radnikId: izabraniRadnikId,
          oldPassword: oldPass,
          newPassword: newPass,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setPassMsg({
          type: 'ok',
          text: isDe ? '✅ Passwort erfolgreich geändert!' : '✅ Šifra je uspešno promenjena!',
        });
        setOldPass('');
        setNewPass('');
      } else {
        setPassMsg({
          type: 'err',
          text: json.error || (isDe ? 'Fehler beim Ändern' : 'Greška pri promeni šifre'),
        });
      }
    } catch {
      setPassMsg({
        type: 'err',
        text: isDe ? 'Netzwerkfehler' : 'Greška na mreži',
      });
    } finally {
      setChangingPass(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('etw_logged_radnik_id');
    setIzabraniRadnikId(null);
    setRadnikKojiSeLoguje(null);
    setLoginPassword('');
  };

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

  // EKRAN 1: Izbor radnika i prijava šifrom (Passwort Login)
  if (!izabraniRadnikId) {
    return (
      <div className="p-6 max-w-md mx-auto mt-4">
        <div className="flex justify-between items-center mb-6">
          <Image
            src="/etw-logo-cropped.png"
            alt="ETW Logo"
            width={75}
            height={58}
            className="h-10 w-auto object-contain"
          />
          <LanguageSwitcher />
        </div>

        {!radnikKojiSeLoguje ? (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
            <h1 className="text-2xl font-extrabold text-center mb-1.5 text-[#1a202c]">
              {isDe ? 'Monteur-Login 🔒' : 'Prijava Radnika 🔒'}
            </h1>
            <p className="text-center mb-6 text-sm text-gray-500">
              {isDe
                ? 'Wählen Sie Ihren Namen und geben Sie Ihr persönliches Passwort ein'
                : 'Izaberite svoje ime i unesite svoju ličnu šifru'}
            </p>

            <div className="grid gap-3.5">
              {radnici.map((radnik) => (
                <button
                  key={radnik.id}
                  onClick={() => {
                    setRadnikKojiSeLoguje(radnik);
                    setLoginPassword('');
                    setLoginError(null);
                  }}
                  className="p-4 rounded-2xl text-white font-bold text-lg shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-between px-6"
                  style={{ backgroundColor: radnik.boja }}
                >
                  <span>👷 {radnik.ime}</span>
                  <span className="text-sm bg-black/20 px-3 py-1 rounded-xl">
                    {isDe ? 'Anmelden →' : 'Prijava →'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span
                className="px-3.5 py-1.5 rounded-full text-sm font-bold text-white inline-flex items-center gap-1.5"
                style={{ backgroundColor: radnikKojiSeLoguje.boja }}
              >
                👷 {radnikKojiSeLoguje.ime}
              </span>
              <button
                type="button"
                onClick={() => setRadnikKojiSeLoguje(null)}
                className="text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                ← {isDe ? 'Zurück zur Auswahl' : 'Nazad na izbor'}
              </button>
            </div>

            <h2 className="text-xl font-extrabold text-[#1a202c] mb-1">
              {isDe ? 'Passwort eingeben' : 'Unesite vašu šifru'}
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              {isDe
                ? `Bitte geben Sie das Passwort für ${radnikKojiSeLoguje.ime} ein.`
                : `Unesite lozinku za radnika ${radnikKojiSeLoguje.ime}.`}
            </p>

            <form onSubmit={handleWorkerLogin} className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={isDe ? 'Ihr Passwort...' : 'Vaša šifra...'}
                  className="w-full px-4 py-3.5 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e60000] outline-none font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 text-sm font-bold cursor-pointer"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl">
                  ⚠️ {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full bg-[#e60000] hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-md transition cursor-pointer disabled:opacity-60"
              >
                {loggingIn
                  ? isDe
                    ? 'Prüfung...'
                    : 'Provera...'
                  : isDe
                  ? '🔓 Anmelden'
                  : '🔓 Prijavi se'}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // EKRAN 2: Prikaz poslova za ulogovanog radnika
  const mojRadnik = radnici.find((r) => r.id === izabraniRadnikId);
  const mojiPoslovi = listaPoslova.filter((p) => p.radnikId === izabraniRadnikId);

  return (
    <>
      <div className="p-6 max-w-md mx-auto print:hidden">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-2 bg-white p-4 rounded-2xl shadow-xs border border-gray-200">
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: mojRadnik?.boja }}>
              👤 {mojRadnik?.ime}
            </h1>
            <button
              type="button"
              onClick={() => {
                setChangePassModal(true);
                setPassMsg(null);
              }}
              className="text-xs font-bold text-gray-600 hover:text-[#e60000] mt-0.5 cursor-pointer inline-flex items-center gap-1"
            >
              🔑 {isDe ? 'Passwort ändern' : 'Promeni šifru'}
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
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

                {(posao.slikaPre || posao.slikaPosle || posao.auftragsscheinData) && (
                  <div className="flex flex-wrap items-center gap-2 mb-4 bg-green-50 border border-green-200 px-3 py-2 rounded-xl text-xs font-semibold text-green-800">
                    <span>✅ {isDe ? 'Gespeichert:' : 'Sačuvano:'}</span>
                    {posao.auftragsscheinData && (
                      <span className="bg-white px-2 py-0.5 rounded border">📄 Auftragsschein</span>
                    )}
                    {(() => {
                      let brojSlika = 0;
                      if (posao.auftragsscheinData) {
                        try {
                          const parsed = JSON.parse(posao.auftragsscheinData);
                          if (Array.isArray(parsed.fotografije)) brojSlika = parsed.fotografije.length;
                        } catch {}
                      }
                      if (brojSlika === 0) {
                        if (posao.slikaPre) brojSlika++;
                        if (posao.slikaPosle) brojSlika++;
                      }
                      return brojSlika > 0 ? (
                        <span className="bg-white px-2 py-0.5 rounded border">
                          📸 {brojSlika} {isDe ? 'Fotos' : 'slika'}
                        </span>
                      ) : null;
                    })()}
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
                    📄 {isDe ? 'Auftragsschein (Fotos & PDF)' : 'Auftragsschein (Slike & PDF)'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal u kom radnik sam menja svoju šifru */}
      {changePassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-[#1a202c] text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base">
                🔑 {isDe ? 'Eigenes Passwort ändern' : 'Promeni svoju šifru'}
              </h3>
              <button
                type="button"
                onClick={() => setChangePassModal(false)}
                className="text-gray-300 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleChangeOwnPassword} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  {isDe ? 'Aktuelles Passwort *' : 'Trenutna šifra *'}
                </label>
                <input
                  type="password"
                  required
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#e60000]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  {isDe ? 'Neues Passwort (mind. 6 Zeichen) *' : 'Nova šifra (min. 6 znakova) *'}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#e60000]"
                />
              </div>

              {passMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    passMsg.type === 'ok'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {passMsg.text}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setChangePassModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold cursor-pointer"
                >
                  {isDe ? 'Schließen' : 'Zatvori'}
                </button>
                <button
                  type="submit"
                  disabled={changingPass}
                  className="bg-[#e60000] hover:bg-red-700 text-white font-bold px-5 py-2 rounded-xl text-xs cursor-pointer"
                >
                  {changingPass
                    ? isDe
                      ? 'Speichern...'
                      : 'Čuvanje...'
                    : isDe
                    ? 'Speichern'
                    : 'Sačuvaj novu šifru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
