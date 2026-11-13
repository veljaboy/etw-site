import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { ime, boja } = await request.json();
    if (!ime) {
      return NextResponse.json({ error: 'Ime radnika je obavezno' }, { status: 400 });
    }
    const noviRadnik = await prisma.radnik.create({
      data: {
        ime: ime.trim(),
        boja: boja || '#3b82f6',
      },
    });
    return NextResponse.json({ success: true, radnik: noviRadnik }, { status: 201 });
  } catch (error) {
    console.error('Greška pri dodavanju radnika:', error);
    return NextResponse.json({ error: 'Greška na serveru' }, { status: 500 });
  }
}
