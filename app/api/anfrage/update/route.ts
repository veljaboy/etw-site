import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Brisanje posla ako šef klikne "Obriši posao"
    if (data.action === 'DELETE') {
      await prisma.anfrage.delete({
        where: { id: data.id },
      });
      return NextResponse.json({ success: true, deletedId: data.id });
    }

    const updateData: any = {};

    if (data.radnikId !== undefined) {
      updateData.radnikId = data.radnikId === 'nedodeljeno' || !data.radnikId ? null : data.radnikId;
    }
    if (data.datum !== undefined) {
      updateData.wunschtermin = data.datum;
    }
    if (data.wunschtermin !== undefined) {
      updateData.wunschtermin = data.wunschtermin;
    }
    if (data.vremeOd !== undefined) {
      updateData.vremeOd = data.vremeOd;
    }
    if (data.vremeDo !== undefined) {
      updateData.vremeDo = data.vremeDo;
    }
    if (data.vorname !== undefined) {
      updateData.vorname = data.vorname;
    }
    if (data.nachname !== undefined) {
      updateData.nachname = data.nachname;
    }
    if (data.adresse !== undefined) {
      updateData.adresse = data.adresse;
    }
    if (data.telefon !== undefined) {
      updateData.telefon = data.telefon;
    }
    if (data.beschreibung !== undefined) {
      updateData.beschreibung = data.beschreibung;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.slikaPre !== undefined) {
      updateData.slikaPre = data.slikaPre;
    }
    if (data.slikaPosle !== undefined) {
      updateData.slikaPosle = data.slikaPosle;
    }
    if (data.izvestajRadnika !== undefined) {
      updateData.izvestajRadnika = data.izvestajRadnika;
    }
    if (data.auftragsscheinData !== undefined) {
      updateData.auftragsscheinData = data.auftragsscheinData;
    }

    const updatedAnfrage = await prisma.anfrage.update({
      where: { id: data.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, updatedAnfrage });
  } catch (error) {
    console.error('Greška pri ažuriranju:', error);
    return NextResponse.json({ error: 'Greška pri čuvanju u bazu' }, { status: 500 });
  }
}
