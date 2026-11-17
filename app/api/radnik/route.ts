import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/app/lib/password';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Brisanje radnika ako šef klikne "Obriši radnika"
    if (body.action === 'DELETE') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: 'ID radnika nedostaje' }, { status: 400 });
      }
      // Prvo sve poslove koji su bili dodeljeni ovom radniku vraćamo u "Nedodeljeno" (radnikId: null)
      await prisma.anfrage.updateMany({
        where: { radnikId: id },
        data: { radnikId: null, status: 'NEU' },
      });

      await prisma.radnik.delete({
        where: { id },
      });

      return NextResponse.json({ success: true, deletedId: id });
    }

    const { ime, boja, lozinka } = body;
    if (!ime) {
      return NextResponse.json({ error: 'Ime radnika je obavezno' }, { status: 400 });
    }
    if (!lozinka || lozinka.length < 6) {
      return NextResponse.json(
        { error: 'Šifra radnika mora imati najmanje 6 karaktera' },
        { status: 400 }
      );
    }

    const noviRadnik = await prisma.radnik.create({
      data: {
        ime: ime.trim(),
        boja: boja || '#3b82f6',
        lozinkaHash: hashPassword(lozinka),
      },
    });

    return NextResponse.json(
      {
        success: true,
        radnik: {
          id: noviRadnik.id,
          ime: noviRadnik.ime,
          boja: noviRadnik.boja,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Greška pri radu sa radnikom:', error);
    return NextResponse.json({ error: 'Greška na serveru' }, { status: 500 });
  }
}
