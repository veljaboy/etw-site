import { PrismaClient } from '@prisma/client';
import ChefCalendar from '../components/ChefCalendar';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function ChefPanel() {
  const anfragen = await prisma.anfrage.findMany({
    orderBy: [{ wunschtermin: 'asc' }, { vremeOd: 'asc' }],
  });
  const radnici = await prisma.radnik.findMany();

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <ChefCalendar anfragen={anfragen} radnici={radnici} />
    </main>
  );
}
