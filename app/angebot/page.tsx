"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AngebotPage() {
  const [formData, setFormData] = useState({
    name: '',
    adresse: '',
    kontakt: '',
    anliegen: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('/api/kontakt-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('sent');
        setFormData({
          name: '',
          adresse: '',
          kontakt: '',
          anliegen: '',
        });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Greška:', error);
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Jednostavno zaglavlje sa novim logom */}
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/etw-logo-cropped.png"
              alt="ETW Elektrische Anlagen"
              width={100}
              height={78}
              className="h-12 w-auto object-contain"
            />
          </Link>
          <Link href="/" className="text-sm font-semibold text-gray-600 hover:text-[#e60000] transition">
            ← Zurück zur Startseite
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-xl">
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-[#e60000] text-white flex items-center justify-center mb-5 shadow-sm">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold text-[#1a202c] mb-2">Anfrage senden</h1>
          <p className="text-gray-600 mb-8">
            Senden Sie uns Ihr Anliegen direkt per E-Mail. Wir melden uns verlässlich bei Ihnen.
          </p>

          {status === 'sent' ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                ✓
              </div>
              <h3 className="font-bold text-lg text-green-900 mb-1">Vielen Dank für Ihre Nachricht!</h3>
              <p className="text-green-700 text-sm mb-5">
                Ihre Anfrage wurde erfolgreich per E-Mail an uns übermittelt.
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="bg-[#e60000] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-red-700 transition cursor-pointer"
              >
                Weitere Anfrage senden
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e60000] focus:border-[#e60000] outline-none"
                  placeholder="Vor- und Nachname oder Firma"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Adresse *</label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e60000] focus:border-[#e60000] outline-none"
                  placeholder="Straße, Hausnummer, PLZ Wien"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Telefon oder E-Mail (für Rückfragen) *
                </label>
                <input
                  type="text"
                  name="kontakt"
                  value={formData.kontakt}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e60000] focus:border-[#e60000] outline-none"
                  placeholder="+43 664 ... oder name@beispiel.at"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Anliegen *</label>
                <textarea
                  name="anliegen"
                  value={formData.anliegen}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e60000] focus:border-[#e60000] outline-none"
                  placeholder="Beschreiben Sie kurz Ihr Anliegen..."
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-600 font-medium">
                  Fehler beim Senden. Bitte versuchen Sie es erneut.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-[#e60000] text-white font-bold py-3.5 px-6 rounded-xl hover:bg-red-700 transition shadow-sm cursor-pointer disabled:opacity-60"
              >
                {status === 'sending' ? 'Wird gesendet...' : 'Absenden'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
