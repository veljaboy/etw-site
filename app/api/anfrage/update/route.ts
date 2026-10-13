import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Ažuriramo upit u bazi: dodeljujemo radnika i čuvamo novi datum
    const updatedAnfrage = await prisma.anfrage.update({
      where: { id: data.id },
      data: {
        radnikId: data.radnikId === 'nedodeljeno' ? null : data.radnikId,
        wunschtermin: data.datum 
      }
    });

    return NextResponse.json({ success: true, updatedAnfrage });
  } catch (error) {
    console.error("Greška pri ažuriranju:", error);
    return NextResponse.json({ error: 'Greška pri čuvanju u bazu' }, { status: 500 });
  }
}