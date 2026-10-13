import Image from 'next/image'
import Link from 'next/link'
export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      
      {/* === NAVIGACIJA (Meni na vrhu) === */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div className="bg-[#e60000] text-white font-bold text-3xl px-2 py-1">ETW</div>
           <div className="text-xs font-bold leading-tight text-[#e60000]">Elektrische<br/>Anlagen</div>
        </div>
        <nav className="hidden md:flex gap-6 font-medium text-gray-700">
          <a href="#" className="text-[#e60000] border-b-2 border-[#e60000] pb-1">Startseite</a>
          <a href="#" className="hover:text-[#e60000] pb-1">Leistungen</a>
          <a href="#" className="hover:text-[#e60000] pb-1">Referenzen</a>
          <a href="#" className="hover:text-[#e60000] pb-1">Über uns</a>
          <a href="#" className="hover:text-[#e60000] pb-1">Kontakt</a>
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <span className="font-medium flex items-center gap-2">
            <span>📞</span> +43 664 123 45 67
          </span>
          <Link href="/angebot" className="bg-[#e60000] text-white px-6 py-2 rounded font-medium hover:bg-red-700 transition">
          Angebot anfordern
          </Link>
        </div>
      </header>

      {/* === HERO SEKCIJA (Glavni naslov i slika) === */}
      <section className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-10">
        <div className="md:w-1/2">
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#1a202c] leading-tight mb-6">
            Ihr zuverlässiger<br />
            Partner für<br />
            moderne<br />
            <span className="text-[#e60000]">Elektrotechnik</span><br />
            in Wien und<br />
            Umgebung
          </h1>
          <p className="text-gray-600 mb-8 text-lg max-w-lg">
            Wir planen, installieren und warten elektrotechnische Anlagen für Privat- und Gewerbekunden – zuverlässig, sicher und termingerecht.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/angebot" className="bg-[#e60000] text-white px-8 py-3 rounded font-medium hover:bg-red-700 transition flex items-center gap-2">
              Angebot anfordern <span>→</span>
            </Link>
            <button className="border-2 border-gray-200 px-8 py-3 rounded font-medium hover:border-gray-300 transition">
              Mehr über uns
            </button>
          </div>
        </div>
        <div className="md:w-1/2 w-full">
          {/* Placeholder za sliku električara */}
          <div className="w-full h-[400px] md:h-[550px] bg-gray-200 rounded-3xl flex items-center justify-center text-gray-500 shadow-lg">
            [Slika električara dolazi ovde]
          </div>
        </div>
      </section>

      {/* === 1. STATISTIKA (Ispod glavne slike) === */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
             <div className="text-[#e60000] text-4xl">⚡</div>
            <div>
              <p className="font-bold text-2xl text-[#1a202c]">300+</p>
              <p className="text-sm text-gray-500 leading-tight mt-1">erfolgreich abgeschlossene<br/>Projekte</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
             <div className="text-[#e60000] text-4xl">🏢</div>
            <div>
              <p className="text-sm font-bold text-[#1a202c] leading-tight">Privat, Gewerbe &</p>
              <p className="text-sm text-gray-500 leading-tight">Hausverwaltungen</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
             <div className="text-[#e60000] text-4xl">📍</div>
            <div>
              <p className="text-sm font-bold text-[#1a202c] leading-tight">Wien &</p>
              <p className="text-sm text-gray-500 leading-tight">Umgebung</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
             <div className="text-[#e60000] text-4xl">⭐</div>
            <div>
              <p className="text-sm font-bold text-[#1a202c] leading-tight">Zuverlässig,</p>
              <p className="text-sm text-gray-500 leading-tight">termintreu & sauber</p>
            </div>
          </div>
        </div>
      </section>

      {/* === 2. ÜBER UNS === */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="md:w-1/2">
            <h2 className="text-[#e60000] font-bold text-xl mb-4">Über uns</h2>
            <h3 className="text-4xl font-extrabold mb-6 text-[#1a202c] leading-tight">Technik mit Erfahrung.<br/>Lösungen mit Verstand.</h3>
            <p className="text-gray-600 mb-8 text-lg">
              ETW Elektrische Anlagen OG steht für hochwertige Elektrotechnik, persönliche Beratung und saubere Ausführung. Wir sind ein eingespieltes Team mit langjähriger Erfahrung und Leidenschaft für moderne Elektrotechnik.
            </p>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center text-gray-700 font-medium">
                <span className="text-[#e60000] mr-3 text-xl">✓</span> Termintreu & verlässlich
              </li>
              <li className="flex items-center text-gray-700 font-medium">
                <span className="text-[#e60000] mr-3 text-xl">✓</span> Saubere & normgerechte Ausführung
              </li>
              <li className="flex items-center text-gray-700 font-medium">
                <span className="text-[#e60000] mr-3 text-xl">✓</span> Individuelle Lösungen
              </li>
              <li className="flex items-center text-gray-700 font-medium">
                <span className="text-[#e60000] mr-3 text-xl">✓</span> Persönlicher Ansprechpartner
              </li>
            </ul>
            <button className="bg-[#e60000] text-white px-8 py-3 rounded font-medium hover:bg-red-700 transition">
              Mehr über uns
            </button>
          </div>
          <div className="md:w-1/2 w-full">
            <div className="w-full h-[400px] bg-gray-200 rounded-3xl flex items-center justify-center text-gray-500 shadow-lg">
                [Slika kombija dolazi ovde]
            </div>
          </div>
        </div>
      </section>

      {/* === 3. UNSERE LEISTUNGEN === */}
      <section className="bg-gray-50 py-24 mt-10">
        <div className="container mx-auto px-4 text-center">
           <h2 className="text-4xl font-extrabold text-[#1a202c] mb-4">Unsere Leistungen</h2>
           <p className="text-gray-600 mb-16 text-lg">Kompetent. Zuverlässig. Alles aus einer Hand.</p>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="text-[#e60000] text-4xl mb-6">⚡</div>
                  <h4 className="font-bold text-xl mb-3 text-[#1a202c]">Elektroinstallationen</h4>
                  <p className="text-gray-500 leading-relaxed">Planung und Ausführung von Elektroinstallationen für Neubau, Sanierung und Umbau.</p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="text-[#e60000] text-4xl mb-6">🏠</div>
                  <h4 className="font-bold text-xl mb-3 text-[#1a202c]">KNX Gebäudeautomation</h4>
                  <p className="text-gray-500 leading-relaxed">Intelligente Steuerung für mehr Komfort, Sicherheit und Energieeffizienz.</p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="text-[#e60000] text-4xl mb-6">📄</div>
                  <h4 className="font-bold text-xl mb-3 text-[#1a202c]">E-Befunde</h4>
                  <p className="text-gray-500 leading-relaxed">Überprüfung elektrischer Anlagen gemäß ÖVE/ÖNORM E 8101.</p>
              </div>
               
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="text-[#e60000] text-4xl mb-6">☀️</div>
                  <h4 className="font-bold text-xl mb-3 text-[#1a202c]">Photovoltaik</h4>
                  <p className="text-gray-500 leading-relaxed">Nachhaltige Energielösungen mit Photovoltaikanlagen und Speichersystemen.</p>
              </div>
           </div>
        </div>
      </section>

    </main>
  )
}