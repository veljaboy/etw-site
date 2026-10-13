"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function AngebotPage() {
  // 1. Definišemo stanje gde čuvamo sve podatke iz forme
  const [formData, setFormData] = useState({
    vorname: '',
    nachname: '',
    telefon: '',
    email: '',
    adresse: '',
    wunschtermin: '',
    beschreibung: ''
  });

  // 2. Funkcija koja ažurira stanje svaki put kad korisnik ukuca neko slovo
  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Funkcija koja se okida kada se klikne "Anfrage senden"
  const handleSubmit = async (e: any) => {
    e.preventDefault(); 
    
    try {
      // Šaljemo podatke na naš novi API
      const response = await fetch('/api/anfrage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("Uspešno! Vaš upit je poslat u bazu.");
        
        // Praznimo formu nakon uspešnog slanja
        setFormData({
          vorname: '',
          nachname: '',
          telefon: '',
          email: '',
          adresse: '',
          wunschtermin: '',
          beschreibung: ''
        });
      } else {
        alert("Greška pri slanju. Pokušajte ponovo.");
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-[#1a202c] mb-2">Projektanfrage</h1>
          <p className="text-gray-600 mb-8">Hinterlassen Sie uns Ihre Daten und wir melden uns zeitnah bei Ihnen.</p>

          {/* Dodali smo onSubmit na formu */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vorname (Ime)</label>
                {/* Dodali smo name, value i onChange na svaki input */}
                <input type="text" name="vorname" value={formData.vorname} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e60000] focus:border-[#e60000] outline-none" placeholder="Max" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nachname (Prezime)</label>
                <input type="text" name="nachname" value={formData.nachname} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e60000] focus:border-[#e60000] outline-none" placeholder="Mustermann" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input type="tel" name="telefon" value={formData.telefon} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e60000] focus:border-[#e60000] outline-none" placeholder="+43 664..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e60000] focus:border-[#e60000] outline-none" placeholder="max@beispiel.at" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse (Adresa radova)</label>
              <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e60000] focus:border-[#e60000] outline-none" placeholder="Musterstraße 1, 1010 Wien" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wunschtermin (Željeni datum - opciono)</label>
              <input type="date" name="wunschtermin" value={formData.wunschtermin} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e60000] focus:border-[#e60000] outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung (Opis problema/projekta)</label>
              <textarea name="beschreibung" value={formData.beschreibung} onChange={handleChange} rows={4} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e60000] focus:border-[#e60000] outline-none" placeholder="Wie können wir Ihnen helfen?"></textarea>
            </div>

            <button type="submit" className="w-full bg-[#e60000] text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition">
              Anfrage senden (Pošalji upit)
            </button>
          </form>

          <div className="mt-6 text-center">
             <Link href="/" className="text-sm text-gray-500 hover:text-[#e60000]">← Zurück zur Startseite (Nazad)</Link>
          </div>
        </div>
      </div>
    </main>
  );
}