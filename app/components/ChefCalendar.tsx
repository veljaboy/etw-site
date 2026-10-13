"use client";

import dynamic from 'next/dynamic';

const PraviKalendar = dynamic(() => import('./CalendarComponent'), {
  ssr: false,
  loading: () => <div className="p-10 text-center font-bold text-gray-500">Učitavanje kalendara...</div>
});

// Dodali smo radnici: any[]
export default function ChefCalendar({ anfragen, radnici }: { anfragen: any[], radnici: any[] }) {
  return <PraviKalendar anfragen={anfragen} radnici={radnici} />;
}