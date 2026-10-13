import { PrismaClient } from '@prisma/client';
import RadnikAplikacija from '../components/RadnikAplikacija';

const prisma = new PrismaClient();

export default async function RadnikPage() {
  // Server povlači radnike iz baze
  const radnici = await prisma.radnik.findMany();

  // Povlačimo samo poslove koji su zapravo dodeljeni nekom radniku!
  const dodeljeniPoslovi = await prisma.anfrage.findMany({
    where: {
      radnikId: {
        not: null, // Ignorišemo one iz "Čeka na dodelu"
      }
    },
    orderBy: { wunschtermin: 'asc' } // Sortiramo po datumu
  });

  return (
    // bg-gray-50 je blaga siva pozadina koja čini da bele kartice izgledaju kao prava aplikacija
    <main className="min-h-screen bg-gray-100 pb-12">
      <RadnikAplikacija radnici={radnici} poslovi={dodeljeniPoslovi} />
    </main>
  );
}