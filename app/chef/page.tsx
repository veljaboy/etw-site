import { PrismaClient } from '@prisma/client';
import ChefCalendar from '../components/ChefCalendar';

const prisma = new PrismaClient();

export default async function ChefPanel() {
  // Povlačimo i upite i radnike iz baze!
  const anfragen = await prisma.anfrage.findMany({
    orderBy: { createdAt: 'desc' },
  });
  const radnici = await prisma.radnik.findMany();

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#1a202c]">Šefov Panel - Dispečerski centar</h1>
            <a href="/" className="text-[#e60000] font-medium hover:underline">← Nazad na sajt</a>
        </div>
        
        {/* Šaljemo i upite i radnike u kalendar */}
        <ChefCalendar anfragen={anfragen} radnici={radnici} />

        <h2 className="text-2xl font-bold text-[#1a202c] mt-12 mb-6">📋 Svi pristigli upiti</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Klijent & Problem</th>
                <th className="px-6 py-4 font-semibold">Kontakt</th>
                <th className="px-6 py-4 font-semibold">Adresa</th>
                <th className="px-6 py-4 font-semibold">Željeni termin</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {anfragen.map((upit) => (
                <tr key={upit.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#1a202c] text-lg">{upit.vorname} {upit.nachname}</div>
                    <div className="text-sm text-gray-500 mt-1 max-w-xs">{upit.beschreibung}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="mb-1">📞 {upit.telefon}</div>
                    <div>✉️ {upit.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">📍 {upit.adresse}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">
                    {upit.wunschtermin ? (
                        <span className="bg-gray-200 px-3 py-1 rounded-md">{upit.wunschtermin}</span>
                    ) : (
                        <span className="text-gray-400 italic">Nije navedeno</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 border border-yellow-200">
                      {upit.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}