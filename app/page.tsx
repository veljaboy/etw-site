import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#1a202c] overflow-x-hidden">
      {/* === NAVIGACIJA (Meni na vrhu sa staklenim efektom) === */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="container mx-auto px-4 md:px-8 py-3.5 flex justify-between items-center">
          <Link href="/" className="flex items-center group">
            <Image
              src="/etw-logo-cropped.png"
              alt="ETW Elektrische Anlagen Logo"
              width={110}
              height={86}
              className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </Link>

          <nav className="hidden md:flex gap-8 font-semibold text-gray-700">
            <a
              href="#start"
              className="text-[#e60000] relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-[#e60000]"
            >
              Startseite
            </a>
            <a
              href="#leistungen"
              className="hover:text-[#e60000] transition relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#e60000] after:transition-all"
            >
              Leistungen
            </a>
            <a
              href="#ueber-uns"
              className="hover:text-[#e60000] transition relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#e60000] after:transition-all"
            >
              Über uns
            </a>
            <Link
              href="/angebot"
              className="hover:text-[#e60000] transition relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#e60000] after:transition-all"
            >
              Kontakt
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="tel:+436641234567"
              className="hidden lg:flex items-center gap-2.5 font-bold text-gray-800 hover:text-[#e60000] transition group"
            >
              <span className="w-9 h-9 rounded-full bg-[#e60000] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </span>
              <span>+43 664 123 45 67</span>
            </a>

            <Link
              href="/angebot"
              className="bg-[#e60000] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-red-500/25 hover:shadow-lg"
            >
              Angebot anfordern
            </Link>
          </div>
        </div>
      </header>

      {/* === HERO SEKCIJA SA KINEMATOGRAFSKOM ANIMACIJOM I LEBDEĆIM ELEMENTIMA === */}
      <section
        id="start"
        className="relative w-full min-h-[580px] md:min-h-[680px] flex items-center overflow-hidden bg-white"
      >
        {/* Animirana pozadinska slika visoke rezolucije (Ken Burns slow zoom) */}
        <div
          className="absolute inset-0 bg-no-repeat bg-cover bg-right animate-hero-zoom"
          style={{
            backgroundImage: "url('/hero-clean.jpg')",
          }}
        />

        {/* Višeslojni prelaz za kristalnu čitljivost i dubinu */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 md:via-white/60 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent" />

        <div className="relative z-10 container mx-auto px-4 md:px-8 py-16 md:py-24 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
          <div className="max-w-xl">
            {/* Animirani bedž iznad naslova */}
            <div className="animate-fade-up-1 inline-flex items-center gap-2.5 bg-red-50 border border-red-100 text-[#e60000] px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold tracking-wide uppercase mb-6 shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e60000] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e60000]"></span>
              </span>
              <span>Ihr Elektro-Fachbetrieb in Wien & Umgebung</span>
            </div>

            {/* Glavni naslov sa kaskadnom animacijom */}
            <h1 className="animate-fade-up-2 text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold text-[#1a202c] leading-[1.12] mb-6 tracking-tight">
              Ihr zuverlässiger Partner
              <br />
              für moderne{' '}
              <span className="text-[#e60000] relative inline-block">
                Elektrotechnik
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#e60000]/25"
                  viewBox="0 0 200 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 9.5C50 2.5 140 1.5 198 8.5"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <br />
              in Wien und Umgebung
            </h1>

            {/* Podnaslov */}
            <p className="animate-fade-up-3 text-gray-700 mb-9 text-lg leading-relaxed max-w-lg font-medium">
              Wir planen, installieren und warten elektrotechnische Anlagen für Privat- und Gewerbekunden – zuverlässig,
              sicher und termingerecht.
            </p>

            {/* CTA Dugme sa pulsirajućim sjajem */}
            <div className="animate-fade-up-4 flex flex-wrap items-center gap-5">
              <Link
                href="/angebot"
                className="animate-pulse-glow bg-[#e60000] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-700 hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-3 group"
              >
                <span>Angebot anfordern</span>
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white/80 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-gray-200/80 shadow-xs">
                <span className="w-6 h-6 rounded-full bg-[#e60000] text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <span>ÖVE / ÖNORM E 8101 zertifiziert</span>
              </div>
            </div>
          </div>

          {/* Lebdeća staklena kartica na desnoj strani (Glassmorphism Floating Badge) */}
          <div className="hidden lg:block animate-float self-end mb-4">
            <div className="bg-white/85 backdrop-blur-md border border-white/90 rounded-2xl p-5 shadow-2xl max-w-xs">
              <div className="flex items-center gap-3.5 mb-2">
                <div className="w-11 h-11 rounded-xl bg-[#e60000] text-white flex items-center justify-center shrink-0 shadow-md">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-extrabold text-[#1a202c] text-sm leading-tight">Geprüfte Sicherheit</p>
                  <p className="text-xs text-gray-600 font-medium">Meisterqualität nach ÖNORM</p>
                </div>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-3">
                <div className="h-full w-full bg-gradient-to-r from-[#e60000] to-red-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === 1. STATISTIKA (Interaktivne kartice ispod glavne slike) === */}
      <section className="relative z-20 container mx-auto px-4 md:px-8 -mt-8 md:-mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100">
          {/* Stavka 1 */}
          <div className="flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 shrink-0 rounded-xl bg-[#e60000] text-white flex items-center justify-center shadow-md shadow-red-600/20 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="font-extrabold text-2xl text-[#1a202c]">300+</p>
              <p className="text-sm text-gray-600 leading-tight mt-0.5">
                erfolgreich abgeschlossene
                <br />
                Projekte
              </p>
            </div>
          </div>

          {/* Stavka 2 */}
          <div className="flex items-center gap-4 lg:border-l border-gray-100 lg:pl-6 group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 shrink-0 rounded-xl bg-[#e60000] text-white flex items-center justify-center shadow-md shadow-red-600/20 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-[#1a202c] leading-tight">Privat, Gewerbe &</p>
              <p className="text-sm text-gray-600 leading-tight mt-0.5">Hausverwaltungen</p>
            </div>
          </div>

          {/* Stavka 3 */}
          <div className="flex items-center gap-4 lg:border-l border-gray-100 lg:pl-6 group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 shrink-0 rounded-xl bg-[#e60000] text-white flex items-center justify-center shadow-md shadow-red-600/20 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-[#1a202c] leading-tight">Wien &</p>
              <p className="text-sm text-gray-600 leading-tight mt-0.5">Umgebung</p>
            </div>
          </div>

          {/* Stavka 4 */}
          <div className="flex items-center gap-4 lg:border-l border-gray-100 lg:pl-6 group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 shrink-0 rounded-xl bg-[#e60000] text-white flex items-center justify-center shadow-md shadow-red-600/20 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-[#1a202c] leading-tight">Zuverlässig,</p>
              <p className="text-sm text-gray-600 leading-tight mt-0.5">termintreu & sauber</p>
            </div>
          </div>
        </div>
      </section>

      {/* === 2. UNSERE LEISTUNGEN (Sa animiranim crvenim gornjim akcentom) === */}
      <section id="leistungen" className="bg-gray-50 py-20 mt-16">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <span className="text-[#e60000] font-bold uppercase tracking-wider text-sm">Was wir bieten</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a202c] mt-2 mb-3">Unsere Leistungen</h2>
          <p className="text-gray-600 mb-14 text-lg">Kompetent. Zuverlässig. Alles aus einer Hand.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {/* Kartica 1: Elektroinstallationen */}
            <div className="relative overflow-hidden bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="absolute top-0 left-0 w-0 h-1.5 bg-[#e60000] group-hover:w-full transition-all duration-500" />
              <div className="w-14 h-14 rounded-xl bg-[#e60000] text-white flex items-center justify-center mb-6 shadow-md shadow-red-600/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-bold text-xl mb-3 text-[#1a202c] group-hover:text-[#e60000] transition-colors">
                Elektroinstallationen
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Planung und Ausführung von Elektroinstallationen für Neubau, Sanierung und Umbau.
              </p>
            </div>

            {/* Kartica 2: KNX Gebäudeautomation */}
            <div className="relative overflow-hidden bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="absolute top-0 left-0 w-0 h-1.5 bg-[#e60000] group-hover:w-full transition-all duration-500" />
              <div className="w-14 h-14 rounded-xl bg-[#e60000] text-white flex items-center justify-center mb-6 shadow-md shadow-red-600/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-xl mb-3 text-[#1a202c] group-hover:text-[#e60000] transition-colors">
                KNX Gebäudeautomation
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Intelligente Steuerung für mehr Komfort, Sicherheit und Energieeffizienz.
              </p>
            </div>

            {/* Kartica 3: E-Befunde */}
            <div className="relative overflow-hidden bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="absolute top-0 left-0 w-0 h-1.5 bg-[#e60000] group-hover:w-full transition-all duration-500" />
              <div className="w-14 h-14 rounded-xl bg-[#e60000] text-white flex items-center justify-center mb-6 shadow-md shadow-red-600/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-xl mb-3 text-[#1a202c] group-hover:text-[#e60000] transition-colors">
                E-Befunde
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Überprüfung elektrischer Anlagen gemäß ÖVE/ÖNORM E 8101.
              </p>
            </div>

            {/* Kartica 4: Photovoltaik */}
            <div className="relative overflow-hidden bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="absolute top-0 left-0 w-0 h-1.5 bg-[#e60000] group-hover:w-full transition-all duration-500" />
              <div className="w-14 h-14 rounded-xl bg-[#e60000] text-white flex items-center justify-center mb-6 shadow-md shadow-red-600/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-xl mb-3 text-[#1a202c] group-hover:text-[#e60000] transition-colors">
                Photovoltaik
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Nachhaltige Energielösungen mit Photovoltaikanlagen und Speichersystemen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === 3. ÜBER UNS (Bez dugmeta "Mehr über uns", sa crveno-belim ikonicama) === */}
      <section id="ueber-uns" className="container mx-auto px-4 md:px-8 py-20">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-center">
          <div className="md:w-1/2">
            <h2 className="text-[#e60000] font-bold text-sm uppercase tracking-wider mb-2">Über uns</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold mb-6 text-[#1a202c] leading-tight">
              Technik mit Erfahrung.
              <br />
              Lösungen mit Verstand.
            </h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              ETW Elektrische Anlagen OG steht für hochwertige Elektrotechnik, persönliche Beratung und saubere
              Ausführung. Wir sind ein eingespieltes Team mit langjähriger Erfahrung und Leidenschaft für moderne
              Elektrotechnik.
            </p>
            <ul className="space-y-4">
              {[
                'Termintreu & verlässlich',
                'Saubere & normgerechte Ausführung',
                'Individuelle Lösungen',
                'Persönlicher Ansprechpartner',
              ].map((item) => (
                <li key={item} className="flex items-center text-gray-800 font-semibold">
                  <span className="w-6 h-6 rounded-full bg-[#e60000] text-white flex items-center justify-center mr-3.5 shrink-0 shadow-xs">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:w-1/2 w-full">
            <div className="bg-gradient-to-br from-[#1a202c] to-gray-900 text-white rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6">
                <Image
                  src="/etw-logo-cropped.png"
                  alt="ETW Logo"
                  width={90}
                  height={70}
                  className="h-14 w-auto object-contain rounded-lg"
                />
                <div>
                  <h4 className="font-bold text-xl">ETW Elektrische Anlagen OG</h4>
                  <p className="text-gray-300 text-sm">Ihr Fachbetrieb in Wien & Umgebung</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-8">
                Haben Sie ein konkretes Projekt, benötigen Sie einen E-Befund oder wünschen Sie eine unverbindliche
                Beratung vor Ort? Kontaktieren Sie uns direkt.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/angebot"
                  className="bg-[#e60000] text-white px-6 py-3.5 rounded-xl font-bold text-center hover:bg-red-700 transition"
                >
                  Jetzt Anfrage senden →
                </Link>
                <a
                  href="tel:+436641234567"
                  className="border border-white/20 bg-white/5 hover:bg-white/10 text-white px-6 py-3.5 rounded-xl font-semibold text-center transition"
                >
                  +43 664 123 45 67
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
