import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, adresse, kontakt, anliegen } = data;

    if (!name || !adresse || !anliegen) {
      return NextResponse.json(
        { success: false, error: 'Bitte füllen Sie alle Pflichtfelder aus.' },
        { status: 400 }
      );
    }

    const chefEmail = process.env.CHEF_EMAIL || 'office@etw-elektro.at';

    // Ispis u serverskoj konzoli (za lokalno testiranje dok se ne unese prava e-mail adresa šefa)
    console.log('====================================================');
    console.log(`📩 NOVI UPIT SA SAJTA (Šalje se isključivo na e-mail: ${chefEmail})`);
    console.log(`👤 Ime klijenta (Name): ${name}`);
    console.log(`📍 Adresa (Adresse): ${adresse}`);
    console.log(`📞 Kontakt: ${kontakt || 'Nije navedeno'}`);
    console.log(`📝 Opis (Anliegen): ${anliegen}`);
    console.log('====================================================');

    // Ako je u .env podešen RESEND_API_KEY, automatski šaljemo pravi mejl šefu
    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ETW Webseite <onboarding@resend.dev>',
          to: [chefEmail],
          subject: `Neue Kundenanfrage von ${name} (${adresse})`,
          html: `
            <h2>Neue Anfrage über die ETW Webseite</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Adresse:</strong> ${adresse}</p>
            <p><strong>Kontakt (Tel / E-Mail):</strong> ${kontakt || '-'}</p>
            <hr />
            <p><strong>Anliegen / Beschreibung:</strong></p>
            <p style="white-space: pre-wrap;">${anliegen}</p>
          `,
        }),
      });
    }

    // NAPOMENA: Po zahtevu šefa, ovaj upit se NE upisuje u kalendar!
    // Šef nakon čitanja mejla sam ručno unosi posao u /chef panel.
    return NextResponse.json({
      success: true,
      message: 'Anfrage erfolgreich per E-Mail gesendet.',
    });
  } catch (error) {
    console.error('Greška pri slanju e-maila:', error);
    return NextResponse.json({ success: false, error: 'Serverfehler' }, { status: 500 });
  }
}
