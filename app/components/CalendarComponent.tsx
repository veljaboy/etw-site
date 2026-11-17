"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import AuftragsscheinModal from './AuftragsscheinModal';

function extractTimeHHMM(dateObj: Date | null, fallback: string): string {
  if (!dateObj) return fallback;
  const h = String(dateObj.getHours()).padStart(2, '0');
  const m = String(dateObj.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function extractDateYYYYMMDD(dateObj: Date | null, fallback: string): string {
  if (!dateObj) return fallback;
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getPosaoFotografije(posao: any): Array<{ id: string; url: string; opis: string }> {
  if (posao?.auftragsscheinData) {
    try {
      const parsed = JSON.parse(posao.auftragsscheinData);
      if (Array.isArray(parsed.fotografije)) {
        return parsed.fotografije;
      }
    } catch {}
  }
  const legacy: Array<{ id: string; url: string; opis: string }> = [];
  if (posao?.slikaPre) legacy.push({ id: 'l1', url: posao.slikaPre, opis: '' });
  if (posao?.slikaPosle) legacy.push({ id: 'l2', url: posao.slikaPosle, opis: '' });
  return legacy;
}

const PALETA_BOJA = [
  '#3b82f6', // Plava
  '#10b981', // Zelena
  '#8b5cf6', // Ljubičasta
  '#f59e0b', // Narandžasta
  '#06b6d4', // Tirkizna
  '#ec4899', // Roze
  '#6366f1', // Indigo
  '#14b8a6', // Teal
];

export default function CalendarComponent({
  anfragen: initialAnfragen,
  radnici: initialRadnici,
}: {
  anfragen: any[];
  radnici: any[];
}) {
  const router = useRouter();
  const [lang, setLang] = useState<'de' | 'sr'>('de');
  const isDe = lang === 'de';

  const [poslovi, setPoslovi] = useState<any[]>(initialAnfragen);
  const [listaRadnika, setListaRadnika] = useState<any[]>(initialRadnici);

  const [selektovaniRadnikFilter, setSelektovaniRadnikFilter] = useState<string>('SVI');
  const [prikaziNedodeljeneUzRadnika, setPrikaziNedodeljeneUzRadnika] = useState<boolean>(true);

  // Modal za dodavanje novog radnika
  const [noviRadnikModal, setNoviRadnikModal] = useState(false);
  const [novoImeRadnika, setNovoImeRadnika] = useState('');
  const [novaBojaRadnika, setNovaBojaRadnika] = useState(PALETA_BOJA[3]);
  const [novaLozinkaRadnika, setNovaLozinkaRadnika] = useState('');

  // Zaštita Šefovog panela šifrom (Chef Login) + upravljanje šiframa
  const [chefLoggedIn, setChefLoggedIn] = useState(false);
  const [chefLoginPass, setChefLoginPass] = useState('');
  const [chefLoginError, setChefLoginError] = useState<string | null>(null);
  const [chefLoggingIn, setChefLoggingIn] = useState(false);
  const [showChefPass, setShowChefPass] = useState(false);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [chefOldPass, setChefOldPass] = useState('');
  const [chefNewPass, setChefNewPass] = useState('');
  const [resetWorkerId, setResetWorkerId] = useState<string>(initialRadnici[0]?.id || '');
  const [resetWorkerNewPass, setResetWorkerNewPass] = useState('');
  const [passModalMsg, setPassModalMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem('etw_chef_logged_in') === 'true') {
      setChefLoggedIn(true);
    }
  }, []);

  // Modal stanje za dodavanje ili izmenu posla
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRawJob, setEditingRawJob] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // Modal za ceo Auftragsschein (da šef može da vidi ceo popunjen formular od radnika i odštampa PDF!)
  const [aktivniPosaoZaPdf, setAktivniPosaoZaPdf] = useState<any | null>(null);

  // Uvećani prikaz slike (Lightbox za Pre / Posle)
  const [uvecanaSlika, setUvecanaSlika] = useState<{ url: string; naslov: string } | null>(null);

  const danasStr = new Date().toISOString().split('T')[0];

  // Referenca na FullCalendar i direktan izbor datuma (da ne mora da se klikće strelica 60 puta!)
  const calendarRef = useRef<FullCalendar | null>(null);
  const [skokNaDatum, setSkokNaDatum] = useState<string>(danasStr);

  // Straničenje radnika (po 4 radnika na ekranu da kalendar NIKADA ne mora da se skroluje levo-desno!)
  const RADNIKA_PO_STRANICI = 4;
  const [stranicaRadnika, setStranicaRadnika] = useState<number>(0);

  const handleJumpToDate = (noviDatumStr: string) => {
    setSkokNaDatum(noviDatumStr);
    if (noviDatumStr && calendarRef.current) {
      const api = calendarRef.current.getApi();
      api.gotoDate(noviDatumStr);
    }
  };

  const [form, setForm] = useState({
    vorname: '',
    nachname: '',
    adresse: '',
    telefon: '',
    beschreibung: '',
    wunschtermin: danasStr,
    vremeOd: '08:00',
    vremeDo: '10:00',
    radnikId: 'nedodeljeno',
    status: 'NEU',
  });

  // 1. Filtriramo koje kolone radnika prikazujemo u kalendaru (najviše 4 radnika odjednom da nema skrolovanja levo-desno!)
  const ukupnoStranicaRadnika = Math.max(1, Math.ceil(listaRadnika.length / RADNIKA_PO_STRANICI));
  const sigurnaStranica = Math.min(stranicaRadnika, ukupnoStranicaRadnika - 1);

  const aktivniRadniciZaKalendar =
    selektovaniRadnikFilter === 'SVI'
      ? listaRadnika.slice(
          sigurnaStranica * RADNIKA_PO_STRANICI,
          (sigurnaStranica + 1) * RADNIKA_PO_STRANICI
        )
      : selektovaniRadnikFilter === 'NEDODELJENO'
      ? []
      : listaRadnika.filter((r) => r.id === selektovaniRadnikFilter);

  const resources = aktivniRadniciZaKalendar.map((radnik) => ({
    id: radnik.id,
    title: `👷 ${radnik.ime}`,
    eventBackgroundColor: radnik.boja,
    eventBorderColor: radnik.boja,
  }));

  const sveKolone =
    selektovaniRadnikFilter === 'SVI' ||
    selektovaniRadnikFilter === 'NEDODELJENO' ||
    prikaziNedodeljeneUzRadnika
      ? [
          {
            id: 'nedodeljeno',
            title: isDe ? '⚠️ Unzugewiesen' : '⚠️ Čeka na dodelu',
            eventBackgroundColor: '#e60000',
            eventBorderColor: '#b91c1c',
          },
          ...resources,
        ]
      : resources;

  // 2. Mapiramo poslove
  const posloviZaKalendar =
    selektovaniRadnikFilter === 'SVI'
      ? poslovi
      : selektovaniRadnikFilter === 'NEDODELJENO'
      ? poslovi.filter((p) => !p.radnikId)
      : poslovi.filter(
          (p) =>
            p.radnikId === selektovaniRadnikFilter ||
            (prikaziNedodeljeneUzRadnika && !p.radnikId)
        );

  const events = posloviZaKalendar
    .filter((upit) => upit.wunschtermin)
    .map((upit) => {
      const vOd = upit.vremeOd || '08:00';
      const vDo = upit.vremeDo || '10:00';
      const punoIme = `${upit.vorname || ''} ${upit.nachname || ''}`.trim();
      const radnikObj = listaRadnika.find((r) => r.id === upit.radnikId);

      return {
        id: upit.id,
        title: punoIme,
        start: `${upit.wunschtermin}T${vOd}:00`,
        end: `${upit.wunschtermin}T${vDo}:00`,
        resourceId: upit.radnikId || 'nedodeljeno',
        backgroundColor: radnikObj ? radnikObj.boja : '#e60000',
        borderColor: radnikObj ? radnikObj.boja : '#b91c1c',
        extendedProps: {
          raw: upit,
          adresse: upit.adresse,
          beschreibung: upit.beschreibung,
          vremeOd: vOd,
          vremeDo: vDo,
          status: upit.status,
          imaSlike: Boolean(upit.slikaPre || upit.slikaPosle || upit.auftragsscheinData),
        },
      };
    });

  // Dodavanje novog radnika (sa početnom šifrom!)
  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoImeRadnika.trim() || novaLozinkaRadnika.length < 6) return;
    try {
      const res = await fetch('/api/radnik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ime: novoImeRadnika,
          boja: novaBojaRadnika,
          lozinka: novaLozinkaRadnika,
        }),
      });
      const json = await res.json();
      if (res.ok && json.radnik) {
        setListaRadnika([...listaRadnika, json.radnik]);
        setNovoImeRadnika('');
        setNovaLozinkaRadnika('');
        setNoviRadnikModal(false);
        router.refresh();
      } else {
        alert(json.error || (isDe ? 'Fehler beim Hinzufügen.' : 'Greška pri dodavanju.'));
      }
    } catch (err) {
      alert(isDe ? 'Fehler beim Hinzufügen des Mitarbeiters.' : 'Greška pri dodavanju radnika.');
    }
  };

  // Brisanje radnika od strane šefa
  const handleDeleteWorker = async (radnikId: string, radnikIme: string) => {
    const potvrda = confirm(
      isDe
        ? `Möchten Sie den Monteur „${radnikIme}“ wirklich löschen? Seine Aufträge werden auf „Unzugewiesen“ gesetzt.`
        : `Da li ste sigurni da želite da obrišete radnika „${radnikIme}“? Njegovi poslovi će biti vraćeni u „Čeka na dodelu“.`
    );
    if (!potvrda) return;

    try {
      const res = await fetch('/api/radnik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', id: radnikId }),
      });
      if (res.ok) {
        const novaLista = listaRadnika.filter((r) => r.id !== radnikId);
        setListaRadnika(novaLista);
        setPoslovi((prev) =>
          prev.map((p) => (p.radnikId === radnikId ? { ...p, radnikId: null, status: 'NEU' } : p))
        );
        if (selektovaniRadnikFilter === radnikId) {
          setSelektovaniRadnikFilter('SVI');
        }
        if (resetWorkerId === radnikId) {
          setResetWorkerId(novaLista[0]?.id || '');
        }
        setPassModalMsg({
          type: 'ok',
          text: isDe
            ? `✅ Monteur „${radnikIme}“ wurde gelöscht.`
            : `✅ Radnik „${radnikIme}“ je uspešno obrisan.`,
        });
        router.refresh();
      }
    } catch {
      alert(isDe ? 'Fehler beim Löschen des Monteurs.' : 'Greška pri brisanju radnika.');
    }
  };

  // Prijava šefa u /chef panel
  const handleChefLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setChefLoggingIn(true);
    setChefLoginError(null);
    try {
      const res = await fetch('/api/auth/chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'LOGIN', password: chefLoginPass }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        sessionStorage.setItem('etw_chef_logged_in', 'true');
        setChefLoggedIn(true);
        setChefLoginPass('');
      } else {
        setChefLoginError(json.error || (isDe ? 'Falsches Passwort!' : 'Pogrešna šifra!'));
      }
    } catch {
      setChefLoginError(isDe ? 'Netzwerkfehler!' : 'Problem sa mrežom!');
    } finally {
      setChefLoggingIn(false);
    }
  };

  // Promena šefovske šifre
  const handleChefChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassModalMsg(null);
    try {
      const res = await fetch('/api/auth/chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHANGE_PASSWORD',
          oldPassword: chefOldPass,
          newPassword: chefNewPass,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setPassModalMsg({
          type: 'ok',
          text: isDe ? '✅ Chef-Passwort erfolgreich geändert!' : '✅ Šefovska šifra je uspešno promenjena!',
        });
        setChefOldPass('');
        setChefNewPass('');
      } else {
        setPassModalMsg({
          type: 'err',
          text: json.error || (isDe ? 'Fehler beim Ändern' : 'Greška pri promeni šifre'),
        });
      }
    } catch {
      setPassModalMsg({ type: 'err', text: isDe ? 'Netzwerkfehler' : 'Greška na mreži' });
    }
  };

  // Resetovanje šifre radniku od strane šefa
  const handleChefResetWorkerPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassModalMsg(null);
    try {
      const res = await fetch('/api/auth/radnik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHEF_RESET_PASSWORD',
          radnikId: resetWorkerId,
          newPassword: resetWorkerNewPass,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const wName = listaRadnika.find((r) => r.id === resetWorkerId)?.ime || '';
        setPassModalMsg({
          type: 'ok',
          text: isDe
            ? `✅ Neues Passwort für ${wName} wurde gespeichert!`
            : `✅ Nova šifra za radnika ${wName} je sačuvana!`,
        });
        setResetWorkerNewPass('');
      } else {
        setPassModalMsg({
          type: 'err',
          text: json.error || (isDe ? 'Fehler beim Zurücksetzen' : 'Greška pri resetovanju šifre'),
        });
      }
    } catch {
      setPassModalMsg({ type: 'err', text: isDe ? 'Netzwerkfehler' : 'Greška na mreži' });
    }
  };

  const openNewModal = (defaults?: Partial<typeof form>) => {
    setEditingId(null);
    setEditingRawJob(null);
    const defaultRadnik =
      defaults?.radnikId ||
      (selektovaniRadnikFilter !== 'SVI' && selektovaniRadnikFilter !== 'NEDODELJENO'
        ? selektovaniRadnikFilter
        : listaRadnika[0]?.id ?? 'nedodeljeno');

    setForm({
      vorname: '',
      nachname: '',
      adresse: '',
      telefon: '',
      beschreibung: '',
      wunschtermin: defaults?.wunschtermin || danasStr,
      vremeOd: defaults?.vremeOd || '08:00',
      vremeDo: defaults?.vremeDo || '10:00',
      radnikId: defaultRadnik,
      status: defaultRadnik !== 'nedodeljeno' ? 'DODELJENO' : 'NEU',
    });
    setModalOpen(true);
  };

  const openEditModal = (upit: any) => {
    setEditingId(upit.id);
    setEditingRawJob(upit);
    setForm({
      vorname: `${upit.vorname || ''}${upit.nachname ? ' ' + upit.nachname : ''}`.trim(),
      nachname: '',
      adresse: upit.adresse || '',
      telefon: upit.telefon || '',
      beschreibung: upit.beschreibung || '',
      wunschtermin: upit.wunschtermin || danasStr,
      vremeOd: upit.vremeOd || '08:00',
      vremeDo: upit.vremeDo || '10:00',
      radnikId: upit.radnikId || 'nedodeljeno',
      status: upit.status || 'NEU',
    });
    setModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!editingId) {
        const res = await fetch('/api/anfrage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (res.ok && json.data) {
          setPoslovi([json.data, ...poslovi]);
          setModalOpen(false);
          router.refresh();
        } else {
          alert(isDe ? 'Fehler beim Erstellen des Auftrags.' : 'Greška pri kreiranju posla.');
        }
      } else {
        const res = await fetch('/api/anfrage/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            ...form,
          }),
        });
        const json = await res.json();
        if (res.ok && json.updatedAnfrage) {
          setPoslovi(poslovi.map((p) => (p.id === editingId ? json.updatedAnfrage : p)));
          setModalOpen(false);
          router.refresh();
        } else {
          alert(isDe ? 'Fehler beim Speichern.' : 'Greška pri čuvanju izmena.');
        }
      }
    } catch (err) {
      alert(isDe ? 'Netzwerkfehler!' : 'Problem sa mrežom!');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!editingId) return;
    if (
      !confirm(
        isDe
          ? 'Möchten Sie diesen Auftrag wirklich aus dem Kalender löschen?'
          : 'Da li ste sigurni da želite da obrišete ovaj posao iz rasporeda?'
      )
    )
      return;

    setSaving(true);
    try {
      const res = await fetch('/api/anfrage/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, action: 'DELETE' }),
      });
      if (res.ok) {
        setPoslovi(poslovi.filter((p) => p.id !== editingId));
        setModalOpen(false);
        router.refresh();
      }
    } catch (err) {
      alert(isDe ? 'Fehler beim Löschen.' : 'Greška pri brisanju.');
    } finally {
      setSaving(false);
    }
  };

  // Brisanje poslatog Auftragsschein-a i svih slika sa diska (oslobadjanje memorije)
  const handleClearAuftragsschein = async (posaoId: string, klijentIme: string) => {
    const potvrda = confirm(
      isDe
        ? `Möchten Sie den eingereichten Auftragsschein und alle Fotos für „${klijentIme}“ wirklich löschen (Speicherplatz freigeben)? Der Termin im Kalender bleibt erhalten.`
        : `Da li ste sigurni da želite da obrišete ovaj Auftragsschein i sve njegove slike za „${klijentIme}“ (oslobađanje memorije)? Sam termin u kalendaru ostaje.`
    );
    if (!potvrda) return;

    try {
      const res = await fetch('/api/anfrage/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: posaoId, action: 'CLEAR_AUFTRAGSSCHEIN' }),
      });
      const json = await res.json();
      if (res.ok && json.updatedAnfrage) {
        setPoslovi((prev) => prev.map((p) => (p.id === posaoId ? json.updatedAnfrage : p)));
        router.refresh();
      }
    } catch {
      alert(isDe ? 'Fehler beim Löschen des Auftragsscheins.' : 'Greška pri brisanju Auftragsscheina.');
    }
  };

  // Brisanje celog završenog posla (i iz kalendara i Auftragsschein i sve slike sa diska)
  const handleDeleteEntireJobFromCard = async (posaoId: string, klijentIme: string) => {
    const potvrda = confirm(
      isDe
        ? `Möchten Sie den gesamten Auftrag „${klijentIme}“ inklusive Auftragsschein, Fotos und Kalendereintrag komplett löschen?`
        : `Da li želite kompletno da obrišete ceo posao „${klijentIme}“ (i iz kalendara, i Auftragsschein, i sve slike)?`
    );
    if (!potvrda) return;

    try {
      const res = await fetch('/api/anfrage/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: posaoId, action: 'DELETE' }),
      });
      if (res.ok) {
        setPoslovi((prev) => prev.filter((p) => p.id !== posaoId));
        router.refresh();
      }
    } catch {
      alert(isDe ? 'Fehler beim Löschen.' : 'Greška pri brisanju.');
    }
  };

  const handleEventMoveOrResize = async (info: any) => {
    const upitId = info.event.id;
    const radniciUKoloni = info.event.getResources?.() || [];
    const postojećiPosao = poslovi.find((p) => p.id === upitId);

    const radnikId =
      radniciUKoloni.length > 0
        ? radniciUKoloni[0].id
        : postojećiPosao?.radnikId || 'nedodeljeno';

    const noviDatum = extractDateYYYYMMDD(info.event.start, postojećiPosao?.wunschtermin || danasStr);
    const novoVremeOd = extractTimeHHMM(info.event.start, postojećiPosao?.vremeOd || '08:00');
    const novoVremeDo = extractTimeHHMM(info.event.end, postojećiPosao?.vremeDo || '10:00');

    try {
      const response = await fetch('/api/anfrage/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: upitId,
          radnikId,
          datum: noviDatum,
          vremeOd: novoVremeOd,
          vremeDo: novoVremeDo,
          status: radnikId !== 'nedodeljeno' ? 'DODELJENO' : 'NEU',
        }),
      });

      if (!response.ok) {
        alert(isDe ? 'Fehler beim Speichern!' : 'Greška pri čuvanju u bazu!');
        info.revert();
      } else {
        const json = await response.json();
        if (json.updatedAnfrage) {
          setPoslovi((prev) => prev.map((p) => (p.id === upitId ? json.updatedAnfrage : p)));
          router.refresh();
        }
      }
    } catch (error) {
      alert(isDe ? 'Netzwerkfehler!' : 'Problem sa mrežom!');
      info.revert();
    }
  };

  const ukupnoPoslova = poslovi.length;
  const dodeljenoPoslova = poslovi.filter((p) => p.radnikId).length;
  const cekaPoslova = ukupnoPoslova - dodeljenoPoslova;
  const posloviSaSlikamaIliFormularom = poslovi.filter(
    (p) => p.slikaPre || p.slikaPosle || p.auftragsscheinData || p.izvestajRadnika
  );

  // EKRAN ZA PRIJAVU ŠEFA (Chef-Login) PRE ULASKA U /chef PANEL
  if (!chefLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
          <div className="flex justify-between items-center mb-6">
            <Link href="/">
              <Image
                src="/etw-logo-cropped.png"
                alt="ETW Logo"
                width={85}
                height={66}
                className="h-12 w-auto object-contain"
              />
            </Link>
            <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
              <button
                type="button"
                onClick={() => setLang('de')}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                  isDe ? 'bg-[#e60000] text-white' : 'text-gray-600'
                }`}
              >
                🇩🇪 DE
              </button>
              <button
                type="button"
                onClick={() => setLang('sr')}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                  !isDe ? 'bg-[#e60000] text-white' : 'text-gray-600'
                }`}
              >
                🇷🇸 SR
              </button>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-[#1a202c] mb-1">
            🔐 {isDe ? 'Chef-Panel Login' : 'Šefov Panel — Prijava'}
          </h1>
          <p className="text-xs text-gray-500 mb-6">
            {isDe
              ? 'Geschützter Bereich der Geschäftsführung. Bitte geben Sie das Chef-Passwort ein.'
              : 'Zaštićeni dispečerski centar. Unesite šefovsku lozinku za pristup.'}
          </p>

          <form onSubmit={handleChefLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showChefPass ? 'text' : 'password'}
                required
                autoFocus
                value={chefLoginPass}
                onChange={(e) => setChefLoginPass(e.target.value)}
                placeholder={isDe ? 'Chef-Passwort eingeben...' : 'Unesite šefovsku šifru...'}
                className="w-full px-4 py-3.5 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e60000] outline-none font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowChefPass(!showChefPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 text-sm cursor-pointer"
              >
                {showChefPass ? '🙈' : '👁️'}
              </button>
            </div>

            {chefLoginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl">
                ⚠️ {chefLoginError}
              </div>
            )}

            <button
              type="submit"
              disabled={chefLoggingIn}
              className="w-full bg-[#e60000] hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-md transition cursor-pointer disabled:opacity-60"
            >
              {chefLoggingIn
                ? isDe
                  ? 'Prüfung...'
                  : 'Provera...'
                : isDe
                ? '🔓 In das Chef-Panel einloggen'
                : '🔓 Prijavi se u Šefov Panel'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <Link href="/" className="text-xs font-bold text-gray-500 hover:text-[#e60000]">
              ← {isDe ? 'Zurück zur Startseite' : 'Nazad na početnu stranicu'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="print:hidden">
        {/* Zaglavlje Šefovog Panela sa prekidačem jezika DE / SR */}
        <header className="bg-white border-b border-gray-200 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Image
                  src="/etw-logo-cropped.png"
                  alt="ETW Logo"
                  width={90}
                  height={70}
                  className="h-12 w-auto object-contain"
                />
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold text-[#1a202c]">
                  {isDe ? 'Chef-Panel — Dispositionszentrale' : 'Šefov Panel — Dispečerski Centar'}
                </h1>
                <p className="text-xs text-gray-500">
                  {isDe
                    ? 'Manuelle Auftragserfassung, Mitarbeiterplanung und genaue Uhrzeiten (Von–Bis)'
                    : 'Ručni unos poslova, raspored po radnicima i tačna satnica (od–do)'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
                <button
                  type="button"
                  onClick={() => setLang('de')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                    isDe ? 'bg-[#e60000] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🇩🇪 DE
                </button>
                <button
                  type="button"
                  onClick={() => setLang('sr')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                    !isDe ? 'bg-[#e60000] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🇷🇸 SR
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPassModalMsg(null);
                  setResetWorkerId(listaRadnika[0]?.id || '');
                  setPasswordModalOpen(true);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                🔑 {isDe ? 'Passwörter' : 'Šifre'}
              </button>

              <Link
                href="/radnik"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition"
              >
                📱 {isDe ? 'Monteur-App' : 'Radnički Portal'}
              </Link>

              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('etw_chef_logged_in');
                  setChefLoggedIn(false);
                }}
                className="bg-red-50 hover:bg-red-100 text-[#e60000] text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                🔒 {isDe ? 'Abmelden' : 'Odjava'}
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          {/* === GORNJE KARTICE SA STATISTIKOM I JEDNIM GLAVNIM DUGMETOM ZA NOVI POSAO === */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {isDe ? 'Aufträge gesamt' : 'Ukupno u rasporedu'}
                </p>
                <p className="text-3xl font-extrabold text-[#1a202c] mt-1">{ukupnoPoslova}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gray-100 text-[#1a202c] flex items-center justify-center font-bold text-xl">
                📅
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {isDe ? 'Aktive Monteure' : 'Aktivni radnici'}
                </p>
                <p className="text-3xl font-extrabold text-green-600 mt-1">{listaRadnika.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold text-xl">
                👷
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {isDe ? 'Auftragsscheine & Fotos' : 'Auftragsscheini i Slike'}
                </p>
                <p className="text-3xl font-extrabold text-blue-600 mt-1">
                  {posloviSaSlikamaIliFormularom.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
                📄
              </div>
            </div>

            <button
              type="button"
              onClick={() => openNewModal()}
              className="bg-[#e60000] hover:bg-red-700 text-white rounded-2xl p-5 shadow-md transition flex flex-col justify-center items-center text-center cursor-pointer active:scale-98"
            >
              <span className="text-2xl font-extrabold mb-0.5">
                {isDe ? '+ Neuer Auftrag' : '+ Novi posao'}
              </span>
              <span className="text-xs text-red-100 font-medium">
                {isDe ? 'Auftrag & Uhrzeit manuell eintragen' : 'Ručno unesi zadatak i satnicu'}
              </span>
            </button>
          </div>

          {/* === GLAVNI KALENDAR === */}
          <div id="chef-kalender-sektion" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-5 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-extrabold text-[#1a202c]">
                  📅 {isDe ? 'Einsatzplan nach Stunden' : 'Dispečerski Raspored po Satima'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isDe
                    ? 'Wählen Sie rechts ein beliebiges Datum für den Sofort-Sprung oder ziehen Sie Aufträge per Drag & Drop.'
                    : 'Izaberite desno bilo koji datum za direktan skok na taj dan ili prevucite poslove mišem.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* DIREKTAN IZBOR DATUMA ZA TAGESPLAN (Bez kliktanja strelica 60 puta!) */}
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl">
                  <span className="text-xs font-extrabold text-[#e60000] uppercase whitespace-nowrap">
                    📅 {isDe ? 'Datum wählen:' : 'Skok na dan:'}
                  </span>
                  <input
                    type="date"
                    value={skokNaDatum}
                    onChange={(e) => handleJumpToDate(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-bold text-[#1a202c] outline-none focus:ring-2 focus:ring-[#e60000] cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setNoviRadnikModal(true)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-4 py-2.5 rounded-xl text-sm transition cursor-pointer"
                >
                  👷+ {isDe ? 'Monteur hinzufügen' : 'Dodaj radnika'}
                </button>
              </div>
            </div>

            {/* === TRAKA ZA BRZI IZBOR RADNIKA I GRUPA (BEZ SKROLOVANJA LEVO-DESNO!) === */}
            <div className="mb-6 bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                  🔍 {isDe ? 'Kalender nach Monteur filtern:' : 'Filtriraj kalendar po radniku:'}
                </span>

                {/* Ako ima više od 4 radnika i gledamo "Svi radnici", prikazujemo dugmad za prebacivanje grupe od po 4 radnika (da nema horizontalnog skrola!) */}
                {selektovaniRadnikFilter === 'SVI' && listaRadnika.length > RADNIKA_PO_STRANICI && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-gray-200 shadow-2xs">
                    <span className="text-xs font-bold text-gray-600">
                      {isDe
                        ? `Ansicht Gruppe ${sigurnaStranica + 1} / ${ukupnoStranicaRadnika}:`
                        : `Prikaz grupe ${sigurnaStranica + 1} / ${ukupnoStranicaRadnika}:`}
                    </span>
                    <button
                      type="button"
                      disabled={sigurnaStranica === 0}
                      onClick={() => setStranicaRadnika((p) => Math.max(0, p - 1))}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-xs font-extrabold cursor-pointer"
                    >
                      ◀ {isDe ? 'Vorherige 4' : 'Prethodna 4'}
                    </button>
                    <button
                      type="button"
                      disabled={sigurnaStranica >= ukupnoStranicaRadnika - 1}
                      onClick={() =>
                        setStranicaRadnika((p) => Math.min(ukupnoStranicaRadnika - 1, p + 1))
                      }
                      className="px-2.5 py-1 rounded-lg bg-[#e60000] text-white hover:bg-red-700 disabled:opacity-40 text-xs font-extrabold cursor-pointer"
                    >
                      {isDe ? 'Nächste 4' : 'Sledeća 4'} ▶
                    </button>
                  </div>
                )}

                {selektovaniRadnikFilter !== 'SVI' && selektovaniRadnikFilter !== 'NEDODELJENO' && (
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prikaziNedodeljeneUzRadnika}
                      onChange={(e) => setPrikaziNedodeljeneUzRadnika(e.target.checked)}
                      className="accent-[#e60000] w-4 h-4"
                    />
                    <span>
                      {isDe
                        ? 'Spalte „Unzugewiesen“ für einfaches Zuweisen mitanzeigen'
                        : 'Prikaži i kolonu „Čeka na dodelu“ za lako prevlačenje'}
                    </span>
                  </label>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelektovaniRadnikFilter('SVI');
                    setStranicaRadnika(0);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                    selektovaniRadnikFilter === 'SVI'
                      ? 'bg-[#1a202c] text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span>
                    👥{' '}
                    {isDe
                      ? listaRadnika.length > RADNIKA_PO_STRANICI
                        ? `Alle Monteure (${sigurnaStranica * RADNIKA_PO_STRANICI + 1}–${Math.min(
                            (sigurnaStranica + 1) * RADNIKA_PO_STRANICI,
                            listaRadnika.length
                          )} von ${listaRadnika.length})`
                        : `Alle Monteure (${listaRadnika.length})`
                      : listaRadnika.length > RADNIKA_PO_STRANICI
                      ? `Svi radnici (${sigurnaStranica * RADNIKA_PO_STRANICI + 1}–${Math.min(
                          (sigurnaStranica + 1) * RADNIKA_PO_STRANICI,
                          listaRadnika.length
                        )} od ${listaRadnika.length})`
                      : `Svi radnici (${listaRadnika.length})`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelektovaniRadnikFilter('NEDODELJENO')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                    selektovaniRadnikFilter === 'NEDODELJENO'
                      ? 'bg-[#e60000] text-white shadow-sm'
                      : 'bg-white text-[#e60000] border border-red-200 hover:bg-red-50'
                  }`}
                >
                  <span>
                    ⚠️ {isDe ? `Unzugewiesen (${cekaPoslova})` : `Čeka na dodelu (${cekaPoslova})`}
                  </span>
                </button>

                {listaRadnika.map((radnik) => {
                  const brojPoslovaRadnika = poslovi.filter((p) => p.radnikId === radnik.id).length;
                  const aktivan = selektovaniRadnikFilter === radnik.id;
                  return (
                    <button
                      key={radnik.id}
                      type="button"
                      onClick={() => setSelektovaniRadnikFilter(aktivan ? 'SVI' : radnik.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2 border ${
                        aktivan
                          ? 'text-white shadow-md scale-[1.02]'
                          : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-100'
                      }`}
                      style={aktivan ? { backgroundColor: radnik.boja, borderColor: radnik.boja } : undefined}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: aktivan ? '#ffffff' : radnik.boja }}
                      />
                      <span>{radnik.ime}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                          aktivan ? 'bg-black/20 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {brojPoslovaRadnika}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kalendar uvek zauzima 100% širine bez horizontalnog skrola! */}
            <div className="w-full">
              <FullCalendar
                ref={calendarRef}
                schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, resourceTimeGridPlugin]}
                initialView="resourceTimeGridDay"
                resources={sveKolone}
                events={events}
                editable={true}
                eventResizableFromStart={true}
                droppable={true}
                selectable={true}
                selectMirror={true}
                navLinks={true}
                allDaySlot={false}
                slotMinTime="06:00:00"
                slotMaxTime="20:00:00"
                slotDuration="00:30:00"
                slotLabelFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                }}
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                }}
                nowIndicator={true}
                height="760px"
                locale="de"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'resourceTimeGridDay,timeGridWeek,dayGridMonth',
                }}
                buttonText={{
                  today: isDe ? 'Heute' : 'Danas',
                  day: isDe ? 'Tagesplan (Monteure)' : 'Po radnicima (Dan)',
                  week: isDe ? 'Woche' : 'Nedelja',
                  month: isDe ? 'Monat' : 'Mesec',
                }}
                datesSet={(dateInfo) => {
                  const cur = extractDateYYYYMMDD(dateInfo.start, danasStr);
                  setSkokNaDatum(cur);
                }}
                select={(selectInfo) => {
                  const datum = extractDateYYYYMMDD(selectInfo.start, danasStr);
                  const vOd = extractTimeHHMM(selectInfo.start, '08:00');
                  const vDo = extractTimeHHMM(selectInfo.end, '10:00');
                  const resId = selectInfo.resource?.id || 'nedodeljeno';
                  openNewModal({
                    wunschtermin: datum,
                    vremeOd: vOd,
                    vremeDo: vDo,
                    radnikId: resId,
                  });
                }}
                eventClick={(info) => {
                  const rawUpit = info.event.extendedProps.raw;
                  if (rawUpit) {
                    openEditModal(rawUpit);
                  }
                }}
                eventDrop={handleEventMoveOrResize}
                eventResize={handleEventMoveOrResize}
                eventContent={(eventInfo) => {
                  const { adresse, beschreibung, vremeOd, vremeDo, imaSlike } = eventInfo.event.extendedProps;
                  return (
                    <div className="p-1.5 overflow-hidden leading-tight h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 text-[11px] font-extrabold bg-black/20 px-1.5 py-0.5 rounded mb-1">
                          <span>
                            🕒 {vremeOd} – {vremeDo}
                          </span>
                          {imaSlike && <span title="Auftragsschein / Fotos vorhanden">📄📸</span>}
                        </div>
                        <div className="font-bold text-sm truncate">{eventInfo.event.title}</div>
                        {adresse && <div className="text-[11px] opacity-95 truncate mt-0.5">📍 {adresse}</div>}
                      </div>
                      {beschreibung && (
                        <div className="text-[11px] opacity-85 line-clamp-2 mt-1 border-t border-white/20 pt-1">
                          {beschreibung}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            </div>
          </div>

          {/* === POSEBNA SEKCIJA ZA ŠEFA: POSLATI AUFTRAGSSCHEIN FORMULARI I SVE SLIKE SA OPISIMA === */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-[#1a202c]">
                  📄 {isDe ? 'Eingereichte Auftragsscheine & Fotodokumentation' : 'Poslati Auftragsschein formulari i slike sa terena'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isDe
                    ? 'Alle Fotos der Monteure inkl. Beschreibung unter jedem Foto sowie kompletter Auftragsschein als PDF'
                    : 'Sve fotografije radnika sa opisom ispod svake slike, kao i kompletan Auftragsschein u PDF formatu'}
                </p>
              </div>
              <span className="bg-blue-50 text-blue-700 text-xs font-extrabold px-3.5 py-1.5 rounded-full">
                {isDe
                  ? `Dokumentierte Aufträge: ${posloviSaSlikamaIliFormularom.length}`
                  : `Ukupno dokumentovanih poslova: ${posloviSaSlikamaIliFormularom.length}`}
              </span>
            </div>

            {posloviSaSlikamaIliFormularom.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
                {isDe ? (
                  <>
                    Noch keine eingereichten Auftragsscheine oder Fotos. Sobald ein Monteur unter{' '}
                    <a href="/radnik" className="text-[#e60000] font-bold underline">
                      /radnik
                    </a>{' '}
                    den <strong>Auftragsschein</strong> speichert oder Fotos hinzufügt, erscheint alles sofort hier!
                  </>
                ) : (
                  <>
                    Još uvek nema poslatih formulara ili slika sa terena. Čim radnik na{' '}
                    <a href="/radnik" className="text-[#e60000] font-bold underline">
                      /radnik
                    </a>{' '}
                    popuni i sačuva <strong>Auftragsschein</strong> ili doda slike, odmah se pojavljuje ovde!
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posloviSaSlikamaIliFormularom.map((posao) => {
                  const radnikObj = listaRadnika.find((r) => r.id === posao.radnikId);
                  const sveSlike = getPosaoFotografije(posao);
                  return (
                    <div
                      key={posao.id}
                      className="border border-gray-200 rounded-2xl p-5 bg-gray-50/50 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-[#1a202c]">
                              {posao.vorname} {posao.nachname}
                            </h3>
                            <p className="text-xs text-gray-500">
                              📍 {posao.adresse} • 📅 {posao.wunschtermin} ({posao.vremeOd}–{posao.vremeDo})
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="bg-white border border-gray-200 text-gray-700 text-xs font-extrabold px-2.5 py-1 rounded-full">
                              📸 {sveSlike.length}
                            </span>
                            {radnikObj && (
                              <span
                                className="px-3 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap inline-flex items-center gap-1"
                                style={{ backgroundColor: radnikObj.boja }}
                              >
                                👷 {radnikObj.ime}
                              </span>
                            )}
                          </div>
                        </div>

                        {sveSlike.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3 max-h-80 overflow-y-auto pr-1">
                            {sveSlike.map((foto, idx) => (
                              <div key={foto.id || idx} className="bg-white p-2 rounded-xl border border-gray-200 flex flex-col">
                                <span className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                                  Foto #{idx + 1}
                                </span>
                                <img
                                  src={foto.url}
                                  alt={foto.opis || `Foto ${idx + 1}`}
                                  onClick={() =>
                                    setUvecanaSlika({
                                      url: foto.url,
                                      naslov: `${posao.vorname} — Foto #${idx + 1}${foto.opis ? ': ' + foto.opis : ''}`,
                                    })
                                  }
                                  className="w-full h-28 object-cover rounded-lg cursor-zoom-in hover:opacity-90 transition mb-1.5"
                                />
                                <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-snug">
                                  {foto.opis || (
                                    <span className="text-gray-400 italic font-normal">
                                      {isDe ? 'Keine Beschreibung' : 'Bez opisa'}
                                    </span>
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {posao.izvestajRadnika && (
                          <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs text-gray-700 mb-3">
                            <strong className="block text-gray-900 mb-0.5">
                              🛠️ {isDe ? 'Monteurbericht (Durchgeführte Arbeiten):' : 'Izveštaj radnika:'}
                            </strong>
                            {posao.izvestajRadnika}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setAktivniPosaoZaPdf(posao)}
                          className="w-full bg-[#e60000] hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>📄</span>
                          <span>
                            {isDe
                              ? 'Kompletten Auftragsschein öffnen / PDF drucken'
                              : 'Otvori kompletan Auftragsschein / Štampaj PDF'}
                          </span>
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleClearAuftragsschein(
                                posao.id,
                                `${posao.vorname} ${posao.nachname}`.trim()
                              )
                            }
                            className="bg-white hover:bg-red-50 text-gray-700 hover:text-[#e60000] border border-gray-200 hover:border-red-200 font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>🗑️</span>
                            <span>
                              {isDe ? 'Nur Auftragsschein löschen' : 'Obriši samo Auftragsschein'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteEntireJobFromCard(
                                posao.id,
                                `${posao.vorname} ${posao.nachname}`.trim()
                              )
                            }
                            className="bg-white hover:bg-red-50 text-[#e60000] border border-red-200 font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>🗑️</span>
                            <span>
                              {isDe ? 'Ganzen Auftrag löschen' : 'Obriši ceo posao'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* === TABELA SVIH POSLOVA === */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold text-[#1a202c]">
                  📋 {isDe ? 'Alle Aufträge im Überblick' : 'Svi uneti poslovi i zadaci'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isDe
                    ? 'Öffnen Sie direkt den ausgefüllten „📄 Auftragsschein“ des Monteurs oder bearbeiten Sie den Termin'
                    : 'Otvorite direktno popunjeni „📄 Auftragsschein“ od radnika ili izmenite termin'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">{isDe ? 'Kunde & Beschreibung' : 'Klijent & Opis posla'}</th>
                    <th className="px-6 py-4 font-bold">{isDe ? 'Adresse' : 'Adresa'}</th>
                    <th className="px-6 py-4 font-bold">
                      {isDe ? 'Datum & Uhrzeit (Von–Bis)' : 'Datum & Satnica (Od–Do)'}
                    </th>
                    <th className="px-6 py-4 font-bold">{isDe ? 'Monteur' : 'Dodeljeni radnik'}</th>
                    <th className="px-6 py-4 font-bold">{isDe ? 'Fotos' : 'Slike'}</th>
                    <th className="px-6 py-4 font-bold text-right">{isDe ? 'Aktion' : 'Akcija'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {poslovi.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                        {isDe
                          ? 'Derzeit sind keine Aufträge im Kalender eingetragen. Klicken Sie oben auf „+ Neuer Auftrag“.'
                          : 'Trenutno nema unetih poslova u rasporedu. Kliknite gore na „+ Novi posao“.'}
                      </td>
                    </tr>
                  ) : (
                    poslovi.map((upit) => {
                      const radnikObj = listaRadnika.find((r) => r.id === upit.radnikId);
                      const sveSlike = getPosaoFotografije(upit);
                      const imaFormular = Boolean(
                        upit.auftragsscheinData || sveSlike.length > 0 || upit.izvestajRadnika
                      );
                      return (
                        <tr key={upit.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="font-bold text-[#1a202c] text-base">
                              {upit.vorname} {upit.nachname}
                            </div>
                            <div className="text-sm text-gray-500 mt-0.5 max-w-md">{upit.beschreibung}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-700 font-medium">📍 {upit.adresse}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {upit.wunschtermin ? (
                              <button
                                type="button"
                                onClick={() => {
                                  handleJumpToDate(upit.wunschtermin);
                                  document
                                    .getElementById('chef-kalender-sektion')
                                    ?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                title={
                                  isDe
                                    ? 'Klicken, um direkt zu diesem Tag im Kalender zu springen'
                                    : 'Klikni da skočiš direktno na ovaj dan u kalendaru'
                                }
                                className="font-bold text-gray-900 hover:text-[#e60000] underline decoration-dotted cursor-pointer inline-flex items-center gap-1"
                              >
                                <span>📅</span>
                                <span>{upit.wunschtermin}</span>
                              </button>
                            ) : (
                              <div className="font-bold text-gray-400">
                                {isDe ? 'Nicht angegeben' : 'Nije navedeno'}
                              </div>
                            )}
                            <div className="text-xs font-bold text-[#e60000] mt-0.5">
                              🕒 {upit.vremeOd || '08:00'} – {upit.vremeDo || '10:00'} Uhr
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {radnikObj ? (
                              <span
                                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                                style={{ backgroundColor: radnikObj.boja }}
                              >
                                <span>👷</span>
                                <span>{radnikObj.ime}</span>
                              </span>
                            ) : (
                              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-100 text-[#e60000] inline-flex items-center gap-1.5 whitespace-nowrap">
                                <span>⚠️</span>
                                <span>{isDe ? 'Unzugewiesen' : 'Čeka na dodelu'}</span>
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {sveSlike.length > 0 ? (
                              <div className="flex items-center gap-1.5">
                                {sveSlike.slice(0, 3).map((f, i) => (
                                  <img
                                    key={f.id || i}
                                    src={f.url}
                                    alt={f.opis || `Foto ${i + 1}`}
                                    title={f.opis || `Foto #${i + 1}`}
                                    onClick={() =>
                                      setUvecanaSlika({
                                        url: f.url,
                                        naslov: `${upit.vorname} — Foto #${i + 1}${f.opis ? ': ' + f.opis : ''}`,
                                      })
                                    }
                                    className="w-10 h-10 rounded-lg object-cover border border-gray-300 cursor-zoom-in"
                                  />
                                ))}
                                {sveSlike.length > 3 && (
                                  <button
                                    type="button"
                                    onClick={() => setAktivniPosaoZaPdf(upit)}
                                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-300 text-xs font-extrabold text-gray-700 flex items-center justify-center cursor-pointer"
                                  >
                                    +{sveSlike.length - 3}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {isDe ? 'Keine Fotos' : 'Nema slika'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setAktivniPosaoZaPdf(upit)}
                                className={`font-bold px-3.5 py-2 rounded-lg text-xs transition cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                                  imaFormular
                                    ? 'bg-[#e60000] hover:bg-red-700 text-white shadow-xs'
                                    : 'bg-red-50 hover:bg-red-100 text-[#e60000] border border-red-200'
                                }`}
                              >
                                <span>📄 Auftragsschein</span>
                                {imaFormular && (
                                  <span className="bg-white text-[#e60000] rounded-full px-1.5 py-0.2 text-[10px] font-extrabold">
                                    ✓
                                  </span>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => openEditModal(upit)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-3.5 py-2 rounded-lg text-xs transition cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                              >
                                <span>✏️</span>
                                <span>{isDe ? 'Bearbeiten' : 'Izmeni'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* === MODAL ZA DODAVANJE NOVOG RADNIKA (SA POČETNOM ŠIFROM) === */}
        {noviRadnikModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-[#1a202c] text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-lg">
                  👷 {isDe ? 'Neuen Monteur hinzufügen' : 'Dodaj novog radnika u tim'}
                </h3>
                <button
                  type="button"
                  onClick={() => setNoviRadnikModal(false)}
                  className="text-gray-300 hover:text-white text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddWorker} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    {isDe ? 'Name des Monteurs *' : 'Ime radnika *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={novoImeRadnika}
                    onChange={(e) => setNovoImeRadnika(e.target.value)}
                    placeholder="z.B. Milan, Lukas, Dejan..."
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e60000] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    🔑 {isDe ? 'Start-Passwort (mind. 6 Zeichen) *' : 'Početna šifra radnika (min. 6 znakova) *'}
                  </label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={novaLozinkaRadnika}
                    onChange={(e) => setNovaLozinkaRadnika(e.target.value)}
                    placeholder={isDe ? 'z.B. Milan2026!' : 'npr. Milan2026!'}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e60000] outline-none font-semibold"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    {isDe
                      ? 'Der Monteur kann sein Passwort später in seiner App selbst ändern.'
                      : 'Radnik kasnije može sam da promeni šifru u svojoj aplikaciji.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-2">
                    {isDe ? 'Farbe im Kalender wählen' : 'Izaberi boju radnika u kalendaru'}
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {PALETA_BOJA.map((boja) => (
                      <button
                        key={boja}
                        type="button"
                        onClick={() => setNovaBojaRadnika(boja)}
                        className={`w-9 h-9 rounded-full cursor-pointer transition-transform ${
                          novaBojaRadnika === boja ? 'scale-125 ring-2 ring-offset-2 ring-gray-900' : ''
                        }`}
                        style={{ backgroundColor: boja }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setNoviRadnikModal(false)}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold cursor-pointer"
                  >
                    {isDe ? 'Abbrechen' : 'Otkaži'}
                  </button>
                  <button
                    type="submit"
                    className="bg-[#e60000] hover:bg-red-700 text-white font-bold px-5 py-2 rounded-xl text-sm cursor-pointer"
                  >
                    + {isDe ? 'Hinzufügen' : 'Dodaj radnika'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* === MODAL ZA UPRAVLJANJE ŠIFRAMA (ŠEFOVA ŠIFRA + RESET ŠIFRE RADNICIMA) === */}
        {passwordModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-auto">
              <div className="bg-[#1a202c] text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-lg">
                  🔑 {isDe ? 'Passwörter & Zugänge verwalten' : 'Upravljanje šiframa i pristupom'}
                </h3>
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="text-gray-300 hover:text-white text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {passModalMsg && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-bold ${
                      passModalMsg.type === 'ok'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {passModalMsg.text}
                  </div>
                )}

                {/* 1. Resetovanje šifre bilo kom radniku */}
                <form
                  onSubmit={handleChefResetWorkerPassword}
                  className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3"
                >
                  <h4 className="font-extrabold text-sm text-[#1a202c]">
                    👷 {isDe ? 'Monteur-Passwort zurücksetzen / neu vergeben' : 'Postavi novu šifru radniku (ako zaboravi)'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                        {isDe ? 'Monteur wählen' : 'Izaberi radnika'}
                      </label>
                      <select
                        value={resetWorkerId}
                        onChange={(e) => setResetWorkerId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-semibold text-sm outline-none"
                      >
                        {listaRadnika.map((r) => (
                          <option key={r.id} value={r.id}>
                            👷 {r.ime}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                        {isDe ? 'Neues Passwort (mind. 6 Zeichen)' : 'Nova šifra (min. 6 znakova)'}
                      </label>
                      <input
                        type="text"
                        required
                        minLength={6}
                        value={resetWorkerNewPass}
                        onChange={(e) => setResetWorkerNewPass(e.target.value)}
                        placeholder={isDe ? 'Neues Passwort...' : 'Upiši novu šifru...'}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-semibold text-sm outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#1a202c] hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      💾 {isDe ? 'Monteur-Passwort speichern' : 'Sačuvaj šifru radnika'}
                    </button>
                  </div>
                </form>

                {/* 2. Promena šefovske šifre */}
                <form
                  onSubmit={handleChefChangePassword}
                  className="bg-red-50/40 p-4 rounded-2xl border border-red-100 space-y-3"
                >
                  <h4 className="font-extrabold text-sm text-[#1a202c]">
                    🔐 {isDe ? 'Eigenes Chef-Passwort ändern' : 'Promeni glavnu Šefovsku šifru (/chef)'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                        {isDe ? 'Aktuelles Chef-Passwort' : 'Trenutna šefovska šifra'}
                      </label>
                      <input
                        type="password"
                        required
                        value={chefOldPass}
                        onChange={(e) => setChefOldPass(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                        {isDe ? 'Neues Chef-Passwort' : 'Nova šefovska šifra (min. 6)'}
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={chefNewPass}
                        onChange={(e) => setChefNewPass(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#e60000] hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      🔐 {isDe ? 'Chef-Passwort aktualisieren' : 'Promeni šefovsku šifru'}
                    </button>
                  </div>
                </form>
                {/* 3. Lista radnika i brisanje radnika iz tima */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                  <h4 className="font-extrabold text-sm text-[#1a202c]">
                    🗑️ {isDe ? 'Monteure verwalten / löschen' : 'Upravljanje radnicima / Brisanje radnika'}
                  </h4>
                  {listaRadnika.length === 0 ? (
                    <p className="text-xs text-gray-500">
                      {isDe ? 'Keine Monteure vorhanden.' : 'Trenutno nema radnika u timu.'}
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-200 bg-white rounded-xl border border-gray-200 overflow-hidden">
                      {listaRadnika.map((r) => (
                        <div key={r.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0"
                              style={{ backgroundColor: r.boja }}
                            />
                            <span className="font-bold text-sm text-gray-800">{r.ime}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteWorker(r.id, r.ime)}
                            className="bg-red-50 hover:bg-red-100 text-[#e60000] text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            🗑️ {isDe ? 'Monteur löschen' : 'Obriši radnika'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === MODAL ZA RUČNI UNOS ILI IZMENU POSLA === */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-auto">
              <div className="bg-[#1a202c] text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-lg">
                  {editingId
                    ? isDe
                      ? '✏️ Auftrag, Uhrzeit & Fotos bearbeiten'
                      : '✏️ Izmeni posao, satnicu i pogledaj slike'
                    : isDe
                    ? '➕ Neuen Auftrag in den Kalender eintragen'
                    : '➕ Unesi novi posao u raspored'}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-gray-300 hover:text-white text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                {/* Ako gledamo postojeći posao, dugme za otvaranje celog Auftragsschein formulara odmah na vrhu! */}
                {editingRawJob && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-[#1a202c] uppercase">
                        📄 {isDe ? 'Auftragsschein des Monteurs' : 'Auftragsschein formular radnika'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {isDe
                          ? 'Materialtabelle, Arbeitszeit, Fotos & Kundenunterschrift ansehen / PDF'
                          : 'Pogledaj tabelu materijala, radno vreme, slike i potpis klijenta / PDF'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const raw = editingRawJob;
                        setModalOpen(false);
                        setAktivniPosaoZaPdf(raw);
                      }}
                      className="bg-[#e60000] hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer whitespace-nowrap shadow-xs"
                    >
                      📄 {isDe ? 'Auftragsschein öffnen' : 'Otvori Auftragsschein'}
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    {isDe ? 'Kunde / Name *' : 'Klijent (Kunde / Name) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.vorname}
                    onChange={(e) => setForm({ ...form, vorname: e.target.value })}
                    placeholder="z.B. Max Mustermann / Hausverwaltung"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e60000] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    {isDe ? 'Einsatzadresse *' : 'Adresa radova (Adresse) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.adresse}
                    onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                    placeholder="z.B. Mariahilfer Straße 10, 1060 Wien"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e60000] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      {isDe ? 'Zugewiesener Monteur' : 'Dodeljeni radnik (Monteur)'}
                    </label>
                    <select
                      value={form.radnikId}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          radnikId: e.target.value,
                          status: e.target.value === 'nedodeljeno' ? 'NEU' : 'DODELJENO',
                        })
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e60000] outline-none bg-white font-semibold"
                    >
                      <option value="nedodeljeno">⚠️ {isDe ? 'Unzugewiesen' : 'Čeka na dodelu'}</option>
                      {listaRadnika.map((r) => (
                        <option key={r.id} value={r.id}>
                          👷 {r.ime}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Datum *</label>
                    <input
                      type="date"
                      required
                      value={form.wunschtermin}
                      onChange={(e) => setForm({ ...form, wunschtermin: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e60000] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      🕒 {isDe ? 'Uhrzeit VON (Start) *' : 'Vreme OD (Start) *'}
                    </label>
                    <input
                      type="time"
                      required
                      value={form.vremeOd}
                      onChange={(e) => setForm({ ...form, vremeOd: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 focus:ring-2 focus:ring-[#e60000] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      🕒 {isDe ? 'Uhrzeit BIS (Ende) *' : 'Vreme DO (Kraj) *'}
                    </label>
                    <input
                      type="time"
                      required
                      value={form.vremeDo}
                      onChange={(e) => setForm({ ...form, vremeDo: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 focus:ring-2 focus:ring-[#e60000] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    {isDe ? 'Durchzuführende Arbeit (Beschreibung) *' : 'Opis posla (Durchzuführende Arbeit) *'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={form.beschreibung}
                    onChange={(e) => setForm({ ...form, beschreibung: e.target.value })}
                    placeholder={
                      isDe ? 'Was soll vor Ort gemacht werden...' : 'Šta radnik treba da uradi na terenu...'
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e60000] outline-none"
                  />
                </div>

                {editingRawJob &&
                  (getPosaoFotografije(editingRawJob).length > 0 || editingRawJob.izvestajRadnika) && (
                    <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-3">
                      <h4 className="font-bold text-xs uppercase text-blue-900">
                        📸{' '}
                        {isDe
                          ? `Fotos (${getPosaoFotografije(editingRawJob).length}) & Bericht vom Monteur:`
                          : `Fotografije (${getPosaoFotografije(editingRawJob).length}) i izveštaj sa terena:`}
                      </h4>
                      {getPosaoFotografije(editingRawJob).length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                          {getPosaoFotografije(editingRawJob).map((foto, i) => (
                            <div key={foto.id || i} className="bg-white p-2 rounded-lg border">
                              <img
                                src={foto.url}
                                alt={foto.opis || `Foto ${i + 1}`}
                                onClick={() =>
                                  setUvecanaSlika({
                                    url: foto.url,
                                    naslov: `${editingRawJob.vorname} — Foto #${i + 1}${
                                      foto.opis ? ': ' + foto.opis : ''
                                    }`,
                                  })
                                }
                                className="w-full h-24 object-cover rounded border cursor-zoom-in mb-1"
                              />
                              <p className="text-[11px] font-semibold text-gray-700 line-clamp-2">
                                {foto.opis || (
                                  <span className="text-gray-400 italic font-normal">
                                    {isDe ? 'Keine Beschreibung' : 'Bez opisa'}
                                  </span>
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      {editingRawJob.izvestajRadnika && (
                        <p className="text-xs text-gray-800 bg-white p-2.5 rounded-lg border">
                          <strong>{isDe ? 'Monteurbericht:' : 'Izveštaj radnika:'}</strong>{' '}
                          {editingRawJob.izvestajRadnika}
                        </p>
                      )}
                    </div>
                  )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-3">
                  {editingId ? (
                    <button
                      type="button"
                      onClick={handleDeleteTask}
                      disabled={saving}
                      className="text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer"
                    >
                      🗑️ {isDe ? 'Löschen' : 'Obriši'}
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 cursor-pointer"
                    >
                      {isDe ? 'Abbrechen' : 'Otkaži'}
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-[#e60000] hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-sm cursor-pointer disabled:opacity-60"
                    >
                      {saving
                        ? isDe
                          ? 'Speichern...'
                          : 'Čuvanje...'
                        : isDe
                        ? '💾 Im Kalender speichern'
                        : '💾 Sačuvaj u raspored'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* === LIGHTBOX ZA UVEĆAN PRIKAZ SLIKE PRE/POSLE === */}
        {uvecanaSlika && (
          <div
            onClick={() => setUvecanaSlika(null)}
            className="fixed inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center p-4 cursor-zoom-out"
          >
            <div
              className="max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#1a202c] text-white px-5 py-3 flex justify-between items-center">
                <span className="font-bold text-sm">{uvecanaSlika.naslov}</span>
                <button
                  type="button"
                  onClick={() => setUvecanaSlika(null)}
                  className="text-gray-300 hover:text-white font-bold cursor-pointer"
                >
                  ✕ {isDe ? 'Schließen' : 'Zatvori'}
                </button>
              </div>
              <img
                src={uvecanaSlika.url}
                alt={uvecanaSlika.naslov}
                className="w-full max-h-[75vh] object-contain bg-black"
              />
            </div>
          </div>
        )}
      </div>

      {/* === MODAL ZA KOMPLETAN AUFTRAGSSCHEIN (Kada ga šef otvori iz /chef panela!) === */}
      {aktivniPosaoZaPdf && (
        <AuftragsscheinModal
          posao={aktivniPosaoZaPdf}
          radnikIme={
            listaRadnika.find((r) => r.id === aktivniPosaoZaPdf.radnikId)?.ime || ''
          }
          lang={lang}
          onClose={() => setAktivniPosaoZaPdf(null)}
          onSaved={(updated) => {
            setPoslovi((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setAktivniPosaoZaPdf(updated);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
