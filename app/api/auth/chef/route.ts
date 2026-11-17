import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '@/app/lib/password';

const prisma = new PrismaClient();
const DEFAULT_CHEF_PASSWORD = 'ChefETW2026!';

async function getOrCreateChefConfig() {
  let config = await prisma.chefConfig.findUnique({ where: { id: 'main' } });
  if (!config) {
    config = await prisma.chefConfig.create({
      data: {
        id: 'main',
        lozinkaHash: hashPassword(DEFAULT_CHEF_PASSWORD),
      },
    });
  }
  return config;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, password, oldPassword, newPassword } = body;

    const config = await getOrCreateChefConfig();

    if (action === 'LOGIN') {
      if (!password) {
        return NextResponse.json({ success: false, error: 'Passwort erforderlich' }, { status: 400 });
      }
      const isValid = verifyPassword(password, config.lozinkaHash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Falsches Passwort! / Pogrešna šifra!' },
          { status: 401 }
        );
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'CHANGE_PASSWORD') {
      if (!oldPassword || !newPassword || newPassword.length < 6) {
        return NextResponse.json(
          {
            success: false,
            error: 'Das neue Passwort muss mindestens 6 Zeichen lang sein. / Nova šifra mora imati bar 6 karaktera.',
          },
          { status: 400 }
        );
      }
      const isOldValid = verifyPassword(oldPassword, config.lozinkaHash);
      if (!isOldValid) {
        return NextResponse.json(
          { success: false, error: 'Aktuelles Passwort ist falsch! / Trenutna šifra nije tačna!' },
          { status: 401 }
        );
      }

      await prisma.chefConfig.update({
        where: { id: 'main' },
        data: { lozinkaHash: hashPassword(newPassword) },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Ungültige Aktion' }, { status: 400 });
  } catch (error) {
    console.error('Greška u chef auth:', error);
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
