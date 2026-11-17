import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { posaoId, dataUrl } = await request.json();
    if (!posaoId || !dataUrl || !dataUrl.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Ungültige Bilddaten' }, { status: 400 });
    }

    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', String(posaoId));
    await fs.mkdir(uploadDir, { recursive: true });

    const fileName = `foto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${posaoId}/${fileName}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Greška pri čuvanju slike na disk:', error);
    return NextResponse.json({ error: 'Fehler beim Speichern des Fotos' }, { status: 500 });
  }
}
