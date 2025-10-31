import Link from 'next/link'

export default function About() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Om tjänsten</h1>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Svenska Kommuner Dashboard</h2>
          <p className="text-lg text-gray-700 mb-4">
            Detta är ett verktyg för att jämföra och analysera statistik för Sveriges 290 kommuner.
            Vi samlar data om säkerhet, skolbetyg, sysselsättning, bostadspriser och demografisk information.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            Målet är att göra kommunal statistik mer tillgänglig och lättare att jämföra, så att medborgare
            kan fatta välgrundade beslut om var de vill bo och arbeta.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Datakällor</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Statistiska Centralbyrån (SCB)</li>
            <li>Brottsförebyggande rådet (BRÅ)</li>
            <li>Skolverket</li>
            <li>Arbetsförmedlingen</li>
            <li>Booli och andra fastighetskällor</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Funktioner</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Sök och filtrera bland alla Sveriges 290 kommuner</li>
            <li>Jämför flera kommuner sida vid sida</li>
            <li>Detaljerad statistik för varje kommun</li>
            <li>Spara favoriter i webbläsaren</li>
            <li>Tillgänglig på både svenska och engelska</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Kontakt</h2>
          <p className="text-lg text-gray-700 mb-4">
            Detta projekt skapades av{' '}
            <a
              href="https://twitter.com/DisturbingEU"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-semibold"
            >
              @DisturbingEU
            </a>
          </p>
          <p className="text-gray-600">
            För frågor, feedback eller datakorrigeringar, vänligen kontakta via Twitter.
          </p>
        </div>

        <div className="text-center">
          <Link href="/" className="text-blue-600 hover:underline text-lg">
            ← Tillbaka till startsidan
          </Link>
        </div>
      </div>
    </main>
  )
}
