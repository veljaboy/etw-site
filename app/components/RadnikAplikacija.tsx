"use client";

import { useState } from 'react';

export default function RadnikAplikacija({ radnici, poslovi }: { radnici: any[], poslovi: any[] }) {
  // Stanje koje pamti kog radnika smo kliknuli
  const [izabraniRadnikId, setIzabraniRadnikId] = useState<string | null>(null);

  // EKRAN 1: Izbor radnika (Login)
  if (!izabraniRadnikId) {
    return (
      <div className="p-6 max-w-md mx-auto mt-10">
        <h1 className="text-3xl font-bold text-center mb-2 text-[#1a202c]">Dobrodošli! 👋</h1>
        <p className="text-center mb-8 text-gray-500">Izaberite svoje ime da vidite današnje zadatke</p>
        
        <div className="grid gap-4">
          {radnici.map(radnik => (
            <button
              key={radnik.id}
              onClick={() => setIzabraniRadnikId(radnik.id)}
              className="p-5 rounded-2xl text-white font-bold text-xl shadow-md transition-transform active:scale-95"
              style={{ backgroundColor: radnik.boja }} // Dugme dobija boju radnika iz baze!
            >
              {radnik.ime}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // EKRAN 2: Prikaz poslova za izabranog radnika
  const mojRadnik = radnici.find(r => r.id === izabraniRadnikId);
  // Filtriramo samo poslove koji pripadaju njemu
  const mojiPoslovi = poslovi.filter(p => p.radnikId === izabraniRadnikId);

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold" style={{ color: mojRadnik?.boja }}>👤 {mojRadnik?.ime}</h1>
        <button onClick={() => setIzabraniRadnikId(null)} className="text-sm text-gray-500 hover:underline">Odjavi se</button>
      </div>

      <h2 className="font-bold text-gray-700 mb-4 uppercase tracking-wider text-sm">Vaši dodeljeni zadaci:</h2>

      {mojiPoslovi.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-200">
          <span className="text-5xl block mb-4">🎉</span>
          <p className="text-gray-500 font-medium">Nemate poslova! Vreme je za pauzu.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {mojiPoslovi.map(posao => (
            <div key={posao.id} className="bg-white p-5 rounded-2xl shadow-md border-l-8" style={{ borderLeftColor: mojRadnik?.boja }}>
              
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-xl text-gray-900">{posao.vorname} {posao.nachname}</h3>
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-bold">
                  {posao.wunschtermin || 'Nema datuma'}
                </span>
              </div>
              
              <p className="text-gray-700 mb-5 bg-gray-50 p-4 rounded-xl border border-gray-100">
                {posao.beschreibung}
              </p>
              
              {/* Pametna dugmad za telefone (poziv i mape) */}
              <div className="space-y-3">
                <a href={`https://maps.google.com/?q=${posao.adresse}`} target="_blank" 
                   className="flex items-center justify-center bg-gray-900 text-white p-3 rounded-xl font-medium active:scale-95 transition-transform">
                  📍 Otvori Navigaciju (Mape)
                </a>
                
                <a href={`tel:${posao.telefon}`} 
                   className="flex items-center justify-center bg-green-500 text-white p-3 rounded-xl font-medium active:scale-95 transition-transform">
                  📞 Pozovi klijenta
                </a>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}