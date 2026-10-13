"use client";

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'; // NOVI DODATAK

export default function CalendarComponent({ anfragen, radnici }: { anfragen: any[], radnici: any[] }) {
  
  // 1. Pretvaramo radnike iz baze u kolone kalendara
  const resources = radnici.map(radnik => ({
    id: radnik.id,
    title: radnik.ime,
    eventBackgroundColor: radnik.boja
  }));

  // Dodajemo jednu fiksnu kolonu za "Nedodeljene poslove" (sve što stigne sa sajta ide tu)
  const sveKolone = [
    { id: 'nedodeljeno', title: '⚠️ Čeka na dodelu', eventBackgroundColor: '#e60000' },
    ...resources
  ];

  // 2. Mapiramo upite
  const events = anfragen
    .filter(upit => upit.wunschtermin) 
    .map(upit => ({
      id: upit.id,
      title: `${upit.vorname} - ${upit.beschreibung.substring(0, 15)}...`,
      date: upit.wunschtermin, 
      resourceId: upit.radnikId || 'nedodeljeno', // Ako nema radnika, ide u Nedodeljeno kolonu
      extendedProps: {
        telefon: upit.telefon,
        adresse: upit.adresse
      }
    }));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-8">
      <h2 className="text-2xl font-bold text-[#1a202c] mb-6">📅 Dnevni raspored (Dispečer)</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, resourceTimeGridPlugin]}
        initialView="resourceTimeGridDay" // Prebacili smo na Dnevni prikaz sa kolonama!
        resources={sveKolone}
        events={events}
        editable={true}   // OVO DOZVOLJAVA DRAG & DROP
        droppable={true}
        height="700px"
        locale="de" 
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'resourceTimeGridDay,dayGridMonth'
        }}
        eventClick={(info) => {
          alert(`Klijent: ${info.event.title}\nAdresa: ${info.event.extendedProps.adresse}`);
        }}
        eventDrop={async (info) => {
          // Uzimamo ID upita koji prevlačimo
          const upitId = info.event.id;
          
          // Gledamo u čiju kolonu smo ga ubacili (Marko ili Nedodeljeno)
          const radniciUKoloni = info.event.getResources();
          const radnikId = radniciUKoloni.length > 0 ? radniciUKoloni[0].id : 'nedodeljeno';
          
          // Uzimamo novi datum (FullCalendar nam to daje kroz startStr)
          const noviDatum = info.event.startStr.split('T')[0];

          try {
            // Šaljemo podatke na našu novu API rutu
            const response = await fetch('/api/anfrage/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                id: upitId, 
                radnikId: radnikId,
                datum: noviDatum 
              }),
            });
            
            if (!response.ok) {
              alert("Greška pri čuvanju u bazu!");
              info.revert(); // Ako pukne, vraćamo karticu na staro mesto
            }
          } catch (error) {
            alert("Problem sa mrežom!");
            info.revert();
          }
        }}
      />
    </div>
  );
}