import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Kreiranje novog posla u kalendaru (isključivo od strane šefa u /chef panelu)
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const novaAnfrage = await prisma.anfrage.create({
      data: {
        vorname: data.vorname || '',
        nachname: data.nachname || '',
        telefon: data.telefon || '',
        email: data.email || '',
        adresse: data.adresse || '',
        wunschtermin: data.wunschtermin || new Date().toISOString().split('T')[0],
        vremeOd: data.vremeOd || '08:00',
        vremeDo: data.vremeDo || '10:00',
        beschreibung: data.beschreibung || '',
        status: data.status || (data.radnikId && data.radnikId !== 'nedodeljeno' ? 'DODELJENO' : 'NEU'),
        radnikId: !data.radnikId || data.radnikId === 'nedodeljeno' ? null : data.radnikId,
      },
    });

    return NextResponse.json({ success: true, data: novaAnfrage }, { status: 201 });
  } catch (error) {
    console.error('Greška pri upisu posla u bazu:', error);
    return NextResponse.json({ success: false, error: 'Greška na serveru' }, { status: 500 });
  }
}
