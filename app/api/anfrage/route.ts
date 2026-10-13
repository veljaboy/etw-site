import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // 1. Čitamo podatke koje je forma poslala
    const data = await request.json();

    // 2. Upisujemo podatke u bazu
    const novaAnfrage = await prisma.anfrage.create({
      data: {
        vorname: data.vorname,
        nachname: data.nachname,
        telefon: data.telefon,
        email: data.email,
        adresse: data.adresse,
        wunschtermin: data.wunschtermin,
        beschreibung: data.beschreibung,
      },
    });

    // 3. Vraćamo poruku da je sve uspešno
    return NextResponse.json({ success: true, data: novaAnfrage }, { status: 201 });
    
  } catch (error) {
    console.error("Greška pri upisu u bazu:", error);
    return NextResponse.json({ success: false, error: "Greška na serveru" }, { status: 500 });
  }
}