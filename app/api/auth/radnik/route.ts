import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '@/app/lib/password';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, radnikId, password, oldPassword, newPassword } = body;

    if (!radnikId) {
      return NextResponse.json({ error: 'Mitarbeiter-ID fehlt' }, { status: 400 });
    }

    const radnik = await prisma.radnik.findUnique({ where: { id: radnikId } });
    if (!radnik) {
      return NextResponse.json({ error: 'Mitarbeiter nicht gefunden' }, { status: 404 });
    }

    // Ako radnik iz ranije verzije baze još nema upisan hash, postavljamo podrazumevanu šifru: Ime2026! (npr. Marko2026!)
    let currentHash = radnik.lozinkaHash;
    if (!currentHash) {
      currentHash = hashPassword(`${radnik.ime}2026!`);
      await prisma.radnik.update({
        where: { id: radnik.id },
        data: { lozinkaHash: currentHash },
      });
    }

    // 1. Prijava radnika (LOGIN)
    if (action === 'LOGIN') {
      if (!password) {
        return NextResponse.json({ success: false, error: 'Passwort erforderlich' }, { status: 400 });
      }
      const isValid = verifyPassword(password, currentHash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Falsches Passwort! / Pogrešna šifra!' },
          { status: 401 }
        );
      }
      return NextResponse.json({ success: true });
    }

    // 2. Radnik sam menja svoju šifru (CHANGE_PASSWORD)
    if (action === 'CHANGE_PASSWORD') {
      if (!oldPassword || !newPassword || newPassword.length < 6) {
        return NextResponse.json(
          {
            success: false,
            error: 'Das neue Passwort muss mindestens 6 Zeichen haben. / Nova šifra mora imati bar 6 znakova.',
          },
          { status: 400 }
        );
      }
      const isOldValid = verifyPassword(oldPassword, currentHash);
      if (!isOldValid) {
        return NextResponse.json(
          { success: false, error: 'Altes Passwort ist falsch! / Stara šifra nije tačna!' },
          { status: 401 }
        );
      }
      await prisma.radnik.update({
        where: { id: radnik.id },
        data: { lozinkaHash: hashPassword(newPassword) },
      });
      return NextResponse.json({ success: true });
    }

    // 3. Šef resetuje / postavlja novu šifru radniku iz /chef panela (CHEF_RESET_PASSWORD)
    if (action === 'CHEF_RESET_PASSWORD') {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          {
            success: false,
            error: 'Das Passwort muss mindestens 6 Zeichen haben. / Šifra mora imati bar 6 znakova.',
          },
          { status: 400 }
        );
      }
      await prisma.radnik.update({
        where: { id: radnik.id },
        data: { lozinkaHash: hashPassword(newPassword) },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Ungültige Aktion' }, { status: 400 });
  } catch (error) {
    console.error('Greška u radnik auth:', error);
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
