"use client";

import { useState, useRef, useEffect } from 'react';

interface MaterialRow {
  menge: string;
  einheit: string;
  bezeichnung: string;
  kfz: string;
}

export interface FotoItem {
  id: string;
  url: string;
  opis: string;
}

function compressImageFile(file: File, maxWidth = 1000, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(ev.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = ev.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AuftragsscheinModal({
  posao,
  radnikIme,
  lang = 'de',
  onClose,
  onSaved,
}: {
  posao: any;
  radnikIme: string;
  lang?: 'de' | 'sr';
  onClose: () => void;
  onSaved?: (updatedPosao: any) => void;
}) {
  const isDe = lang === 'de';
  const danas = new Date().toLocaleDateString('de-AT');
  const punoImeKlijenta = `${posao.vorname || ''} ${posao.nachname || ''}`.trim();

  // Učitavamo prethodno sačuvane podatke iz auftragsscheinData ako postoje
  const savedData = (() => {
    if (!posao.auftragsscheinData) return null;
    try {
      return JSON.parse(posao.auftragsscheinData);
    } catch {
      return null;
    }
  })();

  // Inicijalizacija liste fotografija (neograničen broj slika sa opisom ispod svake slike!)
  const initialFotos: FotoItem[] = (() => {
    if (savedData?.fotografije && Array.isArray(savedData.fotografije)) {
      return savedData.fotografije;
    }
    const legacy: FotoItem[] = [];
    if (posao.slikaPre) {
      legacy.push({ id: 'legacy-1', url: posao.slikaPre, opis: '' });
    }
    if (posao.slikaPosle) {
      legacy.push({ id: 'legacy-2', url: posao.slikaPosle, opis: '' });
    }
    return legacy;
  })();

  const [datum, setDatum] = useState<string>(savedData?.datum || danas);
  const [vereinbarterTermin, setVereinbarterTermin] = useState<string>(
    savedData?.vereinbarterTermin ||
      (posao.vremeOd && posao.vremeDo
        ? `${posao.wunschtermin || ''} (${posao.vremeOd} - ${posao.vremeDo})`
        : posao.wunschtermin || '')
  );
  const [monteur, setMonteur] = useState<string>(savedData?.monteur || radnikIme || '');
  const [mit, setMit] = useState<string>(savedData?.mit || '');
  const [kunde, setKunde] = useState<string>(savedData?.kunde || punoImeKlijenta);
  const [adresse, setAdresse] = useState<string>(savedData?.adresse || posao.adresse || '');
  const [durchzufuehrendeArbeit, setDurchzufuehrendeArbeit] = useState<string>(
    savedData?.durchzufuehrendeArbeit || posao.beschreibung || ''
  );

  const [materialRows, setMaterialRows] = useState<MaterialRow[]>(
    savedData?.materialRows && Array.isArray(savedData.materialRows) && savedData.materialRows.length === 8
      ? savedData.materialRows
      : Array.from({ length: 8 }, () => ({ menge: '', einheit: '', bezeichnung: '', kfz: '' }))
  );

  const [zeitVon, setZeitVon] = useState<string>(savedData?.zeitVon || posao.vremeOd || '');
  const [zeitBis, setZeitBis] = useState<string>(savedData?.zeitBis || posao.vremeDo || '');
  const [zeitGesamt, setZeitGesamt] = useState<string>(savedData?.zeitGesamt || '');
  const [durchgefuehrteArbeiten, setDurchgefuehrteArbeiten] = useState<string>(
    savedData?.durchgefuehrteArbeiten ?? posao.izvestajRadnika ?? ''
  );
  const [abgeschlossen, setAbgeschlossen] = useState<'ja' | 'nein' | null>(
    savedData?.abgeschlossen ?? (posao.status === 'ZAVRŠENO' ? 'ja' : null)
  );

  // Neograničena lista fotografija sa opisom
  const [fotografije, setFotografije] = useState<FotoItem[]>(initialFotos);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [savingToServer, setSavingToServer] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Ugrađena kamera uživo
  const [liveCameraOpen, setLiveCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Canvas za digitalni potpis klijenta
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState<boolean>(Boolean(savedData?.potpisKunde));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    if (savedData?.potpisKunde) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = savedData.potpisKunde;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const uploadCompressedImageToDisk = async (dataUrl: string): Promise<string> => {
    try {
      const res = await fetch('/api/upload-slika', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posaoId: posao.id, dataUrl }),
      });
      const json = await res.json();
      if (res.ok && json.url) {
        return json.url;
      }
    } catch (e) {
      console.error('Upload fallback na dataUrl:', e);
    }
    return dataUrl;
  };

  const startLiveCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      setLiveCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert(
        isDe
          ? 'Kamera konnte nicht gestartet werden. Bitte erlauben Sie den Kamerazugriff im Browser oder wählen Sie Fotos aus.'
          : 'Kamera nije mogla da se pokrene. Dozvolite pristup kameri u pretraživaču ili izaberite slike.'
      );
      setLiveCameraOpen(false);
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setLiveCameraOpen(false);
  };

  const captureFromLiveCamera = async () => {
    if (!videoRef.current) return;
    setUploadingPhotos(true);
    try {
      const video = videoRef.current;
      const maxW = 1000;
      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;
      const scale = vw > maxW ? maxW / vw : 1;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(vw * scale);
      canvas.height = Math.round(vh * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.78);

      const savedUrl = await uploadCompressedImageToDisk(dataUrl);
      const novaSlika: FotoItem = {
        id: `foto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        url: savedUrl,
        opis: '',
      };
      const updatedList = [...fotografije, novaSlika];
      setFotografije(updatedList);
      await saveFieldsToDatabase({ fotografijeOverride: updatedList });
    } finally {
      setUploadingPhotos(false);
    }
  };

  // Dodavanje 1 ili više slika odjednom (čak i 50 slika odjednom!)
  const handleMultiplePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const noveSlike: FotoItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedDataUrl = await compressImageFile(file);
        const savedUrl = await uploadCompressedImageToDisk(compressedDataUrl);
        noveSlike.push({
          id: `foto-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          url: savedUrl,
          opis: '',
        });
      }
      const updatedList = [...fotografije, ...noveSlike];
      setFotografije(updatedList);
      await saveFieldsToDatabase({ fotografijeOverride: updatedList });
    } catch (err) {
      alert(isDe ? 'Fehler beim Laden der Fotos.' : 'Greška pri učitavanju slika.');
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const handleFotoOpisChange = (id: string, noviOpis: string) => {
    setFotografije((prev) => prev.map((f) => (f.id === id ? { ...f, opis: noviOpis } : f)));
  };

  const handleRemoveFoto = async (id: string) => {
    const updatedList = fotografije.filter((f) => f.id !== id);
    setFotografije(updatedList);
    await saveFieldsToDatabase({ fotografijeOverride: updatedList });
  };

  const getSignatureDataUrl = (): string | null => {
    if (!hasSignature || !canvasRef.current) return null;
    try {
      return canvasRef.current.toDataURL('image/png');
    } catch {
      return null;
    }
  };

  const saveFieldsToDatabase = async (overrides?: {
    fotografijeOverride?: FotoItem[];
    izvestajRadnika?: string;
    status?: string;
    abgeschlossenOverride?: 'ja' | 'nein' | null;
  }) => {
    setSavingToServer(true);
    setSaveMessage(null);
    try {
      const finalAbgeschlossen =
        overrides?.abgeschlossenOverride !== undefined ? overrides.abgeschlossenOverride : abgeschlossen;
      const finalFotografije =
        overrides?.fotografijeOverride !== undefined ? overrides.fotografijeOverride : fotografije;

      const fullFormJson = JSON.stringify({
        datum,
        vereinbarterTermin,
        monteur,
        mit,
        kunde,
        adresse,
        durchzufuehrendeArbeit,
        materialRows,
        zeitVon,
        zeitBis,
        zeitGesamt,
        durchgefuehrteArbeiten:
          overrides?.izvestajRadnika !== undefined ? overrides.izvestajRadnika : durchgefuehrteArbeiten,
        abgeschlossen: finalAbgeschlossen,
        fotografije: finalFotografije,
        potpisKunde: getSignatureDataUrl(),
        updatedAt: new Date().toISOString(),
      });

      const payload = {
        id: posao.id,
        // Čuvamo prvu i drugu sliku i u slikaPre/slikaPosle radi brzog pregleda u tabeli, a sve slike i opise u auftragsscheinData!
        slikaPre: finalFotografije[0]?.url || null,
        slikaPosle: finalFotografije[1]?.url || null,
        izvestajRadnika:
          overrides?.izvestajRadnika !== undefined ? overrides.izvestajRadnika : durchgefuehrteArbeiten,
        auftragsscheinData: fullFormJson,
        status:
          overrides?.status ||
          (finalAbgeschlossen === 'ja' ? 'ZAVRŠENO' : posao.radnikId ? 'DODELJENO' : 'NEU'),
      };

      const res = await fetch('/api/anfrage/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        setSaveMessage(
          isDe
            ? `✅ Auftragsschein & alle ${finalFotografije.length} Fotos mit Beschreibungen wurden gespeichert!`
            : `✅ Auftragsschein i svih ${finalFotografije.length} slika sa opisima su sačuvani za šefa!`
        );
        if (onSaved && json.updatedAnfrage) {
          onSaved(json.updatedAnfrage);
        }
      }
    } catch (e) {
      console.error('Greška pri čuvanju formulara:', e);
    } finally {
      setSavingToServer(false);
    }
  };

  const getCoords = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) * canvas.width) / rect.width,
      y: ((clientY - rect.top) * canvas.height) / rect.height,
    };
  };

  const startDraw = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleMaterialChange = (index: number, field: keyof MaterialRow, value: string) => {
    const copy = [...materialRows];
    copy[index] = { ...copy[index], [field]: value };
    setMaterialRows(copy);
  };

  const handlePrintPdf = async () => {
    await saveFieldsToDatabase();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto flex justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto print:shadow-none print:rounded-none print:max-w-none">
        {/* Gornja traka sa komandama (sakrivena pri štampi / PDF-u) */}
        <div className="bg-[#1a202c] text-white px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-3 print:hidden">
          <div>
            <h2 className="font-bold text-lg">
              {isDe
                ? '📄 Auftragsschein — Formular, Fotos & PDF'
                : '📄 Auftragsschein — Radni nalog, Slike & PDF'}
            </h2>
            <p className="text-xs text-gray-300">
              {isDe
                ? 'Unbegrenzt viele Fotos hinzufügen, unter jedem Foto beschreiben was fotografiert wurde & speichern'
                : 'Dodajte neograničen broj slika, ispod svake napišite šta je uslikano i sačuvajte za šefa'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => saveFieldsToDatabase()}
              disabled={savingToServer || uploadingPhotos}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-sm cursor-pointer disabled:opacity-60"
            >
              {savingToServer
                ? isDe
                  ? 'Speichern...'
                  : 'Čuvanje...'
                : isDe
                ? '💾 An Chef senden / Speichern'
                : '💾 Pošalji šefu / Sačuvaj'}
            </button>
            <button
              type="button"
              onClick={handlePrintPdf}
              className="bg-[#e60000] hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isDe ? '📥 PDF / Drucken' : '📥 PDF / Štampaj'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                stopLiveCamera();
                onClose();
              }}
              className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer"
            >
              {isDe ? '✕ Schließen' : '✕ Zatvori'}
            </button>
          </div>
        </div>

        {saveMessage && (
          <div className="bg-green-50 border-b border-green-200 text-green-800 text-xs sm:text-sm font-semibold px-6 py-2.5 text-center print:hidden">
            {saveMessage}
          </div>
        )}

        {/* Modal za direktnu kameru uživo u pretraživaču */}
        {liveCameraOpen && (
          <div className="bg-gray-900 text-white p-4 flex flex-col items-center print:hidden">
            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-red-400">
              {isDe
                ? `📸 Live-Kamera (${fotografije.length} Fotos bisher aufgenommen)`
                : `📸 Kamera uživo (Do sada dodato slika: ${fotografije.length})`}
            </p>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-w-md rounded-xl border-2 border-white/20 mb-3 bg-black"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={captureFromLiveCamera}
                disabled={uploadingPhotos}
                className="bg-[#e60000] hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm cursor-pointer shadow-lg disabled:opacity-60"
              >
                {uploadingPhotos
                  ? isDe
                    ? 'Wird gespeichert...'
                    : 'Čuvanje slike...'
                  : isDe
                  ? '📸 Foto aufnehmen (+ weiteres hinzufügen)'
                  : '📸 Uslikaj (+ dodaj u listu)'}
              </button>
              <button
                type="button"
                onClick={stopLiveCamera}
                className="bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
              >
                {isDe ? 'Kamera schließen' : 'Zatvori kameru'}
              </button>
            </div>
          </div>
        )}

        {/* === AUFTRAGSSCHEIN PAPIR (1:1 sa skeniranim obrascem + Neograničene slike sa opisom) === */}
        <div id="auftragsschein-sheet" className="p-5 sm:p-10 text-black text-sm print:p-6">
          <div className="border-2 border-black bg-[#f9eaea] py-1.5 text-center font-bold text-lg tracking-wide mb-3">
            Auftragsschein
          </div>

          <div className="flex justify-end items-center mb-2">
            <div className="w-full sm:w-1/2 flex items-center gap-2">
              <span className="font-semibold">Datum:</span>
              <input
                type="text"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                className="flex-1 border-b border-dotted border-black px-2 py-0.5 outline-none font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 border-2 border-black mb-5">
            <div className="md:col-span-3 border-b md:border-b-0 md:border-r border-black p-4 flex items-center justify-center bg-white">
              <img
                src="/etw-logo-cropped.png"
                alt="ETW Elektrische Anlagen"
                className="max-h-24 w-auto object-contain"
              />
            </div>

            <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-black p-3 flex flex-col justify-between space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-800">Vereinbarter Termin:</label>
                <input
                  type="text"
                  value={vereinbarterTermin}
                  onChange={(e) => setVereinbarterTermin(e.target.value)}
                  className="w-full border-b border-gray-400 py-0.5 outline-none font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800">Monteur:</label>
                <input
                  type="text"
                  value={monteur}
                  onChange={(e) => setMonteur(e.target.value)}
                  className="w-full border-b border-gray-400 py-0.5 outline-none font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800">mit:</label>
                <input
                  type="text"
                  value={mit}
                  onChange={(e) => setMit(e.target.value)}
                  placeholder={isDe ? 'Kollege / Helfer' : 'Kolega / Pomoćnik'}
                  className="w-full border-b border-gray-400 py-0.5 outline-none font-medium print:placeholder-transparent"
                />
              </div>
            </div>

            <div className="md:col-span-5 p-3 flex flex-col justify-between space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-800">Kunde:</label>
                <input
                  type="text"
                  value={kunde}
                  onChange={(e) => setKunde(e.target.value)}
                  className="w-full border-b border-gray-400 py-0.5 outline-none font-bold text-base"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800">Adresse:</label>
                <textarea
                  rows={2}
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="w-full border-b border-gray-400 py-0.5 outline-none font-medium resize-none"
                />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <div className="inline-block border-2 border-black bg-[#f9eaea] px-3 py-1 font-semibold text-xs mb-1">
              Durchzuführende Arbeit:
            </div>
            <textarea
              rows={3}
              value={durchzufuehrendeArbeit}
              onChange={(e) => setDurchzufuehrendeArbeit(e.target.value)}
              className="w-full border border-gray-400 rounded p-2.5 outline-none leading-7 bg-[linear-gradient(transparent,transparent_27px,#e5e7eb_28px)] bg-[length:100%_28px]"
            />
          </div>

          <div className="mb-5 overflow-x-auto">
            <table className="w-full border-2 border-black border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#f9eaea]">
                  <th className="border border-black px-2 py-1.5 w-20 text-center font-semibold">Menge</th>
                  <th className="border border-black px-2 py-1.5 w-24 text-center font-semibold">Einheit</th>
                  <th className="border border-black px-3 py-1.5 text-center font-semibold">Material - Bezeichnung</th>
                  <th className="border border-black px-2 py-1.5 w-28 text-center font-semibold">KFZ</th>
                </tr>
              </thead>
              <tbody>
                {materialRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-black p-0">
                      <input
                        type="text"
                        value={row.menge}
                        onChange={(e) => handleMaterialChange(idx, 'menge', e.target.value)}
                        className="w-full px-2 py-1 text-center outline-none"
                      />
                    </td>
                    <td className="border border-black p-0">
                      <input
                        type="text"
                        value={row.einheit}
                        onChange={(e) => handleMaterialChange(idx, 'einheit', e.target.value)}
                        className="w-full px-2 py-1 text-center outline-none"
                      />
                    </td>
                    <td className="border border-black p-0">
                      <input
                        type="text"
                        value={row.bezeichnung}
                        onChange={(e) => handleMaterialChange(idx, 'bezeichnung', e.target.value)}
                        className="w-full px-2 py-1 outline-none"
                      />
                    </td>
                    <td className="border border-black p-0">
                      <input
                        type="text"
                        value={row.kfz}
                        onChange={(e) => handleMaterialChange(idx, 'kfz', e.target.value)}
                        className="w-full px-2 py-1 text-center outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-5">
            <div className="border-2 border-black bg-[#f9eaea] px-4 py-1 font-semibold text-xs">
              Zeitaufwand
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">von:</span>
              <input
                type="text"
                value={zeitVon}
                onChange={(e) => setZeitVon(e.target.value)}
                placeholder="08:00"
                className="w-24 border-b border-dotted border-black px-2 py-0.5 text-center outline-none print:placeholder-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">bis:</span>
              <input
                type="text"
                value={zeitBis}
                onChange={(e) => setZeitBis(e.target.value)}
                placeholder="12:00"
                className="w-24 border-b border-dotted border-black px-2 py-0.5 text-center outline-none print:placeholder-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Gesamt:</span>
              <input
                type="text"
                value={zeitGesamt}
                onChange={(e) => setZeitGesamt(e.target.value)}
                placeholder="4,0 Std."
                className="w-28 border-b border-dotted border-black px-2 py-0.5 text-center outline-none font-bold print:placeholder-transparent"
              />
            </div>
          </div>

          <div className="mb-5">
            <div className="inline-block border-2 border-black bg-[#f9eaea] px-4 py-1 font-semibold text-xs mb-1">
              Durchgeführte Arbeiten
            </div>
            <textarea
              rows={4}
              value={durchgefuehrteArbeiten}
              onChange={(e) => setDurchgefuehrteArbeiten(e.target.value)}
              placeholder={
                isDe ? 'Beschreibung der durchgeführten Arbeiten...' : 'Opis izvršenih radova na terenu...'
              }
              className="w-full border border-gray-400 rounded p-2.5 outline-none leading-7 bg-[linear-gradient(transparent,transparent_27px,#e5e7eb_28px)] bg-[length:100%_28px] print:placeholder-transparent"
            />
          </div>

          {/* === SEKCIJA ZA NEOGRANIČEN BROJ SLIKA SA OPISOM ISPOD SVAKE SLIKE === */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="inline-block border-2 border-black bg-[#f9eaea] px-4 py-1 font-semibold text-xs">
                {isDe
                  ? `Fotodokumentation (${fotografije.length} Fotos)`
                  : `Fotodokumentacija (${fotografije.length} slika)`}
              </div>

              {/* Dugmad za dodavanje neograničenog broja slika (sakrivena pri štampi) */}
              <div className="flex flex-wrap items-center gap-2 print:hidden">
                <button
                  type="button"
                  onClick={startLiveCamera}
                  className="bg-[#e60000] hover:bg-red-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>📸</span>
                  <span>{isDe ? 'Kamera öffnen' : 'Otvori kameru'}</span>
                </button>

                <label className="bg-[#1a202c] hover:bg-gray-800 text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs">
                  <span>📁+</span>
                  <span>
                    {uploadingPhotos
                      ? isDe
                        ? 'Fotos werden geladen...'
                        : 'Učitavanje slika...'
                      : isDe
                      ? 'Fotos hinzufügen (auch 10–50 gleichzeitig)'
                      : 'Dodaj slike (može i 10–50 odjednom)'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMultiplePhotosUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {fotografije.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 text-xs bg-gray-50/50 print:hidden">
                {isDe
                  ? 'Noch keine Fotos hinzugefügt. Klicken Sie oben auf „Fotos hinzufügen“ oder „Kamera öffnen“, um beliebig viele Fotos (inkl. Beschreibung unter jedem Foto) hinzuzufügen.'
                  : 'Još nema dodatih slika. Kliknite gore na „Dodaj slike“ ili „Otvori kameru“ da ubacite koliko god želite slika i napišete opis ispod svake.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fotografije.map((foto, index) => (
                  <div
                    key={foto.id}
                    className="border-2 border-gray-300 rounded-xl p-3 bg-gray-50/60 flex flex-col justify-between print:border-black print:bg-white print:break-inside-avoid"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-xs uppercase text-gray-800">
                        {isDe ? `Foto #${index + 1}` : `Slika #${index + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFoto(foto.id)}
                        className="text-xs text-red-600 hover:underline font-bold print:hidden cursor-pointer"
                      >
                        ✕ {isDe ? 'Löschen' : 'Ukloni'}
                      </button>
                    </div>

                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-white mb-2.5">
                      <img
                        src={foto.url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        {isDe
                          ? 'Beschreibung (Was wurde hier fotografiert?):'
                          : 'Opis slike (Šta je radnik ovde uslikao?):'}
                      </label>
                      <input
                        type="text"
                        value={foto.opis}
                        onChange={(e) => handleFotoOpisChange(foto.id, e.target.value)}
                        placeholder={
                          isDe
                            ? 'z.B. Sicherungskasten im 1. OG, Kabelkanal, Zähler...'
                            : 'npr. Razvodna tabla na 1. spratu, kablovi, brojilo...'
                        }
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-[#e60000] print:border-none print:px-0 print:font-semibold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mt-4">
            <div className="w-full sm:w-80">
              <div className="border border-dashed border-gray-400 rounded-lg bg-gray-50/50 mb-1 relative print:border-none print:bg-transparent">
                <canvas
                  ref={canvasRef}
                  width={360}
                  height={90}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={endDraw}
                  className="w-full h-24 touch-none cursor-crosshair"
                />
                <button
                  type="button"
                  onClick={clearSignature}
                  className="absolute top-1.5 right-2 text-xs text-gray-500 hover:text-red-600 bg-white/80 px-2 py-0.5 rounded border border-gray-200 print:hidden"
                >
                  {isDe ? 'Löschen' : 'Obriši potpis'}
                </button>
              </div>
              <div className="border-t border-black pt-1 text-center text-xs font-semibold">
                Unterschrift/Stempel Kunde
              </div>
            </div>

            <div className="border-2 border-black px-4 py-2 flex items-center gap-6 self-end">
              <span className="font-semibold text-xs sm:text-sm">Auftrag abgeschlossen</span>
              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <span>Ja</span>
                <input
                  type="checkbox"
                  checked={abgeschlossen === 'ja'}
                  onChange={() => {
                    const next = abgeschlossen === 'ja' ? null : 'ja';
                    setAbgeschlossen(next);
                    saveFieldsToDatabase({
                      status: next === 'ja' ? 'ZAVRŠENO' : 'DODELJENO',
                      abgeschlossenOverride: next,
                    });
                  }}
                  className="w-4 h-4 accent-[#e60000]"
                />
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <span>Nein</span>
                <input
                  type="checkbox"
                  checked={abgeschlossen === 'nein'}
                  onChange={() => {
                    const next = abgeschlossen === 'nein' ? null : 'nein';
                    setAbgeschlossen(next);
                    saveFieldsToDatabase({ abgeschlossenOverride: next });
                  }}
                  className="w-4 h-4 accent-[#e60000]"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
